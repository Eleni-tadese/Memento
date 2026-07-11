import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { getProfile } from '../api/profile';
import RomanticBackground from './RomanticBackground';

/* Material (React) icons — no emoji anywhere in the UI */
import HomeRounded from '@mui/icons-material/HomeRounded';
import PhotoLibraryRounded from '@mui/icons-material/PhotoLibraryRounded';
import AccessTimeRounded from '@mui/icons-material/AccessTimeRounded';
import MailOutlineRounded from '@mui/icons-material/MailOutlineRounded';
import SettingsRounded from '@mui/icons-material/SettingsRounded';
import SearchRounded from '@mui/icons-material/SearchRounded';
import FavoriteBorderRounded from '@mui/icons-material/FavoriteBorderRounded';
import MenuRounded from '@mui/icons-material/MenuRounded';
import CloseRounded from '@mui/icons-material/CloseRounded';
import LogoutRounded from '@mui/icons-material/LogoutRounded';
import PersonRounded from '@mui/icons-material/PersonRounded';
import KeyboardArrowDownRounded from '@mui/icons-material/KeyboardArrowDownRounded';
import FavoriteRounded from '@mui/icons-material/FavoriteRounded';
import WbSunnyRounded from '@mui/icons-material/WbSunnyRounded';
import DarkModeRounded from '@mui/icons-material/DarkModeRounded';

/* Tracks which user's profile has been hydrated this session (survives route
   remounts of AppLayout, resets naturally when a different user logs in). */
let hydratedProfileFor = null;

/* ─── Constants ─── */
const SIDEBAR_W = 264;
const SIDEBAR_COL = 84;
const EASE = [0.25, 0.46, 0.45, 0.94];

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/dashboard', Icon: HomeRounded },
  { label: 'Memories', href: '/memories', Icon: PhotoLibraryRounded },
  { label: 'Timeline', href: '/timeline', Icon: AccessTimeRounded },
  { label: 'Letters', href: '/letters', Icon: MailOutlineRounded },
  { label: 'Settings', href: '/profile', Icon: SettingsRounded },
];

/* ─── user avatar circle (image or initials) ─── */
const UserAvatar = ({ user, size = 36 }) => {
  if (user?.avatar_url)
    return (
      <img
        src={user.avatar_url}
        alt={user.display_name}
        className="rounded-full object-cover shrink-0 ring-2 ring-white shadow-sm"
        style={{ height: size, width: size }}
      />
    );
  return (
    <div
      className="rounded-full flex items-center justify-center text-sm font-semibold text-white shrink-0 shadow-sm"
      style={{
        height: size,
        width: size,
        background: 'linear-gradient(135deg, #E85D75 0%, #C44569 100%)',
      }}
    >
      {user?.display_name?.[0]?.toUpperCase() || 'U'}
    </div>
  );
};

/* ─── Tooltip (collapsed sidebar) ─── */
const SideTooltip = ({ label, visible }) => (
  <AnimatePresence>
    {visible && (
      <motion.div
        initial={{ opacity: 0, x: 8 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 4 }}
        transition={{ duration: 0.13 }}
        className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-1.5
          rounded-xl bg-[#C44569] text-white text-xs font-medium whitespace-nowrap
          z-[100] shadow-lg pointer-events-none"
      >
        {label}
        <span className="absolute right-full top-1/2 -translate-y-1/2 border-[5px] border-transparent border-r-[#C44569]" />
      </motion.div>
    )}
  </AnimatePresence>
);

/* ─── Shared nav-item ─── */
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
        className={`group relative flex items-center rounded-full transition-all duration-300
          ${showText ? 'gap-3 px-4 py-3' : 'justify-center px-0 py-3 mx-auto w-12'}
          ${active
            ? 'bg-[#FFE1E7] text-[#C44569] shadow-[0_6px_18px_rgba(232,93,117,0.18)]'
            : 'text-[#7A6A73] hover:bg-[#FFF1F3] hover:text-[#C44569] hover:translate-x-0.5'
          }`}
      >
        {/* left accent line on active */}
        {active && (
          <motion.span
            layoutId="nav-accent"
            className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-full bg-[#E85D75]"
          />
        )}
        <Icon style={{ fontSize: 22 }} className="shrink-0" />
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
      </Link>
      {showTooltip && <SideTooltip label={label} visible={hovered} />}
    </div>
  );
};

/* ─── Footer action ─── */
const FooterBtn = ({ Icon, label, onClick, danger, showText, showTooltip }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      className="relative"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <button
        onClick={onClick}
        className={`w-full flex items-center rounded-full transition-all duration-300
          ${showText ? 'gap-3 px-4 py-2.5' : 'justify-center px-0 py-2.5 mx-auto w-12'}
          ${danger
            ? 'text-[#7A6A73] hover:bg-[#FFE1E7] hover:text-[#E85D75]'
            : 'text-[#7A6A73] hover:bg-[#FFF1F3] hover:text-[#C44569]'
          }`}
      >
        <Icon style={{ fontSize: 20 }} className="shrink-0" />
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
const AppLayout = ({ children, pageTitle, title, pageActions, noPadding }) => {
  pageTitle = pageTitle || title;
  const { user, logout, updateUser } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  /* Hydrate the logged-in user's profile (name + avatar) from the server once
     per session, so anything they set persists across logout / login. */
  useEffect(() => {
    const key = user?.id || user?.email;
    if (!user || !key || hydratedProfileFor === key) return;
    hydratedProfileFor = key;
    getProfile()
      .then((data) => {
        if (data?.self) {
          updateUser({
            display_name: data.self.display_name,
            avatar_url: data.self.avatar_url,
            email: data.self.email,
          });
        }
      })
      .catch(() => {
        hydratedProfileFor = null; // allow a retry on a later mount
      });
  }, [user, updateUser]);

  /* sidebar state */
  const [expanded, setExpanded] = useState(
    () => localStorage.getItem('sidebar_expanded') !== 'false'
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

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  /* unread message count */
  const [unreadMsgs, setUnreadMsgs] = useState(() =>
    parseInt(localStorage.getItem('memento_unread_msgs') || '0', 10)
  );
  useEffect(() => {
    const handler = (e) => setUnreadMsgs(e.detail ?? 0);
    window.addEventListener('memento:unread', handler);
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
      if (avatarRef.current && !avatarRef.current.contains(e.target)) setAvatarOpen(false);
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, []);

  const toggleSidebar = useCallback(() => {
    setExpanded((prev) => {
      const next = !prev;
      localStorage.setItem('sidebar_expanded', String(next));
      return next;
    });
  }, []);

  const isActive = (href) => {
    if (href === '/dashboard') return location.pathname === '/dashboard';
    if (href === '/memories') return location.pathname.startsWith('/memories');
    if (href === '/profile') return location.pathname.startsWith('/profile');
    return location.pathname.startsWith(href);
  };

  const confirmLogout = () => {
    setLogoutConfirm(false);
    setAvatarOpen(false);
    logout();
  };

  const sidebarW = expanded ? SIDEBAR_W : SIDEBAR_COL;
  const mainMargin = isMobile ? 0 : sidebarW;

  /* ── Sidebar body ── */
  const renderSidebarBody = (isMobileCtx = false) => {
    const showText = isMobileCtx || expanded;
    const showTip = !isMobileCtx && !expanded;

    return (
      <div className="flex flex-col h-full select-none">
        {/* Logo */}
        <div className={`flex items-center h-[74px] px-5 shrink-0 ${showText ? '' : 'justify-center px-0'}`}>
          <Link to="/dashboard" className="flex items-center gap-3 group min-w-0">
            <span
              className="flex h-10 w-10 items-center justify-center rounded-2xl shadow-md shrink-0 group-hover:scale-105 transition-transform duration-300"
              style={{ background: 'linear-gradient(135deg, #E85D75 0%, #C44569 100%)' }}
            >
              <FavoriteRounded style={{ fontSize: 20 }} className="text-white" />
            </span>
            <AnimatePresence>
              {showText && (
                <motion.span
                  key="brand"
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  transition={{ duration: 0.18, ease: EASE }}
                  className="font-heading text-xl font-semibold text-[#352F36] whitespace-nowrap overflow-hidden"
                >
                  Memento
                </motion.span>
              )}
            </AnimatePresence>
          </Link>
          {isMobileCtx && (
            <button
              onClick={() => setMobileOpen(false)}
              className="ml-auto p-2 rounded-full text-[#7A6A73] hover:bg-[#FFF1F3] transition-colors"
            >
              <CloseRounded style={{ fontSize: 20 }} />
            </button>
          )}
        </div>

        {/* Nav */}
        <nav className={`flex-1 py-4 space-y-1.5 overflow-y-auto overflow-x-hidden ${showText ? 'px-3' : 'px-3 flex flex-col items-center'}`}>
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
        <div className={`py-4 mt-auto space-y-1 border-t border-[#F1D7DD] ${showText ? 'px-3' : 'px-3 flex flex-col items-center'}`}>
          <FooterBtn
            Icon={theme === 'dark' ? WbSunnyRounded : DarkModeRounded}
            label={theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
            onClick={toggleTheme}
            showText={showText}
            showTooltip={showTip}
          />
          <FooterBtn
            Icon={LogoutRounded}
            label="Logout"
            onClick={() => setLogoutConfirm(true)}
            danger
            showText={showText}
            showTooltip={showTip}
          />
          <AnimatePresence>
            {showText && (
              <motion.div
                key="user-chip"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="flex items-center gap-3 px-3 pt-3 mt-1 min-w-0"
              >
                <UserAvatar user={user} size={34} />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-[#352F36] truncate leading-tight">
                    {user?.display_name || 'You'}
                  </p>
                  <p className="text-[11px] text-[#7A6A73] truncate">{user?.email}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    );
  };

  /* ─────────────────────────── RENDER ─────── */
  return (
    <div className="romance-scope relative flex min-h-screen bg-romance-page">
      <RomanticBackground />

      {/* ══════════ DESKTOP SIDEBAR (glass) ══════════ */}
      <motion.aside
        initial={false}
        animate={{ width: sidebarW }}
        transition={{ duration: 0.3, ease: EASE }}
        className="hidden md:flex flex-col fixed left-3 top-3 bottom-3 z-30
          rounded-[28px] romance-glass shadow-romance overflow-hidden shrink-0"
      >
        {renderSidebarBody(false)}
      </motion.aside>

      {/* ══════════ MOBILE SIDEBAR ══════════ */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-40 bg-[#352F36]/30 backdrop-blur-[2px] md:hidden"
            />
            <motion.aside
              key="mobile-sidebar"
              initial={{ x: -SIDEBAR_W - 30 }}
              animate={{ x: 0 }}
              exit={{ x: -SIDEBAR_W - 30 }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              className="fixed left-0 top-0 bottom-0 z-50 md:hidden overflow-hidden flex flex-col"
              style={{ width: SIDEBAR_W }}
            >
              <div className="h-full romance-glass border-r border-[#F1D7DD]">
                {renderSidebarBody(true)}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ══════════ MAIN ══════════ */}
      <motion.div
        initial={false}
        animate={{ marginLeft: mainMargin }}
        transition={{ duration: 0.3, ease: EASE }}
        className="flex-1 flex flex-col min-h-screen relative z-10"
      >
        {/* ── FLOATING TOP NAVBAR ── */}
        <div className="sticky top-0 z-20 px-3 md:px-6 pt-3 md:pt-4">
          <header className="flex items-center justify-between h-[62px] px-3 md:px-5
            rounded-full romance-glass shadow-romance-soft">
            {/* Left */}
            <div className="flex items-center gap-2 min-w-0">
              <button
                onClick={() => (isMobile ? setMobileOpen((o) => !o) : toggleSidebar())}
                className="p-2 rounded-full text-[#7A6A73] hover:bg-[#FFF1F3] hover:text-[#C44569] transition-colors shrink-0"
                aria-label="Toggle menu"
              >
                <MenuRounded style={{ fontSize: 22 }} />
              </button>
              {pageTitle && (
                <h1 className="font-heading text-lg md:text-xl font-semibold text-[#352F36] truncate">
                  {pageTitle}
                </h1>
              )}
            </div>

            {/* Right */}
            <div className="flex items-center gap-1">
              {pageActions && <div className="flex items-center gap-2 mr-1">{pageActions}</div>}

              <button
                className="p-2 rounded-full text-[#7A6A73] hover:bg-[#FFF1F3] hover:text-[#C44569] transition-colors hidden sm:block"
                aria-label="Search"
              >
                <SearchRounded style={{ fontSize: 21 }} />
              </button>

              <Link
                to="/letters"
                className="relative p-2 rounded-full text-[#7A6A73] hover:bg-[#FFF1F3] hover:text-[#C44569] transition-colors"
                aria-label="Saved love letters"
                title="Saved love letters"
              >
                <FavoriteBorderRounded style={{ fontSize: 21 }} />
                {unreadMsgs > 0 ? (
                  <span className="absolute top-0.5 right-0.5 min-w-[16px] h-4 px-0.5 rounded-full bg-[#E85D75] text-white text-[9px] font-bold flex items-center justify-center leading-none">
                    {unreadMsgs > 9 ? '9+' : unreadMsgs}
                  </span>
                ) : (
                  <span className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-[#E85D75]/50" />
                )}
              </Link>

              <button
                onClick={toggleTheme}
                className="p-2 rounded-full text-[#7A6A73] hover:bg-[#FFF1F3] hover:text-[#C44569] transition-colors hidden sm:block"
                title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
              >
                {theme === 'dark' ? (
                  <WbSunnyRounded style={{ fontSize: 20 }} />
                ) : (
                  <DarkModeRounded style={{ fontSize: 20 }} />
                )}
              </button>

              {/* Avatar */}
              <div className="relative ml-1" ref={avatarRef}>
                <button
                  onClick={() => setAvatarOpen((o) => !o)}
                  className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-full hover:bg-[#FFF1F3] transition-colors"
                >
                  <UserAvatar user={user} size={34} />
                  <span className="text-sm font-medium text-[#352F36] hidden sm:block max-w-[90px] truncate">
                    {user?.display_name || 'You'}
                  </span>
                  <KeyboardArrowDownRounded
                    style={{ fontSize: 18 }}
                    className={`text-[#7A6A73] hidden sm:block transition-transform ${avatarOpen ? 'rotate-180' : ''}`}
                  />
                </button>

                <AnimatePresence>
                  {avatarOpen && (
                    <motion.div
                      key="avatar-dd"
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.15, ease: 'easeOut' }}
                      className="absolute right-0 top-full mt-3 w-60 rounded-3xl bg-white shadow-romance border border-[#F1D7DD] overflow-hidden z-50"
                    >
                      <div className="px-4 py-3.5 border-b border-[#F1D7DD] flex items-center gap-3">
                        <UserAvatar user={user} size={40} />
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-[#352F36] truncate">{user?.display_name}</p>
                          <p className="text-xs text-[#7A6A73] truncate">{user?.email}</p>
                        </div>
                      </div>
                      <div className="p-2 space-y-0.5">
                        <Link
                          to="/profile"
                          onClick={() => setAvatarOpen(false)}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm text-[#352F36] hover:bg-[#FFF1F3] hover:text-[#C44569] transition-colors"
                        >
                          <PersonRounded style={{ fontSize: 20 }} /> Profile
                        </Link>
                        <Link
                          to="/profile"
                          onClick={() => setAvatarOpen(false)}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm text-[#352F36] hover:bg-[#FFF1F3] hover:text-[#C44569] transition-colors"
                        >
                          <SettingsRounded style={{ fontSize: 20 }} /> Settings
                        </Link>
                        <button
                          onClick={toggleTheme}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm text-[#352F36] hover:bg-[#FFF1F3] hover:text-[#C44569] transition-colors text-left"
                        >
                          {theme === 'dark' ? (
                            <WbSunnyRounded style={{ fontSize: 20 }} />
                          ) : (
                            <DarkModeRounded style={{ fontSize: 20 }} />
                          )}
                          {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                        </button>
                        <div className="my-1 h-px bg-[#F1D7DD]" />
                        <button
                          onClick={() => {
                            setAvatarOpen(false);
                            setLogoutConfirm(true);
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm text-[#E85D75] hover:bg-[#FFE1E7] transition-colors text-left"
                        >
                          <LogoutRounded style={{ fontSize: 20 }} /> Sign Out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </header>
        </div>

        {/* ── Page content ── */}
        <main className={`flex-1 ${noPadding ? '' : 'px-4 md:px-8 py-6 md:py-8'}`}>{children}</main>
      </motion.div>

      {/* ══════════ LOGOUT MODAL ══════════ */}
      <AnimatePresence>
        {logoutConfirm && (
          <motion.div
            key="logout-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={() => setLogoutConfirm(false)}
            className="fixed inset-0 z-[60] bg-[#352F36]/40 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 18 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 18 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm bg-white rounded-[28px] shadow-romance-lg p-7 border border-[#F1D7DD]"
            >
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#FFE1E7]">
                <LogoutRounded style={{ fontSize: 26 }} className="text-[#E85D75]" />
              </div>
              <h3 className="font-heading text-xl text-center text-[#352F36] mb-1">Sign out of Memento?</h3>
              <p className="text-sm text-center text-[#7A6A73] mb-6 leading-relaxed">
                You will need to log back in to access your memories and moments together.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setLogoutConfirm(false)}
                  className="flex-1 py-3 rounded-full border border-[#F1D7DD] text-sm font-medium text-[#7A6A73] hover:bg-[#FFF1F3] transition-colors"
                >
                  Stay
                </button>
                <button
                  onClick={confirmLogout}
                  className="flex-1 py-3 rounded-full romance-btn text-sm"
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
