import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import BackButton from './BackButton';
import ThemeToggle from './ThemeToggle';

const navItems = [
  { label: 'Home', to: '/dashboard' },
  { label: 'Memories', to: '/memories' },
  { label: 'Timeline', to: '/timeline' },
  { label: 'Calendar', to: '/calendar' },
];

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const menuRef = useRef(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const displayName = user?.display_name || user?.email || 'Memento';
  const avatarLetter = displayName.charAt(0).toUpperCase();

  return (
    <header className="fixed top-0 left-0 right-0 z-40 h-16 border-b border-gray-200 bg-white/95 backdrop-blur-md dark:border-[#e8d5a3]/10 dark:bg-[#0d0008]/95">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <BackButton />
          <Link to="/dashboard" className="text-xl font-bold text-memento-green dark:text-[#e8d5a3] dark:font-serif dark:text-[#e8d5a3]">
            Memento
          </Link>
        </div>

        <nav className="hidden items-center gap-7 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.label}
              to={item.to}
              className="text-sm font-medium text-gray-600 transition-colors duration-200 hover:text-memento-green dark:hover:text-[#e8d5a3] dark:text-[#8b6b6b] dark:hover:text-[#e8d5a3]"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="relative flex items-center gap-3" ref={menuRef}>
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-label="Open account menu"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-memento-green dark:bg-[#7c2d4a] text-sm font-semibold text-white transition-transform duration-200 hover:scale-105 dark:border dark:border-[#e8d5a3]/30 dark:bg-[#2d0020] dark:text-[#e8d5a3]"
          >
            {avatarLetter}
          </button>

          {open && (
            <div className="absolute right-0 top-12 w-44 rounded-xl border border-gray-200 bg-white p-2 shadow-2xl dark:border-[#e8d5a3]/15 dark:bg-[#1a0010]">
              <button
                type="button"
                onClick={() => navigate('/dashboard?tab=profile')}
                className="block w-full rounded-lg px-3 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-gray-100 dark:text-[#c9a0b0] dark:hover:bg-white/5"
              >
                Profile
              </button>
              <button
                type="button"
                onClick={() => navigate('/dashboard?tab=settings')}
                className="block w-full rounded-lg px-3 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-gray-100 dark:text-[#c9a0b0] dark:hover:bg-white/5"
              >
                Settings
              </button>
              <div className="my-1 border-t border-gray-200 dark:border-[#e8d5a3]/10" />
              <button
                type="button"
                onClick={logout}
                className="block w-full rounded-lg px-3 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-gray-100 hover:text-memento-green dark:hover:text-[#e8d5a3] dark:text-[#c9a0b0] dark:hover:bg-white/5"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;