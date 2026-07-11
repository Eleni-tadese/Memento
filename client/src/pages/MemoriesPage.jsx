import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { getMemories } from '../api/memories';
import AppLayout from '../components/AppLayout';
import SearchRounded from '@mui/icons-material/SearchRounded';
import CloseRounded from '@mui/icons-material/CloseRounded';
import AddRounded from '@mui/icons-material/AddRounded';
import FavoriteRounded from '@mui/icons-material/FavoriteRounded';
import FavoriteBorderRounded from '@mui/icons-material/FavoriteBorderRounded';
import IosShareRounded from '@mui/icons-material/IosShareRounded';
import MoreHorizRounded from '@mui/icons-material/MoreHorizRounded';
import LocationOnRounded from '@mui/icons-material/LocationOnRounded';
import CalendarMonthRounded from '@mui/icons-material/CalendarMonthRounded';
import PhotoCameraRounded from '@mui/icons-material/PhotoCameraRounded';
import PlayArrowRounded from '@mui/icons-material/PlayArrowRounded';
import EditRounded from '@mui/icons-material/EditRounded';
import FormatQuoteRounded from '@mui/icons-material/FormatQuoteRounded';
import LocalFloristRounded from '@mui/icons-material/LocalFloristRounded';
import { getCoupleItem, setCoupleItem } from '../utils/coupleStorage';
import { getQuotes, saveQuotes } from '../api/quotes';

const FAVS_KEY = 'memento_fav_memories';
const QUOTES_KEY = 'memento_couple_quotes';

const MemoriesPage = () => {
  const navigate = useNavigate();
  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [error, setError] = useState('');

  /* ── favorites (client-side flag, purely visual) ── */
  const [favs, setFavs] = useState(() => {
    try {
      return new Set(JSON.parse(getCoupleItem(FAVS_KEY) || '[]'));
    } catch {
      return new Set();
    }
  });
  const toggleFav = (id) => {
    setFavs((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      setCoupleItem(FAVS_KEY, JSON.stringify([...next]));
      return next;
    });
  };

  const shareMemory = async (memory) => {
    const url = `${window.location.origin}/memories/${memory.id}`;
    try {
      if (navigator.share) await navigator.share({ title: memory.title, url });
      else await navigator.clipboard.writeText(url);
    } catch {
      /* user cancelled */
    }
  };

  /* ── Couple quotes / blessings ──────────────────────────────────────────
     Quotes now live on the SERVER, scoped to the relationship, so they are
     shared between both partners and can never leak into another couple's
     account. The scoped localStorage copy is kept only as an instant offline
     cache while the request is in flight. */
  const readCache = () => {
    try {
      const raw = getCoupleItem(QUOTES_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  };

  const [quotes, setQuotes] = useState(readCache);
  const [editingIdx, setEditingIdx] = useState(null);
  const [tempQuote, setTempQuote] = useState({ text: '', author: '' });

  // Load the authoritative list from the server on mount.
  useEffect(() => {
    let alive = true;
    getQuotes()
      .then((serverQuotes) => {
        if (!alive) return;
        setQuotes(serverQuotes);
        setCoupleItem(QUOTES_KEY, JSON.stringify(serverQuotes));
      })
      .catch(() => { /* keep the cached copy on network / setup error */ });
    return () => { alive = false; };
  }, []);

  // Persist a new list to the server (and mirror to the scoped cache).
  const persistQuotes = (next) => {
    setQuotes(next);
    setCoupleItem(QUOTES_KEY, JSON.stringify(next));
    saveQuotes(next).catch(() => { /* cache already updated; will re-sync next load */ });
  };

  const openNew = () => {
    setTempQuote({ text: '', author: '' });
    setEditingIdx(-1);
  };
  const openEdit = (i) => {
    setTempQuote({ ...quotes[i] });
    setEditingIdx(i);
  };
  const closeModal = () => setEditingIdx(null);

  const saveQuote = () => {
    if (!tempQuote.text.trim()) return;
    const q = { text: tempQuote.text.trim(), author: tempQuote.author.trim() };
    const next = editingIdx === -1 ? [...quotes, q] : quotes.map((old, i) => (i === editingIdx ? q : old));
    persistQuotes(next);
    closeModal();
  };

  const deleteQuote = (i) => {
    const next = quotes.filter((_, idx) => idx !== i);
    persistQuotes(next);
    closeModal();
  };

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
    <Link to="/memories/new" className="romance-btn text-sm">
      <AddRounded style={{ fontSize: 18 }} /> Add Memory
    </Link>
  );

  return (
    <AppLayout pageTitle="Our Memories" pageActions={AddBtn}>
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Search bar */}
        <div className="relative max-w-xl">
          <div className="relative flex items-center bg-white border border-[#F1D7DD] rounded-full shadow-romance-soft focus-within:border-[#E85D75]/50 transition-all">
            <span className="pl-5 text-[#E85D75]">
              <SearchRounded style={{ fontSize: 20 }} />
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search memories by title or story..."
              className="flex-1 bg-transparent border-0 px-3 py-3.5 text-[#352F36] placeholder-[#7A6A73]/60 text-sm focus:outline-none focus:ring-0"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="pr-5 text-[#7A6A73] hover:text-[#E85D75] transition-colors"
                aria-label="Clear search"
              >
                <CloseRounded style={{ fontSize: 18 }} />
              </button>
            )}
          </div>
        </div>

        {/* ── Couple quotes / blessings ── */}
        <div className="space-y-3">
          <AnimatePresence initial={false}>
            {quotes.map((q, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.35, delay: i * 0.05 }}
                className="group relative overflow-hidden rounded-[24px] border border-[#F1D7DD] bg-gradient-to-br from-white to-[#FFF1F3] shadow-romance-soft"
              >
                <FormatQuoteRounded
                  className="absolute top-3 left-4 text-[#F7CAD0] select-none pointer-events-none"
                  style={{ fontSize: 52 }}
                  aria-hidden="true"
                />
                <div className="px-8 py-7 text-center space-y-3 relative">
                  <p className="font-heading text-lg md:text-xl leading-relaxed text-[#352F36] italic whitespace-pre-wrap">
                    {q.text}
                  </p>
                  {q.author && (
                    <>
                      <div className="flex items-center justify-center gap-3">
                        <div className="h-px w-8 bg-gradient-to-r from-transparent to-[#F7CAD0]" />
                        <LocalFloristRounded style={{ fontSize: 14 }} className="text-[#E85D75]/60" />
                        <div className="h-px w-8 bg-gradient-to-l from-transparent to-[#F7CAD0]" />
                      </div>
                      <p className="font-body text-sm text-[#7A6A73]">— {q.author}</p>
                    </>
                  )}
                </div>
                <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <button
                    onClick={() => openEdit(i)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-sm border border-[#F1D7DD] text-[11px] text-[#C44569] font-medium shadow-sm hover:bg-white transition-colors"
                  >
                    <EditRounded style={{ fontSize: 13 }} /> Edit
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {quotes.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-[24px] border-2 border-dashed border-[#F1D7DD] bg-white/50 py-8 px-6 text-center"
            >
              <LocalFloristRounded style={{ fontSize: 28 }} className="text-[#E85D75] mb-2" />
              <p className="font-heading italic text-sm text-[#7A6A73] mb-4 leading-relaxed">
                Add a quote, blessing, or wish to your memories page
              </p>
              <button onClick={openNew} className="romance-btn text-xs">
                <AddRounded style={{ fontSize: 16 }} /> Add Quote or Blessing
              </button>
            </motion.div>
          ) : (
            <button
              onClick={openNew}
              className="w-full py-3 rounded-full border border-dashed border-[#F1D7DD] text-xs text-[#7A6A73] hover:border-[#E85D75]/50 hover:text-[#C44569] hover:bg-[#FFF1F3] transition-all duration-200 flex items-center justify-center gap-1.5"
            >
              <AddRounded style={{ fontSize: 16 }} /> Add another quote or blessing
            </button>
          )}
        </div>

        {/* ── Quote editor modal ── */}
        <AnimatePresence>
          {editingIdx !== null && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 bg-[#352F36]/40 backdrop-blur-sm flex items-center justify-center p-4"
              onClick={closeModal}
            >
              <motion.div
                initial={{ opacity: 0, y: 24, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 16, scale: 0.97 }}
                transition={{ duration: 0.22, ease: 'easeOut' }}
                className="w-full max-w-md bg-white rounded-[28px] shadow-romance-lg p-7 border border-[#F1D7DD]"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-heading text-xl text-[#352F36]">
                    {editingIdx === -1 ? 'New Quote or Blessing' : 'Edit Quote'}
                  </h3>
                  <button onClick={closeModal} className="text-[#7A6A73] hover:text-[#E85D75] transition-colors">
                    <CloseRounded style={{ fontSize: 22 }} />
                  </button>
                </div>
                <p className="text-xs text-[#7A6A73] mb-5">
                  A verse, blessing, poem line, or any words meaningful to you as a couple
                </p>

                <label className="block text-xs font-medium text-[#352F36] mb-1.5">Quote / Blessing</label>
                <textarea
                  rows={5}
                  value={tempQuote.text}
                  onChange={(e) => setTempQuote((q) => ({ ...q, text: e.target.value }))}
                  placeholder={`e.g. "Love bears all things, believes all things, hopes all things…"`}
                  className="w-full rounded-2xl border border-[#F1D7DD] bg-[#FFF8F8] px-4 py-3 text-sm text-[#352F36] placeholder-[#7A6A73]/50 focus:outline-none focus:ring-2 focus:ring-[#E85D75]/30 resize-none font-heading italic leading-relaxed"
                  autoFocus
                />

                <label className="block text-xs font-medium text-[#352F36] mt-4 mb-1.5">
                  Attribution <span className="font-normal text-[#7A6A73]">(optional)</span>
                </label>
                <input
                  type="text"
                  value={tempQuote.author}
                  onChange={(e) => setTempQuote((q) => ({ ...q, author: e.target.value }))}
                  placeholder="e.g. 1 Corinthians 13:7, or the author's name"
                  className="w-full rounded-2xl border border-[#F1D7DD] bg-[#FFF8F8] px-4 py-2.5 text-sm text-[#352F36] placeholder-[#7A6A73]/50 focus:outline-none focus:ring-2 focus:ring-[#E85D75]/30"
                />

                <div className="flex gap-2 mt-6">
                  <button onClick={saveQuote} disabled={!tempQuote.text.trim()} className="romance-btn flex-1 text-sm disabled:opacity-40 disabled:cursor-not-allowed">
                    Save
                  </button>
                  {editingIdx >= 0 && (
                    <button
                      onClick={() => deleteQuote(editingIdx)}
                      className="px-5 py-2.5 rounded-full border border-[#E85D75]/40 text-[#E85D75] text-sm hover:bg-[#FFE1E7] transition-colors"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {error && (
          <div className="rounded-2xl border border-[#E85D75]/30 bg-[#FFE1E7] px-4 py-2.5 text-center text-sm font-medium text-[#C44569]">
            {error}
          </div>
        )}

        {/* Memory grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="animate-pulse rounded-[24px] overflow-hidden bg-white shadow-romance-soft border border-[#F1D7DD]">
                <div className="h-52 bg-[#FFF1F3]" />
                <div className="p-5 space-y-3">
                  <div className="h-5 rounded-full bg-[#FFF1F3] w-3/4" />
                  <div className="h-4 rounded-full bg-[#FFF1F3] w-full" />
                  <div className="h-3 rounded-full bg-[#FFF1F3] w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : memories.length > 0 ? (
          <div className="grid grid-cols-1 gap-7 md:grid-cols-3">
            {memories.map((memory, idx) => {
              const isFav = favs.has(memory.id);
              return (
                <motion.article
                  key={memory.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: Math.min(idx * 0.05, 0.4) }}
                  onClick={() => navigate(`/memories/${memory.id}`)}
                  className="group flex flex-col overflow-hidden rounded-[24px] border border-[#F1D7DD] bg-white shadow-romance cursor-pointer transition-all duration-300 hover:-translate-y-2 hover:shadow-romance-lg"
                >
                  {/* Image */}
                  <div className="relative w-full overflow-hidden bg-[#FFF1F3]" style={{ height: '220px' }}>
                    {memory.cover_image ? (
                      <>
                        <img
                          src={memory.cover_image}
                          alt=""
                          aria-hidden="true"
                          className="absolute object-cover"
                          style={{
                            top: '-12px',
                            left: '-12px',
                            width: 'calc(100% + 24px)',
                            height: 'calc(100% + 24px)',
                            filter: 'blur(14px) brightness(0.95)',
                          }}
                        />
                        <img
                          src={memory.cover_image}
                          alt={memory.title}
                          className="absolute inset-0 h-full w-full object-contain transition-transform duration-700 group-hover:scale-110"
                          style={{ zIndex: 1 }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" style={{ zIndex: 2 }} />
                      </>
                    ) : (
                      <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-[#FFF1F3] to-[#F7CAD0]/60">
                        <PhotoCameraRounded style={{ fontSize: 40 }} className="text-[#E85D75]/50" />
                        <span className="font-heading italic text-[12px] text-[#7A6A73]">A moment worth keeping</span>
                      </div>
                    )}

                    {/* Date chip */}
                    {memory.memory_date && (
                      <div className="absolute top-3 left-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/85 backdrop-blur-sm text-[#C44569] text-[11px] font-medium shadow-sm" style={{ zIndex: 3 }}>
                        <CalendarMonthRounded style={{ fontSize: 13 }} />
                        {new Date(memory.memory_date).getFullYear()}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="absolute top-3 right-3 flex gap-1.5" style={{ zIndex: 3 }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFav(memory.id);
                        }}
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-white/85 backdrop-blur-sm shadow-sm hover:bg-white transition-colors"
                        aria-label="Favorite"
                      >
                        {isFav ? (
                          <FavoriteRounded style={{ fontSize: 17 }} className="text-[#E85D75]" />
                        ) : (
                          <FavoriteBorderRounded style={{ fontSize: 17 }} className="text-[#7A6A73]" />
                        )}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          shareMemory(memory);
                        }}
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-white/85 backdrop-blur-sm shadow-sm hover:bg-white transition-colors"
                        aria-label="Share"
                      >
                        <IosShareRounded style={{ fontSize: 16 }} className="text-[#7A6A73]" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/memories/${memory.id}`);
                        }}
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-white/85 backdrop-blur-sm shadow-sm hover:bg-white transition-colors"
                        aria-label="More"
                      >
                        <MoreHorizRounded style={{ fontSize: 18 }} className="text-[#7A6A73]" />
                      </button>
                    </div>

                    {memory.cover_type === 'video' && (
                      <div className="absolute inset-0 flex items-center justify-center" style={{ zIndex: 2 }}>
                        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/90 text-[#E85D75] shadow-lg">
                          <PlayArrowRounded style={{ fontSize: 26 }} />
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex flex-col flex-1 px-5 pt-5 pb-4 gap-2.5">
                    <h3 className="font-heading text-xl leading-snug text-[#352F36] group-hover:text-[#C44569] transition-colors duration-200">
                      {memory.title}
                    </h3>

                    <div className="flex items-center gap-3 text-[11px] text-[#7A6A73]">
                      <span>By {memory.created_by_name || 'Us'}</span>
                      {memory.memory_date && (
                        <>
                          <span className="text-[#F7CAD0]">•</span>
                          <span className="flex items-center gap-1">
                            <CalendarMonthRounded style={{ fontSize: 13 }} />
                            {formatDate(memory.memory_date)}
                          </span>
                        </>
                      )}
                    </div>

                    {memory.location && (
                      <p className="text-[12px] text-[#7A6A73] truncate flex items-center gap-1">
                        <LocationOnRounded style={{ fontSize: 14 }} className="text-[#E85D75]" />
                        {memory.location}
                      </p>
                    )}

                    {memory.body && (
                      <p className="text-sm text-[#7A6A73] line-clamp-3 leading-relaxed mt-0.5">{memory.body}</p>
                    )}

                    <div className="mt-auto pt-3 border-t border-[#F1D7DD]">
                      <span className="text-sm font-medium text-[#C44569] group-hover:gap-2 inline-flex items-center gap-1 transition-all">
                        Relive this moment →
                      </span>
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16 romance-card space-y-5">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#FFF1F3]">
              <FavoriteRounded style={{ fontSize: 30 }} className="text-[#E85D75]" />
            </div>
            <div className="space-y-1">
              <h3 className="font-heading text-2xl text-[#352F36]">No memories yet</h3>
              <p className="font-heading italic text-[#7A6A73] text-sm px-6">
                Start logging your journey together by adding your very first memory.
              </p>
            </div>
            <Link to="/memories/new" className="romance-btn inline-flex">
              <AddRounded style={{ fontSize: 18 }} /> Add your first memory
            </Link>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default MemoriesPage;
