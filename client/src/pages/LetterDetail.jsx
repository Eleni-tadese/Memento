import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import AppLayout from '../components/AppLayout'
import { useAuth } from '../context/AuthContext'
import { getLetter, deleteLetter, pinLetter } from '../api/letters'
import { MOODS } from './Letters'

const getMood = (key) => MOODS.find(m => m.key === key) || MOODS[0]

const fmtDate = (d) => {
  if (!d) return ''
  return new Date(d).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
}

/* ── A single chat bubble ── */
const Bubble = ({ msg, isMine, senderName, isFirst }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: Math.random() * 0.15 }}
    className={`flex flex-col gap-0.5 ${isMine ? 'items-end' : 'items-start'}`}
  >
    {isFirst && (
      <span className={`text-[11px] font-semibold mb-0.5 px-1 ${isMine ? 'text-[#C44569]/60 dark:text-[#CBA24A]/60' : 'text-[#352F36]/45 dark:text-[#D9C1BF]/45'}`}>
        {senderName}
      </span>
    )}
    <div className={`relative max-w-[72%] px-4 py-2.5 shadow-sm
      ${isMine
        ? 'bg-[#C44569] text-white rounded-2xl rounded-br-sm dark:bg-[#C44569]'
        : 'bg-[#FEFEFE] dark:bg-[#5A2532]/60 text-[#352F36] dark:text-[#D9C1BF] rounded-2xl rounded-bl-sm border border-[#E8BFB6]/50 dark:border-[#CBA24A]/15'
      }`}
    >
      <p className="text-[14px] leading-relaxed whitespace-pre-wrap break-words">{msg.text}</p>
      <span className={`block text-right mt-1 text-[10px] ${isMine ? 'text-white/50' : 'text-[#352F36]/35 dark:text-[#D9C1BF]/35'}`}>
        {msg.msg_time}
      </span>
    </div>
  </motion.div>
)

/* ── Delete confirm modal ── */
const DeleteModal = ({ onConfirm, onCancel }) => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
    onClick={onCancel}
  >
    <motion.div initial={{ scale: 0.92 }} animate={{ scale: 1 }}
      className="w-full max-w-sm rounded-2xl bg-[#FFF8F8] dark:bg-[#2A1218] border border-[#E8BFB6]/50 dark:border-[#CBA24A]/15 p-6 shadow-2xl"
      onClick={e => e.stopPropagation()}
    >
      <h3 className="font-serif text-xl font-bold text-[#352F36] dark:text-[#D9C1BF] mb-2">Delete this conversation?</h3>
      <p className="text-sm text-[#352F36]/60 dark:text-[#D9C1BF]/60 mb-6">This memory will be permanently removed. This cannot be undone.</p>
      <div className="flex gap-3">
        <button onClick={onCancel}
          className="flex-1 rounded-xl border border-[#E8BFB6] dark:border-[#CBA24A]/20 py-2.5 text-sm font-semibold text-[#352F36]/60 dark:text-[#D9C1BF]/60 hover:bg-[#E8BFB6]/30 dark:hover:bg-[#5A2532]/30 transition-colors">
          Cancel
        </button>
        <button onClick={onConfirm}
          className="flex-1 rounded-xl bg-[#C44569] py-2.5 text-sm font-semibold text-white hover:bg-[#E85D75] transition-colors">
          Delete forever
        </button>
      </div>
    </motion.div>
  </motion.div>
)

export default function LetterDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const bottomRef = useRef(null)

  const [letter, setLetter] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showDelete, setShowDelete] = useState(false)
  const [pinning, setPinning] = useState(false)

  useEffect(() => {
    getLetter(id)
      .then(data => { setLetter(data); setLoading(false) })
      .catch(() => { setLoading(false) })
  }, [id])

  useEffect(() => {
    if (letter) {
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 200)
    }
  }, [letter])

  const handleDelete = async () => {
    await deleteLetter(id)
    navigate('/letters')
  }

  const handlePin = async () => {
    setPinning(true)
    const newPin = !letter.is_pinned
    await pinLetter(id, newPin)
    setLetter(prev => ({ ...prev, is_pinned: newPin }))
    setPinning(false)
  }

  if (loading) return (
    <AppLayout title="Letters">
      <div className="flex items-center justify-center py-32">
        <div className="h-8 w-8 rounded-full border-2 border-[#C44569]/20 border-t-[#C44569] animate-spin" />
      </div>
    </AppLayout>
  )

  if (!letter) return (
    <AppLayout title="Letters">
      <div className="py-24 text-center text-[#352F36]/50 dark:text-[#D9C1BF]/50">Conversation not found.</div>
    </AppLayout>
  )

  const mood = getMood(letter.mood)
  const isCreator = String(user?.id) === String(letter.created_by_user_id)

  /* Group consecutive messages by same sender for visual grouping */
  const groupedMessages = letter.messages.map((msg, idx) => ({
    ...msg,
    isMine: (msg.sender === 'me' && isCreator) || (msg.sender === 'partner' && !isCreator),
    isFirst: idx === 0 || letter.messages[idx - 1].sender !== msg.sender,
  }))

  /* My display name and partner's label */
  const myName = user?.display_name || 'Me'
  const partnerName = 'Partner'

  return (
    <AppLayout title={letter.title}>
      <div className="mx-auto max-w-2xl">

        {/* ── Top toolbar ── */}
        <div className="mb-6 flex items-center justify-between gap-4">
          <button
            onClick={() => navigate('/letters')}
            className="inline-flex items-center gap-1.5 rounded-xl border border-[#E8BFB6]/60 dark:border-[#CBA24A]/15 px-3 py-2 text-sm font-medium text-[#352F36]/60 dark:text-[#D9C1BF]/60 hover:bg-[#C44569]/5 dark:hover:bg-[#CBA24A]/5 hover:text-[#C44569] dark:hover:text-[#CBA24A] transition-colors"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Letters
          </button>

          <div className="flex items-center gap-2">
            {/* Pin */}
            <button
              onClick={handlePin}
              disabled={pinning}
              title={letter.is_pinned ? 'Unpin from dashboard' : 'Pin to dashboard'}
              className={`rounded-xl border px-3 py-2 text-sm font-medium transition-colors ${
                letter.is_pinned
                  ? 'border-[#CBA24A]/40 bg-[#CBA24A]/10 text-[#CBA24A]'
                  : 'border-[#E8BFB6]/60 dark:border-[#CBA24A]/15 text-[#352F36]/50 dark:text-[#D9C1BF]/50 hover:bg-[#CBA24A]/8 hover:text-[#CBA24A]'
              }`}
            >
              {letter.is_pinned ? 'Pinned' : 'Pin'}
            </button>

            {/* Edit */}
            <button
              onClick={() => navigate(`/letters/${id}/edit`)}
              className="rounded-xl border border-[#E8BFB6]/60 dark:border-[#CBA24A]/15 px-3 py-2 text-sm font-medium text-[#352F36]/50 dark:text-[#D9C1BF]/50 hover:bg-[#C44569]/5 hover:text-[#C44569] dark:hover:text-[#CBA24A] transition-colors"
            >
              Edit
            </button>

            {/* Delete */}
            <button
              onClick={() => setShowDelete(true)}
              className="rounded-xl border border-red-200 dark:border-red-900/30 px-3 py-2 text-sm font-medium text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
            >
              Delete
            </button>
          </div>
        </div>

        {/* ── Conversation header card ── */}
        <div className="mb-6 rounded-2xl border border-[#E8BFB6]/60 dark:border-[#CBA24A]/15 bg-[#FEFEFE] dark:bg-[#2A1218]/80 p-6 text-center shadow-sm">
          <div className="mb-2 text-4xl">{mood.emoji}</div>
          <h1 className="font-serif text-2xl font-bold text-[#352F36] dark:text-[#D9C1BF] mb-1">
            {letter.title}
          </h1>
          <p className="text-sm text-[#352F36]/45 dark:text-[#D9C1BF]/45 mb-3">{fmtDate(letter.letter_date)}</p>
          <div className="flex items-center justify-center gap-2">
            <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-[12px] font-semibold ${mood.bg} ${mood.text}`}>
              {mood.emoji} {mood.label}
            </span>
            {letter.label && (
              <span className="rounded-full bg-[#C44569]/8 dark:bg-[#CBA24A]/10 px-3 py-1 text-[12px] italic text-[#C44569]/70 dark:text-[#CBA24A]/60">
                {letter.label}
              </span>
            )}
            <span className="text-[12px] text-[#352F36]/30 dark:text-[#D9C1BF]/30">
              {letter.messages.length} messages
            </span>
          </div>
        </div>

        {/* ── Chat bubble thread ── */}
        <div className="rounded-2xl border border-[#E8BFB6]/60 dark:border-[#CBA24A]/15 bg-[#F8E4DF]/40 dark:bg-[#1A0B10]/60 overflow-hidden shadow-sm">
          {/* Fake phone status bar / chat header */}
          <div className="flex items-center gap-3 border-b border-[#E8BFB6]/50 dark:border-[#CBA24A]/10 bg-[#FEFEFE] dark:bg-[#2A1218] px-4 py-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#C44569]/15 dark:bg-[#CBA24A]/15 text-lg">
              {mood.emoji}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold text-[#352F36] dark:text-[#D9C1BF] truncate">{letter.title}</p>
              <p className="text-[11px] text-[#352F36]/40 dark:text-[#D9C1BF]/40">{fmtDate(letter.letter_date)} · frozen in time</p>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[11px] text-[#352F36]/35 dark:text-[#D9C1BF]/35">saved</span>
            </div>
          </div>

          {/* Messages */}
          <div className="flex flex-col gap-3 px-4 py-5 min-h-[200px]">
            {letter.messages.length === 0 ? (
              <p className="text-center text-sm text-[#352F36]/35 dark:text-[#D9C1BF]/35 py-8">No messages saved yet.</p>
            ) : (
              groupedMessages.map((msg, idx) => (
                <Bubble
                  key={msg.id || idx}
                  msg={msg}
                  isMine={msg.isMine}
                  isFirst={msg.isFirst}
                  senderName={msg.isMine ? myName : partnerName}
                />
              ))
            )}
            <div ref={bottomRef} />
          </div>

          {/* Frozen in time footer */}
          <div className="border-t border-[#E8BFB6]/50 dark:border-[#CBA24A]/10 bg-[#FEFEFE] dark:bg-[#2A1218] px-4 py-3 text-center">
            <p className="text-[11px] text-[#352F36]/30 dark:text-[#D9C1BF]/30 italic">
              This conversation is frozen in time — a memory preserved forever
            </p>
          </div>
        </div>

        <div className="h-10" />
      </div>

      <AnimatePresence>
        {showDelete && (
          <DeleteModal onConfirm={handleDelete} onCancel={() => setShowDelete(false)} />
        )}
      </AnimatePresence>
    </AppLayout>
  )
}
