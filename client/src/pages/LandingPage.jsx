import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import StarsBackground from '../components/StarsBackground';
import PetalEffect from '../components/PetalEffect';
import ThemeToggle from '../components/ThemeToggle';
import useReveal from '../hooks/useReveal';
import {
  FloralWreath,
  HeroFloralAccent,
  LeafBracket,
  SafeImage,
  ShowcaseCard,
  StatItem,
} from '../components/landing/LandingDecor';
import {
  FlowerIcon,
  ArrowForwardIcon,
  CaptureIcon,
  VideoIcon,
  TimelineIcon,
  CalendarIcon,
  SearchIcon,
  MailIcon,
  HeartIcon,
  LockIcon,
  SparklesIcon,
  PlayIcon,
  ShieldIcon,
  UploadIcon,
} from '../components/Icons';

const IMG = {
  heroMain: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=500&q=80',
  heroArch: 'https://images.unsplash.com/photo-1529636798458-92182e662485?auto=format&fit=crop&w=400&q=80',
  heroInset: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=300&q=80',
  wreathLeft: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=400&q=80',
  wreathRight: 'https://images.unsplash.com/photo-1523438885200-e635ba2c371e?auto=format&fit=crop&w=400&q=80',
};

const STEPS = [
  {
    icon: CaptureIcon,
    title: 'Create Your Space',
    desc: 'Sign up and invite your partner with a secure link. Only the two of you can ever access your memories.',
  },
  {
    icon: UploadIcon,
    title: 'Upload Memories',
    desc: 'Add photos, videos, and write the story behind each moment. Tag them, add dates and locations.',
  },
  {
    icon: HeartIcon,
    title: 'Relive Together',
    desc: 'Browse your timeline, search memories, and celebrate anniversaries. Your love story, beautifully organized.',
  },
];

const SERVICES = [
  {
    icon: CaptureIcon,
    title: 'Photo Gallery',
    desc: 'Upload unlimited photos organized beautifully by memory. Browse by album or date.',
    image: 'https://images.unsplash.com/photo-1452457807411-4979b707c5be?auto=format&fit=crop&w=600&q=80',
  },
  {
    icon: VideoIcon,
    title: 'Video Memories',
    desc: 'Save videos with smooth playback. Relive the moments words cannot describe.',
    image: 'https://images.unsplash.com/photo-1511285560929-80b456fea0df?auto=format&fit=crop&w=600&q=80',
  },
  {
    icon: TimelineIcon,
    title: 'Timeline View',
    desc: 'See your entire relationship story told chronologically from day one.',
    image: 'https://images.unsplash.com/photo-1474552226712-ac0f0961a954?auto=format&fit=crop&w=600&q=80',
  },
  {
    icon: CalendarIcon,
    title: 'Calendar',
    desc: 'Browse memories by date with a beautiful calendar. Never forget an anniversary.',
    image: 'https://images.unsplash.com/photo-1518568814500-bf0f8d125f46?auto=format&fit=crop&w=600&q=80',
  },
  {
    icon: SearchIcon,
    title: 'Smart Search',
    desc: 'Find any memory instantly by title, date, location, or tag.',
    image: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=600&q=80',
  },
  {
    icon: MailIcon,
    title: 'Love Letters',
    desc: 'Write private letters to each other, saved forever in your shared space.',
    image: 'https://images.unsplash.com/photo-1518199266791-5375a57590ae?auto=format&fit=crop&w=600&q=80',
  },
];

const SHOWCASE = [
  { title: 'Sunset Moments', tag: 'Photo Memories', image: 'https://images.unsplash.com/photo-1518568814500-bf0f8d125f46?auto=format&fit=crop&w=500&q=80' },
  { title: 'Adventure Days', tag: 'Timeline Stories', image: 'https://images.unsplash.com/photo-1529636798458-92182e662485?auto=format&fit=crop&w=500&q=80' },
  { title: 'Date Nights', tag: 'Video Memories', image: 'https://images.unsplash.com/photo-1511285560929-80b456fea0df?auto=format&fit=crop&w=500&q=80' },
  { title: 'Love Letters', tag: 'Private Notes', image: 'https://images.unsplash.com/photo-1518199266791-5375a57590ae?auto=format&fit=crop&w=500&q=80' },
];

const STATS = [
  { value: '1,200+', label: 'Couple Spaces' },
  { value: '850+', label: 'Memories Saved' },
  { value: '750+', label: 'Photo Albums' },
  { value: '500+', label: 'Love Stories' },
];

const NAV_LINKS = [
  { label: 'Home', id: 'top' },
  { label: 'Features', id: 'services' },
  { label: 'How it Works', id: 'how-it-works' },
  { label: 'About', id: 'about' },
];

/* ─── inline FeatureImageCard ─── */
const FeatureImageCard = ({ icon: Icon, title, desc, image }) => (
  <article className="group relative overflow-hidden rounded-2xl shadow-lg cursor-default">
    <SafeImage
      src={image}
      alt={title}
      className="h-60 w-full object-cover transition-transform duration-700 group-hover:scale-110"
    />
    {/* gradient overlay */}
    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent transition-all duration-300 group-hover:from-black/90 group-hover:via-black/50" />
    {/* icon badge */}
    <div className="absolute top-4 right-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm transition-all duration-300 group-hover:bg-[#C96B60] dark:group-hover:bg-[#8C5D5D]">
      <Icon className="h-4 w-4 text-white" />
    </div>
    {/* bottom info */}
    <div className="absolute bottom-0 left-0 right-0 p-5">
      <h3 className="font-serif text-lg font-bold text-white mb-1">{title}</h3>
      <p className="text-xs text-white/80 leading-relaxed max-h-0 overflow-hidden opacity-0 transition-all duration-300 group-hover:max-h-16 group-hover:opacity-100">
        {desc}
      </p>
    </div>
  </article>
);

/* ─── step screen helpers ─── */
const NavSidebar = ({ active }) => (
  <div className="w-36 shrink-0 bg-white/30 dark:bg-[#8E5B60]/25 p-3 flex flex-col gap-1.5 border-r border-black/10 dark:border-[#BF8F8F]/20">
    <div className="flex items-center gap-1.5 mb-3">
      <FlowerIcon className="h-4 w-4 text-[#C96B60] dark:text-[#BF8F8F]" />
      <span className="font-serif text-sm font-bold text-[#1A2B48] dark:text-[#D9C1BF]">Memento</span>
    </div>
    {['Dashboard', 'Memories', 'Timeline', 'Letters'].map((item, i) => (
      <div
        key={item}
        className={`rounded-lg px-3 py-1.5 text-[11px] font-medium transition-colors ${
          i === active ? 'bg-[#C96B60] text-white dark:bg-[#8E5B60]' : 'text-[#1A2B48]/50 dark:text-[#BF8F8F]/60'
        }`}
      >
        {item}
      </div>
    ))}
  </div>
);

const LandingPage = () => {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [stepProgress, setStepProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* auto-advance how-it-works */
  useEffect(() => {
    setStepProgress(0);
    let p = 0;
    const DURATION = 3500;
    const TICK = 80;
    const inc = (TICK / DURATION) * 100;

    const timer = setInterval(() => {
      p += inc;
      if (p >= 100) {
        clearInterval(timer);
        setActiveStep(s => (s + 1) % 3);
      } else {
        setStepProgress(p);
      }
    }, TICK);
    return () => clearInterval(timer);
  }, [activeStep]);

  const scrollToSection = (id) => {
    if (id === 'top') { window.scrollTo({ top: 0, behavior: 'smooth' }); return; }
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  const jumpStep = (idx) => { setActiveStep(idx); setStepProgress(0); };

  const heroReveal     = useReveal();
  const introReveal    = useReveal();
  const statsReveal    = useReveal();
  const howReveal      = useReveal();
  const servicesReveal = useReveal();
  const showcaseReveal = useReveal();

  return (
    <div id="top" className="relative min-h-screen overflow-hidden bg-[#B0C3D4] text-gray-900 transition-colors duration-300 dark:bg-[#40110D] dark:text-white">
      <StarsBackground />
      <PetalEffect />

      {/* NAVBAR */}
      <header className={`sticky top-0 z-50 border-b transition-all duration-300 ${
        scrolled
          ? 'border-[#8BA3B8]/50 bg-[#B0C3D4]/95 shadow-md backdrop-blur-md dark:border-[#D9C1BF]/10 dark:bg-[#40110D]/95'
          : 'border-[#8BA3B8]/30 bg-[#B0C3D4] dark:border-[#D9C1BF]/10 dark:bg-[#40110D]'
      }`}>
        <div className="relative mx-auto flex h-[72px] max-w-7xl items-center justify-between px-6">
          <Link to="/" className="z-10 flex items-center gap-2 font-serif text-2xl font-bold text-[#1A2B48] dark:text-[#D9C1BF]">
            <FlowerIcon className="h-7 w-7 text-[#C96B60] dark:text-[#D9C1BF]" />
            Memento
          </Link>

          <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-8 md:flex">
            {NAV_LINKS.map(({ label, id }) => (
              <button key={label} type="button" onClick={() => scrollToSection(id)}
                className="text-sm font-medium text-[#1A2B48]/80 transition-colors hover:text-[#C96B60] dark:text-[#BF8F8F] dark:hover:text-[#D9C1BF]">
                {label}
              </button>
            ))}
          </nav>

          <div className="z-10 flex items-center gap-3">
            <ThemeToggle />
            <Link to="/login"
              className="hidden rounded-md border border-[#C96B60]/40 px-4 py-2 text-sm font-medium text-[#C96B60] transition-all hover:bg-[#C96B60]/10 dark:border-[#D9C1BF]/30 dark:text-[#D9C1BF] dark:hover:bg-white/5 sm:inline-block">
              Login
            </Link>
            <Link to="/signup"
              className="rounded-md bg-[#C96B60] px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-[#B05A50] dark:bg-[#591F12] dark:text-[#D9C1BF] dark:hover:bg-[#8C5D5D]">
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section ref={heroReveal} className="reveal relative bg-[#B0C3D4] py-16 dark:bg-[#40110D] lg:py-24">
        <div className="relative mx-auto max-w-7xl px-6">
          <HeroFloralAccent className="absolute -left-4 top-8 h-20 w-20 opacity-40 lg:h-28 lg:w-28" />
          <HeroFloralAccent className="absolute bottom-0 right-0 h-24 w-24 scale-x-[-1] opacity-30" />

          <div className="grid grid-cols-1 items-center gap-14 lg:grid-cols-2">
            <div className="space-y-6">
              <span className="font-serif text-sm italic text-[#C96B60] dark:text-[#BF8F8F]">Your private memory space</span>
              <h1 className="font-serif text-4xl font-bold leading-[1.15] text-[#1A2B48] dark:text-[#D9C1BF] md:text-5xl lg:text-[3.5rem]">
                Preserve Every<br />Moment You<br />Share Together
              </h1>
              <p className="max-w-md text-sm leading-relaxed text-[#1A2B48]/70 dark:text-[#BF8F8F] md:text-base">
                Photos, videos, and stories — private, beautiful, forever yours.
              </p>
              <div className="flex flex-wrap items-center gap-4 pt-1">
                <button type="button" onClick={() => navigate('/signup')}
                  className="inline-flex items-center gap-2 rounded-md bg-[#C96B60] px-7 py-3 text-sm font-semibold text-white transition-all hover:bg-[#B05A50] dark:bg-[#591F12] dark:text-[#D9C1BF] dark:hover:bg-[#8C5D5D]">
                  Start Your Story
                  <ArrowForwardIcon className="h-4 w-4" />
                </button>
                <button type="button" onClick={() => scrollToSection('how-it-works')}
                  className="group inline-flex items-center gap-3 text-sm font-semibold text-[#1A2B48] dark:text-[#D9C1BF]">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/40 shadow ring-1 ring-[#8BA3B8] transition-shadow group-hover:shadow-md dark:bg-[#591F12] dark:ring-[#D9C1BF]/20">
                    <PlayIcon className="h-6 w-6 text-[#C96B60] dark:text-[#D9C1BF]" />
                  </span>
                  See How It Works
                </button>
              </div>
              <div className="flex flex-wrap gap-4 text-xs text-[#1A2B48]/60 dark:text-[#8C5D5D]">
                <span className="inline-flex items-center gap-1"><ShieldIcon className="h-3.5 w-3.5 text-[#C96B60]" /> Secure</span>
                <span className="inline-flex items-center gap-1"><LockIcon className="h-3.5 w-3.5 text-[#C96B60]" /> Private</span>
                <span className="inline-flex items-center gap-1"><HeartIcon className="h-3.5 w-3.5 text-[#C96B60]" /> For Two</span>
              </div>
            </div>

            <div className="relative mx-auto h-[460px] w-full max-w-[500px] lg:mx-0 lg:ml-auto lg:h-[520px]">
              <div className="absolute right-6 top-0 z-10 w-[55%] overflow-hidden rounded-md shadow-2xl">
                <SafeImage src={IMG.heroMain} alt="Couple moment" className="h-[400px] w-full object-cover lg:h-[460px]" />
              </div>
              <div className="absolute left-0 top-14 z-20 w-[40%] overflow-hidden rounded-t-[999px] shadow-xl">
                <SafeImage src={IMG.heroArch} alt="Couple portrait" className="h-[280px] w-full object-cover lg:h-[320px]" />
              </div>
              <div className="absolute right-0 top-6 z-30 w-[26%] overflow-hidden rounded-md shadow-lg">
                <SafeImage src={IMG.heroInset} alt="Memory details" className="h-24 w-full object-cover lg:h-28" />
              </div>
              <HeroFloralAccent className="absolute -right-4 bottom-20 h-28 w-28 opacity-60" />
            </div>
          </div>
        </div>
      </section>

      {/* INTRO */}
      <section id="about" ref={introReveal} className="reveal bg-[#98B1C4] py-20 dark:bg-[#8E5B60]/20 lg:py-28">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col items-center gap-10 lg:flex-row lg:items-center lg:justify-between">
            <FloralWreath src={IMG.wreathLeft} alt="Couple portrait left" />
            <div className="max-w-lg space-y-5 text-center">
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#C96B60] dark:text-[#D9C1BF]">Built for Couples</span>
              <h2 className="font-serif text-3xl font-bold leading-snug text-[#1A2B48] dark:text-[#D9C1BF] md:text-4xl lg:text-[2.75rem]">
                Unrivaled Privacy<br />Unforgettable Memories
              </h2>
              <p className="text-sm text-[#1A2B48]/70 dark:text-[#BF8F8F]">
                Your own space — no followers, no algorithms.
              </p>
              <button type="button" onClick={() => scrollToSection('services')}
                className="rounded-md bg-[#C96B60] px-8 py-3 text-sm font-semibold text-white transition-all hover:bg-[#B05A50] dark:bg-[#591F12] dark:text-[#D9C1BF] dark:hover:bg-[#8C5D5D]">
                See Features
              </button>
            </div>
            <FloralWreath src={IMG.wreathRight} alt="Couple portrait right" />
          </div>
        </div>
      </section>

      {/* STATS */}
      <section ref={statsReveal} className="reveal border-y border-[#8BA3B8]/40 bg-white py-8 dark:border-[#D9C1BF]/10 dark:bg-[#40110D] lg:py-12">
        <div className="mx-auto flex max-w-6xl items-center justify-center px-6">
          <LeafBracket className="hidden h-28 w-14 shrink-0 md:block" />
          <div className="grid flex-1 grid-cols-2 md:grid-cols-4">
            {STATS.map(({ value, label }) => (
              <StatItem key={label} value={value} label={label} />
            ))}
          </div>
          <LeafBracket className="hidden h-28 w-14 shrink-0 scale-x-[-1] md:block" />
        </div>
      </section>

      {/* HOW IT WORKS — interactive video player */}
      <section id="how-it-works" ref={howReveal} className="reveal bg-[#B0C3D4] py-20 dark:bg-[#40110D] lg:py-28">
        <div className="mx-auto max-w-5xl space-y-10 px-6">
          <div className="mx-auto max-w-3xl space-y-3 text-center">
            <h2 className="font-serif text-3xl font-bold text-[#1A2B48] dark:text-[#D9C1BF] md:text-4xl lg:text-5xl">
              How Memento Works
            </h2>
            <p className="text-sm text-[#1A2B48]/70 dark:text-[#BF8F8F] md:text-base">
              Click any step — or watch it guide you automatically
            </p>
          </div>

          {/* Step selector tabs */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {STEPS.map((step, idx) => {
              const StepIcon = step.icon;
              const isActive = activeStep === idx;
              return (
                <button key={step.title} type="button" onClick={() => jumpStep(idx)}
                  className={`rounded-2xl p-4 text-left transition-all duration-300 ${
                    isActive
                      ? 'bg-white shadow-lg dark:bg-[#8E5B60]/40'
                      : 'bg-[#98B1C4]/50 hover:bg-[#98B1C4] dark:bg-[#8E5B60]/15 dark:hover:bg-[#8E5B60]/25'
                  }`}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-bold transition-colors ${
                      isActive ? 'bg-[#C96B60] text-white' : 'bg-white/50 text-[#1A2B48]/50 dark:bg-[#BF8F8F]/20 dark:text-[#BF8F8F]/60'
                    }`}>{idx + 1}</span>
                    <span className={`text-sm font-semibold ${isActive ? 'text-[#1A2B48] dark:text-[#D9C1BF]' : 'text-[#1A2B48]/50 dark:text-[#D9C1BF]/40'}`}>
                      {step.title}
                    </span>
                  </div>
                  <p className={`mb-3 text-xs leading-relaxed ${isActive ? 'text-[#1A2B48]/70 dark:text-[#D9C1BF]' : 'text-[#1A2B48]/40 dark:text-[#BF8F8F]/50'}`}>
                    {step.desc}
                  </p>
                  {/* progress bar */}
                  <div className="h-1 w-full overflow-hidden rounded-full bg-black/10 dark:bg-white/10">
                    <div className="h-full rounded-full bg-[#C96B60] dark:bg-[#8C5D5D]"
                      style={{ width: isActive ? `${stepProgress}%` : '0%', transition: 'width 80ms linear' }} />
                  </div>
                </button>
              );
            })}
          </div>

          {/* App / browser frame */}
          <div className="overflow-hidden rounded-2xl shadow-2xl border border-[#8BA3B8]/30 dark:border-[#D9C1BF]/10">
            {/* Browser chrome bar */}
            <div className="flex items-center gap-2 bg-[#8BA3B8] px-4 py-3 dark:bg-[#8E5B60]">
              <span className="h-3 w-3 rounded-full bg-rose-400/80" />
              <span className="h-3 w-3 rounded-full bg-amber-400/80" />
              <span className="h-3 w-3 rounded-full bg-emerald-400/80" />
              <div className="mx-3 flex flex-1 items-center gap-2 rounded-full bg-white/20 px-3 py-1">
                <LockIcon className="h-3 w-3 text-white/70" />
                <span className="text-[11px] text-white/80">app.memento.love</span>
              </div>
              <SparklesIcon className="h-4 w-4 text-white/60" />
            </div>

            {/* App screen area */}
            <div className="relative bg-[#C8D7E4] dark:bg-[#591F12]/40" style={{ minHeight: '340px' }}>

              {/* ── STEP 0: Create Your Space ── */}
              <div className={`absolute inset-0 flex ${activeStep === 0 ? 'opacity-100 translate-x-0 duration-500 delay-150 transition-all' : 'opacity-0 translate-x-8 duration-200 delay-0 transition-all pointer-events-none'}`}>
                <NavSidebar active={0} />
                <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6">
                  <div className="text-center">
                    <p className="font-serif text-xl font-bold text-[#1A2B48] dark:text-[#D9C1BF]">Welcome to Memento! 🌸</p>
                    <p className="text-xs text-[#1A2B48]/60 dark:text-[#BF8F8F] mt-1">Invite your partner to start your shared space</p>
                  </div>
                  <div className="w-full max-w-xs rounded-xl border border-[#C96B60]/30 bg-white dark:bg-[#8E5B60]/30 p-3 shadow-md">
                    <p className="text-[10px] font-semibold text-[#C96B60] dark:text-[#D9C1BF] mb-2">Partner Invite Link</p>
                    <div className="flex gap-1 items-center">
                      <div className="flex-1 rounded bg-[#B0C3D4]/30 dark:bg-[#40110D]/60 px-2 py-1 text-[9px] text-gray-500 dark:text-[#BF8F8F] truncate font-mono">
                        memento.app/join/♥-abc123
                      </div>
                      <span className="rounded bg-[#C96B60] px-2 py-1 text-[9px] text-white font-semibold">Copy</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col items-center gap-1">
                      <div className="h-12 w-12 rounded-full bg-[#C96B60]/20 border-2 border-[#C96B60] flex items-center justify-center text-[#C96B60] text-xs font-bold">You</div>
                      <span className="text-[9px] text-[#1A2B48]/60 dark:text-[#BF8F8F]">Joined ✓</span>
                    </div>
                    <HeartIcon className="h-6 w-6 text-[#C96B60] animate-pulse" />
                    <div className="flex flex-col items-center gap-1">
                      <div className="h-12 w-12 rounded-full border-2 border-dashed border-[#8BA3B8] flex items-center justify-center text-[9px] text-[#8BA3B8] dark:text-[#BF8F8F]">Partner</div>
                      <span className="text-[9px] text-[#1A2B48]/40 dark:text-[#8C5D5D]">Pending…</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── STEP 1: Upload Memories ── */}
              <div className={`absolute inset-0 flex ${activeStep === 1 ? 'opacity-100 translate-x-0 duration-500 delay-150 transition-all' : 'opacity-0 translate-x-8 duration-200 delay-0 transition-all pointer-events-none'}`}>
                <NavSidebar active={1} />
                <div className="flex-1 p-5">
                  <h3 className="font-serif text-base font-bold text-[#1A2B48] dark:text-[#D9C1BF] mb-3">Add a Memory</h3>
                  <div className="border-2 border-dashed border-[#C96B60]/40 rounded-xl p-4 flex flex-col items-center gap-1.5 mb-3 bg-white/30 dark:bg-[#8E5B60]/20">
                    <UploadIcon className="h-6 w-6 text-[#C96B60]" />
                    <span className="text-[10px] text-[#C96B60] font-medium">Drop photos or videos here</span>
                    <span className="text-[9px] text-[#1A2B48]/50 dark:text-[#BF8F8F]">JPG · PNG · MP4</span>
                  </div>
                  <div className="space-y-2">
                    <div className="h-7 rounded-lg border border-black/10 bg-white/60 dark:bg-[#8E5B60]/30 dark:border-[#BF8F8F]/20 px-2.5 flex items-center">
                      <span className="text-[9px] text-gray-400 dark:text-[#BF8F8F]">Memory title…</span>
                    </div>
                    <div className="flex gap-2">
                      <div className="h-7 flex-1 rounded-lg border border-black/10 bg-white/60 dark:bg-[#8E5B60]/30 dark:border-[#BF8F8F]/20 px-2.5 flex items-center">
                        <CalendarIcon className="h-3 w-3 text-gray-300 dark:text-[#BF8F8F] mr-1" /><span className="text-[9px] text-gray-400 dark:text-[#BF8F8F]">Date</span>
                      </div>
                      <div className="h-7 flex-1 rounded-lg border border-black/10 bg-white/60 dark:bg-[#8E5B60]/30 dark:border-[#BF8F8F]/20 px-2.5 flex items-center">
                        <span className="text-[9px] text-gray-400 dark:text-[#BF8F8F]">📍 Location</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex gap-1">
                        {['#beach','#us','#2025'].map(tag => (
                          <span key={tag} className="rounded-full bg-[#C96B60]/10 px-2 py-0.5 text-[8px] text-[#C96B60] dark:bg-[#8C5D5D]/20 dark:text-[#BF8F8F]">{tag}</span>
                        ))}
                      </div>
                      <div className="h-7 w-24 rounded-lg bg-[#C96B60] dark:bg-[#8C5D5D] flex items-center justify-center text-[9px] text-white font-semibold">Save Memory</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── STEP 2: Relive Together ── */}
              <div className={`absolute inset-0 flex ${activeStep === 2 ? 'opacity-100 translate-x-0 duration-500 delay-150 transition-all' : 'opacity-0 translate-x-8 duration-200 delay-0 transition-all pointer-events-none'}`}>
                <NavSidebar active={1} />
                <div className="flex-1 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-serif text-base font-bold text-[#1A2B48] dark:text-[#D9C1BF]">Your Memories</h3>
                    <div className="flex items-center gap-1 text-[10px] text-[#C96B60] dark:text-[#BF8F8F]">
                      <HeartIcon className="h-3 w-3" /> 42 memories
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { bg: 'bg-rose-200 dark:bg-rose-900/40',    label: 'First Date',   emoji: '🌹' },
                      { bg: 'bg-sky-200 dark:bg-sky-900/40',      label: 'Beach Day',    emoji: '🌊' },
                      { bg: 'bg-amber-200 dark:bg-amber-900/40',  label: 'Anniversary',  emoji: '🕯️' },
                      { bg: 'bg-emerald-200 dark:bg-emerald-900/40', label: 'Road Trip', emoji: '🗺️' },
                      { bg: 'bg-purple-200 dark:bg-purple-900/40',label: 'Movie Night',  emoji: '🍿' },
                      { bg: 'bg-pink-200 dark:bg-pink-900/40',    label: 'Surprise!',    emoji: '🎁' },
                    ].map(({ bg, label, emoji }) => (
                      <div key={label} className={`rounded-xl overflow-hidden ${bg} h-[70px] flex flex-col`}>
                        <div className="flex-1 flex items-center justify-center text-lg">{emoji}</div>
                        <div className="px-1.5 py-1 bg-white/50 dark:bg-black/20 text-[8px] font-semibold text-gray-700 dark:text-[#D9C1BF] truncate">{label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* SERVICES — image grid */}
      <section id="services" ref={servicesReveal} className="reveal bg-[#98B1C4] py-20 dark:bg-[#8E5B60]/20 lg:py-28">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-14 text-center">
            <span className="mb-3 inline-block text-xs font-semibold uppercase tracking-[0.2em] text-[#C96B60] dark:text-[#BF8F8F]">
              Features
            </span>
            <h2 className="font-serif text-3xl font-bold text-[#1A2B48] dark:text-[#D9C1BF] md:text-4xl lg:text-5xl">
              Everything You Need
            </h2>
            <p className="mt-3 text-sm text-[#1A2B48]/70 dark:text-[#BF8F8F]">
              Built for couples who want to remember everything
            </p>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {SERVICES.map((service) => (
              <FeatureImageCard
                key={service.title}
                icon={service.icon}
                title={service.title}
                desc={service.desc}
                image={service.image}
              />
            ))}
          </div>
        </div>
      </section>

      {/* SHOWCASE */}
      <section id="showcase" ref={showcaseReveal} className="reveal bg-[#C8D7E4] py-20 dark:bg-[#40110D] lg:py-28">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-14 text-center">
            <span className="mb-3 inline-block text-xs font-semibold uppercase tracking-[0.2em] text-[#C96B60] dark:text-[#BF8F8F]">
              Your Gallery
            </span>
            <h2 className="font-serif text-3xl font-bold text-[#1A2B48] dark:text-[#D9C1BF] md:text-4xl lg:text-5xl">
              Special Memories For You
            </h2>
            <p className="mt-3 text-sm text-[#1A2B48]/70 dark:text-[#BF8F8F]">
              A glimpse of what awaits — your story, beautifully preserved
            </p>
          </div>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {SHOWCASE.map((item) => (
              <ShowcaseCard key={item.title} {...item} />
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-[#8BA3B8]/50 bg-[#8BA3B8] py-4 dark:border-[#D9C1BF]/10 dark:bg-[#40110D]">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-3 px-6 text-sm text-white/70 dark:text-[#8C5D5D]">
          <p className="inline-flex items-center gap-1">
            © 2026 Memento · Made with
            <HeartIcon className="h-3.5 w-3.5 text-white dark:text-[#BF8F8F]" />
          </p>
          <ThemeToggle />
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
