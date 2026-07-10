import { useEffect, useState } from 'react';

const PETALS = [
  { left: '3%', delay: '0s', dur: '9s' },
  { left: '12%', delay: '2s', dur: '11s' },
  { left: '22%', delay: '4s', dur: '8s' },
  { left: '33%', delay: '1s', dur: '12s' },
  { left: '44%', delay: '3s', dur: '9s' },
  { left: '53%', delay: '5s', dur: '10s' },
  { left: '63%', delay: '0.5s', dur: '8s' },
  { left: '72%', delay: '2.5s', dur: '11s' },
  { left: '81%', delay: '4.5s', dur: '9s' },
  { left: '88%', delay: '1.5s', dur: '10s' },
  { left: '17%', delay: '6s', dur: '12s' },
  { left: '57%', delay: '7s', dur: '8s' },
];

export default function PetalEffect() {
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
    <>
      {PETALS.map((petal, index) => (
        <div
          key={index}
          className="petal"
          style={{
            left: petal.left,
            animationDelay: petal.delay,
            animationDuration: petal.dur,
          }}
        >
          🌸
        </div>
      ))}
    </>
  );
}