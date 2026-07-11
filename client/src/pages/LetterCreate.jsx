import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence, Reorder } from 'framer-motion'
import AppLayout from '../components/AppLayout'
import { useAuth } from '../context/AuthContext'
import { createLetter, getLetter, updateLetter } from '../api/letters'
import { MOODS } from './Letters'

const getMood = (key) => MOODS.find(m => m.key === key) || MOODS[0]

const inputCls = `w-full rounded-xl border border-[#E8BFB6]/60 dark:border-[#CBA24A]/20
  bg-[#FEFEFE] dark:bg-[#2A1218] px-4 py-3 text-sm text-[#352F36] dark:text-[#D9C1BF]
  placeholder-[#352F36]/30 dark:placeholder-[#D9C1BF]/30
  focus:outline-none focus:ring-2 focus:ring-[#C44569]/25 dark:focus:ring-[#CBA24A]/20
  transition`

/* ── Draggable message row in builder ── */
const MessageRow = ({ msg, index, onDelete, myName }) => {
  const isMine = msg.sender === 'me'
  return (
    <Reorder.Item
      value={msg}
      dragListener={true}
      className={`flex items-start gap-2 rounded-xl p-2 select-none
        ${isMine ? 'flex-row-reverse' : 'flex-row'}`}
    >
      {/* Drag handle */}
      <div className="flex shrink-0 cursor-grab active:cursor-grabbing mt-2 opacity-30 hover:opacity-60 transition-opacity touch-none">
        <svg className="h-4 w-4 text-[#352F36] dark:text-[#D9C1BF]" fill="currentColor" viewBox="0 0 16 16">
          <path d="M5 4a1 1 0 110-2 1 1 0 010 2zm6 0a1 1 0 110-2 1 1 0 010 2zM5 9a1 1 0 110-2 1 1 0 010 2zm6 0a1 1 0 110-2 1 1 0 010 2zM5 14a1 1 0 110-2 1 1 0 010 2zm6 0a1 1 0 110-2 1 1 0 010 2z"/>
        </svg>
      </div>

      {/* Bubble preview */}
      <div className={`flex-1 flex flex-col gap-0.5 ${isMine ? 'items-end' : 'items-start'}`}>
        <span className="text-[10px] font-semibold text-[#352F36]/40 dark:text-[#D9C1BF]/40 px-1">
          {isMine ? myName : 'Partner'} · {msg.msg_time}
        </span>
        <div className={`max-w-[80%] rounded-xl px-3 py-2 text-[13px] leading-relaxed break-words
          ${isMine
            ? 'bg-[#C44569] text-white rounded-br-sm'
            : 'bg-[#FEFEFE] dark:bg-[#5A2532]/50 text-[#352F36] dark:text-[#D9C1BF] border border-[#E8BFB6]/50 dark:border-[#CBA24A]/15 rounded-bl-sm'
          }`}
        >
          {msg.text}
        </div>
      </div>

      {/* Delete button */}
      <button
        type="button"
        onClick={() => onDelete(index)}
        className="shrink-0 mt-2 flex h-6 w-6 items-center justify-center rounded-full text-red-400/60 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 transition-colors"
        title="Remove message"
      >
        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </Reorder.Item>
  )
}

/* ── Add message panel ── */
const AddMessagePanel = ({ onAdd, myName }) => {
  const [sender, setSender] = useState('me')
  const [text, setText] = useState('')
  const [time, setTime] = useState(() => {
    const now = new Date()
    return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
  })
  const textRef = useRef(null)

  const handleAdd = () => {
    const trimmed = text.trim()
    if (!trimmed) return
    onAdd({ sender, text: trimmed, msg_time: time, id: `temp-${Date.now()}` })
    setText('')
    textRef.current?.focus()
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleAdd()
  }

  return (
    <div className="rounded-2xl border border-[#C44569]/20 dark:border-[#CBA24A]/20 bg-[#FFF8F8] dark:bg-[#2A1218]/60 p-4">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-[#C44569]/60 dark:text-[#CBA24A]/60 mb-3">Add a message</p>

      {/* Sender toggle */}
      <div className="flex gap-2 mb-3">
        {[{ val: 'me', label: `${myName} (Me)` }, { val: 'partner', label: 'Partner' }].map(opt => (
          <button
            key={opt.val}
            type="button"
            onClick={() => setSender(opt.val)}
            className={`flex-1 rounded-xl py-2.5 text-[13px] font-semibold transition-all ${
              sender === opt.val
                ? 'bg-[#C44569] text-white shadow'
                : 'border border-[#E8BFB6]/60 dark:border-[#CBA24A]/20 text-[#352F36]/60 dark:text-[#D9C1BF]/60 hover:bg-[#C44569]/5 dark:hover:bg-[#CBA24A]/5'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Message text */}
      <textarea
        ref={textRef}
        value={text}
        onChange={e => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={sender === 'me' ? 'What did you say?' : 'What did they say?'}
        rows={3}
        className={`${inputCls} resize-none mb-3`}
      />

      {/* Time + Add button row */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <svg className="h-4 w-4 shrink-0 text-[#352F36]/30 dark:text-[#D9C1BF]/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <circle cx="12" cy="12" r="10" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" />
          </svg>
          <input
            type="time"
            value={time}
            onChange={e => setTime(e.target.value)}
            className="rounded-lg border border-[#E8BFB6]/60 dark:border-[#CBA24A]/20 bg-[#FEFEFE] dark:bg-[#2A1218] px-2 py-1.5 text-sm text-[#352F36] dark:text-[#D9C1BF] focus:outline-none focus:ring-2 focus:ring-[#C44569]/20 dark:focus:ring-[#CBA24A]/20 transition"
          />
        </div>

        <button
          type="button"
          onClick={handleAdd}
          disabled={!text.trim()}
          className="ml-auto rounded-xl bg-[#C44569] px-5 py-2.5 text-sm font-semibold text-white shadow hover:bg-[#E85D75] transition-colors disabled:opacity-40 disabled:pointer-events-none"
        >
          Add
        </button>
        <span className="text-[10px] text-[#352F36]/25 dark:text-[#D9C1BF]/25">Ctrl+Enter</span>
      </div>
    </div>
  )
}

/* ── Main create/edit component ── */
export default function LetterCreate() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const { user } = useAuth()

  const [title, setTitle] = useState('')
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0])
  const [mood, setMood] = useState('romantic')
  const [label, setLabel] = useState('')
  const [messages, setMessages] = useState([])
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(isEdit)
  const [error, setError] = useState('')
  const [preview, setPreview] = useState(false)

  const myName = user?.display_name || 'Me'

  /* Load existing letter in edit mode */
  useEffect(() => {
    if (!isEdit) return
    getLetter(id).then(data => {
      setTitle(data.title)
      setDate(data.letter_date?.split('T')[0] || data.letter_date || '')
      setMood(data.mood || 'romantic')
      setLabel(data.label || '')
      setMessages(data.messages.map((m, i) => ({ ...m, id: m.id || `loaded-${i}` })))
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [id, isEdit])

  const addMessage = (msg) => setMessages(prev => [...prev, msg])
  const deleteMessage = (idx) => setMessages(prev => prev.filter((_, i) => i !== idx))

  const handleSave = async () => {
    if (!title.trim()) { setError('Please add a title.'); return }
    if (!date) { setError('Please choose a date.'); return }
    if (messages.length === 0) { setError('Add at least one message.'); return }
    setError('')
    setSaving(true)
    try {
      const payload = {
        title: title.trim(),
        letter_date: date,
        mood,
        label: label.trim() || null,
        messages: messages.map(({ sender, text, msg_time }) => ({ sender, text, msg_time })),
      }
      if (isEdit) {
        await updateLetter(id, payload)
        navigate(`/letters/${id}`)
      } else {
        const created = await createLetter(payload)
        navigate(`/letters/${created.id}`)
      }
    } catch (e) {
      const msg = e?.response?.data?.error || e?.message || 'Failed to save. Please try again.'
      setError(msg)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return (
    <AppLayout title="Letters">
      <div className="flex items-center justify-center py-32">
        <div className="h-8 w-8 rounded-full border-2 border-[#C44569]/20 border-t-[#C44569] animate-spin" />
      </div>
    </AppLayout>
  )

  const currentMood = getMood(mood)

  return (
    <AppLayout title={isEdit ? 'Edit Conversation' : 'Save a Conversation'}>
      <div className="mx-auto max-w-2xl">

        {/* ── Header ── */}
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <button
              onClick={() => navigate(isEdit ? `/letters/${id}` : '/letters')}
              className="mb-2 inline-flex items-center gap-1 text-sm text-[#352F36]/50 dark:text-[#D9C1BF]/50 hover:text-[#C44569] dark:hover:text-[#CBA24A] transition-colors"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>
            <h1 className="font-serif text-2xl font-bold text-[#352F36] dark:text-[#D9C1BF]">
              {isEdit ? 'Edit Conversation' : 'Save a Conversation'}
            </h1>
            <p className="text-sm text-[#352F36]/45 dark:text-[#D9C1BF]/45 mt-0.5">
              Preserve words that matter
            </p>
          </div>

          {/* Preview toggle */}
          <button
            type="button"
            onClick={() => setPreview(v => !v)}
            className={`rounded-xl border px-4 py-2.5 text-sm font-semibold transition-colors ${
              preview
                ? 'border-[#C44569]/30 bg-[#C44569]/8 text-[#C44569] dark:text-[#CBA24A]'
                : 'border-[#E8BFB6]/60 dark:border-[#CBA24A]/15 text-[#352F36]/50 dark:text-[#D9C1BF]/50 hover:bg-[#C44569]/5'
            }`}
          >
            {preview ? 'Edit' : 'Preview'}
          </button>
        </div>

        <AnimatePresence mode="wait">
          {!preview ? (
            <motion.div key="form" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}
              className="space-y-6"
            >
              {/* ── SECTION 1: Details ── */}
              <div className="rounded-2xl border border-[#E8BFB6]/60 dark:border-[#CBA24A]/15 bg-[#FEFEFE] dark:bg-[#2A1218]/80 p-5 space-y-4">
                <h2 className="font-serif text-lg font-semibold text-[#352F36] dark:text-[#D9C1BF]">Conversation details</h2>

                {/* Title */}
                <div>
                  <label className="mb-1.5 block text-[12px] font-semibold uppercase tracking-wider text-[#C44569]/70 dark:text-[#CBA24A]/70">Title *</label>
                  <input
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="The night we first said 'I love you'"
                    className={inputCls}
                  />
                </div>

                {/* Date */}
                <div>
                  <label className="mb-1.5 block text-[12px] font-semibold uppercase tracking-wider text-[#C44569]/70 dark:text-[#CBA24A]/70">Date *</label>
                  <input
                    type="date"
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    className={inputCls}
                  />
                </div>

                {/* Mood */}
                <div>
                  <label className="mb-2 block text-[12px] font-semibold uppercase tracking-wider text-[#C44569]/70 dark:text-[#CBA24A]/70">Mood</label>
                  <div className="flex flex-wrap gap-2">
                    {MOODS.map(m => (
                      <button
                        key={m.key}
                        type="button"
                        onClick={() => setMood(m.key)}
                        className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[13px] font-semibold transition-all ${
                          mood === m.key
                            ? 'bg-[#C44569] text-white shadow-sm scale-105'
                            : `${m.bg} ${m.text} hover:scale-105`
                        }`}
                      >
                        {m.emoji} {m.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Label (optional) */}
                <div>
                  <label className="mb-1.5 block text-[12px] font-semibold uppercase tracking-wider text-[#C44569]/70 dark:text-[#CBA24A]/70">
                    Label <span className="normal-case font-normal text-[#352F36]/30 dark:text-[#D9C1BF]/30">(optional)</span>
                  </label>
                  <input
                    value={label}
                    onChange={e => setLabel(e.target.value)}
                    placeholder="the night we met, our first fight, 3am confession…"
                    className={inputCls}
                  />
                </div>
              </div>

              {/* ── SECTION 2: Messages ── */}
              <div className="rounded-2xl border border-[#E8BFB6]/60 dark:border-[#CBA24A]/15 bg-[#FEFEFE] dark:bg-[#2A1218]/80 p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-serif text-lg font-semibold text-[#352F36] dark:text-[#D9C1BF]">Messages</h2>
                  {messages.length > 0 && (
                    <span className="text-[12px] text-[#352F36]/35 dark:text-[#D9C1BF]/35">{messages.length} messages · drag to reorder</span>
                  )}
                </div>

                {/* Message list (reorderable) */}
                {messages.length > 0 ? (
                  <Reorder.Group axis="y" values={messages} onReorder={setMessages}
                    className="space-y-1 rounded-xl bg-[#F8E4DF]/30 dark:bg-[#1A0B10]/30 py-2"
                  >
                    {messages.map((msg, idx) => (
                      <MessageRow
                        key={msg.id}
                        msg={msg}
                        index={idx}
                        onDelete={deleteMessage}
                        myName={myName}
                      />
                    ))}
                  </Reorder.Group>
                ) : (
                  <div className="rounded-xl border-2 border-dashed border-[#E8BFB6]/60 dark:border-[#CBA24A]/15 py-8 text-center">
                    <p className="text-sm text-[#352F36]/35 dark:text-[#D9C1BF]/35">No messages yet — add them below</p>
                  </div>
                )}

                {/* Add message form */}
                <AddMessagePanel onAdd={addMessage} myName={myName} />
              </div>

              {/* ── Error + Save ── */}
              {error && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="rounded-xl bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 px-4 py-3 text-sm text-red-600 dark:text-red-400"
                >
                  {error}
                </motion.p>
              )}

              <div className="flex gap-3 pb-8">
                <button
                  type="button"
                  onClick={() => navigate(isEdit ? `/letters/${id}` : '/letters')}
                  className="flex-1 rounded-xl border border-[#E8BFB6]/60 dark:border-[#CBA24A]/20 py-3 text-sm font-semibold text-[#352F36]/55 dark:text-[#D9C1BF]/55 hover:bg-[#C44569]/5 dark:hover:bg-[#CBA24A]/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-[2] rounded-xl bg-[#C44569] py-3 text-sm font-semibold text-white shadow hover:bg-[#E85D75] transition-colors disabled:opacity-50 disabled:pointer-events-none"
                >
                  {saving ? 'Saving…' : (isEdit ? 'Save changes' : 'Save conversation')}
                </button>
              </div>
            </motion.div>
          ) : (
            /* ── Preview mode ── */
            <motion.div key="preview" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}
              className="space-y-4 pb-8"
            >
              {/* Preview header card */}
              <div className="rounded-2xl border border-[#E8BFB6]/60 dark:border-[#CBA24A]/15 bg-[#FEFEFE] dark:bg-[#2A1218]/80 p-6 text-center">
                <div className="mb-2 text-4xl">{currentMood.emoji}</div>
                <h2 className="font-serif text-2xl font-bold text-[#352F36] dark:text-[#D9C1BF] mb-1">{title || 'Untitled'}</h2>
                <p className="text-sm text-[#352F36]/45 dark:text-[#D9C1BF]/45 mb-3">
                  {date ? new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'No date'}
                </p>
                <div className="flex items-center justify-center gap-2">
                  <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-[12px] font-semibold ${currentMood.bg} ${currentMood.text}`}>
                    {currentMood.emoji} {currentMood.label}
                  </span>
                  {label && (
                    <span className="rounded-full bg-[#C44569]/8 dark:bg-[#CBA24A]/10 px-3 py-1 text-[12px] italic text-[#C44569]/70 dark:text-[#CBA24A]/60">
                      {label}
                    </span>
                  )}
                </div>
              </div>

              {/* Preview chat */}
              <div className="rounded-2xl border border-[#E8BFB6]/60 dark:border-[#CBA24A]/15 bg-[#F8E4DF]/40 dark:bg-[#1A0B10]/60 overflow-hidden">
                <div className="flex items-center gap-3 border-b border-[#E8BFB6]/50 dark:border-[#CBA24A]/10 bg-[#FEFEFE] dark:bg-[#2A1218] px-4 py-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#C44569]/15 dark:bg-[#CBA24A]/15 text-lg">{currentMood.emoji}</div>
                  <div>
                    <p className="text-[13px] font-semibold text-[#352F36] dark:text-[#D9C1BF]">{title || 'Untitled'}</p>
                    <p className="text-[11px] text-[#352F36]/40 dark:text-[#D9C1BF]/40">{messages.length} messages</p>
                  </div>
                </div>
                <div className="flex flex-col gap-3 px-4 py-5 min-h-[120px]">
                  {messages.length === 0 ? (
                    <p className="text-center text-sm text-[#352F36]/35 dark:text-[#D9C1BF]/35 py-6">No messages yet</p>
                  ) : messages.map((msg, idx) => {
                    const isMine = msg.sender === 'me'
                    const isFirst = idx === 0 || messages[idx - 1].sender !== msg.sender
                    return (
                      <div key={msg.id || idx} className={`flex flex-col gap-0.5 ${isMine ? 'items-end' : 'items-start'}`}>
                        {isFirst && (
                          <span className="text-[11px] font-semibold mb-0.5 px-1 text-[#352F36]/45 dark:text-[#D9C1BF]/45">
                            {isMine ? myName : 'Partner'}
                          </span>
                        )}
                        <div className={`max-w-[72%] px-4 py-2.5 text-[14px] leading-relaxed whitespace-pre-wrap break-words rounded-2xl
                          ${isMine
                            ? 'bg-[#C44569] text-white rounded-br-sm'
                            : 'bg-[#FEFEFE] dark:bg-[#5A2532]/60 text-[#352F36] dark:text-[#D9C1BF] border border-[#E8BFB6]/50 dark:border-[#CBA24A]/15 rounded-bl-sm'
                          }`}
                        >
                          {msg.text}
                          <span className={`block text-right mt-1 text-[10px] ${isMine ? 'text-white/50' : 'text-[#352F36]/35 dark:text-[#D9C1BF]/35'}`}>
                            {msg.msg_time}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
                <div className="border-t border-[#E8BFB6]/50 dark:border-[#CBA24A]/10 bg-[#FEFEFE] dark:bg-[#2A1218] px-4 py-3 text-center">
                  <p className="text-[11px] text-[#352F36]/30 dark:text-[#D9C1BF]/30 italic">Frozen in time — a memory preserved forever</p>
                </div>
              </div>

              {/* Save from preview */}
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="w-full rounded-xl bg-[#C44569] py-3 text-sm font-semibold text-white shadow hover:bg-[#E85D75] transition-colors disabled:opacity-50"
              >
                {saving ? 'Saving…' : (isEdit ? 'Save changes' : 'Save this conversation')}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AppLayout>
  )
}
