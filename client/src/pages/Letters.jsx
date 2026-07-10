import { useState, useEffect, useRef, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import AppLayout from '../components/AppLayout'
import {
  getMessages, sendMessage, editMessage,
  deleteMessage, markRead, uploadMessageMedia,
} from '../api/messages'
import { getInviteLink } from '../api/auth'

/* ── Helpers ── */
const requestNotifPerm = () => {
  if ('Notification' in window && Notification.permission === 'default')
    Notification.requestPermission()
}
const notify = (title, body) => {
  if ('Notification' in window && Notification.permission === 'granted')
    new Notification(title, { body, icon: '/favicon.ico' })
}
const fmtTime = (iso) => new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
const dayLabel = (iso) => {
  const d = new Date(iso), today = new Date()
  const yest = new Date(today); yest.setDate(today.getDate() - 1)
  if (d.toDateString() === today.toDateString()) return 'Today'
  if (d.toDateString() === yest.toDateString()) return 'Yesterday'
  return d.toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' })
}
const humanSize = (b) => b < 1048576 ? `${(b / 1024).toFixed(1)} KB` : `${(b / 1048576).toFixed(1)} MB`

/* ── Image lightbox ── */
const Lightbox = ({ src, onClose }) => (
  <motion.div
    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm"
    onClick={onClose}
  >
    <img src={src} alt="full" className="max-h-[90vh] max-w-[90vw] rounded-2xl shadow-2xl" onClick={e => e.stopPropagation()} />
    <button onClick={onClose} className="absolute top-5 right-5 text-white/70 hover:text-white text-2xl">✕</button>
  </motion.div>
)

/* ── Media in bubble ── */
const MediaDisplay = ({ msg }) => {
  const [lb, setLb] = useState(false)
  if (!msg.media_url) return null
  if (msg.media_type === 'image') return (
    <>
      <img src={msg.media_url} alt="img" onClick={() => setLb(true)}
        className="max-w-[200px] max-h-44 rounded-xl object-cover cursor-zoom-in mb-1 block" />
      <AnimatePresence>{lb && <Lightbox src={msg.media_url} onClose={() => setLb(false)} />}</AnimatePresence>
    </>
  )
  if (msg.media_type === 'video') return (
    <video src={msg.media_url} controls className="max-w-[240px] rounded-xl bg-black mb-1" style={{ maxHeight: 180 }} />
  )
  if (msg.media_type === 'audio') return (
    <audio src={msg.media_url} controls className="max-w-[220px] mb-1" />
  )
  return (
    <a href={msg.media_url} download target="_blank" rel="noreferrer"
      className="flex items-center gap-2 px-3 py-2 rounded-xl bg-black/10 dark:bg-white/10 hover:bg-black/20 transition mb-1 text-xs">
      <span className="text-lg">📎</span>
      <span className="truncate max-w-[160px]">{msg.original_name || 'Attachment'}</span>
    </a>
  )
}

/* ── Reply quote inside bubble ── */
const ReplyQuote = ({ msg, isMine }) => {
  if (!msg.reply_content && !msg.reply_media_type) return null
  return (
    <div className={`flex gap-1.5 mb-2 rounded-xl px-2.5 py-1.5 text-xs cursor-default
      ${isMine
        ? 'bg-white/20 border-l-2 border-white/60'
        : 'bg-[#C96B60]/10 dark:bg-[#8E5B60]/20 border-l-2 border-[#C96B60]/50'}`}>
      <div className="min-w-0">
        <p className={`font-semibold text-[10px] mb-0.5 ${isMine ? 'text-white/80' : 'text-[#C96B60] dark:text-[#BF8F8F]'}`}>
          {msg.reply_sender_name || 'Message'}
        </p>
        <p className={`truncate leading-snug ${isMine ? 'text-white/70' : 'text-[#1A2B48]/50 dark:text-[#EDE0D8]/50'}`}>
          {msg.reply_media_type === 'image' ? '📷 Photo'
            : msg.reply_media_type === 'video' ? '▶ Video'
            : msg.reply_media_type === 'audio' ? '🎵 Audio'
            : msg.reply_media_type === 'file' ? '📎 File'
            : msg.reply_content || ''}
        </p>
      </div>
    </div>
  )
}

/* ── Bubble ── */
const Bubble = ({ msg, isMine, onEdit, onDelete, onReply }) => {
  const [hov, setHov] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editVal, setEditVal] = useState(msg.content)
  const ref = useRef(null)

  const save = async () => {
    if (!editVal.trim()) return
    await onEdit(msg.id, editVal.trim())
    setEditing(false)
  }

  return (
    <motion.div layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.92 }} transition={{ duration: 0.2 }}
      className={`flex items-end gap-2 ${isMine ? 'flex-row-reverse' : 'flex-row'}`}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
    >
      {/* partner avatar */}
      {!isMine && (
        <div className="w-7 h-7 rounded-full bg-[#BF8F8F] dark:bg-[#8E5B60] flex items-center justify-center text-white text-xs shrink-0 mb-1 font-semibold">
          {msg.display_name?.[0]?.toUpperCase() ?? '?'}
        </div>
      )}

      <div className={`relative max-w-[65%] flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
        {editing ? (
          <div className="flex flex-col gap-1.5 w-full">
            <textarea ref={ref} value={editVal} onChange={e => setEditVal(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); save() } if (e.key === 'Escape') setEditing(false) }}
              rows={2}
              className="px-3 py-2 rounded-2xl text-sm bg-[#F4E8E8] dark:bg-[#3D1E1E] border border-[#C96B60]/40 text-[#1A2B48] dark:text-[#EDE0D8] resize-none outline-none w-full min-w-[180px]"
            />
            <div className="flex gap-2 text-xs">
              <button onClick={save} className="px-3 py-1 rounded-full bg-[#C96B60] text-white hover:bg-[#b05a50] transition">Save</button>
              <button onClick={() => setEditing(false)} className="px-3 py-1 rounded-full bg-black/10 dark:bg-white/10 hover:bg-black/20 transition text-[#1A2B48] dark:text-[#EDE0D8]">Cancel</button>
            </div>
          </div>
        ) : (
          <div className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm break-words
            ${isMine
              ? 'bg-[#C96B60] text-white rounded-br-sm'
              : 'bg-white dark:bg-[#2A1414] text-[#1A2B48] dark:text-[#EDE0D8] rounded-bl-sm border border-black/5 dark:border-white/10'}`}>
            <ReplyQuote msg={msg} isMine={isMine} />
            <MediaDisplay msg={msg} />
            {msg.content && <p>{msg.content}</p>}
          </div>
        )}

        {!editing && (
          <div className={`flex items-center gap-1.5 text-[10px] text-[#1A2B48]/30 dark:text-[#BF8F8F]/50 px-1 mt-0.5 ${isMine ? 'flex-row-reverse' : ''}`}>
            <span>{fmtTime(msg.created_at)}</span>
            {msg.is_edited && <span className="italic">(edited)</span>}
            {isMine && <span className={msg.is_read ? 'text-sky-400' : 'opacity-30'}>{msg.is_read ? '✓✓' : '✓'}</span>}
          </div>
        )}
      </div>

      {/* action buttons */}
      {!editing && (
        <div className={`flex flex-col gap-1 mb-6 transition-opacity ${hov ? 'opacity-100' : 'opacity-0'}`}>
          {/* reply — all messages */}
          <button onClick={() => onReply(msg)}
            title="Reply"
            className="w-6 h-6 rounded-full bg-[#BF8F8F]/15 hover:bg-[#BF8F8F]/35 flex items-center justify-center text-[#1A2B48]/50 dark:text-[#EDE0D8]/50 hover:text-[#C96B60] dark:hover:text-[#BF8F8F] transition text-[11px]">
            ↩
          </button>
          {/* edit + delete — only own messages */}
          {isMine && <>
            <button onClick={() => { setEditVal(msg.content); setEditing(true); setTimeout(() => ref.current?.focus(), 50) }}
              title="Edit" className="w-6 h-6 rounded-full bg-[#BF8F8F]/15 hover:bg-[#BF8F8F]/35 flex items-center justify-center text-[#C96B60] dark:text-[#BF8F8F] transition text-xs">✎</button>
            <button onClick={() => onDelete(msg.id)}
              title="Delete" className="w-6 h-6 rounded-full bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-800/50 flex items-center justify-center text-red-500 transition text-xs">🗑</button>
          </>}
        </div>
      )}
    </motion.div>
  )
}

/* ── Date sep ── */
const DateSep = ({ label }) => (
  <div className="flex items-center gap-3 my-2">
    <div className="flex-1 h-px bg-black/5 dark:bg-white/8" />
    <span className="text-[10px] tracking-wider uppercase text-[#1A2B48]/30 dark:text-[#8C5D5D] px-2">{label}</span>
    <div className="flex-1 h-px bg-black/5 dark:bg-white/8" />
  </div>
)

/* ── SQL notice ── */
const SQL_NOTICE = `CREATE TABLE IF NOT EXISTS messages (
  id BIGSERIAL PRIMARY KEY,
  relationship_id BIGINT NOT NULL REFERENCES relationships(id) ON DELETE CASCADE,
  sender_user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL DEFAULT '',
  media_url TEXT,
  media_type VARCHAR(20),
  is_edited BOOLEAN DEFAULT FALSE,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_messages_rel ON messages(relationship_id, created_at);

-- Already have the table? Add new columns:
ALTER TABLE messages
  ADD COLUMN IF NOT EXISTS media_url TEXT,
  ADD COLUMN IF NOT EXISTS media_type VARCHAR(20),
  ADD COLUMN IF NOT EXISTS is_edited BOOLEAN DEFAULT FALSE;`

/* ─────────────────────────────────────────── */
const Letters = () => {
  const { user } = useAuth()
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [sendError, setSendError] = useState('')
  const [partnerName, setPartnerName] = useState('')
  const [noTable, setNoTable] = useState(false)
  const [loading, setLoading] = useState(true)
  const [deleteId, setDeleteId] = useState(null)
  const [replyTo, setReplyTo] = useState(null) // { id, content, display_name, media_type }

  /* attach */
  const [attachFile, setAttachFile] = useState(null)
  const [attachPreview, setAttachPreview] = useState(null)
  const [attachType, setAttachType] = useState(null)
  const [uploadPct, setUploadPct] = useState(0)

  const bottomRef = useRef(null)
  const inputRef = useRef(null)
  const fileRef = useRef(null)
  const lastTsRef = useRef(null)
  const prevUnreadRef = useRef(0)
  const isSending = useRef(false)

  const scrollBottom = useCallback((smooth = true) => {
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'instant' }), 60)
  }, [])

  /* deduplicate + sort by ID */
  const mergeMessages = useCallback((prev, incoming) => {
    const map = new Map(prev.map(m => [m.id, m]))
    incoming.forEach(m => map.set(m.id, m))
    return Array.from(map.values()).sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
  }, [])

  /* initial load */
  useEffect(() => {
    requestNotifPerm()
    getInviteLink().then(d => { if (d.partnerJoined) setPartnerName(d.partnerName || 'Partner') }).catch(() => {})
    getMessages().then(({ messages: msgs, unread }) => {
      setMessages(msgs)
      if (msgs.length) lastTsRef.current = msgs[msgs.length - 1].created_at
      setLoading(false)
      scrollBottom(false)
      if (unread > 0) markRead().catch(() => {})
    }).catch(err => {
      setLoading(false)
      if (err?.response?.status === 500 || err?.response?.data?.message?.toLowerCase().includes('table'))
        setNoTable(true)
    })
  }, [scrollBottom])

  /* poll every 3s */
  useEffect(() => {
    if (noTable) return
    const id = setInterval(async () => {
      try {
        const { messages: fresh, unread } = await getMessages(lastTsRef.current)
        if (!fresh.length) return
        setMessages(prev => mergeMessages(prev, fresh))
        lastTsRef.current = fresh[fresh.length - 1].created_at
        const partnerMsgs = fresh.filter(m => m.sender_user_id !== user?.id)
        if (partnerMsgs.length) {
          scrollBottom()
          if (document.hidden)
            notify(partnerMsgs[0].display_name || 'Partner', partnerMsgs[0].content || '📎 Attachment')
          markRead().catch(() => {})
        } else scrollBottom()
        prevUnreadRef.current = 0
        window.dispatchEvent(new CustomEvent('memento:unread', { detail: 0 }))
      } catch (_) {}
    }, 3000)
    return () => clearInterval(id)
  }, [noTable, user?.id, scrollBottom, mergeMessages])

  /* pick file */
  const onPickFile = e => {
    const file = e.target.files?.[0]; e.target.value = ''
    if (!file) return
    const mime = file.type
    let t = 'file'
    if (mime.startsWith('image/')) t = 'image'
    else if (mime.startsWith('video/')) t = 'video'
    else if (mime.startsWith('audio/')) t = 'audio'
    setAttachFile(file); setAttachType(t); setUploadPct(0)
    setAttachPreview(t === 'image' ? URL.createObjectURL(file) : null)
  }
  const clearAttach = () => {
    if (attachPreview) URL.revokeObjectURL(attachPreview)
    setAttachFile(null); setAttachPreview(null); setAttachType(null); setUploadPct(0)
  }

  /* send */
  const handleSend = async () => {
    if (isSending.current) return
    const text = input.trim()
    if (!text && !attachFile) return
    isSending.current = true
    setSending(true); setSendError('')
    const file = attachFile
    setInput(''); clearAttach()
    try {
      let mediaUrl = null, mediaType = null
      if (file) {
        const up = await uploadMessageMedia(file, setUploadPct)
        mediaUrl = up.url; mediaType = up.mediaType
      }
      const { message } = await sendMessage({ content: text, mediaUrl, mediaType, replyToId: replyTo?.id ?? null })
      setReplyTo(null)
      setMessages(prev => mergeMessages(prev, [message]))
      lastTsRef.current = message.created_at
      scrollBottom()
    } catch (err) {
      setSendError(err?.response?.data?.message || 'Failed to send. Try again.')
    } finally {
      isSending.current = false
      setSending(false)
      inputRef.current?.focus()
    }
  }

  /* edit */
  const handleEdit = async (id, content) => {
    try {
      const { message } = await editMessage(id, content)
      setMessages(prev => prev.map(m => m.id === id ? { ...m, ...message } : m))
    } catch (err) { console.error('Edit failed', err) }
  }

  /* reply */
  const handleReply = (msg) => {
    setReplyTo({ id: msg.id, content: msg.content, display_name: msg.display_name, media_type: msg.media_type })
    inputRef.current?.focus()
  }

  /* delete */
  const handleDelete = async (id) => {
    try {
      await deleteMessage(id)
      setMessages(prev => prev.filter(m => m.id !== id))
    } finally { setDeleteId(null) }
  }

  /* build list with separators */
  const items = (() => {
    const out = []; let lastDay = null
    messages.forEach(msg => {
      const day = new Date(msg.created_at).toDateString()
      if (day !== lastDay) { out.push({ type: 'sep', key: `sep-${day}`, label: dayLabel(msg.created_at) }); lastDay = day }
      out.push({ type: 'msg', key: `m-${msg.id}`, msg })
    })
    return out
  })()

  return (
    <AppLayout title="Letters" noPadding>
      {/* outer: fill the content area below the top navbar */}
      <div className="flex justify-center items-stretch h-[calc(100vh-56px)] px-2 py-3 sm:px-4 sm:py-4">

        {/* card */}
        <div className="flex flex-col w-full max-w-2xl bg-white dark:bg-[#1C0E0E] rounded-2xl shadow-xl overflow-hidden border border-black/5 dark:border-white/5">

          {/* SQL notice */}
          {noTable && (
            <div className="flex-1 flex flex-col items-center justify-center p-6 gap-4">
              <p className="text-base font-semibold text-[#C96B60] dark:text-[#BF8F8F]">Messages table missing</p>
              <p className="text-sm text-[#1A2B48]/50 dark:text-[#EDE0D8]/50 text-center max-w-sm">
                Run this SQL in your Neon editor, then refresh.
              </p>
              <pre className="text-xs bg-[#1A2B48]/4 dark:bg-white/5 rounded-xl p-4 overflow-x-auto w-full max-w-lg border border-black/8 dark:border-white/8 text-[#1A2B48]/75 dark:text-[#EDE0D8]/75 leading-relaxed">
                {SQL_NOTICE}
              </pre>
            </div>
          )}

          {!noTable && (
            <>
              {/* header */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-black/5 dark:border-white/5 bg-white/80 dark:bg-[#1C0E0E]/80 shrink-0">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#C96B60] to-[#BF8F8F] flex items-center justify-center text-white font-bold shrink-0">
                  {partnerName?.[0]?.toUpperCase() ?? '♥'}
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#1A2B48] dark:text-[#EDE0D8]">{partnerName || 'Your partner'}</p>
                  <p className="text-[10px] text-[#1A2B48]/35 dark:text-[#BF8F8F]/50">Private chat · end to end</p>
                </div>
              </div>

              {/* messages */}
              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1.5 bg-[#FBF5F5]/60 dark:bg-[#140808]/40">
                {loading && (
                  <div className="flex justify-center py-16 text-sm text-[#1A2B48]/30 dark:text-[#BF8F8F]/40">Loading…</div>
                )}
                {!loading && messages.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-full gap-3 pt-16 text-center">
                    <span className="text-4xl">💌</span>
                    <p className="text-sm text-[#1A2B48]/40 dark:text-[#EDE0D8]/30">No messages yet. Say something sweet ✨</p>
                  </div>
                )}
                <AnimatePresence initial={false}>
                  {items.map(item =>
                    item.type === 'sep'
                      ? <DateSep key={item.key} label={item.label} />
                      : <Bubble key={item.key} msg={item.msg} isMine={item.msg.sender_user_id === user?.id} onEdit={handleEdit} onDelete={id => setDeleteId(id)} onReply={handleReply} />
                  )}
                </AnimatePresence>
                <div ref={bottomRef} />
              </div>

              {/* reply preview strip */}
              {replyTo && (
                <div className="flex items-center gap-3 px-4 py-2 bg-[#F4E8E8] dark:bg-[#2A1414] border-t border-[#C96B60]/15 dark:border-[#8E5B60]/20 shrink-0">
                  <div className="w-0.5 self-stretch rounded-full bg-[#C96B60]" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-semibold text-[#C96B60] dark:text-[#BF8F8F] mb-0.5">
                      Reply to {replyTo.display_name}
                    </p>
                    <p className="text-xs text-[#1A2B48]/50 dark:text-[#EDE0D8]/50 truncate">
                      {replyTo.media_type === 'image' ? '📷 Photo'
                        : replyTo.media_type === 'video' ? '▶ Video'
                        : replyTo.media_type === 'audio' ? '🎵 Audio'
                        : replyTo.media_type === 'file' ? '📎 File'
                        : replyTo.content || ''}
                    </p>
                  </div>
                  <button onClick={() => setReplyTo(null)}
                    className="w-6 h-6 rounded-full bg-black/8 hover:bg-red-100 hover:text-red-500 flex items-center justify-center text-[#1A2B48]/35 text-sm transition">✕</button>
                </div>
              )}

              {/* attach preview strip */}
              {attachFile && (
                <div className="flex items-center gap-3 px-4 py-2 bg-[#F4E8E8] dark:bg-[#2A1414] border-t border-black/5 dark:border-white/5 shrink-0">
                  {attachPreview
                    ? <img src={attachPreview} alt="" className="w-12 h-12 rounded-lg object-cover shrink-0" />
                    : <div className="w-12 h-12 rounded-lg bg-[#BF8F8F]/20 flex items-center justify-center text-xl shrink-0">
                        {attachType === 'video' ? '▶' : attachType === 'audio' ? '🎵' : '📎'}
                      </div>
                  }
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-[#1A2B48] dark:text-[#EDE0D8] truncate">{attachFile.name}</p>
                    <p className="text-[10px] text-[#1A2B48]/40">{humanSize(attachFile.size)}</p>
                    {uploadPct > 0 && uploadPct < 100 && (
                      <div className="mt-1 h-1 rounded-full bg-black/10 overflow-hidden">
                        <div className="h-full bg-[#C96B60] transition-all" style={{ width: `${uploadPct}%` }} />
                      </div>
                    )}
                  </div>
                  <button onClick={clearAttach} className="w-6 h-6 rounded-full bg-black/8 hover:bg-red-100 hover:text-red-500 flex items-center justify-center text-[#1A2B48]/40 text-sm transition">✕</button>
                </div>
              )}

              {/* error banner */}
              {sendError && (
                <div className="px-4 py-2 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 text-xs text-center shrink-0">
                  {sendError}
                </div>
              )}

              {/* input bar */}
              <div className="shrink-0 flex items-end gap-2 px-3 py-3 border-t border-black/5 dark:border-white/5 bg-white/80 dark:bg-[#1C0E0E]/80">
                <input type="file" ref={fileRef} className="hidden"
                  accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt,.zip,.rar"
                  onChange={onPickFile}
                />
                {/* paperclip */}
                <button onClick={() => fileRef.current?.click()} disabled={sending} title="Attach"
                  className="w-9 h-9 rounded-full flex items-center justify-center text-[#C96B60]/70 dark:text-[#BF8F8F]/70 hover:bg-[#C96B60]/10 transition shrink-0 mb-0.5">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
                    <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>

                {/* textarea */}
                <textarea ref={inputRef} value={input}
                  onChange={e => {
                    setInput(e.target.value)
                    setSendError('')
                    e.target.style.height = 'auto'
                    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'
                  }}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }}
                  placeholder="Write something…" rows={1} disabled={sending}
                  className="flex-1 resize-none outline-none bg-[#F4E8E8]/70 dark:bg-[#2A1414] text-[#1A2B48] dark:text-[#EDE0D8] placeholder-[#1A2B48]/30 dark:placeholder-[#EDE0D8]/30 rounded-2xl px-4 py-2.5 text-sm leading-relaxed border border-transparent focus:border-[#C96B60]/30 transition overflow-y-auto"
                  style={{ minHeight: 40, maxHeight: 120 }}
                />

                {/* send */}
                <button onClick={handleSend}
                  disabled={sending || (!input.trim() && !attachFile)}
                  className="w-9 h-9 rounded-full bg-[#C96B60] hover:bg-[#b05a50] disabled:opacity-35 disabled:cursor-not-allowed transition flex items-center justify-center text-white shrink-0 mb-0.5">
                  {sending
                    ? <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg>
                    : <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 translate-x-0.5"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
                  }
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* delete confirm */}
      <AnimatePresence>
        {deleteId && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-[#2A1414] rounded-2xl shadow-2xl p-6 max-w-xs w-full text-center">
              <p className="text-3xl mb-3">🗑️</p>
              <p className="font-semibold text-[#1A2B48] dark:text-[#EDE0D8] mb-1">Delete message?</p>
              <p className="text-sm text-[#1A2B48]/40 dark:text-[#EDE0D8]/40 mb-5">This cannot be undone.</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteId(null)}
                  className="flex-1 py-2 rounded-xl bg-black/5 dark:bg-white/5 text-sm text-[#1A2B48] dark:text-[#EDE0D8] hover:bg-black/10 transition">Cancel</button>
                <button onClick={() => handleDelete(deleteId)}
                  className="flex-1 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm transition">Delete</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AppLayout>
  )
}

export default Letters
