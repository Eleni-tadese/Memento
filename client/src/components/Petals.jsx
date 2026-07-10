import React, { useMemo } from 'react';

// Falling rose petals — the romantic "top section" effect from the birthday page.
// Pure CSS animation (.petal defined in index.css); this just places them.
const Petals = ({ count = 18 }) => {
  const petals = useMemo(
    () =>
      Array.from({ length: count }, () => ({
        left: `${Math.random() * 100}%`,
        duration: `${8 + Math.random() * 10}s`,
        delay: `${Math.random() * 10}s`,
        scale: 0.6 + Math.random() * 1.2,
      })),
    [count]
  );

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {petals.map((p, i) => (
        <span
          key={i}
          className="petal"
          style={{
            left: p.left,
            animationDuration: p.duration,
            animationDelay: p.delay,
            transform: `scale(${p.scale})`,
          }}
        />
      ))}
    </div>
  );
};

export default Petals;
