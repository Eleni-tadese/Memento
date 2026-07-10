import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createMemory } from '../api/memories';
import { useToast } from '../context/ToastContext';
import AppLayout from '../components/AppLayout';

const UploadMemory = () => {
  const navigate = useNavigate();
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
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    return () => imagePreviews.forEach((url) => URL.revokeObjectURL(url));
  }, [imagePreviews]);

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
    if (files.length + images.length > 10) {
      setError('Maximum 10 images allowed.');
      showToast('Maximum 10 images allowed.', 'warning');
      return;
    }
    setError('');
    setImagePreviews((prev) => [...prev, ...files.map((f) => URL.createObjectURL(f))]);
    setImages((prev) => [...prev, ...files]);
    if (imageInputRef.current) imageInputRef.current.value = '';
  };
  const handleRemoveImage = (i) => {
    URL.revokeObjectURL(imagePreviews[i]);
    setImagePreviews((prev) => prev.filter((_, idx) => idx !== i));
    setImages((prev) => prev.filter((_, idx) => idx !== i));
  };

  const handleVideoChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length + videos.length > 3) {
      setError('Maximum 3 videos allowed.');
      showToast('Maximum 3 videos allowed.', 'warning');
      return;
    }
    setError('');
    setVideos((prev) => [...prev, ...files]);
    if (videoInputRef.current) videoInputRef.current.value = '';
  };
  const handleRemoveVideo = (i) => setVideos((prev) => prev.filter((_, idx) => idx !== i));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!title.trim() || !story.trim()) {
      setError('Title and Story are required.');
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('body', story);
      formData.append('memory_date', date);
      formData.append('location', location);
      formData.append('visibility', visibility);
      formData.append('tags', JSON.stringify(tags));
      images.forEach((f) => formData.append('images', f));
      videos.forEach((f) => formData.append('videos', f));
      const result = await createMemory(formData);
      showToast('Memory saved! ❤️', 'success');
      navigate(`/memories/${result.memory.id}`);
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        'Failed to save memory.';
      setError(msg);
      showToast('Upload failed. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const inputCls = 'memento-input w-full';
  const labelCls = 'block text-sm font-medium text-[#1A2B48] dark:text-[#BF8F8F] mb-1.5';

  const CancelBtn = (
    <Link
      to="/memories"
      className="text-sm text-[#1A2B48]/50 dark:text-[#8C5D5D] hover:text-[#C96B60] dark:hover:text-[#BF8F8F] transition-colors"
    >
      Cancel
    </Link>
  );

  return (
    <AppLayout pageTitle="Add a Memory" pageActions={CancelBtn}>
      <div className="max-w-3xl mx-auto">
        <div className="rounded-2xl bg-white/60 dark:bg-[#591F12]/50 border border-white/40 dark:border-[#D9C1BF]/8 backdrop-blur-sm shadow-lg p-7">

          {/* Drop zone header */}
          <div
            onClick={() => imageInputRef.current?.click()}
            className="mb-6 flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-[#C96B60]/30 dark:border-[#BF8F8F]/20 bg-[#FFF0EC]/50 dark:bg-[#8E5B60]/10 py-10 cursor-pointer hover:border-[#C96B60]/60 dark:hover:border-[#BF8F8F]/40 hover:bg-[#FFF0EC]/80 dark:hover:bg-[#8E5B60]/20 transition-all group"
          >
            <span className="text-3xl text-[#C96B60]/60 dark:text-[#BF8F8F]/50 group-hover:scale-110 transition-transform">☁</span>
            <p className="text-sm font-medium text-[#C96B60] dark:text-[#BF8F8F]">Drop photos or videos here</p>
            <p className="text-xs text-[#1A2B48]/40 dark:text-[#8C5D5D]">JPG · PNG · MP4</p>
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageChange}
              className="hidden"
            />
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Title */}
            <div>
              <label className={labelCls} htmlFor="title-input">Memory Title *</label>
              <input id="title-input" type="text" required value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={inputCls} placeholder="e.g. Our First Coffee Date" />
            </div>

            {/* Story */}
            <div>
              <label className={labelCls} htmlFor="story-input">Our Story *</label>
              <textarea id="story-input" required rows={5} value={story}
                onChange={(e) => setStory(e.target.value)}
                className={inputCls} placeholder="Tell the story of this memory..." />
            </div>

            {/* Date & Location */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className={labelCls} htmlFor="date-input">Date</label>
                <input id="date-input" type="date" value={date}
                  onChange={(e) => setDate(e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className={labelCls} htmlFor="location-input">Location</label>
                <input id="location-input" type="text" value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className={inputCls} placeholder="e.g. Tomoca Coffee, Addis Ababa" />
              </div>
            </div>

            {/* Visibility & Tags */}
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
                  onKeyDown={handleAddTag}
                  className={inputCls} placeholder="e.g. anniversary, travel" />
                <div className="flex flex-wrap gap-2 mt-2">
                  {tags.map((tag, idx) => (
                    <span key={idx} className="inline-flex items-center gap-1 rounded-full border border-[#C96B60]/25 dark:border-[#BF8F8F]/20 bg-[#C96B60]/10 dark:bg-[#8E5B60]/20 px-3 py-1 text-xs font-medium text-[#C96B60] dark:text-[#BF8F8F]">
                      #{tag}
                      <button type="button" onClick={() => handleRemoveTag(idx)}
                        className="text-[#C96B60]/60 dark:text-[#BF8F8F]/60 hover:text-[#C96B60] dark:hover:text-[#BF8F8F] transition-colors">&times;</button>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Media upload sections */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 border-t border-black/5 dark:border-[#D9C1BF]/8 pt-5">
              {/* Images */}
              <div>
                <label className={labelCls}>Additional Images</label>
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  className="w-full cursor-pointer text-sm text-[#1A2B48]/60 dark:text-[#8C5D5D]
                    file:mr-3 file:rounded-lg file:border-0 file:px-3 file:py-1.5 file:text-xs file:font-medium
                    file:bg-[#C96B60]/12 dark:file:bg-[#8E5B60]/30
                    file:text-[#C96B60] dark:file:text-[#BF8F8F]
                    hover:file:bg-[#C96B60]/20 dark:hover:file:bg-[#8E5B60]/50"
                />
                <p className="mt-1 text-xs text-[#1A2B48]/40 dark:text-[#8C5D5D]">Max 10 images</p>
                {imagePreviews.length > 0 && (
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    {imagePreviews.map((preview, idx) => (
                      <div key={idx} className="group relative aspect-square overflow-hidden rounded-lg border border-white/60 dark:border-[#D9C1BF]/10">
                        <img src={preview} alt="" className="w-full h-full object-cover" />
                        <button type="button" onClick={() => handleRemoveImage(idx)}
                          className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-600/90 text-xs text-white hover:bg-red-500">
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Videos */}
              <div>
                <label className={labelCls}>Upload Videos</label>
                <input
                  ref={videoInputRef}
                  type="file"
                  accept="video/*"
                  multiple
                  onChange={handleVideoChange}
                  className="w-full cursor-pointer text-sm text-[#1A2B48]/60 dark:text-[#8C5D5D]
                    file:mr-3 file:rounded-lg file:border-0 file:px-3 file:py-1.5 file:text-xs file:font-medium
                    file:bg-[#C96B60]/12 dark:file:bg-[#8E5B60]/30
                    file:text-[#C96B60] dark:file:text-[#BF8F8F]
                    hover:file:bg-[#C96B60]/20 dark:hover:file:bg-[#8E5B60]/50"
                />
                <p className="mt-1 text-xs text-[#1A2B48]/40 dark:text-[#8C5D5D]">Max 3 videos</p>
                {videos.length > 0 && (
                  <ul className="mt-3 space-y-1.5">
                    {videos.map((vid, idx) => (
                      <li key={idx} className="flex items-center justify-between rounded-lg border border-white/40 dark:border-[#D9C1BF]/8 bg-white/30 dark:bg-[#40110D]/50 p-2 text-xs text-[#1A2B48]/60 dark:text-[#8C5D5D]">
                        <span className="truncate max-w-[75%]">📹 {vid.name}</span>
                        <button type="button" onClick={() => handleRemoveVideo(idx)}
                          className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-600/80 text-xs text-white hover:bg-red-500">
                          ✕
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {/* Submit */}
            <div className="flex flex-col items-center gap-3 border-t border-black/5 dark:border-[#D9C1BF]/8 pt-5">
              {loading && (
                <div className="flex items-center gap-2 text-sm font-medium text-[#C96B60] dark:text-[#BF8F8F]">
                  <svg className="h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Uploading your memory...
                </div>
              )}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#C96B60] dark:bg-[#8E5B60] px-6 py-3.5 text-base font-semibold text-white hover:bg-[#B05A50] dark:hover:bg-[#BF8F8F]/80 shadow-md transition-colors disabled:cursor-not-allowed disabled:opacity-50"
              >
                Save Memory ❤️
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

export default UploadMemory;
