import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { getMemory, updateMemory, uploadMedia, deleteMedia } from '../api/memories';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import ConfirmModal from '../components/ConfirmModal';
import AppLayout from '../components/AppLayout';

const EditMemory = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();
  const imageInputRef = useRef(null);
  const videoInputRef = useRef(null);

  const [title, setTitle] = useState('');
  const [story, setStory] = useState('');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');
  const [visibility, setVisibility] = useState('shared');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState([]);
  const [existingMedia, setExistingMedia] = useState([]);
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [mediaToDelete, setMediaToDelete] = useState(null);
  const [deletingMedia, setDeletingMedia] = useState(false);

  useEffect(() => {
    return () => imagePreviews.forEach((url) => URL.revokeObjectURL(url));
  }, [imagePreviews]);

  useEffect(() => {
    const loadMemory = async () => {
      try {
        const data = await getMemory(id);
        if (data.created_by_user_id !== user?.id) {
          showToast('You can only edit memories you created.', 'error');
          navigate(`/memories/${id}`);
          return;
        }
        setTitle(data.title || '');
        setStory(data.body || '');
        setDate(data.memory_date ? data.memory_date.split('T')[0] : '');
        setLocation(data.location || '');
        setVisibility(data.visibility || 'shared');
        setTags((data.tags || []).map((t) => t.name));
        setExistingMedia(data.media || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load memory.');
        showToast('Failed to load memory.', 'error');
      } finally {
        setLoading(false);
      }
    };
    loadMemory();
  }, [id, user?.id, navigate, showToast]);

  const handleAddTag = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const clean = tagInput.trim().toLowerCase();
      if (clean && !tags.includes(clean)) setTags([...tags, clean]);
      setTagInput('');
    }
  };
  const handleRemoveTag = (i) => setTags(tags.filter((_, idx) => idx !== i));

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files || []);
    const existingImages = existingMedia.filter((m) => m.media_type === 'image').length;
    if (files.length + images.length + existingImages > 10) {
      setError('Maximum 10 images total.');
      showToast('Maximum 10 images allowed.', 'warning');
      return;
    }
    setError('');
    setImagePreviews((prev) => [...prev, ...files.map((f) => URL.createObjectURL(f))]);
    setImages((prev) => [...prev, ...files]);
    if (imageInputRef.current) imageInputRef.current.value = '';
  };
  const handleRemoveNewImage = (i) => {
    URL.revokeObjectURL(imagePreviews[i]);
    setImagePreviews((prev) => prev.filter((_, idx) => idx !== i));
    setImages((prev) => prev.filter((_, idx) => idx !== i));
  };

  const handleVideoChange = (e) => {
    const files = Array.from(e.target.files || []);
    const existingVideos = existingMedia.filter((m) => m.media_type === 'video').length;
    if (files.length + videos.length + existingVideos > 3) {
      setError('Maximum 3 videos total.');
      showToast('Maximum 3 videos allowed.', 'warning');
      return;
    }
    setError('');
    setVideos((prev) => [...prev, ...files]);
    if (videoInputRef.current) videoInputRef.current.value = '';
  };
  const handleRemoveVideo = (i) => setVideos((prev) => prev.filter((_, idx) => idx !== i));

  const handleConfirmDeleteMedia = async () => {
    if (!mediaToDelete) return;
    setDeletingMedia(true);
    try {
      await deleteMedia(mediaToDelete.id);
      setExistingMedia((prev) => prev.filter((m) => m.id !== mediaToDelete.id));
      showToast('Photo removed.', 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to remove photo.', 'error');
    } finally {
      setDeletingMedia(false);
      setMediaToDelete(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!title.trim() || !story.trim()) {
      setError('Title and Story are required.');
      return;
    }
    setSaving(true);
    try {
      await updateMemory(id, { title, body: story, memory_date: date || null, location, visibility, tags });
      if (images.length > 0 || videos.length > 0) {
        const fd = new FormData();
        images.forEach((f) => fd.append('images', f));
        videos.forEach((f) => fd.append('videos', f));
        await uploadMedia(id, fd);
      }
      showToast('Memory updated ❤️', 'success');
      navigate(`/memories/${id}`);
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.error || err.message || 'Failed to update memory.';
      setError(msg);
      showToast('Update failed. Please try again.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const existingImages = existingMedia.filter((m) => m.media_type === 'image');

  const inputCls = 'memento-input w-full';
  const labelCls = 'block text-sm font-medium text-[#1A2B48] dark:text-[#BF8F8F] mb-1.5';

  const CancelBtn = (
    <Link
      to={`/memories/${id}`}
      className="text-sm text-[#1A2B48]/50 dark:text-[#8C5D5D] hover:text-[#C96B60] dark:hover:text-[#BF8F8F] transition-colors"
    >
      Cancel
    </Link>
  );

  if (loading) {
    return (
      <AppLayout pageTitle="Edit Memory">
        <div className="flex items-center justify-center py-24">
          <svg className="animate-spin h-8 w-8 text-[#C96B60] dark:text-[#BF8F8F]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout pageTitle="Edit Memory" pageActions={CancelBtn}>
      <ConfirmModal
        isOpen={!!mediaToDelete}
        title="Remove Photo"
        message="Remove this photo from the memory?"
        confirmLabel="Remove"
        onConfirm={handleConfirmDeleteMedia}
        onCancel={() => setMediaToDelete(null)}
      />

      <div className="max-w-3xl mx-auto">
        <div className="rounded-2xl bg-white/60 dark:bg-[#591F12]/50 border border-white/40 dark:border-[#D9C1BF]/8 backdrop-blur-sm shadow-lg p-7">

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className={labelCls} htmlFor="title-input">Memory Title *</label>
              <input id="title-input" type="text" required value={title}
                onChange={(e) => setTitle(e.target.value)} className={inputCls} />
            </div>

            <div>
              <label className={labelCls} htmlFor="story-input">Our Story *</label>
              <textarea id="story-input" required rows={6} value={story}
                onChange={(e) => setStory(e.target.value)} className={inputCls} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className={labelCls} htmlFor="date-input">When did it happen?</label>
                <input id="date-input" type="date" value={date}
                  onChange={(e) => setDate(e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className={labelCls} htmlFor="location-input">Where did it happen?</label>
                <input id="location-input" type="text" value={location}
                  onChange={(e) => setLocation(e.target.value)} className={inputCls}
                  placeholder="e.g. Tomoca Coffee, Addis Ababa" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className={labelCls} htmlFor="visibility-input">Visibility</label>
                <select id="visibility-input" value={visibility}
                  onChange={(e) => setVisibility(e.target.value)} className={inputCls}>
                  <option value="shared">Shared (Both Partners)</option>
                  <option value="private">Private (Only Me)</option>
                  <option value="partner_only">Partner Only</option>
                </select>
              </div>
              <div>
                <label className={labelCls} htmlFor="tag-input">Tags (Press Enter to add)</label>
                <input id="tag-input" type="text" value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleAddTag} className={inputCls}
                  placeholder="e.g. anniversary, travel" />
                <div className="flex flex-wrap gap-2 mt-2">
                  {tags.map((tag, idx) => (
                    <span key={idx} className="inline-flex items-center gap-1 rounded-full border border-[#C96B60]/25 dark:border-[#BF8F8F]/20 bg-[#C96B60]/10 dark:bg-[#8E5B60]/20 px-3 py-1 text-xs font-medium text-[#C96B60] dark:text-[#BF8F8F]">
                      #{tag}
                      <button type="button" onClick={() => handleRemoveTag(idx)}
                        className="text-[#C96B60]/60 hover:text-[#C96B60] transition-colors">&times;</button>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Existing images */}
            {existingImages.length > 0 && (
              <div className="border-t border-black/5 dark:border-[#D9C1BF]/8 pt-5">
                <h3 className={labelCls}>Current Photos</h3>
                <div className="grid grid-cols-3 gap-3">
                  {existingImages.map((item) => (
                    <div key={item.id} className="relative aspect-square rounded-lg overflow-hidden border border-white/40 dark:border-[#D9C1BF]/10">
                      <img src={item.media_url} alt="Current" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        disabled={deletingMedia}
                        onClick={() => setMediaToDelete(item)}
                        className="absolute top-1.5 right-1.5 w-6 h-6 bg-red-600/90 rounded-full flex items-center justify-center text-white text-xs hover:bg-red-500 transition-colors"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* New media */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 border-t border-black/5 dark:border-[#D9C1BF]/8 pt-5">
              <div>
                <label className={labelCls}>Add Images</label>
                <input ref={imageInputRef} type="file" accept="image/*" multiple onChange={handleImageChange}
                  className="w-full cursor-pointer text-sm text-[#1A2B48]/60 dark:text-[#8C5D5D]
                    file:mr-3 file:rounded-lg file:border-0 file:px-3 file:py-1.5 file:text-xs file:font-medium
                    file:bg-[#C96B60]/12 dark:file:bg-[#8E5B60]/30 file:text-[#C96B60] dark:file:text-[#BF8F8F]
                    hover:file:bg-[#C96B60]/20 dark:hover:file:bg-[#8E5B60]/50" />
                <p className="text-xs text-[#1A2B48]/40 dark:text-[#8C5D5D] mt-1">Max 10 images total</p>
                {imagePreviews.length > 0 && (
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    {imagePreviews.map((preview, idx) => (
                      <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-white/40 dark:border-[#D9C1BF]/10">
                        <img src={preview} alt="" className="w-full h-full object-cover" />
                        <button type="button" onClick={() => handleRemoveNewImage(idx)}
                          className="absolute top-1 right-1 w-5 h-5 bg-red-600/90 rounded-full flex items-center justify-center text-white text-xs hover:bg-red-500">
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <label className={labelCls}>Add Videos</label>
                <input ref={videoInputRef} type="file" accept="video/*" multiple onChange={handleVideoChange}
                  className="w-full cursor-pointer text-sm text-[#1A2B48]/60 dark:text-[#8C5D5D]
                    file:mr-3 file:rounded-lg file:border-0 file:px-3 file:py-1.5 file:text-xs file:font-medium
                    file:bg-[#C96B60]/12 dark:file:bg-[#8E5B60]/30 file:text-[#C96B60] dark:file:text-[#BF8F8F]
                    hover:file:bg-[#C96B60]/20 dark:hover:file:bg-[#8E5B60]/50" />
                <p className="text-xs text-[#1A2B48]/40 dark:text-[#8C5D5D] mt-1">Max 3 videos total</p>
                {videos.length > 0 && (
                  <ul className="mt-3 space-y-1.5">
                    {videos.map((vid, idx) => (
                      <li key={idx} className="flex items-center justify-between rounded-lg border border-white/40 dark:border-[#D9C1BF]/8 bg-white/30 dark:bg-[#40110D]/50 p-2 text-xs text-[#1A2B48]/60 dark:text-[#8C5D5D]">
                        <span className="truncate max-w-[75%]">📹 {vid.name}</span>
                        <button type="button" onClick={() => handleRemoveVideo(idx)}
                          className="w-5 h-5 bg-red-600/80 rounded-full flex items-center justify-center text-white text-xs hover:bg-red-500">
                          ✕
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {/* Submit */}
            <div className="border-t border-black/5 dark:border-[#D9C1BF]/8 pt-5 flex flex-col items-center gap-3">
              {saving && (
                <div className="flex items-center gap-2 text-sm font-medium text-[#C96B60] dark:text-[#BF8F8F]">
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Saving changes...
                </div>
              )}
              <button type="submit" disabled={saving}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#C96B60] dark:bg-[#8E5B60] px-6 py-3.5 text-base font-semibold text-white hover:bg-[#B05A50] dark:hover:bg-[#BF8F8F]/80 shadow-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                Save Changes ❤️
              </button>
              {error && (
                <div className="w-full text-red-600 dark:text-red-400 text-sm text-center bg-red-50 dark:bg-red-950/20 py-2.5 px-4 rounded-lg border border-red-200 dark:border-red-900/30">
                  {error}
                </div>
              )}
            </div>
          </form>
        </div>
      </div>
    </AppLayout>
  );
};

export default EditMemory;
