import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AppLayout from '../components/AppLayout';
import { useAuth } from '../context/AuthContext';
import { getProfile, updateProfile, uploadAvatarPhoto } from '../api/profile';
import { getAllPhotos } from '../api/memories';

/* ─── tiny helpers ─── */
const fmtBirthday = (d) => {
  if (!d) return '';
  const parts = d.split('T')[0];
  const [y, m, day] = parts.split('-');
  return new Date(y, parseInt(m) - 1, parseInt(day))
    .toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });
};

const Avatar = ({ src, name, size = 'lg' }) => {
  const sz = size === 'lg' ? 'h-28 w-28 text-4xl' : 'h-20 w-20 text-2xl';
  if (src) return (
    <img
      src={src}
      alt={name}
      className={`${sz} rounded-full object-cover border-4 border-white dark:border-[#591F12] shadow-xl`}
    />
  );
  return (
    <div className={`${sz} rounded-full bg-[#C96B60]/20 dark:bg-[#8E5B60]/60 flex items-center justify-center border-4 border-white dark:border-[#591F12] shadow-xl`}>
      <span className="font-serif font-bold text-[#C96B60] dark:text-[#D9C1BF]">
        {name?.[0]?.toUpperCase() || '?'}
      </span>
    </div>
  );
};

/* ─── Photo picker modal ─── */
const PhotoPicker = ({ photos, loading, current, onSelect, onClose }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-end md:items-center justify-center p-4"
    onClick={onClose}
  >
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
      className="w-full max-w-lg bg-white dark:bg-[#291008] rounded-2xl shadow-2xl p-6 max-h-[80vh] overflow-y-auto"
      onClick={e => e.stopPropagation()}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-serif text-lg text-[#352F36] dark:text-[#D9C1BF]">Choose Profile Photo</h3>
        <button onClick={onClose} className="text-[#352F36]/40 dark:text-[#8C5D5D] text-lg hover:text-[#C96B60]">✕</button>
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <svg className="animate-spin h-6 w-6 text-[#C96B60]" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>
      ) : photos.length === 0 ? (
        <p className="text-center py-10 font-serif italic text-[#352F36]/40 dark:text-[#8C5D5D] text-sm">
          No photos yet — upload memories with photos first.
        </p>
      ) : (
        <div className="grid grid-cols-3 gap-2.5">
          {photos.map((p, i) => {
            const sel = current === p.url;
            return (
              <div
                key={i}
                onClick={() => onSelect(p.url)}
                className={`relative aspect-square rounded-xl overflow-hidden cursor-pointer border-2 transition-all duration-200 ${
                  sel ? 'border-[#C96B60] dark:border-[#BF8F8F]' : 'border-transparent hover:border-[#C96B60]/40'
                }`}
              >
                <img src={p.url} alt={p.memory_title} className="w-full h-full object-cover" />
                {sel && (
                  <div className="absolute inset-0 bg-[#C96B60]/30 flex items-center justify-center">
                    <span className="w-7 h-7 rounded-full bg-[#C96B60] text-white text-sm flex items-center justify-center font-bold shadow">✓</span>
                  </div>
                )}
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 p-1.5">
                  <p className="text-white text-[9px] truncate">{p.memory_title}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <button
        onClick={onClose}
        className="mt-5 w-full py-2.5 rounded-xl bg-[#C96B60] dark:bg-[#8E5B60] text-white font-semibold text-sm hover:bg-[#B05A50] transition-colors"
      >
        Done
      </button>
    </motion.div>
  </motion.div>
);

/* ─── Profile Page ────────────────────────────────────────────────── */
const Profile = () => {
  const { user, updateUser } = useAuth();

  const [profile, setProfile] = useState(null);
  const [partner, setPartner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  // Edit form state
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ display_name: '', avatar_url: '', bio: '', location: '', birthday: '' });

  // Avatar upload
  const fileRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [localPreview, setLocalPreview] = useState(''); // blob URL for instant preview

  // Photo picker (from memories)
  const [photos, setPhotos] = useState([]);
  const [showPicker, setShowPicker] = useState(false);

  /* fetch profile + all photos */
  useEffect(() => {
    Promise.all([
      getProfile().catch(() => null),
      getAllPhotos().catch(() => ({ photos: [] })),
    ]).then(([prof, ph]) => {
      if (prof?.self) {
        setProfile(prof.self);
        setPartner(prof.partner || null);
        setForm({
          display_name: prof.self.display_name || '',
          avatar_url:   prof.self.avatar_url   || '',
          bio:          prof.self.bio          || '',
          location:     prof.self.location     || '',
          birthday:     prof.self.birthday ? prof.self.birthday.split('T')[0] : '',
        });
      }
      setPhotos(ph?.photos || []);
    }).finally(() => setLoading(false));
  }, []);

  const startEdit = () => {
    setEditing(true);
    setSaved(false);
    setError('');
    setLocalPreview('');
  };

  const cancel = () => {
    setEditing(false);
    setError('');
    setLocalPreview('');
    if (profile) {
      setForm({
        display_name: profile.display_name || '',
        avatar_url:   profile.avatar_url   || '',
        bio:          profile.bio          || '',
        location:     profile.location     || '',
        birthday:     profile.birthday ? profile.birthday.split('T')[0] : '',
      });
    }
  };

  /* ── Avatar file upload ── */
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Instant preview via blob URL
    const preview = URL.createObjectURL(file);
    setLocalPreview(preview);
    setUploading(true);
    setError('');
    try {
      const res = await uploadAvatarPhoto(file);
      setForm(f => ({ ...f, avatar_url: res.avatar_url }));
      setLocalPreview('');
      updateUser({ avatar_url: res.avatar_url });
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Unknown error';
      setError(`Photo upload failed: ${msg}`);
      setLocalPreview('');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const save = async () => {
    if (!form.display_name.trim()) { setError('Display name is required.'); return; }
    setSaving(true);
    setError('');
    try {
      const res = await updateProfile({
        display_name: form.display_name.trim(),
        avatar_url:   form.avatar_url  || null,
        bio:          form.bio         || null,
        location:     form.location    || null,
        birthday:     form.birthday    || null,
      });
      setProfile(res.user);
      // Sync display_name + avatar_url back to the auth context / localStorage
      updateUser({ display_name: res.user.display_name, avatar_url: res.user.avatar_url });
      setEditing(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      setError('Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const applyUrlInput = () => {
    setForm(f => ({ ...f, avatar_url: urlInput.trim() }));
  };

  /* ─── Render ─── */
  if (loading) return (
    <AppLayout pageTitle="Profile">
      <div className="flex justify-center py-20">
        <svg className="animate-spin h-7 w-7 text-[#C96B60]" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    </AppLayout>
  );

  return (
    <AppLayout pageTitle="Profile">
      <div className="max-w-2xl mx-auto space-y-6">

        {/* ── SQL notice banner (shows only when bio/location/birthday columns may not exist) ── */}
        {profile && profile.bio === undefined && (
          <div className="rounded-xl border border-amber-300 dark:border-amber-800/50 bg-amber-50 dark:bg-amber-950/20 p-4 text-sm text-amber-800 dark:text-amber-400">
            <p className="font-semibold mb-1">⚠ Run this SQL in your Neon dashboard first:</p>
            <code className="block text-xs bg-black/5 dark:bg-white/5 rounded-lg p-3 mt-2 whitespace-pre select-all">
              {`ALTER TABLE users\n  ADD COLUMN IF NOT EXISTS bio TEXT,\n  ADD COLUMN IF NOT EXISTS location VARCHAR(255),\n  ADD COLUMN IF NOT EXISTS birthday DATE;`}
            </code>
          </div>
        )}

        {/* ── MY PROFILE CARD ── */}
        <div className="rounded-2xl bg-white dark:bg-[#291008]/80 border border-black/5 dark:border-[#D9C1BF]/8 shadow-md overflow-hidden">
          {/* Header bar */}
          <div className="h-24 bg-gradient-to-r from-[#C96B60]/30 via-[#BF8F8F]/20 to-[#F7CAD0]/20 dark:from-[#8E5B60]/50 dark:via-[#591F12] dark:to-[#40110D]" />

          <div className="px-6 pb-6">
            {/* Avatar */}
            <div className="-mt-14 mb-4 flex items-end justify-between">
              <div className="relative group">
                {/* Show local blob preview instantly, then the saved URL */}
                <Avatar
                  src={localPreview || (editing ? form.avatar_url : profile?.avatar_url)}
                  name={form.display_name || profile?.display_name}
                  size="lg"
                />
                {editing && (
                  <>
                    <button
                      type="button"
                      onClick={() => fileRef.current?.click()}
                      disabled={uploading}
                      className="absolute inset-0 rounded-full bg-black/55 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity gap-0.5"
                    >
                      {uploading ? (
                        <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                        </svg>
                      ) : (
                        <>
                          <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                          </svg>
                          <span className="text-white text-[10px] font-medium">Upload</span>
                        </>
                      )}
                    </button>
                    {/* Hidden file input */}
                    <input
                      ref={fileRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                  </>
                )}
              </div>
              {!editing ? (
                <button
                  onClick={startEdit}
                  className="px-4 py-2 rounded-xl border border-[#C96B60]/30 dark:border-[#BF8F8F]/20 text-[#C96B60] dark:text-[#BF8F8F] text-sm font-medium hover:bg-[#C96B60]/8 transition-colors"
                >
                  Edit Profile
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={cancel}
                    className="px-4 py-2 rounded-xl border border-black/10 dark:border-[#D9C1BF]/12 text-sm text-[#352F36]/60 dark:text-[#BF8F8F] hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={save}
                    disabled={saving}
                    className="px-5 py-2 rounded-xl bg-[#C96B60] dark:bg-[#8E5B60] text-white text-sm font-semibold hover:bg-[#B05A50] transition-colors disabled:opacity-50"
                  >
                    {saving ? 'Saving…' : 'Save'}
                  </button>
                </div>
              )}
            </div>

            {/* Success / error banners */}
            <AnimatePresence>
              {saved && (
                <motion.p
                  initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="mb-3 text-sm text-green-600 dark:text-green-400 font-medium"
                >
                  ✓ Profile saved
                </motion.p>
              )}
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="mb-3 text-sm text-red-500"
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>

            {/* ── VIEW MODE ── */}
            {!editing && (
              <div className="space-y-2">
                <h2 className="font-serif text-2xl font-bold text-[#352F36] dark:text-[#D9C1BF]">
                  {profile?.display_name}
                </h2>
                <p className="text-xs text-[#352F36]/40 dark:text-[#8C5D5D]">{profile?.email}</p>

                {profile?.bio && (
                  <p className="mt-3 text-sm text-[#352F36]/70 dark:text-[#BF8F8F] leading-relaxed">{profile.bio}</p>
                )}

                <div className="mt-4 flex flex-wrap gap-4">
                  {profile?.location && (
                    <span className="flex items-center gap-1.5 text-xs text-[#352F36]/55 dark:text-[#8C5D5D]">
                      {profile.location}
                    </span>
                  )}
                  {profile?.birthday && (
                    <span className="flex items-center gap-1.5 text-xs text-[#352F36]/55 dark:text-[#8C5D5D]">
                      🎂 {fmtBirthday(profile.birthday)}
                    </span>
                  )}
                  {!profile?.bio && !profile?.location && !profile?.birthday && (
                    <p className="text-sm font-serif italic text-[#352F36]/30 dark:text-[#8C5D5D]">
                      Click "Edit Profile" to add your details
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* ── EDIT FORM ── */}
            {editing && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4 mt-2"
              >
                {/* Display name */}
                <div>
                  <label className="block text-xs font-medium text-[#352F36]/60 dark:text-[#BF8F8F] mb-1.5">
                    Display Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.display_name}
                    onChange={e => setForm(f => ({ ...f, display_name: e.target.value }))}
                    className="memento-input"
                    placeholder="Your name"
                  />
                </div>

                {/* Profile photo helpers */}
                <div>
                  <label className="block text-xs font-medium text-[#352F36]/60 dark:text-[#BF8F8F] mb-2">
                    Profile Photo
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => fileRef.current?.click()}
                      disabled={uploading}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#C96B60]/30 dark:border-[#BF8F8F]/20 text-[#C96B60] dark:text-[#BF8F8F] text-xs hover:bg-[#C96B60]/8 transition-colors disabled:opacity-50"
                    >
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                      </svg>
                      {uploading ? 'Uploading…' : 'Upload from device'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowPicker(true)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#C96B60]/30 dark:border-[#BF8F8F]/20 text-[#C96B60] dark:text-[#BF8F8F] text-xs hover:bg-[#C96B60]/8 transition-colors"
                    >
                      🖼 From memories
                    </button>
                    {form.avatar_url && (
                      <button
                        type="button"
                        onClick={() => setForm(f => ({ ...f, avatar_url: '' }))}
                        className="px-3 py-2 rounded-xl border border-red-300 dark:border-red-800/50 text-red-400 text-xs hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  {uploading && (
                    <p className="mt-1.5 text-xs text-[#C96B60] dark:text-[#BF8F8F] animate-pulse">
                      Uploading to Cloudinary…
                    </p>
                  )}
                </div>

                {/* Bio */}
                <div>
                  <label className="block text-xs font-medium text-[#352F36]/60 dark:text-[#BF8F8F] mb-1.5">
                    Bio
                  </label>
                  <textarea
                    rows={3}
                    value={form.bio}
                    onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
                    className="memento-input resize-none"
                    placeholder="A little about yourself…"
                  />
                </div>

                {/* Location + Birthday in a row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-[#352F36]/60 dark:text-[#BF8F8F] mb-1.5">
                      Location
                    </label>
                    <input
                      type="text"
                      value={form.location}
                      onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                      className="memento-input"
                      placeholder="City, Country"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#352F36]/60 dark:text-[#BF8F8F] mb-1.5">
                      Birthday
                    </label>
                    <input
                      type="date"
                      value={form.birthday}
                      onChange={e => setForm(f => ({ ...f, birthday: e.target.value }))}
                      className="memento-input"
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* ── PARTNER PROFILE (read-only) ── */}
        {partner && (
          <div className="rounded-2xl bg-white dark:bg-[#291008]/80 border border-black/5 dark:border-[#D9C1BF]/8 shadow-md overflow-hidden">
            <div className="h-16 bg-gradient-to-r from-[#BF8F8F]/25 via-[#C96B60]/15 to-[#F7CAD0]/15 dark:from-[#8C5D5D]/40 dark:via-[#591F12] dark:to-[#40110D]" />
            <div className="px-6 pb-6">
              <div className="-mt-10 mb-4 flex items-end justify-between">
                <Avatar src={partner.avatar_url} name={partner.display_name} size="sm" />
                <span className="text-xs text-[#352F36]/40 dark:text-[#8C5D5D] font-medium tracking-wider uppercase">Partner</span>
              </div>
              <h3 className="font-serif text-xl font-bold text-[#352F36] dark:text-[#D9C1BF]">{partner.display_name}</h3>
              {partner.bio && (
                <p className="mt-2 text-sm text-[#352F36]/65 dark:text-[#BF8F8F] leading-relaxed">{partner.bio}</p>
              )}
              <div className="mt-3 flex flex-wrap gap-4">
                {partner.location && (
                  <span className="text-xs text-[#352F36]/50 dark:text-[#8C5D5D]">{partner.location}</span>
                )}
                {partner.birthday && (
                  <span className="text-xs text-[#352F36]/50 dark:text-[#8C5D5D]">🎂 {fmtBirthday(partner.birthday)}</span>
                )}
                {!partner.bio && !partner.location && !partner.birthday && (
                  <p className="text-sm font-serif italic text-[#352F36]/25 dark:text-[#8C5D5D]">
                    Your partner hasn't filled in their profile yet
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── No partner yet ── */}
        {!partner && (
          <div className="rounded-2xl bg-white/50 dark:bg-[#291008]/40 border border-dashed border-[#C96B60]/20 dark:border-[#BF8F8F]/15 p-6 text-center">
            <p className="font-serif italic text-[#352F36]/35 dark:text-[#8C5D5D] text-sm">
              Partner profile will appear here once they accept your invite
            </p>
          </div>
        )}
      </div>

      {/* ── Photo picker modal ── */}
      <AnimatePresence>
        {showPicker && (
          <PhotoPicker
            photos={photos}
            loading={false}
            current={form.avatar_url}
            onSelect={(url) => {
              setForm(f => ({ ...f, avatar_url: url }));
              setShowPicker(false);
            }}
            onClose={() => setShowPicker(false)}
          />
        )}
      </AnimatePresence>
    </AppLayout>
  );
};

export default Profile;
