import React from 'react';
import { useTheme } from '../context/ThemeContext';

/* ── Custom moon & sun SVGs matching the reference images ── */
const MoonSVG = () => (
  <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z"
      fill="currentColor"
      stroke="currentColor"
      strokeWidth="0.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const SunSVG = () => (
  <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="4" fill="currentColor" />
    {/* 8 rays */}
    {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
      <line
        key={deg}
        x1="12" y1="3"
        x2="12" y2="5.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        transform={`rotate(${deg} 12 12)`}
      />
    ))}
  </svg>
);

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={`
        flex h-10 w-10 items-center justify-center rounded-xl
        border transition-all duration-300
        hover:scale-105 active:scale-95
        ${isDark
          /* dark mode → golden sun on deep plum */
          ? 'border-[#CBA24A]/30 bg-[#5A2532] text-[#CBA24A] shadow-[0_2px_8px_rgba(203,162,74,0.2)] hover:bg-[#5A2532]/80 hover:shadow-[0_4px_12px_rgba(203,162,74,0.3)]'
          /* light mode → burgundy moon on cream */
          : 'border-[#E8BFB6] bg-[#FDF6F0] text-[#5A2532] shadow-sm hover:bg-white hover:shadow-md hover:border-[#B8863E]/30'
        }
      `}
    >
      {isDark ? <SunSVG /> : <MoonSVG />}
    </button>
  );
};

export default ThemeToggle;
