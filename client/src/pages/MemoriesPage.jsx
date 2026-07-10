import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getMemories } from '../api/memories';
import { getInviteLink } from '../api/auth';
import AppLayout from '../components/AppLayout';
import { SearchIcon, CaptureIcon } from '../components/Icons';

const MemoriesPage = () => {
  const navigate = useNavigate();
  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [error, setError] = useState('');
  const [partnerJoined, setPartnerJoined] = useState(false);

  useEffect(() => {
    const fetchPartnerStatus = async () => {
      try {
        const data = await getInviteLink();
        setPartnerJoined(data.partnerJoined);
      } catch (err) {
        console.error('Failed to fetch partner status:', err);
      }
    };
    fetchPartnerStatus();
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedQuery(searchQuery), 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  useEffect(() => {
    const fetchMemories = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await getMemories({ search: debouncedQuery });
        setMemories(data.memories || []);
      } catch (err) {
        setError('Failed to fetch memories.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchMemories();
  }, [debouncedQuery]);

  const formatDate = (dateStr) => {
    if (!dateStr) return 'No Date';
    const parts = dateStr.split('T')[0].split('-');
    if (parts.length === 3) {
      const d = new Date(parts[0], parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
      return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    }
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  const AddBtn = (
    <Link
      to="/memories/new"
      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#C96B60] dark:bg-[#8E5B60] text-white text-sm font-semibold hover:bg-[#B05A50] dark:hover:bg-[#BF8F8F]/80 transition-colors shadow-sm"
    >
      <span className="text-base leading-none">+</span>
      <span>Add Memory</span>
    </Link>
  );

  return (
    <AppLayout pageTitle="Our Memories" pageActions={AddBtn}>
      <div className="max-w-5xl mx-auto space-y-6">

        {/* Search bar */}
        <div className="relative group max-w-xl">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-[#C96B60]/30 to-[#7AAEC8]/20 rounded-2xl blur opacity-0 group-focus-within:opacity-100 transition duration-500" />
          <div className="relative flex items-center bg-white/60 dark:bg-[#591F12]/40 border border-white/60 dark:border-[#D9C1BF]/10 rounded-2xl backdrop-blur-sm shadow-sm group-focus-within:border-[#C96B60]/40 dark:group-focus-within:border-[#BF8F8F]/30 transition-all">
            <span className="pl-4 text-[#C96B60] dark:text-[#BF8F8F]/70">
              <SearchIcon className="h-4 w-4" />
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search memories by title or story..."
              className="flex-1 bg-transparent border-0 px-3 py-3 text-[#1A2B48] dark:text-[#D9C1BF] placeholder-[#1A2B48]/40 dark:placeholder-[#8C5D5D] text-sm focus:outline-none focus:ring-0"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="pr-4 text-[#1A2B48]/30 dark:text-[#8C5D5D] hover:text-[#C96B60] dark:hover:text-[#BF8F8F] transition-colors"
                aria-label="Clear search"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Partner blessing banner */}
        {partnerJoined && (
          <section className="relative overflow-hidden rounded-2xl border border-[#C96B60]/15 dark:border-[#BF8F8F]/10 bg-gradient-to-br from-[#FFF0EC]/70 dark:from-[#591F12]/40 to-transparent p-5 text-center shadow-sm">
            <div className="flex justify-center mb-3 text-lg animate-pulse">✨ 👑 ✨</div>
            <div className="space-y-3 font-serif text-[#1A2B48] dark:text-[#D9C1BF] leading-relaxed text-sm">
              <p className="font-semibold px-2">
                ዘመናችንን ሙሉ ለእግዚአብሔር ቤት እርሱን ደስ በሚያሰኝ አኗኗር እንድንኖር ያድርገን ::ቅዱስ ገብርኤል ከፈተና ይጠብቀን::
              </p>
              <div className="flex items-center justify-center gap-2 py-1">
                <div className="h-px w-10 bg-[#C96B60]/20 dark:bg-[#BF8F8F]/15" />
                <span className="text-[#C96B60]/60 dark:text-[#BF8F8F]/40 text-xs">❦</span>
                <div className="h-px w-10 bg-[#C96B60]/20 dark:bg-[#BF8F8F]/15" />
              </div>
              <p className="font-semibold px-2">
                {"\"እመ አምላክ እመ ህይወት — ለቤታችን አክሊል ትሁነን\""}
              </p>
            </div>
          </section>
        )}

        {/* Error */}
        {error && (
          <div className="rounded-lg border border-red-200 dark:border-red-900/30 bg-red-50 dark:bg-red-950/20 px-4 py-2.5 text-center text-sm font-medium text-red-500 dark:text-red-400">
            {error}
          </div>
        )}

        {/* Memory grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="animate-pulse rounded-xl overflow-hidden bg-white dark:bg-[#291008] shadow-md border border-black/8 dark:border-[#D9C1BF]/8">
                <div className="h-52 bg-[#C96B60]/10 dark:bg-[#8E5B60]/20" />
                <div className="p-5 space-y-3">
                  <div className="h-5 rounded bg-[#C96B60]/10 dark:bg-[#8E5B60]/20 w-3/4" />
                  <div className="h-4 rounded bg-[#C96B60]/10 dark:bg-[#8E5B60]/20 w-4/4" />
                  <div className="h-3 rounded bg-[#C96B60]/10 dark:bg-[#8E5B60]/20 w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : memories.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {memories.map((memory) => (
              <article
                key={memory.id}
                onClick={() => navigate(`/memories/${memory.id}`)}
                className="group flex flex-col overflow-hidden rounded-xl border border-black/8 dark:border-[#D9C1BF]/10 bg-white dark:bg-[#291008] shadow-md cursor-pointer transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl"
              >
                {/* ── Image ── */}
                <div className="relative w-full overflow-hidden bg-[#160606]" style={{ height: '210px' }}>
                  {memory.cover_image ? (
                    <>
                      {/* Layer 1 – blurred background fills empty space for portrait/square images */}
                      <img
                        src={memory.cover_image}
                        alt=""
                        aria-hidden="true"
                        className="absolute object-cover"
                        style={{
                          top: '-12px', left: '-12px',
                          width: 'calc(100% + 24px)', height: 'calc(100% + 24px)',
                          filter: 'blur(12px) brightness(0.55)',
                        }}
                      />
                      {/* Layer 2 – sharp image fully visible, never cropped */}
                      <img
                        src={memory.cover_image}
                        alt={memory.title}
                        className="absolute inset-0 h-full w-full object-contain transition-transform duration-700 group-hover:scale-105"
                        style={{ zIndex: 1 }}
                      />
                    </>
                  ) : (
                    <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-[#C96B60]/20 via-[#BF8F8F]/15 to-[#7AAEC8]/10 dark:from-[#8E5B60]/50 dark:to-[#40110D]">
                      <span className="text-4xl mb-2 opacity-50">📷</span>
                      <span className="font-serif italic text-[11px] tracking-wider text-[#1A2B48]/40 dark:text-[#D9C1BF]/30">A moment worth keeping</span>
                    </div>
                  )}

                  {/* ── Heart badge (top-left, like reference image) ── */}
                  <div className="absolute top-0 left-0 bg-[#C96B60] dark:bg-[#8E5B60] text-white flex flex-col items-center justify-center gap-0.5 px-3 py-2.5 min-w-[52px]" style={{ zIndex: 2 }}>
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                    </svg>
                    <span className="text-[11px] font-bold leading-none">
                      {memory.memory_date ? new Date(memory.memory_date).getFullYear() : '♡'}
                    </span>
                  </div>

                  {/* Video play overlay */}
                  {memory.cover_type === 'video' && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/25" style={{ zIndex: 2 }}>
                      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#C96B60]/90 text-white text-base shadow-lg">▶</span>
                    </div>
                  )}
                </div>

                {/* ── Content ── */}
                <div className="flex flex-col flex-1 px-5 pt-5 pb-4 gap-2.5">
                  {/* Title in large cursive style */}
                  <h3 className="font-serif text-[1.35rem] leading-snug text-[#1A2B48] dark:text-[#D9C1BF] group-hover:text-[#C96B60] dark:group-hover:text-[#BF8F8F] transition-colors duration-200">
                    {memory.title}
                  </h3>

                  {/* Byline: author + date */}
                  <div className="flex items-center gap-3 text-[11px] text-[#1A2B48]/45 dark:text-[#8C5D5D]">
                    <span>By {memory.created_by_name || 'Us'}</span>
                    {memory.memory_date && (
                      <>
                        <span className="text-[#C96B60]/30">·</span>
                        <span className="flex items-center gap-1">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                            <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                          </svg>
                          {formatDate(memory.memory_date)}
                        </span>
                      </>
                    )}
                  </div>

                  {/* Location */}
                  {memory.location && (
                    <p className="text-[11px] text-[#1A2B48]/40 dark:text-[#8C5D5D] truncate">
                      📍 {memory.location}
                    </p>
                  )}

                  {/* Story excerpt */}
                  {memory.body && (
                    <p className="text-sm text-[#1A2B48]/55 dark:text-[#8C5D5D] line-clamp-4 leading-relaxed mt-0.5">
                      {memory.body}
                    </p>
                  )}

                  {/* Read more */}
                  <div className="mt-auto pt-3 border-t border-black/5 dark:border-[#D9C1BF]/8">
                    <span className="text-sm font-medium text-[#C96B60] dark:text-[#BF8F8F] group-hover:underline transition-all">
                      Read more ›
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 rounded-2xl bg-white/40 dark:bg-[#591F12]/30 border border-white/30 dark:border-[#D9C1BF]/8 space-y-5">
            <div className="text-5xl">❤️</div>
            <div className="space-y-1">
              <h3 className="font-serif text-lg font-bold text-[#1A2B48] dark:text-[#D9C1BF]">No memories yet</h3>
              <p className="font-serif italic text-[#1A2B48]/50 dark:text-[#BF8F8F] text-sm px-6">
                Start logging your journey together by adding your very first memory.
              </p>
            </div>
            <Link
              to="/memories/new"
              className="inline-block px-6 py-2.5 rounded-xl bg-[#C96B60] dark:bg-[#8E5B60] text-white text-sm font-semibold hover:bg-[#B05A50] dark:hover:bg-[#BF8F8F]/80 transition-colors"
            >
              + Add your first memory
            </Link>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default MemoriesPage;
