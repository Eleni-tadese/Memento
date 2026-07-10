import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import StarsBackground from './StarsBackground';
import PetalEffect from './PetalEffect';
import {
  FlowerIcon, HeartIcon, TimelineIcon, MailIcon,
  CaptureIcon, SearchIcon, SunIcon, MoonIcon,
} from './Icons';

/* ─── Constants ─── */
const SIDEBAR_W   = 260;
const SIDEBAR_COL = 72;

/* ─── user avatar circle (image or initials) ─── */
const UserAvatar = ({ user, size = 7 }) => {
  const sz = `h-${size} w-${size}`;
  if (user?.avatar_url) return (
    <img
      src={user.avatar_url}
      alt={user.display_name}
      className={`${sz} rounded-full object-cover border border-white/20 shrink-0`}
    />
  );
  return (
    <div className={`${sz} rounded-full bg-[#C96B60]/25 dark:bg-[#8E5B60]/70 flex items-center justify-center text-xs font-bold text-[#C96B60] dark:text-[#D9C1BF] shrink-0`}>
      {user?.display_name?.[0]?.toUpperCase() || 'U'}
    </div>
  );
};

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/dashboard',  Icon: CaptureIcon },
  { label: 'Memories',  href: '/memories',   Icon: HeartIcon   },
  { label: 'Timeline',  href: '/timeline',   Icon: TimelineIcon },
  { label: 'Letters',   href: '/letters',    Icon: MailIcon    },
];

const EASE = [0.25, 0.46, 0.45, 0.94];

/* ─── Small inline icons (SVG) ─── */
const LogoutSVG = ({ cls = 'h-[18px] w-[18px]' }) => (
  <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
);

const BellSVG = ({ cls = 'h-[18px] w-[18px]' }) => (
  <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
  </svg>
);

const HamburgerSVG = ({ cls = 'h-5 w-5' }) => (
  <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

const CloseSVG = ({ cls = 'h-5 w-5' }) => (
  <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const ChevronSVG = ({ open, cls = 'h-3 w-3' }) => (
  <svg className={`${cls} transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
    fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);

/* ─── Tooltip (shown when sidebar is collapsed) ─── */
const SideTooltip = ({ label, visible }) => (
  <AnimatePresence>
    {visible && (
      <motion.div
        initial={{ opacity: 0, x: 8 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 4 }}
        transition={{ duration: 0.13 }}
        className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-1.5
          rounded-lg bg-[#1A2B48] dark:bg-[#D9C1BF]
          text-white dark:text-[#1A2B48]
          text-xs font-medium whitespace-nowrap
          z-[100] shadow-xl pointer-events-none"
      >
        {label}
        <span className="absolute right-full top-1/2 -translate-y-1/2
          border-[5px] border-transparent border-r-[#1A2B48] dark:border-r-[#D9C1BF]" />
      </motion.div>
    )}
  </AnimatePresence>
);

/* ─── Shared nav-item (used in both desktop + mobile sidebars) ─── */
const NavItem = ({ label, href, Icon, active, showText, showTooltip, onClick }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="relative"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Link
        to={href}
        onClick={onClick}
        className={`flex items-center rounded-xl transition-all duration-200
          ${showText ? 'gap-3 px-3 py-2.5' : 'justify-center px-0 py-2.5 mx-auto w-10'}
          ${active
            ? 'bg-[#C96B60] text-white dark:bg-[#8E5B60] shadow-sm'
            : 'text-[#1A2B48]/55 dark:text-[#BF8F8F]/60 hover:bg-black/6 dark:hover:bg-white/6 hover:text-[#1A2B48] dark:hover:text-[#D9C1BF]'
          }`}
      >
        <Icon className="h-[18px] w-[18px] shrink-0" />
        <AnimatePresence>
          {showText && (
            <motion.span
              key="label"
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -4 }}
              transition={{ duration: 0.18, ease: EASE }}
              className="text-sm font-medium whitespace-nowrap overflow-hidden"
            >
              {label}
            </motion.span>
          )}
        </AnimatePresence>
        {active && showText && (
          <span className="ml-auto text-[10px] opacity-60 select-none">🌸</span>
        )}
      </Link>

      {showTooltip && <SideTooltip label={label} visible={hovered} />}
    </div>
  );
};

/* ─── Shared footer action (theme / logout) ─── */
const FooterBtn = ({ icon, label, onClick, danger, showText, showTooltip }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="relative"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <button
        onClick={onClick}
        className={`w-full flex items-center rounded-xl transition-all duration-200
          ${showText ? 'gap-3 px-3 py-2.5' : 'justify-center px-0 py-2.5 mx-auto w-10'}
          ${danger
            ? 'text-[#1A2B48]/50 dark:text-[#BF8F8F]/50 hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-500 dark:hover:text-red-400'
            : 'text-[#1A2B48]/50 dark:text-[#BF8F8F]/50 hover:bg-black/5 dark:hover:bg-white/5 hover:text-[#1A2B48] dark:hover:text-[#D9C1BF]'
          }`}
      >
        {icon}
        <AnimatePresence>
          {showText && (
            <motion.span
              key="label"
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -4 }}
              transition={{ duration: 0.18, ease: EASE }}
              className="text-sm font-medium whitespace-nowrap overflow-hidden"
            >
              {label}
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      {showTooltip && <SideTooltip label={label} visible={hovered} />}
    </div>
  );
};

/* ─── Main Layout ─── */
const AppLayout = ({ children, pageTitle, pageActions, noPadding }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  /* sidebar state */
  const [expanded, setExpanded] = useState(() =>
    localStorage.getItem('sidebar_expanded') !== 'false'
  );
  const [mobileOpen, setMobileOpen] = useState(false);

  /* top-nav state */
  const [avatarOpen, setAvatarOpen] = useState(false);
  const [logoutConfirm, setLogoutConfirm] = useState(false);

  /* responsive */
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  /* close mobile sidebar on route change */
  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  /* ── unread message count (driven by Letters.jsx via custom event) ── */
  const [unreadMsgs, setUnreadMsgs] = useState(() =>
    parseInt(localStorage.getItem('memento_unread_msgs') || '0', 10)
  );
  useEffect(() => {
    const handler = (e) => setUnreadMsgs(e.detail ?? 0);
    window.addEventListener('memento:unread', handler);
    // also sync if another tab updated localStorage
    const storageHandler = () =>
      setUnreadMsgs(parseInt(localStorage.getItem('memento_unread_msgs') || '0', 10));
    window.addEventListener('storage', storageHandler);
    return () => {
      window.removeEventListener('memento:unread', handler);
      window.removeEventListener('storage', storageHandler);
    };
  }, []);

  /* close avatar dropdown on outside click */
  const avatarRef = useRef(null);
  useEffect(() => {
    const handle = (e) => {
      if (avatarRef.current && !avatarRef.current.contains(e.target)) {
        setAvatarOpen(false);
      }
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, []);

  const toggleSidebar = useCallback(() => {
    setExpanded(prev => {
      const next = !prev;
      localStorage.setItem('sidebar_expanded', String(next));
      return next;
    });
  }, []);

  const isActive = (href) => {
    if (href === '/dashboard') return location.pathname === '/dashboard';
    if (href === '/memories')  return location.pathname.startsWith('/memories');
    return location.pathname.startsWith(href);
  };

  const confirmLogout = () => { setLogoutConfirm(false); setAvatarOpen(false); logout(); };

  /* derived */
  const sidebarW = expanded ? SIDEBAR_W : SIDEBAR_COL;
  const mainMargin = isMobile ? 0 : sidebarW;

  /* ── Sidebar body (shared markup, different props per instance) ── */
  const renderSidebarBody = (isMobileCtx = false) => {
    const showText  = isMobileCtx || expanded;
    const showTip   = !isMobileCtx && !expanded;

    return (
      <div className="flex flex-col h-full select-none">

        {/* Logo */}
        <div className="flex items-center h-14 border-b border-black/5 dark:border-[#BF8F8F]/10 px-4 shrink-0">
          <Link to="/dashboard" className="flex items-center gap-3 group min-w-0">
            <FlowerIcon className="h-5 w-5 text-[#C96B60] dark:text-[#BF8F8F] group-hover:scale-110 transition-transform duration-200 shrink-0" />
            <AnimatePresence>
              {showText && (
                <motion.span
                  key="brand"
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  transition={{ duration: 0.18, ease: EASE }}
                  className="font-serif text-base font-bold text-[#1A2B48] dark:text-[#D9C1BF] whitespace-nowrap overflow-hidden"
                >
                  Memento
                </motion.span>
              )}
            </AnimatePresence>
          </Link>
          {/* Mobile close button */}
          {isMobileCtx && (
            <button
              onClick={() => setMobileOpen(false)}
              className="ml-auto p-1.5 rounded-lg text-[#1A2B48]/40 dark:text-[#BF8F8F]/40 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            >
              <CloseSVG />
            </button>
          )}
        </div>

        {/* Nav */}
        <nav className={`flex-1 py-3 space-y-0.5 overflow-y-auto overflow-x-hidden
          ${showText ? 'px-2' : 'px-2 flex flex-col items-center'}`}>
          {NAV_ITEMS.map(({ label, href, Icon }) => (
            <NavItem
              key={href}
              label={label}
              href={href}
              Icon={Icon}
              active={isActive(href)}
              showText={showText}
              showTooltip={showTip}
              onClick={() => isMobileCtx && setMobileOpen(false)}
            />
          ))}
        </nav>

        {/* Footer */}
        <div className={`py-3 border-t border-black/5 dark:border-[#BF8F8F]/10 space-y-0.5
          ${showText ? 'px-2' : 'px-2 flex flex-col items-center'}`}>

          <FooterBtn
            icon={theme === 'dark'
              ? <SunIcon className="h-[18px] w-[18px] shrink-0" />
              : <MoonIcon className="h-[18px] w-[18px] shrink-0" />
            }
            label={theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
            onClick={toggleTheme}
            showText={showText}
            showTooltip={showTip}
          />

          <FooterBtn
            icon={<LogoutSVG />}
            label="Logout"
            onClick={() => setLogoutConfirm(true)}
            danger
            showText={showText}
            showTooltip={showTip}
          />

          {/* User chip */}
          <AnimatePresence>
            {showText && (
              <motion.div
                key="user-chip"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="flex items-center gap-2.5 px-3 pt-2 mt-1 min-w-0"
              >
                <UserAvatar user={user} size={7} />
                <span className="text-xs text-[#1A2B48]/55 dark:text-[#BF8F8F]/70 truncate">{user?.display_name || 'You'}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    );
  };

  /* ─────────────────────────────────────────── RENDER ─────── */
  return (
    <div className="relative flex min-h-screen bg-[#B0C3D4] dark:bg-[#40110D] text-[#1A2B48] dark:text-[#D9C1BF] font-sans">
      <StarsBackground />
      <PetalEffect />

      {/* ══════════════ DESKTOP SIDEBAR ══════════════ */}
      <motion.aside
        initial={false}
        animate={{ width: sidebarW }}
        transition={{ duration: 0.3, ease: EASE }}
        className="hidden md:flex flex-col fixed left-0 top-0 bottom-0 z-30
          bg-white/40 dark:bg-[#2a0a08]/70
          border-r border-black/6 dark:border-[#BF8F8F]/10
          backdrop-blur-md overflow-hidden shrink-0"
      >
        {renderSidebarBody(false)}
      </motion.aside>

      {/* ══════════════ MOBILE SIDEBAR + BACKDROP ══════════════ */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-40 bg-black/55 backdrop-blur-[2px] md:hidden"
            />

            {/* Slide-in panel */}
            <motion.aside
              key="mobile-sidebar"
              initial={{ x: -SIDEBAR_W - 20 }}
              animate={{ x: 0 }}
              exit={{ x: -SIDEBAR_W - 20 }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              className="fixed left-0 top-0 bottom-0 z-50 md:hidden overflow-hidden flex flex-col"
              style={{ width: SIDEBAR_W }}
            >
              <div className="h-full bg-white dark:bg-[#220a08] border-r border-black/6 dark:border-[#BF8F8F]/10">
                {renderSidebarBody(true)}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ══════════════ MAIN CONTENT ══════════════ */}
      <motion.div
        initial={false}
        animate={{ marginLeft: mainMargin }}
        transition={{ duration: 0.3, ease: EASE }}
        className="flex-1 flex flex-col min-h-screen relative z-10"
      >

        {/* ── TOP NAVBAR ── */}
        <header className="sticky top-0 z-20 flex items-center justify-between
          h-14 px-3 md:px-5
          bg-white/70 dark:bg-[#1f0805]/75
          backdrop-blur-md
          border-b border-black/6 dark:border-[#D9C1BF]/7
          shrink-0">

          {/* Left group */}
          <div className="flex items-center gap-2 min-w-0">
            {/* Hamburger */}
            <button
              onClick={() => isMobile ? setMobileOpen(o => !o) : toggleSidebar()}
              className="p-2 rounded-xl hover:bg-black/6 dark:hover:bg-white/6 transition-colors
                text-[#1A2B48]/55 dark:text-[#BF8F8F]/60 shrink-0"
              aria-label="Toggle menu"
            >
              <HamburgerSVG />
            </button>

            {/* Page title */}
            {pageTitle && (
              <h1 className="font-serif text-[15px] font-bold text-[#1A2B48] dark:text-[#D9C1BF] truncate">
                {pageTitle}
              </h1>
            )}
          </div>

          {/* Right group */}
          <div className="flex items-center gap-1">
            {pageActions && (
              <div className="flex items-center gap-2 mr-2">{pageActions}</div>
            )}

            {/* Search */}
            <button className="p-2 rounded-xl hover:bg-black/6 dark:hover:bg-white/6 transition-colors
              text-[#1A2B48]/45 dark:text-[#BF8F8F]/50 hidden sm:block">
              <SearchIcon className="h-4 w-4" />
            </button>

            {/* Notifications — links to /letters, shows unread count */}
            <Link to="/letters"
              className="relative p-2 rounded-xl hover:bg-black/6 dark:hover:bg-white/6 transition-colors
                text-[#1A2B48]/45 dark:text-[#BF8F8F]/50">
              <BellSVG cls="h-4 w-4" />
              {unreadMsgs > 0 ? (
                <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-0.5 rounded-full
                  bg-[#C96B60] text-white text-[9px] font-bold flex items-center justify-center leading-none animate-pulse">
                  {unreadMsgs > 9 ? '9+' : unreadMsgs}
                </span>
              ) : (
                <span className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-[#C96B60]/40" />
              )}
            </Link>

            {/* Theme toggle (top-nav shortcut) */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl hover:bg-black/6 dark:hover:bg-white/6 transition-colors
                text-[#1A2B48]/45 dark:text-[#BF8F8F]/50 hidden sm:block"
              title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
            >
              {theme === 'dark'
                ? <SunIcon className="h-4 w-4" />
                : <MoonIcon className="h-4 w-4" />
              }
            </button>

            {/* Avatar + dropdown */}
            <div className="relative ml-1" ref={avatarRef}>
              <button
                onClick={() => setAvatarOpen(o => !o)}
                className="flex items-center gap-2 pl-2 pr-2.5 py-1.5 rounded-xl
                  hover:bg-black/6 dark:hover:bg-white/6 transition-colors"
              >
                <UserAvatar user={user} size={7} />
                <span className="text-xs font-medium text-[#1A2B48]/65 dark:text-[#BF8F8F] hidden sm:block max-w-[90px] truncate">
                  {user?.display_name || 'You'}
                </span>
                <ChevronSVG open={avatarOpen} cls="h-3 w-3 text-[#1A2B48]/35 dark:text-[#8C5D5D] hidden sm:block" />
              </button>

              {/* Avatar dropdown */}
              <AnimatePresence>
                {avatarOpen && (
                  <motion.div
                    key="avatar-dd"
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.15, ease: 'easeOut' }}
                    className="absolute right-0 top-full mt-2 w-56
                      rounded-2xl bg-white dark:bg-[#291008]
                      shadow-2xl border border-black/6 dark:border-[#D9C1BF]/10
                      overflow-hidden z-50"
                  >
                    {/* User info */}
                    <div className="px-4 py-3 border-b border-black/5 dark:border-[#D9C1BF]/8">
                      <p className="text-sm font-semibold text-[#1A2B48] dark:text-[#D9C1BF]">
                        {user?.display_name}
                      </p>
                      <p className="text-xs text-[#1A2B48]/40 dark:text-[#8C5D5D] truncate mt-0.5">
                        {user?.email}
                      </p>
                    </div>

                    {/* Menu */}
                    <div className="p-1.5 space-y-0.5">
                      <Link
                        to="/profile"
                        onClick={() => setAvatarOpen(false)}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm
                          text-[#1A2B48]/70 dark:text-[#BF8F8F]
                          hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                      >
                        <span className="text-base">👤</span>
                        Profile
                      </Link>
                      <button
                        onClick={() => setAvatarOpen(false)}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm
                          text-[#1A2B48]/70 dark:text-[#BF8F8F]
                          hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-left"
                      >
                        <span className="text-base">⚙️</span>
                        Settings
                      </button>

                      {/* Theme toggle row */}
                      <button
                        onClick={toggleTheme}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm
                          text-[#1A2B48]/70 dark:text-[#BF8F8F]
                          hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-left"
                      >
                        {theme === 'dark'
                          ? <SunIcon className="h-4 w-4 text-amber-500" />
                          : <MoonIcon className="h-4 w-4 text-indigo-400" />
                        }
                        {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                      </button>

                      <div className="my-1 h-px bg-black/5 dark:bg-[#D9C1BF]/8" />

                      {/* Logout */}
                      <button
                        onClick={() => { setAvatarOpen(false); setLogoutConfirm(true); }}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm
                          text-red-500 dark:text-red-400
                          hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors text-left"
                      >
                        <LogoutSVG cls="h-4 w-4" />
                        Sign Out
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* ── Page content ── */}
        <main className={`flex-1 ${noPadding ? '' : 'p-5 md:p-8'}`}>
          {children}
        </main>
      </motion.div>

      {/* ══════════════ LOGOUT CONFIRMATION MODAL ══════════════ */}
      <AnimatePresence>
        {logoutConfirm && (
          <motion.div
            key="logout-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={() => setLogoutConfirm(false)}
            className="fixed inset-0 z-[60] bg-black/55 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 18 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 18 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-sm bg-white dark:bg-[#291008] rounded-2xl shadow-2xl p-6
                border border-black/5 dark:border-[#D9C1BF]/10"
            >
              <div className="text-3xl mb-3 text-center">🚪</div>
              <h3 className="font-serif text-lg text-center text-[#1A2B48] dark:text-[#D9C1BF] mb-1">
                Sign out of Memento?
              </h3>
              <p className="text-sm text-center text-[#1A2B48]/50 dark:text-[#8C5D5D] mb-6 leading-relaxed">
                You will need to log back in to access your memories and moments together.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setLogoutConfirm(false)}
                  className="flex-1 py-2.5 rounded-xl border border-black/10 dark:border-[#D9C1BF]/12
                    text-sm font-medium text-[#1A2B48]/60 dark:text-[#BF8F8F]
                    hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                >
                  Stay
                </button>
                <button
                  onClick={confirmLogout}
                  className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600
                    text-white text-sm font-semibold transition-colors shadow-sm"
                >
                  Sign Out
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AppLayout;
