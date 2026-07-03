import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getInviteLink } from '../api/auth';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [inviteData, setInviteData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchInvite = async () => {
      try {
        const data = await getInviteLink();
        setInviteData(data);
      } catch (err) {
        // Fail silently as requested
        console.error('Failed to load invite link', err);
      } finally {
        setLoading(false);
      }
    };
    fetchInvite();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'morning';
    if (hour < 18) return 'afternoon';
    return 'evening';
  };

  const handleCopy = async () => {
    if (!inviteData?.inviteUrl) return;
    try {
      await navigator.clipboard.writeText(inviteData.inviteUrl);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <div className="min-h-screen bg-[#1A1A2E] text-white flex flex-col font-sans" id="dashboard-view">
      {/* Top bar */}
      <header className="bg-[#16213E] border-b border-purple-900/30 px-6 py-4 flex items-center justify-between shadow-md">
        <div className="flex items-center space-x-2">
          <span className="text-2xl font-black tracking-wider text-[#7B2D8B] drop-shadow-md">
            Memento
          </span>
        </div>
        <button
          onClick={logout}
          className="px-4 py-2 rounded-lg bg-red-950/40 hover:bg-red-900/40 border border-red-900/30 text-red-200 text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-red-700"
        >
          Logout
        </button>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-6 space-y-6">
        {/* Welcome Card */}
        <section className="bg-[#16213E] rounded-2xl p-8 shadow-xl border border-purple-900/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-600/10 rounded-full blur-3xl"></div>
          <h2 className="text-3xl font-bold tracking-tight mb-2">
            Good {getGreeting()}, {user?.display_name || 'Partner'} ❤️
          </h2>
          <p className="text-gray-400 text-sm">Welcome to your shared journal.</p>
        </section>

        {/* Invite section */}
        {loading ? (
          <div className="flex justify-center py-8">
            <svg
              className="animate-spin h-8 w-8 text-[#7B2D8B]"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          </div>
        ) : inviteData ? (
          inviteData.partnerJoined ? (
            <div className="bg-emerald-950/20 border border-emerald-500/30 text-emerald-200 rounded-2xl p-6 text-center shadow-lg">
              <span className="text-lg font-semibold flex items-center justify-center gap-2">
                Your partner has joined! ❤️
              </span>
            </div>
          ) : (
            <section className="bg-[#16213E] rounded-2xl p-6 shadow-xl border border-purple-900/20 space-y-4">
              <h3 className="text-xl font-bold text-gray-200">Invite your partner</h3>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  readOnly
                  value={inviteData.inviteUrl || ''}
                  className="flex-1 px-4 py-3 bg-[#1A1A2E] border border-gray-700 rounded-lg text-gray-300 text-sm focus:outline-none"
                />
                <button
                  onClick={handleCopy}
                  className="px-6 py-3 rounded-lg bg-[#7B2D8B] hover:bg-[#913fa3] font-semibold transition-all shadow-md focus:outline-none focus:ring-2 focus:ring-[#7B2D8B] min-w-[120px]"
                >
                  {copied ? 'Copied! ✓' : 'Copy Link'}
                </button>
              </div>
              <p className="text-xs text-gray-400">
                Share this link with your partner. It expires in 72 hours.
              </p>
            </section>
          )
        ) : null}

        {/* Memories Placeholder */}
        <section className="bg-[#16213E] rounded-2xl p-12 text-center shadow-xl border border-purple-900/10">
          <div className="text-gray-500 text-lg mb-2">📸 ✨ 📝</div>
          <p className="text-gray-400">Your memories will appear here soon.</p>
        </section>
      </main>
    </div>
  );
};

export default Dashboard;
