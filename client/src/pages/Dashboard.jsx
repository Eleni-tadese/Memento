import React, { useEffect, useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { getInviteLink } from '../api/auth';
import { getMemories } from '../api/memories';
import { Link, useNavigate } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import { getAllPhotos } from '../api/memories';
import FavoriteRounded from '@mui/icons-material/FavoriteRounded';
import MailOutlineRounded from '@mui/icons-material/MailOutlineRounded';
import PhotoLibraryRounded from '@mui/icons-material/PhotoLibraryRounded';

// ─── Ken Burns animation cycle (4 directions) ────────────────────────────────
const KB_ANIMS = ['kenBurnsA', 'kenBurnsB', 'kenBurnsC', 'kenBurnsD'];

// Each visit to a slide picks a direction: alternates between two for variety
const getKBAnim = (idx, visitCount) =>
  KB_ANIMS[(idx + visitCount * 2) % 4];

// ─── Scroll reveal hook ───────────────────────────────────────────────────────
const useScrollReveal = (threshold = 0.12) => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);
  return [ref, visible];
};

// ─── Live countdown component ─────────────────────────────────────────────────
const CountdownTimer = ({ targetDate }) => {
  const getDiff = useCallback(() => {
    if (!targetDate) return null;
    const target = new Date(targetDate);
    const now = new Date();
    const diff = target - now;
    if (diff <= 0) return { past: true, days: Math.abs(Math.floor(diff / 86400000)) };
    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    return { past: false, d, h, m, s };
  }, [targetDate]);

  const [time, setTime] = useState(getDiff);
  useEffect(() => {
    const id = setInterval(() => setTime(getDiff()), 1000);
    return () => clearInterval(id);
  }, [getDiff]);

  if (!time) return null;

  if (time.past) {
    return (
      <div className="text-center">
        <span className="text-6xl md:text-8xl font-serif font-bold text-[#BF8F8F] dark:text-[#D9C1BF] tabular-nums drop-shadow-lg">
          {time.days}
        </span>
        <p className="mt-2 font-serif italic text-white/60">days together</p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center gap-3 md:gap-8">
      {[
        { val: time.d,  label: 'Days' },
        { val: time.h,  label: 'Hours' },
        { val: time.m,  label: 'Minutes' },
        { val: time.s,  label: 'Seconds' },
      ].map(({ val, label }, i) => (
        <React.Fragment key={label}>
          {i > 0 && <span className="text-3xl text-white/30 font-light self-start mt-2">:</span>}
          <div className="flex flex-col items-center gap-1">
            <span className="text-4xl md:text-6xl font-serif font-bold text-white tabular-nums min-w-[2ch] text-center drop-shadow-lg">
              {String(val).padStart(2, '0')}
            </span>
            <span className="text-[10px] text-white/50 uppercase tracking-[0.3em]">{label}</span>
          </div>
        </React.Fragment>
      ))}
    </div>
  );
};

// ─── Module-level orientation cache (survives slide transitions) ──────────────
const _orientCache = new Map(); // url → 'landscape' | 'portrait'

// ─── Smart hero slide: detects orientation, applies correct display mode ──────
const HeroSlide = ({ url, label, kbAnim }) => {
  // Seed from cache so re-visited slides render correctly on first paint
  const [orient, setOrient] = useState(() => _orientCache.get(url) ?? 'landscape');
  const isPortrait = orient === 'portrait';

  const onImgLoad = useCallback((e) => {
    const { naturalWidth: w, naturalHeight: h } = e.target;
    // Treat anything with aspect-ratio < 1.2 as portrait/square
    const detected = w / h < 1.2 ? 'portrait' : 'landscape';
    _orientCache.set(url, detected);
    setOrient(detected);
  }, [url]);

  return (
    <>
      {/* ── Layer 1: blurred background – portrait/square only, carries Ken Burns ── */}
      {isPortrait && (
        <div
          className="absolute inset-0 overflow-hidden"
          style={{
            animation: `${kbAnim} 10s cubic-bezier(0.45,0,0.55,1) forwards`,
            willChange: 'transform',
          }}
        >
          {/* Extend -40px past every edge so blur never bleeds at the border */}
          <img
            src={url}
            alt=""
            aria-hidden="true"
            className="absolute object-cover"
            style={{
              top: '-40px', left: '-40px',
              width: 'calc(100% + 80px)', height: 'calc(100% + 80px)',
              filter: 'blur(25px) brightness(0.45)',
            }}
          />
        </div>
      )}

      {/* ── Layer 2: semi-transparent dark overlay (portrait/square only) ── */}
      {isPortrait && (
        <div className="absolute inset-0 bg-black/25" style={{ zIndex: 1 }} />
      )}

      {/* ── Layer 3: sharp image
              landscape → object-cover + Ken Burns on the image itself
              portrait  → object-contain, perfectly centred, no zoom (avoids crop) ── */}
      <img
        src={url}
        alt={label}
        onLoad={onImgLoad}
        loading="lazy"
        className={`absolute inset-0 w-full h-full ${isPortrait ? 'object-contain' : 'object-cover'}`}
        style={
          isPortrait
            ? { zIndex: 2 }
            : {
                animation: `${kbAnim} 8s cubic-bezier(0.45,0,0.55,1) forwards`,
                willChange: 'transform',
                transformOrigin: 'center center',
                zIndex: 2,
              }
        }
      />

      {/* ── Cinematic vignette ── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          zIndex: 3,
          background: isPortrait
            ? 'linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, transparent 25%, transparent 75%, rgba(0,0,0,0.5) 100%)'
            : 'linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, transparent 40%, transparent 60%, rgba(0,0,0,0.7) 100%)',
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          zIndex: 3,
          background: 'linear-gradient(to right, rgba(0,0,0,0.12), transparent 30%, transparent 70%, rgba(0,0,0,0.12))',
        }}
      />
    </>
  );
};

// ─── Format date helper ───────────────────────────────────────────────────────
const fmtDate = (dateStr) => {
  if (!dateStr) return '';
  const parts = dateStr.split('T')[0].split('-');
  if (parts.length !== 3) return '';
  const d = new Date(parts[0], parseInt(parts[1]) - 1, parseInt(parts[2]));
  return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
};

// ─── Dashboard ────────────────────────────────────────────────────────────────
const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Remote data
  const [inviteData, setInviteData] = useState(null);
  const [memories, setMemories] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  // ── Hero slider state ──────────────────────────────────────────────────────
  const [heroSlide, setHeroSlide] = useState(0);
  const [kenBurnsKeys, setKenBurnsKeys] = useState({}); // { slideIdx: visitCount }
  const [heroImages, setHeroImages] = useState(() => {
    try { return JSON.parse(localStorage.getItem('memento_hero_images') || '[]'); }
    catch { return []; }
  });
  const [showHeroPicker, setShowHeroPicker] = useState(false);
  const [allPhotos, setAllPhotos]   = useState([]);   // every image from memories
  const [photosReady, setPhotosReady] = useState(false);

  // Stable refs so the interval never captures stale values
  const heroSlideRef   = useRef(heroSlide);
  const heroImagesRef  = useRef(heroImages);
  useEffect(() => { heroSlideRef.current  = heroSlide;  }, [heroSlide]);
  useEffect(() => { heroImagesRef.current = heroImages; }, [heroImages]);

  // ── Couple profile photos ──────────────────────────────────────────────────
  const [couplePhotos, setCouplePhotos] = useState(() => {
    try { return JSON.parse(localStorage.getItem('memento_couple_photos') || '{"mine":"","partner":""}'); }
    catch { return { mine: '', partner: '' }; }
  });
  const [editingPhoto, setEditingPhoto] = useState(null);
  const [photoInput, setPhotoInput] = useState('');

  // ── Invite link copy state ────────────────────────────────────────────────
  const [linkCopied, setLinkCopied] = useState(false);
  const handleCopyInvite = () => {
    if (!inviteData?.inviteUrl) return;
    // Replace the server's CLIENT_URL host with the actual current frontend host
    const url = inviteData.inviteUrl.replace(/^https?:\/\/[^/]+/, window.location.origin);
    navigator.clipboard.writeText(url).then(() => {
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2500);
    });
  };

  // ── Special date / countdown ───────────────────────────────────────────────
  const [specialDate, setSpecialDate] = useState(() => localStorage.getItem('memento_special_date') || '');
  const [editingDate, setEditingDate] = useState(false);
  const [tempDate, setTempDate] = useState('');

  // ── Scroll reveal refs ────────────────────────────────────────────────────
  const [coupleRef,    coupleVisible]    = useScrollReveal(0.1);
  const [storiesRef,   storiesVisible]   = useScrollReveal(0.06);
  const [countdownRef, countdownVisible] = useScrollReveal(0.1);

  // ── Fetch + validate hero images against database ─────────────────────────
  useEffect(() => {
    Promise.all([
      getInviteLink().catch(() => null),
      getMemories({ limit: 30 }).catch(() => null),
      getAllPhotos().catch(() => null),
    ]).then(([inv, mem, ph]) => {
      setInviteData(inv);
      const mems = mem?.memories || [];
      setMemories(mems);

      // All individual photos for the picker
      const photos = ph?.photos || [];
      setAllPhotos(photos);
      setPhotosReady(true);

      // Build a set of ALL valid image URLs (cover + media)
      const validUrls = new Set([
        ...mems.filter(m => m.cover_image).map(m => m.cover_image),
        ...photos.map(p => p.url),
      ]);

      setHeroImages(prev => {
        if (prev.length === 0) return prev;
        // Only prune the saved selection when we actually have a valid photo
        // set to compare against. If the fetch failed or returned nothing
        // (e.g. a Neon cold start), keep the user's saved photos untouched
        // so their "Select Your Best Photos" choice never silently disappears.
        if (validUrls.size === 0) return prev;
        const valid = prev.filter(h => validUrls.has(h.url));
        if (valid.length !== prev.length) {
          localStorage.setItem('memento_hero_images', JSON.stringify(valid));
        }
        return valid;
      });
    }).finally(() => setLoadingData(false));
  }, []);

  // ── Clamp slide index when images are removed ─────────────────────────────
  useEffect(() => {
    if (heroImages.length > 0 && heroSlide >= heroImages.length) {
      setHeroSlide(0);
      setKenBurnsKeys(prev => ({ ...prev, 0: (prev[0] ?? 0) + 1 }));
    }
  // Only react to length change, not heroSlide (intentional)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [heroImages.length]);

  // ── Go-to-slide: changes active slide + increments visit counter ──────────
  const goToSlide = useCallback((next) => {
    setHeroSlide(next);
    setKenBurnsKeys(prev => ({
      ...prev,
      [next]: (prev[next] ?? 0) + 1,
    }));
  }, []);

  // ── Auto-advance every 7 s (uses refs → no stale closure) ─────────────────
  useEffect(() => {
    if (heroImages.length <= 1) return;
    const id = setInterval(() => {
      const imgs = heroImagesRef.current;
      const cur  = heroSlideRef.current;
      if (imgs.length > 1) goToSlide((cur + 1) % imgs.length);
    }, 7000);
    return () => clearInterval(id);
  }, [heroImages.length, goToSlide]);

  // ── Hero image picker helpers ─────────────────────────────────────────────
  const toggleHeroImg = (url, label) => {
    setHeroImages(prev => {
      const exists = prev.some(h => h.url === url);
      const next = exists
        ? prev.filter(h => h.url !== url)
        : prev.length < 6 ? [...prev, { url, label }] : prev;
      localStorage.setItem('memento_hero_images', JSON.stringify(next));
      return next;
    });
  };

  // ── Couple photo helpers ──────────────────────────────────────────────────
  const saveCouplePhoto = (who, url) => {
    const next = { ...couplePhotos, [who]: url };
    setCouplePhotos(next);
    localStorage.setItem('memento_couple_photos', JSON.stringify(next));
    setEditingPhoto(null);
    setPhotoInput('');
  };

  // ── Special date helper ───────────────────────────────────────────────────
  const saveSpecialDate = (d) => {
    setSpecialDate(d);
    if (d) localStorage.setItem('memento_special_date', d);
    else localStorage.removeItem('memento_special_date');
    setEditingDate(false);
  };

  // ── Derived values ────────────────────────────────────────────────────────
  const recentMems  = memories.slice(0, 8);
  // Use the real partner name returned by the API; fall back gracefully
  const partnerName = inviteData?.partnerName || (inviteData?.partnerJoined ? 'Partner' : 'Your Love');

  // Ken Burns animation for the current slide
  const curVisit  = kenBurnsKeys[heroSlide] ?? 0;
  const curKBAnim = getKBAnim(heroSlide, curVisit);
  // Unique React key so every slide visit remounts the <img> → animation restarts
  const curSlideKey = `slide-${heroSlide}-v${curVisit}`;

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <AppLayout noPadding>

      {/* ══════════════════════════════════════════════════════════════════════
          SECTION 1 — CINEMATIC HERO SLIDER
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="relative w-full h-[80vh] min-h-[560px] overflow-hidden bg-[#FFF1F3]">

        {/* ── Slide images with Ken Burns crossfade ── */}
        <AnimatePresence mode="sync">
          {heroImages.length > 0 ? (
            <motion.div
              key={curSlideKey}
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.3, ease: 'easeInOut' }}
            >
              {/* HeroSlide detects orientation and applies correct display:
                  landscape → object-cover + Ken Burns on the image
                  portrait/square → blurred bg + dark overlay + sharp object-contain image */}
              <HeroSlide
                url={heroImages[heroSlide].url}
                label={heroImages[heroSlide].label}
                kbAnim={curKBAnim}
              />
            </motion.div>
          ) : (
            /* ── No images selected → gradient fallback ── */
            <motion.div
              key="no-image-bg"
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <img
                src="/couple_background.png"
                alt=""
                className="absolute inset-0 w-full h-full object-cover"
                style={{ filter: 'brightness(0.62) saturate(1.15)' }}
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/15 via-transparent to-black/55" />
              <div className="absolute inset-0 bg-gradient-to-br from-[#E85D75]/25 to-transparent" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Hero text (always above the image, never moves) ── */}
        {heroImages.length > 0 && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-center text-white px-6 pointer-events-none">
            <p className="hero-text-enter text-xs tracking-[0.5em] uppercase text-white/55 mb-4 font-sans">
              Welcome back
            </p>
            <h1 className="hero-text-enter-delay font-serif text-5xl md:text-7xl font-bold drop-shadow-2xl leading-tight">
              {user?.display_name?.split(' ')[0] || 'Our'}
              {inviteData?.partnerJoined
                ? <span> <span className="text-[#BF8F8F]">&</span> {partnerName.split(' ')[0]}</span>
                : "'s Story"
              }
            </h1>
            <p className="hero-text-enter-delay2 font-serif italic text-lg md:text-xl text-white/65 mt-3 drop-shadow">
              A private space for your memories
            </p>
            {specialDate && (
              <div className="hero-text-enter-delay2 mt-6 pointer-events-auto">
                <CountdownTimer targetDate={specialDate} />
              </div>
            )}
          </div>
        )}

        {/* ── Empty hero — welcome screen (no partner) or photo CTA ── */}
        {!loadingData && heroImages.length === 0 && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center px-6">

            {/* ── NO PARTNER YET → full onboarding welcome ── */}
            {inviteData?.partnerJoined === false ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: 'easeOut' }}
                className="w-full max-w-md text-center"
              >
                {/* Heading */}
                <p className="hero-text-enter text-xs tracking-[0.5em] uppercase text-white/50 mb-4 font-sans">
                  Welcome to Memento
                </p>
                <h1 className="hero-text-enter-delay font-serif text-4xl md:text-5xl font-bold text-white drop-shadow-2xl mb-2">
                  Hi, {user?.display_name?.split(' ')[0] || 'there'}
                </h1>
                <p className="hero-text-enter-delay2 text-white/60 text-sm mb-8 font-serif italic">
                  Invite your partner to start your shared space
                </p>

                {/* Invite link card */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="bg-white/15 backdrop-blur-md rounded-2xl border border-white/20 p-5 shadow-2xl mb-6"
                >
                  <p className="text-xs font-semibold text-[#C96B60] dark:text-[#D9C1BF] mb-3 text-left">
                    Partner Invite Link
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 rounded-xl bg-black/20 px-3 py-2 text-[11px] text-white/70 truncate font-mono">
                      {inviteData?.inviteUrl
                        ? inviteData.inviteUrl.replace(/^https?:\/\/[^/]+/, window.location.origin)
                        : `${window.location.origin}/join/…`}
                    </div>
                    <button
                      onClick={handleCopyInvite}
                      className={`shrink-0 rounded-xl px-4 py-2 text-xs font-semibold shadow transition-all duration-200 ${
                        linkCopied
                          ? 'bg-green-400 text-white'
                          : 'bg-[#C96B60] hover:bg-[#B05A50] text-white active:scale-95'
                      }`}
                    >
                      {linkCopied ? '✓ Copied!' : 'Copy'}
                    </button>
                  </div>
                </motion.div>

                {/* You / Partner status */}
                <div className="flex items-center justify-center gap-6">
                  <div className="flex flex-col items-center gap-1.5">
                    <div className="h-14 w-14 rounded-full bg-[#C96B60]/30 border-2 border-[#C96B60] flex items-center justify-center text-white text-sm font-bold shadow-lg">
                      {user?.display_name?.[0]?.toUpperCase() || 'Y'}
                    </div>
                    <span className="text-[10px] text-white/70">{user?.display_name?.split(' ')[0] || 'You'}</span>
                    <span className="text-[9px] text-emerald-300">Joined ✓</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <div className="h-4 w-8 rounded-full bg-[#C96B60] animate-pulse" />
                  </div>
                  <div className="flex flex-col items-center gap-1.5">
                    <div className="h-14 w-14 rounded-full border-2 border-dashed border-white/40 flex items-center justify-center text-[11px] text-white/50">
                      Partner
                    </div>
                    <span className="text-[10px] text-white/50">Waiting…</span>
                    <span className="text-[9px] text-white/30">Pending</span>
                  </div>
                </div>

                {/* Skip — add first memory */}
                <Link
                  to="/memories/new"
                  className="mt-8 inline-block text-xs text-white/40 hover:text-white/70 transition-colors underline underline-offset-2"
                >
                  Skip for now — add your first memory →
                </Link>
              </motion.div>

            ) : (
              /* ── PARTNER JOINED but no photos yet ── */
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-8 max-w-sm text-center shadow-2xl"
              >
                <div className="mb-3 flex justify-center"><PhotoLibraryRounded style={{ fontSize: 40 }} className="text-white/90" /></div>
                <h3 className="font-serif text-2xl text-white mb-2">Set Your Hero Photos</h3>
                <p className="text-white/60 text-sm mb-6 leading-relaxed">
                  {allPhotos.length > 0
                    ? 'Choose your favorite memories to display in this cinematic slideshow'
                    : 'Upload memories with photos and they will appear here'}
                </p>
                {allPhotos.length > 0 ? (
                  <button
                    onClick={() => setShowHeroPicker(true)}
                    className="px-7 py-3 rounded-xl bg-white text-[#C96B60] font-semibold text-sm hover:bg-white/90 active:scale-95 transition-all duration-200 shadow-lg"
                  >
                    Select Your Best Photos
                  </button>
                ) : (
                  <Link
                    to="/memories/new"
                    className="inline-block px-7 py-3 rounded-xl bg-white text-[#C96B60] font-semibold text-sm hover:bg-white/90 transition-all duration-200 shadow-lg"
                  >
                    + Add Your First Memory
                  </Link>
                )}
              </motion.div>
            )}

          </div>
        )}

        {/* ── Slide navigation dots ── */}
        {heroImages.length > 1 && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
            {heroImages.map((_, i) => (
              <button
                key={i}
                onClick={() => goToSlide(i)}
                className={`rounded-full transition-all duration-500 ease-out ${
                  i === heroSlide
                    ? 'w-7 h-2 bg-white shadow-md'
                    : 'w-2 h-2 bg-white/35 hover:bg-white/65'
                }`}
              />
            ))}
          </div>
        )}

        {/* ── Prev / Next arrows ── */}
        {heroImages.length > 1 && (
          <>
            <button
              onClick={() => goToSlide((heroSlide - 1 + heroImages.length) % heroImages.length)}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/30 hover:bg-black/55 text-white flex items-center justify-center text-xl backdrop-blur-sm transition-all duration-200 hover:scale-105"
            >
              ‹
            </button>
            <button
              onClick={() => goToSlide((heroSlide + 1) % heroImages.length)}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/30 hover:bg-black/55 text-white flex items-center justify-center text-xl backdrop-blur-sm transition-all duration-200 hover:scale-105"
            >
              ›
            </button>
          </>
        )}

        {/* ── Edit photos button (top-right corner, always visible) ── */}
        <button
          onClick={() => setShowHeroPicker(true)}
          className="absolute top-4 right-4 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/30 backdrop-blur-sm text-white/80 text-xs hover:bg-black/55 transition-colors"
        >
          <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor">
            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
          </svg>
          {heroImages.length === 0 ? 'Add Photos' : 'Edit Photos'}
        </button>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          SECTION 2 — COUPLE PROFILES
      ══════════════════════════════════════════════════════════════════════ */}
      <section
        ref={coupleRef}
        className={`py-20 px-6 bg-[#FFF1F3] dark:bg-[#591F12]/20 transition-all duration-700 ease-out ${
          coupleVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        <div className="max-w-xl mx-auto">
          <p className="text-center text-[10px] tracking-[0.55em] uppercase text-[#C96B60]/50 dark:text-[#BF8F8F]/40 mb-14 font-sans">
            The Couple
          </p>

          <div className="flex items-center justify-center gap-6 md:gap-14">

            {/* ─ Partner 1 (me) ─ */}
            <div className="flex flex-col items-center gap-4">
              <div className="relative group">
                <div className="w-36 h-40 md:w-44 md:h-52 rounded-3xl overflow-hidden shadow-2xl border-4 border-white dark:border-[#591F12]">
                  {couplePhotos.mine ? (
                    <img
                      src={couplePhotos.mine}
                      alt="You"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#C96B60]/25 to-[#F7CAD0]/15 dark:from-[#8E5B60]/50 dark:to-[#591F12] flex items-center justify-center">
                      <span className="text-5xl text-white/40">{user?.display_name?.[0]?.toUpperCase() || '?'}</span>
                    </div>
                  )}
                </div>
                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 px-5 py-1.5 rounded-full bg-[#C96B60] dark:bg-[#8E5B60] text-white text-[11px] font-medium shadow-lg whitespace-nowrap">
                  {user?.display_name?.split(' ')[0] || 'You'}
                </div>
                <button
                  onClick={() => { setEditingPhoto('mine'); setPhotoInput(couplePhotos.mine || ''); }}
                  className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/50 backdrop-blur-sm text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-black/70"
                  title="Change photo"
                >
                  ✎
                </button>
              </div>
              <p className="font-serif text-lg text-[#352F36] dark:text-[#D9C1BF] mt-5">
                {user?.display_name || 'You'}
              </p>
            </div>

            {/* ─ Divider ─ */}
            <div className="flex flex-col items-center gap-3 text-[#C96B60] dark:text-[#BF8F8F] mt-2">
              <div className="w-px h-16 bg-gradient-to-b from-transparent via-[#C96B60]/30 to-transparent dark:via-[#BF8F8F]/20" />
              <span className="drop-shadow"><FavoriteRounded style={{ fontSize: 30 }} /></span>
              <div className="w-px h-16 bg-gradient-to-b from-transparent via-[#C96B60]/30 to-transparent dark:via-[#BF8F8F]/20" />
            </div>

            {/* ─ Partner 2 ─ */}
            <div className="flex flex-col items-center gap-4">
              {inviteData?.partnerJoined === false ? (
                /* ── Partner hasn't joined yet → show invite card ── */
                <div className="flex flex-col items-center gap-3">
                  <div className="w-36 h-40 md:w-44 md:h-52 rounded-3xl border-4 border-dashed border-[#C96B60]/30 dark:border-[#BF8F8F]/20 bg-gradient-to-br from-[#C96B60]/8 dark:from-[#8C5D5D]/20 dark:to-[#591F12]/30 flex flex-col items-center justify-center gap-2 text-center px-3">
                    <span><MailOutlineRounded style={{ fontSize: 30 }} className="text-[#C44569]" /></span>
                    <p className="text-[10px] font-medium text-[#C96B60]/80 dark:text-[#BF8F8F]/70 leading-tight">
                      Waiting for<br />your partner
                    </p>
                  </div>
                  <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 px-5 py-1.5 rounded-full bg-[#BF8F8F]/60 dark:bg-[#8C5D5D]/60 text-white text-[11px] font-medium shadow-lg whitespace-nowrap relative">
                    Invite Pending
                  </div>

                  {/* Copy invite link button */}
                  <button
                    onClick={handleCopyInvite}
                    className={`mt-5 flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold shadow transition-all duration-200 ${
                      linkCopied
                        ? 'bg-green-500 text-white'
                        : 'bg-[#C96B60] dark:bg-[#8E5B60] text-white hover:bg-[#B05A50] dark:hover:bg-[#7A4D50] active:scale-95'
                    }`}
                  >
                    {linkCopied ? '✓ Copied!' : 'Copy Invite Link'}
                  </button>
                  <p className="text-[9px] text-[#352F36]/35 dark:text-[#8C5D5D] text-center max-w-[140px] leading-tight">
                    Share this link with your partner to invite them
                  </p>
                </div>
              ) : (
                /* ── Partner has joined → show their photo card ── */
                <div className="relative group">
                  <div className="w-36 h-40 md:w-44 md:h-52 rounded-3xl overflow-hidden shadow-2xl border-4 border-white dark:border-[#591F12]">
                    {couplePhotos.partner ? (
                      <img
                        src={couplePhotos.partner}
                        alt="Partner"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-[#BF8F8F]/25 to-[#C96B60]/15 dark:from-[#8C5D5D]/40 dark:to-[#591F12] flex items-center justify-center">
                        <span className="text-5xl text-white/40">{partnerName[0]?.toUpperCase() || '?'}</span>
                      </div>
                    )}
                  </div>
                  <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 px-5 py-1.5 rounded-full bg-[#BF8F8F] dark:bg-[#8C5D5D] text-white text-[11px] font-medium shadow-lg whitespace-nowrap">
                    {partnerName.split(' ')[0]}
                  </div>
                  <button
                    onClick={() => { setEditingPhoto('partner'); setPhotoInput(couplePhotos.partner || ''); }}
                    className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/50 backdrop-blur-sm text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-black/70"
                    title="Change photo"
                  >
                    ✎
                  </button>
                </div>
              )}
              {inviteData?.partnerJoined !== false && (
                <p className="font-serif text-lg text-[#352F36] dark:text-[#D9C1BF] mt-5">
                  {partnerName}
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          SECTION 3 — RECENT MEMORIES (timeline)
      ══════════════════════════════════════════════════════════════════════ */}
      <section
        ref={storiesRef}
        className={`py-20 px-6 bg-white dark:bg-[#40110D] transition-all duration-700 ease-out delay-100 ${
          storiesVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        <div className="max-w-2xl mx-auto">
          <p className="text-center text-[10px] tracking-[0.55em] uppercase text-[#C96B60]/50 dark:text-[#BF8F8F]/40 mb-2 font-sans">
            Our Journey
          </p>
          <h2 className="text-center font-serif text-3xl md:text-4xl text-[#352F36] dark:text-[#D9C1BF] mb-14">
            Recent Memories
          </h2>

          {loadingData ? (
            <div className="flex justify-center py-10">
              <svg className="animate-spin h-6 w-6 text-[#C96B60] dark:text-[#BF8F8F]" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            </div>
          ) : recentMems.length === 0 ? (
            <div className="text-center py-12">
              <p className="font-serif italic text-[#352F36]/40 dark:text-[#8C5D5D] mb-4">
                No memories yet — add your first moment together!
              </p>
              <Link to="/memories/new"
                className="inline-block px-6 py-2.5 rounded-xl bg-[#C96B60] dark:bg-[#8E5B60] text-white text-sm font-semibold hover:bg-[#B05A50] transition-colors">
                + Add Memory
              </Link>
            </div>
          ) : (
            <div className="relative">
              <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-[#C96B60]/20 dark:via-[#BF8F8F]/15 to-transparent -translate-x-1/2 hidden md:block" />
              <div className="space-y-10">
                {recentMems.map((memory, i) => {
                  const isLeft      = i % 2 === 0;
                  const isHighlight = i % 3 === 1;
                  return (
                    <div
                      key={memory.id}
                      onClick={() => navigate(`/memories/${memory.id}`)}
                      className={`flex items-center gap-4 md:gap-6 cursor-pointer group ${isLeft ? 'flex-row' : 'flex-row-reverse'}`}
                    >
                      <div className={`w-24 md:w-32 shrink-0 ${isLeft ? 'text-right' : 'text-left'}`}>
                        <p className="font-serif italic text-base md:text-lg text-[#352F36]/25 dark:text-[#8C5D5D]/60 leading-snug">
                          {fmtDate(memory.memory_date) || '—'}
                        </p>
                      </div>
                      <div className="relative shrink-0 hidden md:flex flex-col items-center">
                        <div className="w-3 h-3 rounded-full bg-[#C96B60] dark:bg-[#BF8F8F] shadow-md group-hover:scale-125 transition-transform duration-300" />
                      </div>
                      <div className={`flex-1 flex items-center gap-4 rounded-2xl shadow-md border transition-all duration-500 ease-out p-4 group-hover:-translate-y-1 group-hover:shadow-xl ${
                        isHighlight
                          ? 'bg-[#C96B60] dark:bg-[#8E5B60] border-transparent'
                          : 'bg-[#FFF1F3] dark:bg-[#591F12]/50 border-[#C96B60]/8 dark:border-[#D9C1BF]/8 group-hover:border-[#C96B60]/25'
                      } ${isLeft ? '' : 'flex-row-reverse'}`}>
                        {memory.cover_image && (
                          <div className="w-14 h-14 shrink-0 rounded-full overflow-hidden border-2 border-white/70 dark:border-[#D9C1BF]/20 shadow-md group-hover:scale-105 transition-transform duration-500">
                            <img src={memory.cover_image} alt="" className="w-full h-full object-cover" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className={`font-serif font-semibold text-base truncate ${
                            isHighlight ? 'text-white' : 'text-[#352F36] dark:text-[#D9C1BF]'
                          }`}>
                            {memory.title}
                          </h3>
                          {memory.location && (
                            <p className={`text-xs mt-0.5 truncate ${
                              isHighlight ? 'text-white/70' : 'text-[#352F36]/45 dark:text-[#8C5D5D]'
                            }`}>
                              {memory.location}
                            </p>
                          )}
                          {!memory.cover_image && (
                            <p className={`text-xs mt-0.5 ${
                              isHighlight ? 'text-white/60' : 'text-[#352F36]/30 dark:text-[#8C5D5D]'
                            }`}>
                              {fmtDate(memory.memory_date)}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {memories.length > 8 && (
            <div className="text-center mt-12">
              <Link to="/memories"
                className="font-serif italic text-[#C96B60] dark:text-[#BF8F8F] hover:underline text-sm tracking-wide">
                View all {memories.length} memories →
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          SECTION 4 — COUNTDOWN / DAYS TOGETHER
      ══════════════════════════════════════════════════════════════════════ */}
      <section
        ref={countdownRef}
        className={`py-20 px-6 bg-gradient-to-br from-[#FFF1F3] via-[#FFF1F3] to-[#FFF8F8] dark:from-[#591F12]/50 dark:via-[#40110D] dark:to-[#2A0808] transition-all duration-800 ease-out delay-150 ${
          countdownVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        <div className="max-w-lg mx-auto text-center">
          {specialDate ? (
            <>
              <p className="text-[10px] tracking-[0.55em] uppercase text-[#C96B60]/50 dark:text-[#BF8F8F]/40 mb-8 font-sans">
                Counting Down To
              </p>
              <CountdownTimer targetDate={specialDate} />
              <p className="mt-6 font-serif italic text-sm text-[#352F36]/40 dark:text-[#8C5D5D]">
                {new Date(specialDate + 'T00:00:00').toLocaleDateString('en-US', {
                  weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
                })}
              </p>
              <button
                onClick={() => { setTempDate(specialDate); setEditingDate(true); }}
                className="mt-5 text-xs text-[#C96B60]/40 dark:text-[#8C5D5D] hover:text-[#C96B60] dark:hover:text-[#BF8F8F] transition-colors"
              >
                ✎ Change date
              </button>
            </>
          ) : (
            <>
              <p className="text-[10px] tracking-[0.55em] uppercase text-[#C96B60]/50 dark:text-[#BF8F8F]/40 mb-4 font-sans">
                Special Date
              </p>
              <p className="font-serif italic text-[#352F36]/40 dark:text-[#8C5D5D] mb-6 text-sm">
                Set a date to count down to — your anniversary, wedding, or any special moment
              </p>
              <button
                onClick={() => { setTempDate(''); setEditingDate(true); }}
                className="px-7 py-3 rounded-xl bg-[#C96B60] dark:bg-[#8E5B60] text-white font-semibold text-sm hover:bg-[#B05A50] dark:hover:bg-[#BF8F8F]/80 transition-colors shadow-md"
              >
                + Set Special Date
              </button>
            </>
          )}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          MODALS
      ══════════════════════════════════════════════════════════════════════ */}

      {/* ─── Hero image picker ─── */}
      <AnimatePresence>
        {showHeroPicker && (
          <motion.div
            key="picker-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-end md:items-center justify-center p-4"
            onClick={() => setShowHeroPicker(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.97 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="w-full max-w-lg bg-white dark:bg-[#591F12] rounded-2xl shadow-2xl p-6 max-h-[82vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-serif text-lg text-[#352F36] dark:text-[#D9C1BF]">Choose Hero Photos</h3>
                <button onClick={() => setShowHeroPicker(false)} className="text-[#352F36]/40 dark:text-[#8C5D5D] hover:text-[#C96B60] text-lg">✕</button>
              </div>
              <p className="text-xs text-[#352F36]/40 dark:text-[#8C5D5D] mb-5">
                Select up to 6 · {heroImages.length}/6 chosen · Shows ALL photos from all your memories
              </p>

              {!photosReady ? (
                <div className="flex justify-center py-10">
                  <svg className="animate-spin h-6 w-6 text-[#C96B60]" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                </div>
              ) : allPhotos.length === 0 ? (
                <div className="text-center py-10">
                  <p className="font-serif italic text-[#352F36]/40 dark:text-[#8C5D5D] text-sm">Add memories with photos first!</p>
                  <Link to="/memories/new" onClick={() => setShowHeroPicker(false)}
                    className="mt-3 inline-block text-xs text-[#C96B60] dark:text-[#BF8F8F] hover:underline">
                    + Add a memory
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2.5">
                  {allPhotos.map((photo, i) => {
                    const sel = heroImages.some(h => h.url === photo.url);
                    const selIdx = heroImages.findIndex(h => h.url === photo.url);
                    return (
                      <div
                        key={i}
                        onClick={() => toggleHeroImg(photo.url, photo.memory_title)}
                        className={`relative aspect-square rounded-xl overflow-hidden cursor-pointer border-2 transition-all duration-200 ${
                          sel ? 'border-[#C96B60] dark:border-[#BF8F8F]' : 'border-transparent hover:border-[#C96B60]/40'
                        }`}
                      >
                        <img src={photo.url} alt={photo.memory_title} className="w-full h-full object-cover" />
                        {sel && (
                          <div className="absolute inset-0 bg-[#C96B60]/25 flex items-center justify-center">
                            <span className="w-7 h-7 rounded-full bg-[#C96B60] text-white text-xs flex items-center justify-center font-bold shadow-lg">
                              {selIdx + 1}
                            </span>
                          </div>
                        )}
                        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent p-1.5">
                          <p className="text-white text-[9px] truncate">{photo.memory_title}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="flex gap-2 mt-5">
                {heroImages.length > 0 && (
                  <button
                    onClick={() => {
                      setHeroImages([]);
                      localStorage.removeItem('memento_hero_images');
                    }}
                    className="px-4 py-2.5 rounded-xl border border-red-300 dark:border-red-800/50 text-red-500 text-sm hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                  >
                    Clear all
                  </button>
                )}
                <button
                  onClick={() => setShowHeroPicker(false)}
                  className="flex-1 py-2.5 rounded-xl bg-[#C96B60] dark:bg-[#8E5B60] text-white font-semibold text-sm hover:bg-[#B05A50] transition-colors"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Couple photo editor ─── */}
      <AnimatePresence>
        {editingPhoto && (
          <motion.div
            key="photo-editor-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-end md:items-center justify-center p-4"
            onClick={() => setEditingPhoto(null)}
          >
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.97 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              className="w-full max-w-md bg-white dark:bg-[#591F12] rounded-2xl shadow-2xl p-6"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-serif text-lg text-[#352F36] dark:text-[#D9C1BF]">
                  {editingPhoto === 'mine' ? 'Your' : "Partner's"} Profile Photo
                </h3>
                <button onClick={() => setEditingPhoto(null)} className="text-[#352F36]/40 dark:text-[#8C5D5D] text-lg">✕</button>
              </div>

              <label className="block text-sm text-[#352F36]/60 dark:text-[#BF8F8F] mb-1.5">Photo URL</label>
              <input
                type="url"
                value={photoInput}
                onChange={e => setPhotoInput(e.target.value)}
                className="memento-input mb-4"
                placeholder="https://... or pick from memories below"
              />

            {allPhotos.length > 0 && (
              <>
                <p className="text-xs text-[#352F36]/40 dark:text-[#8C5D5D] mb-2">Pick from your memories ({allPhotos.length} photos):</p>
                <div className="grid grid-cols-4 gap-2 max-h-36 overflow-y-auto mb-4">
                  {allPhotos.map((photo, i) => (
                    <div
                      key={i}
                      onClick={() => setPhotoInput(photo.url)}
                      className={`aspect-square rounded-lg overflow-hidden cursor-pointer border-2 transition-all ${
                        photoInput === photo.url ? 'border-[#C96B60] dark:border-[#BF8F8F]' : 'border-transparent hover:border-[#C96B60]/40'
                      }`}
                    >
                      <img src={photo.url} alt={photo.memory_title} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              </>
            )}

              <div className="flex gap-2">
                <button
                  onClick={() => saveCouplePhoto(editingPhoto, photoInput)}
                  className="flex-1 py-2.5 rounded-xl bg-[#C96B60] dark:bg-[#8E5B60] text-white font-semibold text-sm hover:bg-[#B05A50] transition-colors"
                >
                  Save Photo
                </button>
                {couplePhotos[editingPhoto] && (
                  <button
                    onClick={() => saveCouplePhoto(editingPhoto, '')}
                    className="px-4 py-2.5 rounded-xl border border-red-300 dark:border-red-800/50 text-red-500 text-sm hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                  >
                    Remove
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Special date picker ─── */}
      <AnimatePresence>
        {editingDate && (
          <motion.div
            key="date-picker-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-end md:items-center justify-center p-4"
            onClick={() => setEditingDate(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.97 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              className="w-full max-w-sm bg-white dark:bg-[#591F12] rounded-2xl shadow-2xl p-6"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-serif text-lg text-[#352F36] dark:text-[#D9C1BF]">Set Special Date</h3>
                <button onClick={() => setEditingDate(false)} className="text-[#352F36]/40 dark:text-[#8C5D5D] text-lg">✕</button>
              </div>
              <p className="text-xs text-[#352F36]/40 dark:text-[#8C5D5D] mb-4">
                Past date = shows days together · Future date = counts down
              </p>
              <input
                type="date"
                value={tempDate}
                onChange={e => setTempDate(e.target.value)}
                className="memento-input mb-4"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => saveSpecialDate(tempDate)}
                  disabled={!tempDate}
                  className="flex-1 py-2.5 rounded-xl bg-[#C96B60] dark:bg-[#8E5B60] text-white font-semibold text-sm hover:bg-[#B05A50] transition-colors disabled:opacity-40"
                >
                  Save
                </button>
                {specialDate && (
                  <button
                    onClick={() => saveSpecialDate('')}
                    className="px-4 py-2.5 rounded-xl border border-red-300 dark:border-red-800/50 text-red-500 text-sm hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                  >
                    Clear
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </AppLayout>
  );
};

export default Dashboard;
