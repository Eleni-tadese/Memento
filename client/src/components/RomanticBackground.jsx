import React, { useMemo } from 'react';
import FavoriteRounded from '@mui/icons-material/FavoriteRounded';
import AutoAwesomeRounded from '@mui/icons-material/AutoAwesomeRounded';
import FilterVintageRounded from '@mui/icons-material/FilterVintageRounded';

/*
 * RomanticBackground
 * A very subtle, slow, non-distracting ambient layer for the logged-in app.
 * Floating hearts + twinkling sparkles + drifting cherry-blossom petals.
 * Everything sits below 15% opacity and ignores pointer events.
 */

const rand = (min, max) => Math.random() * (max - min) + min;

const RomanticBackground = () => {
  // Generated once per mount so positions stay stable across re-renders.
  const hearts = useMemo(
    () =>
      Array.from({ length: 7 }).map(() => ({
        left: `${rand(4, 92)}%`,
        top: `${rand(6, 88)}%`,
        size: rand(26, 58),
        delay: `${rand(0, 8)}s`,
        duration: `${rand(12, 20)}s`,
        opacity: rand(0.05, 0.12),
      })),
    []
  );

  const sparkles = useMemo(
    () =>
      Array.from({ length: 14 }).map(() => ({
        left: `${rand(2, 97)}%`,
        top: `${rand(3, 95)}%`,
        size: rand(10, 20),
        delay: `${rand(0, 5)}s`,
        duration: `${rand(3.5, 7)}s`,
      })),
    []
  );

  const petals = useMemo(
    () =>
      Array.from({ length: 9 }).map(() => ({
        left: `${rand(0, 98)}%`,
        size: rand(16, 30),
        delay: `${rand(0, 20)}s`,
        duration: `${rand(18, 30)}s`,
        opacity: rand(0.05, 0.12),
      })),
    []
  );

  return (
    <div
      className="pointer-events-none fixed inset-0 overflow-hidden z-0"
      aria-hidden="true"
    >
      {/* Soft radial glows */}
      <div
        className="absolute -top-40 -left-40 h-[32rem] w-[32rem] rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(247,202,208,0.45) 0%, transparent 70%)' }}
      />
      <div
        className="absolute -bottom-52 -right-32 h-[36rem] w-[36rem] rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(232,93,117,0.14) 0%, transparent 70%)' }}
      />

      {/* Floating hearts */}
      {hearts.map((h, i) => (
        <FavoriteRounded
          key={`h-${i}`}
          className="absolute animate-float-slow"
          style={{
            left: h.left,
            top: h.top,
            fontSize: h.size,
            color: '#E85D75',
            opacity: h.opacity,
            animationDelay: h.delay,
            animationDuration: h.duration,
          }}
        />
      ))}

      {/* Twinkling sparkles */}
      {sparkles.map((s, i) => (
        <AutoAwesomeRounded
          key={`s-${i}`}
          className="absolute animate-sparkle"
          style={{
            left: s.left,
            top: s.top,
            fontSize: s.size,
            color: '#C44569',
            opacity: 0.12,
            animationDelay: s.delay,
            animationDuration: s.duration,
          }}
        />
      ))}

      {/* Drifting cherry-blossom petals */}
      {petals.map((p, i) => (
        <FilterVintageRounded
          key={`p-${i}`}
          className="absolute animate-drift"
          style={{
            left: p.left,
            top: '-6vh',
            fontSize: p.size,
            color: '#F7CAD0',
            opacity: p.opacity,
            animationDelay: p.delay,
            animationDuration: p.duration,
          }}
        />
      ))}
    </div>
  );
};

export default RomanticBackground;
