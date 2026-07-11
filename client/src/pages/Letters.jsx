import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import AppLayout from '../components/AppLayout';
import { getLetters, deleteLetter, pinLetter } from '../api/letters';
import FavoriteRounded from '@mui/icons-material/FavoriteRounded';
import SentimentSatisfiedAltRounded from '@mui/icons-material/SentimentSatisfiedAltRounded';
import WaterDropRounded from '@mui/icons-material/WaterDropRounded';
import LocalFireDepartmentRounded from '@mui/icons-material/LocalFireDepartmentRounded';
import NightlightRoundedIcon from '@mui/icons-material/NightlightRounded';
import AddRounded from '@mui/icons-material/AddRounded';
import SearchRounded from '@mui/icons-material/SearchRounded';
import CloseRounded from '@mui/icons-material/CloseRounded';
import PushPinRounded from '@mui/icons-material/PushPinRounded';
import MoreHorizRounded from '@mui/icons-material/MoreHorizRounded';
import ChatBubbleOutlineRounded from '@mui/icons-material/ChatBubbleOutlineRounded';
import MailOutlineRounded from '@mui/icons-material/MailOutlineRounded';
import DeleteOutlineRounded from '@mui/icons-material/DeleteOutlineRounded';

/* ── Moods (shared with LetterCreate / LetterDetail). No emoji — Material icons. ── */
export const MOODS = [
  { key: 'romantic', label: 'Romantic', emoji: '', Icon: FavoriteRounded, bg: 'bg-[#FFE1E7]', text: 'text-[#C44569]' },
  { key: 'funny', label: 'Funny', emoji: '', Icon: SentimentSatisfiedAltRounded, bg: 'bg-amber-50', text: 'text-amber-600' },
  { key: 'emotional', label: 'Emotional', emoji: '', Icon: WaterDropRounded, bg: 'bg-sky-50', text: 'text-sky-600' },
  { key: 'passionate', label: 'Passionate', emoji: '', Icon: LocalFireDepartmentRounded, bg: 'bg-orange-50', text: 'text-orange-600' },
  { key: 'latenight', label: 'Late Night', emoji: '', Icon: NightlightRoundedIcon, bg: 'bg-violet-50', text: 'text-violet-600' },
];

const getMood = (key) => MOODS.find((m) => m.key === key) || MOODS[0];

const fmtDate = (dateStr) => {
  if (!dateStr) return '';
  const parts = dateStr.split('T')[0].split('-');
  if (parts.length !== 3) return '';
  const d = new Date(parts[0], parseInt(parts[1]) - 1, parseInt(parts[2]));
  return d.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });
};

/* ── Delete confirmation modal ── */
const DeleteModal = ({ onCancel, onConfirm, busy }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 z-[60] flex items-center justify-center bg-[#352F36]/40 backdrop-blur-sm px-4"
    onClick={onCancel}
  >
    <motion.div
      initial={{ scale: 0.92, opacity: 0, y: 16 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      exit={{ scale: 0.92, opacity: 0, y: 16 }}
      onClick={(e) => e.stopPropagation()}
      className="w-full max-w-sm rounded-[28px] bg-white p-7 shadow-romance-lg border border-[#F1D7DD] text-center"
    >
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#FFE1E7]">
        <DeleteOutlineRounded style={{ fontSize: 26 }} className="text-[#E85D75]" />
      </div>
      <h3 className="font-heading text-xl text-[#352F36] mb-1">Delete this conversation?</h3>
      <p className="text-sm text-[#7A6A73] mb-6">This memory of words will be gone forever.</p>
      <div className="flex gap-3">
        <button onClick={onCancel} className="flex-1 py-3 rounded-full border border-[#F1D7DD] text-sm font-medium text-[#7A6A73] hover:bg-[#FFF1F3] transition-colors">
          Keep it
        </button>
        <button onClick={onConfirm} disabled={busy} className="flex-1 py-3 rounded-full romance-btn text-sm disabled:opacity-50">
          {busy ? 'Deleting…' : 'Delete'}
        </button>
      </div>
    </motion.div>
  </motion.div>
);

/* ── Letter card ── */
const LetterCard = ({ letter, navigate, onPin, onDelete, index }) => {
  const mood = getMood(letter.mood);
  const [menuOpen, setMenuOpen] = useState(false);
  const preview = letter.preview || letter.first_message || '';
  const count = letter.message_count ?? letter.messages?.length ?? 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.4) }}
      onClick={() => navigate(`/letters/${letter.id}`)}
      className="group relative flex flex-col cursor-pointer rounded-[24px] bg-white border border-[#F1D7DD] shadow-romance p-6 transition-all duration-300 hover:-translate-y-2 hover:shadow-romance-lg"
    >
      {/* top row */}
      <div className="flex items-center justify-between mb-3">
        <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[12px] font-medium ${mood.bg} ${mood.text}`}>
          <mood.Icon style={{ fontSize: 14 }} />
          {mood.label}
        </span>
        <div className="flex items-center gap-1">
          {letter.is_pinned && <PushPinRounded style={{ fontSize: 16 }} className="text-[#E85D75]" />}
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen((o) => !o);
              }}
              className="flex h-8 w-8 items-center justify-center rounded-full text-[#7A6A73] hover:bg-[#FFF1F3] hover:text-[#C44569] transition-colors"
              aria-label="More options"
            >
              <MoreHorizRounded style={{ fontSize: 18 }} />
            </button>
            <AnimatePresence>
              {menuOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -6 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -6 }}
                  transition={{ duration: 0.14 }}
                  onClick={(e) => e.stopPropagation()}
                  className="absolute right-0 top-full mt-1 w-44 rounded-2xl bg-white shadow-romance border border-[#F1D7DD] overflow-hidden z-20"
                >
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      onPin(letter);
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-[13px] text-[#352F36] hover:bg-[#FFF1F3] hover:text-[#C44569] transition-colors text-left"
                  >
                    <PushPinRounded style={{ fontSize: 16 }} />
                    {letter.is_pinned ? 'Unpin from Dashboard' : 'Pin to Dashboard'}
                  </button>
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      onDelete(letter);
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-[13px] text-[#E85D75] hover:bg-[#FFE1E7] transition-colors text-left"
                  >
                    <DeleteOutlineRounded style={{ fontSize: 16 }} />
                    Delete
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {letter.label && <p className="text-[11px] font-medium uppercase tracking-wider text-[#C44569]/70 mb-1">{letter.label}</p>}

      <h3 className="font-heading text-xl text-[#352F36] group-hover:text-[#C44569] transition-colors leading-snug">
        {letter.title}
      </h3>
      <p className="text-xs text-[#7A6A73] mt-1">{fmtDate(letter.letter_date)}</p>

      {preview && (
        <p className="text-sm text-[#7A6A73] mt-3 line-clamp-2 leading-relaxed italic">
          &ldquo;{preview}&rdquo;
        </p>
      )}

      <div className="mt-auto pt-4 flex items-center gap-1.5 text-[12px] text-[#7A6A73]">
        <ChatBubbleOutlineRounded style={{ fontSize: 15 }} className="text-[#E85D75]" />
        {count} {count === 1 ? 'message' : 'messages'}
      </div>
    </motion.div>
  );
};

/* ══════════════════════════════════════════════════════════ */
const Letters = () => {
  const navigate = useNavigate();
  const [letters, setLetters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [filterMood, setFilterMood] = useState('all');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = () => {
    setLoading(true);
    getLetters()
      .then((data) => {
        setLetters(Array.isArray(data) ? data : data?.letters || []);
        setError('');
      })
      .catch((e) => {
        setError(e?.response?.data?.error || 'Could not load conversations.');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handlePin = async (letter) => {
    const newPin = !letter.is_pinned;
    setLetters((prev) =>
      prev.map((l) => ({
        ...l,
        is_pinned: l.id === letter.id ? newPin : newPin ? false : l.is_pinned,
      }))
    );
    try {
      await pinLetter(letter.id, newPin);
    } catch {
      load();
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteLetter(deleteTarget.id);
      setLetters((prev) => prev.filter((l) => l.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch {
      /* keep modal open on failure */
    } finally {
      setDeleting(false);
    }
  };

  const filtered = letters.filter((l) => {
    const matchMood = filterMood === 'all' || l.mood === filterMood;
    const q = search.trim().toLowerCase();
    const matchSearch =
      !q ||
      l.title?.toLowerCase().includes(q) ||
      l.label?.toLowerCase().includes(q) ||
      l.preview?.toLowerCase().includes(q);
    return matchMood && matchSearch;
  });

  const AddBtn = (
    <button onClick={() => navigate('/letters/new')} className="romance-btn text-sm">
      <AddRounded style={{ fontSize: 18 }} /> Save a Conversation
    </button>
  );

  return (
    <AppLayout pageTitle="Letters" pageActions={AddBtn}>
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Hero */}
        <div className="text-center">
          <span className="romance-chip inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium">
            <MailOutlineRounded style={{ fontSize: 14 }} /> A Memory of Words
          </span>
          <h2 className="font-heading text-4xl font-semibold text-[#352F36] mt-4">Saved Conversations</h2>
          <p className="text-[#7A6A73] mt-2 max-w-lg mx-auto">
            The messages that meant everything — kept forever, frozen in time.
          </p>
        </div>

        {/* Search + filters */}
        {(letters.length > 0 || search || filterMood !== 'all') && (
          <div className="space-y-4">
            <div className="relative max-w-xl mx-auto">
              <div className="relative flex items-center bg-white border border-[#F1D7DD] rounded-full shadow-romance-soft focus-within:border-[#E85D75]/50 transition-all">
                <span className="pl-5 text-[#E85D75]">
                  <SearchRounded style={{ fontSize: 20 }} />
                </span>
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search conversations..."
                  className="flex-1 bg-transparent border-0 px-3 py-3.5 text-[#352F36] placeholder-[#7A6A73]/60 text-sm focus:outline-none"
                />
                {search && (
                  <button onClick={() => setSearch('')} className="pr-5 text-[#7A6A73] hover:text-[#E85D75]" aria-label="Clear">
                    <CloseRounded style={{ fontSize: 18 }} />
                  </button>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2">
              <button
                onClick={() => setFilterMood('all')}
                className={`rounded-full px-4 py-1.5 text-[12px] font-medium transition-colors ${
                  filterMood === 'all' ? 'bg-[#C44569] text-white' : 'bg-[#FFF1F3] text-[#C44569] hover:bg-[#F7CAD0]'
                }`}
              >
                All
              </button>
              {MOODS.map((m) => (
                <button
                  key={m.key}
                  onClick={() => setFilterMood(m.key)}
                  className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-[12px] font-medium transition-colors ${
                    filterMood === m.key ? 'bg-[#C44569] text-white' : `${m.bg} ${m.text} hover:opacity-80`
                  }`}
                >
                  <m.Icon style={{ fontSize: 14 }} />
                  {m.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse rounded-[24px] bg-white border border-[#F1D7DD] shadow-romance-soft p-6 space-y-3">
                <div className="h-6 w-24 rounded-full bg-[#FFF1F3]" />
                <div className="h-5 w-3/4 rounded-full bg-[#FFF1F3]" />
                <div className="h-4 w-full rounded-full bg-[#FFF1F3]" />
                <div className="h-4 w-1/2 rounded-full bg-[#FFF1F3]" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-16 romance-card space-y-4">
            <p className="text-[#C44569] font-medium">{error}</p>
            <button onClick={load} className="romance-btn-soft text-sm">
              Try again
            </button>
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((letter, i) => (
              <LetterCard
                key={letter.id}
                letter={letter}
                index={i}
                navigate={navigate}
                onPin={handlePin}
                onDelete={setDeleteTarget}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 romance-card space-y-5">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#FFF1F3]">
              <MailOutlineRounded style={{ fontSize: 30 }} className="text-[#E85D75]" />
            </div>
            <div className="space-y-1">
              <h3 className="font-heading text-2xl text-[#352F36]">
                {letters.length === 0 ? 'No saved conversations yet' : 'Nothing matches your search'}
              </h3>
              <p className="font-heading italic text-[#7A6A73] text-sm px-6">
                {letters.length === 0
                  ? 'Save your most meaningful text exchanges — a memory of words, frozen in time.'
                  : 'Try a different search or mood filter.'}
              </p>
            </div>
            {letters.length === 0 && (
              <button onClick={() => navigate('/letters/new')} className="romance-btn inline-flex">
                <AddRounded style={{ fontSize: 18 }} /> Save your first conversation
              </button>
            )}
          </div>
        )}
      </div>

      <AnimatePresence>
        {deleteTarget && <DeleteModal onCancel={() => setDeleteTarget(null)} onConfirm={confirmDelete} busy={deleting} />}
      </AnimatePresence>
    </AppLayout>
  );
};

export default Letters;
