import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import AppLayout from '../components/AppLayout';
import { getMemories } from '../api/memories';
import FavoriteRounded from '@mui/icons-material/FavoriteRounded';
import PhotoCameraRounded from '@mui/icons-material/PhotoCameraRounded';
import LocationOnRounded from '@mui/icons-material/LocationOnRounded';
import AutoAwesomeRounded from '@mui/icons-material/AutoAwesomeRounded';
import CalendarMonthRounded from '@mui/icons-material/CalendarMonthRounded';
import AddRounded from '@mui/icons-material/AddRounded';

/* ── helpers ── */
const fmtLong = (dateStr) => {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('T')[0].split('-');
  return new Date(y, parseInt(m) - 1, parseInt(d)).toLocaleDateString('en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

const fmtShort = (dateStr) => {
  if (!dateStr) return '—';
  const [y, m, d] = dateStr.split('T')[0].split('-');
  return new Date(y, parseInt(m) - 1, parseInt(d)).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
  });
};

const getYear = (dateStr) => (dateStr ? dateStr.split('T')[0].split('-')[0] : 'Undated');

/* ── scroll-reveal hook ── */
const useReveal = () => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { threshold: 0.08 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return [ref, visible];
};

/* ── Elegant stacked date ── */
const DateBadge = ({ dateStr, side }) => {
  if (!dateStr) return <div className="w-24" />;
  const d = new Date(dateStr.split('T')[0] + 'T00:00:00');
  const mon = d.toLocaleDateString('en-US', { month: 'long' });
  const num = d.getDate();
  const yr = d.getFullYear();
  return (
    <div className={`flex flex-col ${side === 'left' ? 'items-end pr-6 text-right' : 'items-start pl-6 text-left'}`}>
      <span className="font-body text-xs font-medium tracking-[0.2em] text-[#C44569]/70 uppercase leading-none">
        {mon}
      </span>
      <span className="font-heading font-semibold leading-none text-[#C44569]" style={{ fontSize: '3.4rem', lineHeight: 1 }}>
        {num}
      </span>
      <span className="font-body text-xs tracking-widest text-[#7A6A73] mt-1">{yr}</span>
    </div>
  );
};

/* ── Memory card ── */
const MemoryCard = ({ memory, navigate }) => (
  <motion.div
    whileHover={{ y: -8 }}
    transition={{ duration: 0.35, ease: 'easeOut' }}
    onClick={() => navigate(`/memories/${memory.id}`)}
    className="group w-full max-w-[360px] cursor-pointer rounded-[24px] overflow-hidden
      bg-white border border-[#F1D7DD] shadow-romance hover:shadow-romance-lg transition-shadow duration-300"
  >
    {memory.cover_image ? (
      <div className="relative w-full overflow-hidden bg-[#FFF1F3]" style={{ height: 200 }}>
        <img
          src={memory.cover_image}
          aria-hidden="true"
          alt=""
          className="absolute inset-0 w-full h-full object-cover scale-110"
          style={{ filter: 'blur(16px) brightness(0.9)' }}
        />
        <img
          src={memory.cover_image}
          alt={memory.title}
          className="absolute inset-0 w-full h-full object-contain transition-transform duration-700 group-hover:scale-105"
          style={{ zIndex: 1 }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" style={{ zIndex: 2 }} />
      </div>
    ) : (
      <div className="flex items-center justify-center bg-gradient-to-br from-[#FFF1F3] to-[#F7CAD0]/50" style={{ height: 200 }}>
        <PhotoCameraRounded style={{ fontSize: 40 }} className="text-[#E85D75]/40" />
      </div>
    )}

    <div className="px-5 py-4">
      <h3 className="font-heading text-lg text-[#352F36] group-hover:text-[#C44569] transition-colors leading-snug truncate">
        {memory.title}
      </h3>
      {memory.location && (
        <p className="text-[12px] text-[#7A6A73] truncate mt-1 flex items-center gap-1">
          <LocationOnRounded style={{ fontSize: 14 }} className="text-[#E85D75]" />
          {memory.location}
        </p>
      )}
      <p className="text-[11px] tracking-wide text-[#7A6A73]/70 mt-2 font-body">{fmtLong(memory.memory_date)}</p>
    </div>
  </motion.div>
);

/* ── Timeline entry ── */
const TimelineEntry = ({ memory, isLeft, navigate }) => {
  const [ref, visible] = useReveal();
  return (
    <div
      ref={ref}
      className={`relative flex items-start gap-3 md:gap-0 md:grid md:grid-cols-[1fr_60px_1fr]
        transition-all duration-700 ease-out
        ${visible ? 'opacity-100 translate-x-0' : `opacity-0 ${isLeft ? '-translate-x-8' : 'translate-x-8'}`}`}
    >
      {/* LEFT column */}
      <div className="hidden md:flex items-start justify-end">
        {isLeft ? <MemoryCard memory={memory} navigate={navigate} /> : <DateBadge dateStr={memory.memory_date} side="left" />}
      </div>

      {/* Centre glowing node */}
      <div className="flex flex-col items-center pt-6 shrink-0">
        <span className="relative flex h-5 w-5 items-center justify-center">
          <span className="absolute inline-flex h-full w-full rounded-full bg-[#E85D75]/40 animate-ping" />
          <span className="relative inline-flex h-4 w-4 rounded-full bg-gradient-to-br from-[#E85D75] to-[#C44569] shadow-[0_0_14px_rgba(232,93,117,0.6)] ring-4 ring-white z-10" />
        </span>
      </div>

      {/* RIGHT column */}
      <div className="hidden md:flex items-start justify-start">
        {isLeft ? <DateBadge dateStr={memory.memory_date} side="right" /> : <MemoryCard memory={memory} navigate={navigate} />}
      </div>

      {/* Mobile stacked */}
      <div className="flex-1 flex flex-col gap-2 md:hidden">
        <div className="flex items-baseline gap-2">
          <span className="font-heading text-3xl font-semibold text-[#C44569] leading-none">
            {memory.memory_date ? new Date(memory.memory_date.split('T')[0] + 'T00:00:00').getDate() : '—'}
          </span>
          <span className="font-heading text-sm text-[#352F36]">
            {memory.memory_date
              ? new Date(memory.memory_date.split('T')[0] + 'T00:00:00').toLocaleDateString('en-US', {
                  month: 'long',
                  year: 'numeric',
                })
              : ''}
          </span>
        </div>
        <MemoryCard memory={memory} navigate={navigate} />
      </div>
    </div>
  );
};

/* ── Year divider ── */
const YearDivider = ({ year }) => {
  const [ref, visible] = useReveal();
  return (
    <div
      ref={ref}
      className={`flex items-center gap-5 my-6 transition-all duration-700 ease-out ${
        visible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
      }`}
    >
      <div className="flex-1 h-px bg-gradient-to-r from-transparent to-[#F7CAD0]" />
      <div
        className="flex items-center gap-2 px-6 py-2 rounded-full shadow-romance shrink-0"
        style={{ background: 'linear-gradient(135deg, #E85D75 0%, #C44569 100%)' }}
      >
        <FavoriteRounded style={{ fontSize: 15 }} className="text-white/90" />
        <span className="font-heading text-lg font-semibold text-white tracking-wide">{year}</span>
      </div>
      <div className="flex-1 h-px bg-gradient-to-l from-transparent to-[#F7CAD0]" />
    </div>
  );
};

/* ── Stat card ── */
const StatCard = ({ Icon, value, label, caption, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    className="romance-card romance-card-hover p-6 text-center"
  >
    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FFF1F3]">
      <Icon style={{ fontSize: 24 }} className="text-[#E85D75]" />
    </div>
    <p className="font-heading text-2xl font-semibold text-[#C44569]">{value}</p>
    <p className="text-sm font-medium text-[#352F36] mt-0.5">{label}</p>
    {caption && <p className="text-[11px] italic text-[#7A6A73] mt-1">{caption}</p>}
  </motion.div>
);

/* ══════════════════════════════════════════════════════════ */
const Timeline = () => {
  const navigate = useNavigate();
  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMemories({ limit: 200 })
      .then((d) => setMemories(d?.memories || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const grouped = memories.reduce((acc, m) => {
    const y = getYear(m.memory_date);
    if (!acc[y]) acc[y] = [];
    acc[y].push(m);
    return acc;
  }, {});
  const years = Object.keys(grouped).sort((a, b) => b - a);

  const totalMems = memories.length;
  const yearsSpanned = years.filter((y) => y !== 'Undated').length;
  const firstDate = memories.length ? memories[memories.length - 1]?.memory_date : null;

  return (
    <AppLayout pageTitle="Our Timeline">
      <div className="max-w-4xl mx-auto">
        {/* ── Hero heading ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <span className="romance-chip inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium">
            <FavoriteRounded style={{ fontSize: 14 }} /> Our Love Story
          </span>
          <h2 className="font-heading text-4xl md:text-5xl font-semibold text-[#352F36] mt-4">
            A Journey Through Time
          </h2>
          <p className="text-[#7A6A73] mt-2 max-w-md mx-auto">
            Every moment we have shared, gathered in one beautiful place.
          </p>
        </motion.div>

        {/* ── Header stats ── */}
        {!loading && memories.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-14">
            <StatCard Icon={FavoriteRounded} value={totalMems} label={totalMems === 1 ? 'Memory' : 'Memories'} caption="Every memory tells our story" delay={0} />
            <StatCard Icon={AutoAwesomeRounded} value={yearsSpanned} label={yearsSpanned === 1 ? 'Year' : 'Years'} caption="Growing together" delay={0.1} />
            <StatCard Icon={CalendarMonthRounded} value={firstDate ? fmtShort(firstDate) : '—'} label="First Memory" caption="Where it all began" delay={0.2} />
          </div>
        )}

        {/* ── Loading ── */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <svg className="animate-spin h-7 w-7 text-[#E85D75]" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <p className="font-heading italic text-sm text-[#7A6A73]">Loading your timeline…</p>
          </div>
        ) : memories.length === 0 ? (
          <div className="text-center py-20 romance-card">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#FFF1F3]">
              <AutoAwesomeRounded style={{ fontSize: 30 }} className="text-[#E85D75]" />
            </div>
            <h3 className="font-heading text-2xl text-[#352F36]">Your story is just beginning</h3>
            <p className="font-heading italic text-sm text-[#7A6A73] mt-2 mb-6">
              Add memories and they will appear here as a beautiful timeline
            </p>
            <button onClick={() => navigate('/memories/new')} className="romance-btn">
              <AddRounded style={{ fontSize: 18 }} /> Add First Memory
            </button>
          </div>
        ) : (
          /* ── Timeline ── */
          <div className="relative">
            {/* Centre gradient line — desktop */}
            <div
              className="absolute left-1/2 top-0 bottom-0 w-[3px] rounded-full -translate-x-1/2 hidden md:block"
              style={{ background: 'linear-gradient(to bottom, transparent, #F7CAD0 12%, #E85D75 50%, #F7CAD0 88%, transparent)' }}
            />
            {/* Mobile left line */}
            <div
              className="absolute left-[9px] top-0 bottom-0 w-[3px] rounded-full md:hidden"
              style={{ background: 'linear-gradient(to bottom, transparent, #F7CAD0 12%, #E85D75 50%, #F7CAD0 88%, transparent)' }}
            />

            <div className="space-y-12">
              {(() => {
                let globalIdx = 0;
                return years.map((year) => (
                  <div key={year}>
                    <YearDivider year={year} />
                    <div className="space-y-10 mt-8">
                      {grouped[year].map((memory) => {
                        const isLeft = globalIdx % 2 === 0;
                        globalIdx++;
                        return <TimelineEntry key={memory.id} memory={memory} isLeft={isLeft} navigate={navigate} />;
                      })}
                    </div>
                  </div>
                ));
              })()}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default Timeline;
