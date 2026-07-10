import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import AppLayout from '../components/AppLayout';
import { getMemories } from '../api/memories';

/* ── helpers ── */
const fmtLong = (dateStr) => {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('T')[0].split('-');
  return new Date(y, parseInt(m) - 1, parseInt(d))
    .toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
};

const fmtShort = (dateStr) => {
  if (!dateStr) return '—';
  const [y, m, d] = dateStr.split('T')[0].split('-');
  return new Date(y, parseInt(m) - 1, parseInt(d))
    .toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
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
      ([e]) => { if (e.isIntersecting) { setVisible(true); io.disconnect(); } },
      { threshold: 0.08 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return [ref, visible];
};

/* ── Date badge next to the dot ── */
const DateBadge = ({ dateStr, side }) => {
  if (!dateStr) return <div className="w-24" />;
  const d = new Date(dateStr.split('T')[0] + 'T00:00:00');
  const mon = d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
  const num = d.getDate();
  const yr  = d.getFullYear();
  return (
    <div className={`flex flex-col ${side === 'left' ? 'items-end pr-5 text-right' : 'items-start pl-5 text-left'}`}>
      <span className="font-sans text-xs font-bold tracking-[0.2em] text-[#C96B60]/60 dark:text-[#BF8F8F]/55 uppercase leading-none">
        {mon}
      </span>
      <span className="font-serif font-bold leading-none text-[#C96B60] dark:text-[#BF8F8F]"
        style={{ fontSize: '3.2rem', lineHeight: 1 }}>
        {num}
      </span>
      <span className="font-sans text-[11px] tracking-widest text-[#1A2B48]/40 dark:text-[#8C5D5D] mt-0.5 uppercase">
        {yr}
      </span>
    </div>
  );
};

/* ── Single timeline entry ── */
const TimelineEntry = ({ memory, isLeft, navigate }) => {
  const [ref, visible] = useReveal();
  return (
    <div
      ref={ref}
      className={`relative flex items-start gap-3 md:gap-0 md:grid md:grid-cols-[1fr_52px_1fr]
        transition-all duration-700 ease-out
        ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
    >
      {/* LEFT column */}
      <div className="hidden md:flex items-start justify-end">
        {isLeft
          ? <MemoryCard memory={memory} navigate={navigate} />
          : <DateBadge dateStr={memory.memory_date} side="left" />
        }
      </div>

      {/* Centre dot */}
      <div className="flex flex-col items-center pt-5 shrink-0">
        <div className="w-3.5 h-3.5 rounded-full bg-[#C96B60] dark:bg-[#BF8F8F] shadow-md ring-[3px] ring-[#B0C3D4] dark:ring-[#40110D] z-10" />
      </div>

      {/* RIGHT column */}
      <div className="hidden md:flex items-start justify-start">
        {isLeft
          ? <DateBadge dateStr={memory.memory_date} side="right" />
          : <MemoryCard memory={memory} navigate={navigate} />
        }
      </div>

      {/* Mobile: stacked */}
      <div className="flex-1 flex flex-col gap-1.5 md:hidden">
        <div className="flex items-baseline gap-2">
          <span className="font-serif text-3xl font-bold text-[#C96B60] dark:text-[#BF8F8F] leading-none">
            {memory.memory_date ? new Date(memory.memory_date.split('T')[0] + 'T00:00:00').getDate() : '—'}
          </span>
          <span className="font-serif text-sm font-semibold text-[#1A2B48] dark:text-[#D9C1BF]">
            {memory.memory_date
              ? new Date(memory.memory_date.split('T')[0] + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
              : ''}
          </span>
        </div>
        <MemoryCard memory={memory} navigate={navigate} />
      </div>
    </div>
  );
};

const MemoryCard = ({ memory, navigate }) => (
  <div
    onClick={() => navigate(`/memories/${memory.id}`)}
    className="group w-full max-w-[340px] cursor-pointer rounded-2xl overflow-hidden
      border border-black/6 dark:border-white/6
      bg-white dark:bg-[#291008]
      shadow-md hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
  >
    {/* image */}
    {memory.cover_image ? (
      <div className="relative w-full overflow-hidden bg-[#160606]" style={{ height: 190 }}>
        {/* blurred background */}
        <img src={memory.cover_image} aria-hidden="true" alt=""
          className="absolute inset-0 w-full h-full object-cover scale-110"
          style={{ filter: 'blur(14px) brightness(0.45)' }} />
        {/* sharp foreground */}
        <img src={memory.cover_image} alt={memory.title}
          className="absolute inset-0 w-full h-full object-contain transition-transform duration-700 group-hover:scale-105"
          style={{ zIndex: 1 }} />
      </div>
    ) : (
      <div className="flex items-center justify-center bg-gradient-to-br from-[#C96B60]/15 to-[#BF8F8F]/10 dark:from-[#8E5B60]/40 dark:to-[#40110D]"
        style={{ height: 190 }}>
        <span className="text-4xl opacity-30">📷</span>
      </div>
    )}

    {/* info bar */}
    <div className="px-4 py-3 bg-[#7A2E25] dark:bg-[#3D1008]">
      <h3 className="font-serif text-base text-white/90 group-hover:text-white transition-colors leading-snug truncate">
        {memory.title}
      </h3>
      {memory.location && (
        <p className="text-[11px] text-white/45 truncate mt-0.5">📍 {memory.location}</p>
      )}
      <p className="text-[10px] tracking-widest uppercase text-white/35 mt-1 font-sans">
        {fmtLong(memory.memory_date)}
      </p>
    </div>
  </div>
);

/* ── Year divider ── */
const YearDivider = ({ year }) => {
  const [ref, visible] = useReveal();
  return (
    <div ref={ref} className={`flex items-center gap-5 my-4 transition-all duration-700 ease-out ${visible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#C96B60]/30 to-[#C96B60]/30 dark:via-[#BF8F8F]/20 dark:to-[#BF8F8F]/20" />
      <div className="flex items-center gap-3 px-5 py-2 rounded-full bg-[#C96B60] dark:bg-[#8E5B60] shadow-lg shrink-0">
        <span className="font-serif text-xl font-bold text-white tracking-wider">{year}</span>
      </div>
      <div className="flex-1 h-px bg-gradient-to-l from-transparent via-[#C96B60]/30 to-[#C96B60]/30 dark:via-[#BF8F8F]/20 dark:to-[#BF8F8F]/20" />
    </div>
  );
};

/* ══════════════════════════════════════════════════════════ */
const Timeline = () => {
  const navigate = useNavigate();
  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMemories({ limit: 200 })
      .then(d => setMemories(d?.memories || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  /* group by year */
  const grouped = memories.reduce((acc, m) => {
    const y = getYear(m.memory_date);
    if (!acc[y]) acc[y] = [];
    acc[y].push(m);
    return acc;
  }, {});
  const years = Object.keys(grouped).sort((a, b) => b - a);

  const totalMems = memories.length;
  const yearsSpanned = years.filter(y => y !== 'Undated').length;
  const firstDate = memories.length ? memories[memories.length - 1]?.memory_date : null;

  return (
    <AppLayout pageTitle="Our Timeline">
      <div className="max-w-4xl mx-auto">

        {/* ── Header stats ── */}
        {!loading && memories.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="grid grid-cols-3 gap-4 mb-12"
          >
            {[
              { val: totalMems, label: 'Memories' },
              { val: yearsSpanned, label: yearsSpanned === 1 ? 'Year' : 'Years' },
              { val: firstDate ? fmtShort(firstDate) : '—', label: 'First Memory' },
            ].map(({ val, label }) => (
              <div key={label} className="rounded-2xl bg-white dark:bg-[#291008] border border-black/5 dark:border-[#D9C1BF]/8 shadow-sm p-5 text-center">
                <p className="font-serif text-3xl font-bold text-[#C96B60] dark:text-[#BF8F8F]">{val}</p>
                <p className="text-[11px] tracking-widest uppercase text-[#1A2B48]/40 dark:text-[#8C5D5D] mt-1">{label}</p>
              </div>
            ))}
          </motion.div>
        )}

        {/* ── Loading ── */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <svg className="animate-spin h-7 w-7 text-[#C96B60] dark:text-[#BF8F8F]" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <p className="font-serif italic text-sm text-[#1A2B48]/40 dark:text-[#8C5D5D]">Loading your timeline…</p>
          </div>
        ) : memories.length === 0 ? (
          <div className="text-center py-24 rounded-2xl bg-white/40 dark:bg-[#591F12]/20 border border-white/30 dark:border-[#D9C1BF]/8 space-y-4">
            <div className="text-5xl">🌿</div>
            <h3 className="font-serif text-xl text-[#1A2B48] dark:text-[#D9C1BF]">Your story is just beginning</h3>
            <p className="font-serif italic text-sm text-[#1A2B48]/45 dark:text-[#8C5D5D]">
              Add memories and they will appear here as a beautiful timeline
            </p>
            <button onClick={() => navigate('/memories/new')}
              className="inline-block mt-2 px-6 py-2.5 rounded-xl bg-[#C96B60] dark:bg-[#8E5B60] text-white text-sm font-semibold hover:bg-[#B05A50] transition-colors">
              + Add First Memory
            </button>
          </div>
        ) : (
          /* ── Timeline ── */
          <div className="relative">
            {/* Centre vertical line — desktop only */}
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-[#C96B60]/20 dark:via-[#BF8F8F]/15 to-transparent -translate-x-1/2 hidden md:block" />

            {/* Mobile left line */}
            <div className="absolute left-1.5 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-[#C96B60]/20 dark:via-[#BF8F8F]/15 to-transparent md:hidden" />

            <div className="space-y-10">
              {(() => {
                let globalIdx = 0;
                return years.map(year => (
                  <div key={year}>
                    <YearDivider year={year} />
                    <div className="space-y-8 mt-6">
                      {grouped[year].map((memory) => {
                        const isLeft = globalIdx % 2 === 0;
                        globalIdx++;
                        return (
                          <TimelineEntry
                            key={memory.id}
                            memory={memory}
                            isLeft={isLeft}
                            navigate={navigate}
                          />
                        );
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
