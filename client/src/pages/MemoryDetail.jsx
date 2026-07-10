import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getMemory, deleteMemory, addComment } from '../api/memories';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import ConfirmModal from '../components/ConfirmModal';
import AppLayout from '../components/AppLayout';

const formatLongDate = (dateStr) => {
  if (!dateStr) return '';
  const parts = dateStr.split('T')[0].split('-');
  if (parts.length === 3) {
    const d = new Date(parts[0], parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    return d.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  }
  return new Date(dateStr).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
};

const formatTimestamp = (dateStr) =>
  new Date(dateStr).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });

const formatDuration = (seconds) => {
  if (!seconds || Number.isNaN(seconds)) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
};

const VideoCard = ({ video, isPlaying, onPlay, onClose }) => {
  const durationValue = video.duration || video.duration_seconds || video.durationSeconds;
  const durationLabel = durationValue ? formatDuration(durationValue) : '';

  return (
    <div className="overflow-hidden rounded-2xl border border-white/40 dark:border-[#D9C1BF]/10 bg-white/60 dark:bg-[#591F12]/50 shadow-lg backdrop-blur-sm transition-all duration-300">
      {isPlaying ? (
        <div className="relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute right-3 top-3 z-20 rounded-full bg-black/70 px-3 py-1 text-sm font-semibold text-white transition-colors hover:bg-black"
          >
            X
          </button>
          <video src={video.media_url} controls autoPlay className="w-full aspect-video bg-black" />
        </div>
      ) : (
        <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-[#2B1055] via-[#43288A] to-[#0D0D1A]">
          {video.thumbnail_url ? (
            <img src={video.thumbnail_url} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-5xl">🎬</div>
          )}

          <div className="absolute inset-0 bg-black/10" />
          <button
            type="button"
            onClick={onPlay}
            className="absolute inset-0 flex items-center justify-center"
            aria-label="Play video"
          >
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-2xl transition-all duration-300 hover:scale-110">
              <span className="ml-1 text-2xl text-[#C96B60] dark:text-[#BF8F8F]">▶</span>
            </span>
          </button>
        </div>
      )}

      <div className="flex items-center justify-between gap-3 border-t border-black/5 dark:border-[#D9C1BF]/8 px-4 py-3 text-sm">
        <div className="min-w-0 text-[#1A2B48]/50 dark:text-[#8C5D5D]">
          {durationLabel ? <span>Duration: {durationLabel}</span> : <span>Video</span>}
        </div>
        <a
          href={video.media_url}
          download
          target="_blank"
          rel="noreferrer"
          className="shrink-0 text-[#C96B60] dark:text-[#BF8F8F] transition-colors hover:underline"
        >
          Download
        </a>
      </div>
    </div>
  );
};

const AudioPlayerItem = ({ src, index }) => {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => setProgress(audio.currentTime);
    const onLoaded = () => setDuration(audio.duration);
    const onEnded = () => setPlaying(false);

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoaded);
    audio.addEventListener('ended', onEnded);

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoaded);
      audio.removeEventListener('ended', onEnded);
    };
  }, []);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      audio.play();
      setPlaying(true);
    } else {
      audio.pause();
      setPlaying(false);
    }
  };

  const handleSeek = (e) => {
    const audio = audioRef.current;
    if (!audio || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    audio.currentTime = ratio * duration;
    setProgress(audio.currentTime);
  };

  return (
    <div className="rounded-xl border border-white/40 dark:border-[#D9C1BF]/10 bg-white/60 dark:bg-[#591F12]/50 backdrop-blur-sm p-4 shadow-md">
      <audio ref={audioRef} src={src} preload="metadata" />
      <div className="flex items-center gap-4">
        <span className="text-2xl">🎵</span>
        <div className="flex-1 min-w-0">
          <p className="truncate text-sm font-medium text-[#1A2B48] dark:text-[#D9C1BF]">Audio clip {index + 1}</p>
          <p className="text-xs text-[#1A2B48]/50 dark:text-[#8C5D5D]">{formatDuration(duration)}</p>
        </div>
        <button
          type="button"
          onClick={togglePlay}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#C96B60] dark:bg-[#8E5B60] text-white transition-colors hover:bg-[#B05A50] dark:hover:bg-[#BF8F8F]/80"
        >
          {playing ? '⏸' : '▶'}
        </button>
      </div>
      <div
        className="mt-3 h-1.5 cursor-pointer overflow-hidden rounded-full bg-[#C96B60]/10 dark:bg-[#8E5B60]/20"
        onClick={handleSeek}
      >
        <div
          className="h-full rounded-full bg-[#C96B60] dark:bg-[#8E5B60] transition-all duration-100"
          style={{ width: duration ? `${(progress / duration) * 100}%` : '0%' }}
        />
      </div>
    </div>
  );
};

const MemoryDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [memory, setMemory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [playingId, setPlayingId] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const fetchMemoryDetail = useCallback(async () => {
    try {
      const data = await getMemory(id);
      setMemory(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load memory details.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    setLoading(true);
    fetchMemoryDetail();
  }, [fetchMemoryDetail]);

  const images = memory?.media?.filter((m) => m.media_type === 'image') || [];
  const videos = memory?.media?.filter((m) => m.media_type === 'video') || [];
  const audioFiles = memory?.media?.filter((m) => m.media_type === 'audio') || [];
  const isCreator = memory?.created_by_user_id === user?.id;
  const addedByLabel = isCreator ? 'Added by you' : `Added by ${memory?.created_by_name || 'partner'}`;

  useEffect(() => {
    if (images.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % images.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [images.length]);

  useEffect(() => {
    if (lightboxIndex === null || images.length === 0) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setLightboxIndex(null);
      if (e.key === 'ArrowRight') {
        setLightboxIndex((prev) => (prev + 1) % images.length);
      }
      if (e.key === 'ArrowLeft') {
        setLightboxIndex((prev) => (prev - 1 + images.length) % images.length);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxIndex, images.length]);

  const openLightbox = (index) => setLightboxIndex(index);

  const handleConfirmDelete = async () => {
    setShowDeleteConfirm(false);
    setDeleting(true);
    try {
      await deleteMemory(id);
      showToast('Memory deleted', 'success');
      navigate('/memories');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete memory.', 'error');
      setDeleting(false);
    }
  };

  const handlePostComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setSubmittingComment(true);
    try {
      const newComment = await addComment(id, commentText);
      setMemory((prev) => ({
        ...prev,
        comments: [...(prev.comments || []), newComment],
      }));
      setCommentText('');
      showToast('Comment posted ❤️', 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to post comment', 'error');
    } finally {
      setSubmittingComment(false);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center py-24">
          <svg className="h-8 w-8 animate-spin text-[#C96B60] dark:text-[#BF8F8F]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        </div>
      </AppLayout>
    );
  }

  if (error || !memory) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center py-24 px-8">
          <div className="max-w-md rounded-2xl border border-red-200 dark:border-red-900/30 bg-white/60 dark:bg-[#591F12]/50 backdrop-blur-sm p-6 text-center">
            <p className="mb-4 text-red-500 dark:text-red-400">{error || 'Memory not found.'}</p>
            <Link to="/memories" className="inline-block px-5 py-2 rounded-xl bg-[#C96B60] dark:bg-[#8E5B60] text-white text-sm font-semibold hover:bg-[#B05A50] transition-colors">
              Back to Memories
            </Link>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout id="memory-detail-view">
      <ConfirmModal
        isOpen={showDeleteConfirm}
        title="Delete Memory"
        message="This memory will be permanently removed. This cannot be undone."
        confirmLabel="Delete"
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />

      {/* Hero Section — full bleed using negative margins */}
      <section className="relative w-full h-[40vh] md:h-[55vh] bg-black overflow-hidden -mx-6 md:-mx-8 -mt-6 md:-mt-8 mb-6 md:mb-8">
        {images.length > 0 ? (
          <>
            {images.map((item, idx) => (
              <div
                key={item.id}
                className={`absolute inset-0 flex items-center justify-center transition-opacity duration-500 ${
                  idx === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
                }`}
              >
                <img
                  src={item.media_url}
                  alt={memory.title}
                  className="max-w-full max-h-full object-contain"
                />
              </div>
            ))}

            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => setCurrentSlide((prev) => (prev - 1 + images.length) % images.length)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-all"
                >
                  &#10094;
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentSlide((prev) => (prev + 1) % images.length)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-all"
                >
                  &#10095;
                </button>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
                  {images.map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setCurrentSlide(idx)}
                      className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                        idx === currentSlide ? 'bg-[#C96B60] dark:bg-[#BF8F8F] scale-125' : 'bg-white/40 hover:bg-white/60'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#C96B60]/30 to-[#8E5B60]/40 dark:from-[#591F12] dark:to-[#40110D] p-8">
            <h1 className="font-display text-center text-3xl md:text-5xl text-[#1A2B48] dark:text-[#D9C1BF] drop-shadow-lg">
              {memory.title}
            </h1>
          </div>
        )}
      </section>

      {/* Memory Info Card */}
      <div className="max-w-4xl w-full mx-auto space-y-4">
        <section className="rounded-2xl bg-white/60 dark:bg-[#591F12]/50 border border-white/40 dark:border-[#D9C1BF]/8 backdrop-blur-sm p-6 md:p-8 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
            <h1 className="text-2xl font-bold font-serif text-[#C96B60] dark:text-[#D9C1BF]">{memory.title}</h1>
            <span className="inline-flex self-start whitespace-nowrap rounded-full border border-[#C96B60]/20 dark:border-[#BF8F8F]/15 bg-[#C96B60]/10 dark:bg-[#8E5B60]/20 px-3 py-1 text-xs font-medium text-[#C96B60] dark:text-[#BF8F8F]">
              {addedByLabel}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-sm text-[#1A2B48]/50 dark:text-[#8C5D5D]">
            {memory.memory_date && <span>📅 {formatLongDate(memory.memory_date)}</span>}
            {memory.location && <span>📍 {memory.location}</span>}
            <span className="rounded-full border border-[#C96B60]/20 dark:border-[#BF8F8F]/15 bg-[#C96B60]/8 dark:bg-[#8E5B60]/15 px-2 py-0.5 text-xs capitalize text-[#C96B60] dark:text-[#BF8F8F]">
              👁 {memory.visibility === 'partner_only' ? 'partner only' : memory.visibility}
            </span>
          </div>

          {memory.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {memory.tags.map((tag) => (
                <span key={tag.id} className="rounded-full bg-[#C96B60]/10 dark:bg-[#8E5B60]/20 border border-[#C96B60]/15 dark:border-[#BF8F8F]/10 px-3 py-1 text-xs font-medium text-[#C96B60] dark:text-[#BF8F8F]">
                  #{tag.name}
                </span>
              ))}
            </div>
          )}

          <p className="font-serif whitespace-pre-wrap pt-2 text-base leading-relaxed text-[#1A2B48] dark:text-[#D9C1BF]">
            {memory.body}
          </p>
        </section>
      </div>

      {/* Photo Gallery */}
      {images.length > 0 && (
        <section className="max-w-4xl w-full mx-auto mt-6 space-y-4">
          <h2 className="text-xl font-serif font-bold text-[#1A2B48] dark:text-[#D9C1BF]">📸 Photos ({images.length})</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {images.map((img, index) => (
              <div
                key={img.id}
                className="relative aspect-square rounded-xl overflow-hidden cursor-pointer group"
                onClick={() => openLightbox(index)}
              >
                <img
                  src={img.media_url}
                  alt=""
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300" />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Videos */}
      {videos.length > 0 && (
        <section className="max-w-4xl w-full mx-auto mt-6 space-y-4">
          <h2 className="text-xl font-serif font-bold text-[#1A2B48] dark:text-[#D9C1BF]">🎥 Videos ({videos.length})</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {videos.map((video) => (
              <VideoCard
                key={video.id}
                video={video}
                isPlaying={playingId === video.id}
                onPlay={() => setPlayingId(video.id)}
                onClose={() => setPlayingId(null)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Audio */}
      {audioFiles.length > 0 && (
        <section className="max-w-4xl w-full mx-auto mt-6 space-y-4">
          <h2 className="text-xl font-serif font-bold text-[#1A2B48] dark:text-[#D9C1BF]">🎵 Audio ({audioFiles.length})</h2>
          <div className="space-y-3">
            {audioFiles.map((item, idx) => (
              <AudioPlayerItem key={item.id} src={item.media_url} index={idx} />
            ))}
          </div>
        </section>
      )}

      {/* Comments */}
      <section className="max-w-4xl w-full mx-auto mt-6 space-y-6">
        <h2 className="text-xl font-serif font-bold text-[#1A2B48] dark:text-[#D9C1BF]">
          💬 Comments ({memory.comments?.length || 0})
        </h2>

        <div className="space-y-4">
          {memory.comments?.length > 0 ? (
            memory.comments.map((comment) => {
              const authorLetter = comment.display_name ? comment.display_name.charAt(0).toUpperCase() : '?';
              return (
                <div key={comment.id} className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#C96B60] dark:bg-[#8E5B60] font-bold text-white">
                    {authorLetter}
                  </div>
                  <div className="flex-1 rounded-xl bg-white/60 dark:bg-[#591F12]/40 border border-white/40 dark:border-[#D9C1BF]/8 backdrop-blur-sm p-4">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-sm font-semibold text-[#1A2B48] dark:text-[#D9C1BF]">{comment.display_name}</span>
                      <span className="text-xs text-[#1A2B48]/40 dark:text-[#8C5D5D]">{formatTimestamp(comment.created_at)}</span>
                    </div>
                    <p className="font-serif text-sm leading-relaxed text-[#1A2B48]/80 dark:text-[#BF8F8F]">{comment.body}</p>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-sm italic text-[#1A2B48]/50 dark:text-[#8C5D5D]">No comments yet. Leave a sweet note below ❤️</p>
          )}
        </div>

        <form onSubmit={handlePostComment} className="space-y-3">
          <textarea
            required
            rows={3}
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Write a comment..."
            className="memento-input"
          />
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submittingComment || !commentText.trim()}
              className="px-5 py-2 rounded-xl bg-[#C96B60] dark:bg-[#8E5B60] text-white text-sm font-semibold hover:bg-[#B05A50] dark:hover:bg-[#BF8F8F]/80 transition-colors disabled:opacity-40 flex items-center gap-2"
            >
              {submittingComment ? (
                <>
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Posting...
                </>
              ) : 'Post Comment ❤'}
            </button>
          </div>
        </form>
      </section>

      {/* Action Buttons */}
      {isCreator && (
        <div className="mx-auto mt-8 w-full max-w-4xl">
          <div className="flex items-center justify-end gap-3">
            <Link to={`/memories/${id}/edit`}
              className="px-4 py-2 rounded-xl border border-[#C96B60]/30 dark:border-[#BF8F8F]/20 text-[#C96B60] dark:text-[#BF8F8F] text-sm font-semibold hover:bg-[#C96B60]/8 dark:hover:bg-[#8E5B60]/20 transition-colors">
              ✏️ Edit
            </Link>
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              disabled={deleting}
              className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-50"
            >
              {deleting ? 'Deleting...' : '🗑️ Delete'}
            </button>
          </div>
        </div>
      )}

      {/* Lightbox */}
      {lightboxIndex !== null && images.length > 0 && (
        <div className="fixed inset-0 z-50 flex flex-col bg-black/95" onClick={() => setLightboxIndex(null)}>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setLightboxIndex(null);
            }}
            className="absolute right-6 top-6 z-10 text-4xl text-white transition-colors hover:text-[#BF8F8F]"
          >
            ✕
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setLightboxIndex((prev) => (prev - 1 + images.length) % images.length);
            }}
            className="absolute left-4 top-1/2 z-10 -translate-y-1/2 p-4 text-4xl text-white transition-colors hover:text-[#BF8F8F]"
          >
            &#10094;
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setLightboxIndex((prev) => (prev + 1) % images.length);
            }}
            className="absolute right-4 top-1/2 z-10 -translate-y-1/2 p-4 text-4xl text-white transition-colors hover:text-[#BF8F8F]"
          >
            &#10095;
          </button>

          <div className="flex-1 flex items-center justify-center p-4 pb-32" onClick={(e) => e.stopPropagation()}>
            <img
              src={images[lightboxIndex].media_url}
              alt={`Photo ${lightboxIndex + 1}`}
              className="max-w-[85vw] max-h-[85vh] object-contain transition-opacity duration-300"
            />
          </div>

          <div className="absolute bottom-20 left-1/2 -translate-x-1/2 text-white/60 text-sm font-medium">
            {lightboxIndex + 1} / {images.length}
          </div>

          <div className="absolute bottom-4 left-0 right-0 px-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex gap-2 justify-center overflow-x-auto py-2 max-w-full">
              {images.map((item, idx) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setLightboxIndex(idx)}
                  className={`shrink-0 w-14 h-14 rounded-lg overflow-hidden border-2 transition-all duration-300 ${
                    idx === lightboxIndex
                      ? 'border-[#C96B60] dark:border-[#BF8F8F] scale-110 opacity-100'
                      : 'border-transparent opacity-50 hover:opacity-80'
                  }`}
                >
                  <img src={item.media_url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
};

export default MemoryDetail;
