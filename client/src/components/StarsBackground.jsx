import { useEffect, useState } from 'react';

const stars = Array.from({ length: 50 }, (_, id) => ({
  id,
  left: `${Math.random() * 98 + 1}%`,
  top: `${Math.random() * 98 + 1}%`,
  size: `${Math.random() * 1.5 + 0.8}px`,
  delay: `${Math.random() * 5}s`,
  duration: `${Math.random() * 3 + 2}s`,
  color: Math.random() > 0.7 ? 'rgba(232,213,163,0.9)' : 'rgba(255,255,255,0.85)',
}));

export default function StarsBackground() {
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'));

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setDark(document.documentElement.classList.contains('dark'));
    });

    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  if (!dark) return null;

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
      {stars.map((star) => (
        <div
          key={star.id}
          className="absolute rounded-full"
          style={{
            left: star.left,
            top: star.top,
            width: star.size,
            height: star.size,
            backgroundColor: star.color,
            animation: `twinkle ${star.duration} ${star.delay} ease-in-out infinite`,
          }}
        />
      ))}
    </div>
  );
}