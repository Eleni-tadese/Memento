import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { joinWithToken } from '../api/auth';
import ThemeToggle from '../components/ThemeToggle';
import BackButton from '../components/BackButton';
import StarsBackground from '../components/StarsBackground';
import PetalEffect from '../components/PetalEffect';
import { FlowerIcon } from '../components/Icons';

const JoinPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { login: contextLogin } = useAuth();

  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 4) {
      setError('Password must be at least 4 characters long.');
      return;
    }

    setLoading(true);
    try {
      const data = await joinWithToken(token, email, password, displayName);
      contextLogin(data.token, data.user, data.relationshipId);
      navigate('/dashboard');
    } catch (err) {
      if (err.response && err.response.status === 400) {
        setError('This invitation link has expired or is invalid. Ask your partner to send a new one.');
      } else {
        setError(
          err.response?.data?.message ||
          err.response?.data?.error ||
          err.message ||
          'Failed to join. Please check your details and try again.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      className="relative min-h-screen flex items-center justify-center bg-[#B0C3D4] dark:bg-[#40110D] p-4"
      id="join-view"
    >
      <StarsBackground />
      <PetalEffect />

      {/* Glow orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/3 h-72 w-72 rounded-full bg-[#C96B60]/8 dark:bg-[#8E5B60]/12 blur-3xl" />
        <div className="absolute bottom-1/3 right-1/4 h-56 w-56 rounded-full bg-[#7AAEC8]/10 dark:bg-[#591F12]/25 blur-2xl" />
      </div>

      <div className="fixed top-4 left-4 z-50"><BackButton to="/" /></div>
      <div className="fixed top-4 right-4 z-50"><ThemeToggle /></div>

      <div className="relative z-10 w-full max-w-md">
        {/* Card */}
        <div className="rounded-2xl border border-white/50 dark:border-[#D9C1BF]/10 bg-white/70 dark:bg-[#591F12]/60 backdrop-blur-md shadow-2xl p-8">
          {/* Brand */}
          <div className="text-center mb-8">
            <div className="mb-3 flex items-center justify-center gap-2">
              <FlowerIcon className="h-8 w-8 text-[#C96B60] dark:text-[#BF8F8F]" />
              <h1 className="font-serif text-4xl font-bold text-[#C96B60] dark:text-[#D9C1BF]">Memento</h1>
            </div>
            <p className="text-sm text-[#1A2B48]/60 dark:text-[#BF8F8F]">{"You've been invited to join your partner's space"}</p>
          </div>

          {/* Invitation badge */}
          <div className="mb-6 rounded-xl bg-[#C96B60]/8 dark:bg-[#8E5B60]/20 border border-[#C96B60]/20 dark:border-[#BF8F8F]/15 px-4 py-3 text-center">
            <p className="text-xs font-medium text-[#C96B60] dark:text-[#BF8F8F]">
              💌 Partner invitation — create your account to accept
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                className="block text-sm font-medium text-[#1A2B48] dark:text-[#BF8F8F] mb-1.5"
                htmlFor="fullname-input"
              >
                Full Name
              </label>
              <input
                id="fullname-input"
                type="text"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="memento-input"
                placeholder="Your Full Name"
              />
            </div>

            <div>
              <label
                className="block text-sm font-medium text-[#1A2B48] dark:text-[#BF8F8F] mb-1.5"
                htmlFor="email-input"
              >
                Email Address
              </label>
              <input
                id="email-input"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="memento-input"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label
                className="block text-sm font-medium text-[#1A2B48] dark:text-[#BF8F8F] mb-1.5"
                htmlFor="password-input"
              >
                Password
              </label>
              <input
                id="password-input"
                type="password"
                required
                minLength={4}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="memento-input"
                placeholder="•••• (min 4 chars)"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="memento-btn-primary w-full flex items-center justify-center gap-2 rounded-xl py-3 mt-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading && (
                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              )}
              {loading ? 'Joining Memento...' : 'Join Memento ❤'}
            </button>

            {error && (
              <div className="text-red-600 dark:text-red-400 text-sm text-center bg-red-50 dark:bg-red-950/20 py-2 px-3 rounded-lg border border-red-200 dark:border-red-900/30">
                {error}
              </div>
            )}
          </form>
        </div>

        <p className="text-center mt-4 text-xs text-[#1A2B48]/40 dark:text-[#8C5D5D] font-serif italic">
          Private memories, shared love ❤
        </p>
      </div>
    </main>
  );
};

export default JoinPage;
