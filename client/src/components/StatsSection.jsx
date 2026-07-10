import React, { useState, useEffect, useRef } from 'react';
import client from '../api/client';
import { useTheme } from '../context/ThemeContext';

const StatItem = ({ targetValue, label, inView, showDivider, isDarkMode }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const end = targetValue;
    const duration = 2000;
    const startTime = performance.now();
    const tick = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // Cubic ease-out
      setCount(Math.floor(eased * end));
      if (progress < 1) {
        requestAnimationFrame(tick);
      }
    };
    requestAnimationFrame(tick);
  }, [inView, targetValue]);

  return (
    <div className="relative flex flex-col items-center justify-center py-16 text-center">
      <span
        style={{
          fontFamily: "Georgia, 'Times New Roman', serif",
          fontStyle: 'italic',
          textShadow: isDarkMode ? '0 2px 20px rgba(0,0,0,0.5)' : '0 2px 10px rgba(0,0,0,0.3)',
        }}
        className="text-6xl md:text-8xl font-normal text-white select-none transition-all duration-300"
      >
        {count}
      </span>
      <span
        style={{
          fontFamily: "Georgia, 'Times New Roman', serif",
          fontStyle: 'italic',
          letterSpacing: '0.05em',
          color: isDarkMode ? 'rgba(255, 255, 255, 0.85)' : 'rgba(255, 255, 255, 0.9)',
        }}
        className="mt-3 text-lg md:text-xl select-none"
      >
        {label}
      </span>
      {showDivider && (
        <div 
          className="hidden md:block absolute right-0 top-1/2 -translate-y-1/2 w-px h-[60px] transition-all duration-300" 
          style={{
            backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.3)',
          }}
        />
      )}
    </div>
  );
};

const StatsSection = ({ bgImage = '/couple_background.png' }) => {
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  const sectionRef = useRef(null);
  const [inView, setInView] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [stats, setStats] = useState({
    totalMemories: 100,
    totalPhotos: 100,
    totalVideos: 100,
    daysTogther: 100,
  });

  // Test image loading on mount to determine fallback
  useEffect(() => {
    const img = new Image();
    img.src = bgImage;
    img.onload = () => setImageError(false);
    img.onerror = () => setImageError(true);
  }, [bgImage]);

  // Fetch stats on mount
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await client.get('/api/dashboard');
        if (response.data) {
          setStats({
            totalMemories: response.data.totalMemories ?? 100,
            totalPhotos: response.data.totalPhotos ?? 100,
            totalVideos: response.data.totalVideos ?? 100,
            daysTogther: response.data.daysTogther ?? response.data.daysTogether ?? 100,
          });
        }
      } catch (err) {
        // Fail silently and use placeholders
        console.warn('Dashboard stats API not ready or failed. Using default placeholders.', err);
      }
    };
    fetchStats();
  }, []);

  // Setup Intersection Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          if (sectionRef.current) {
            observer.unobserve(sectionRef.current);
          }
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  const backgroundStyle = imageError
    ? {
        backgroundImage: isDarkMode
          ? 'linear-gradient(135deg, #1a0010 0%, #2d0020 50%, #1a0010 100%)'
          : 'linear-gradient(135deg, #e8f4f8 0%, #fce4ec 50%, #e8f4f8 100%)',
      }
    : {
        backgroundImage: `url('${bgImage}')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      };

  return (
    <section
      ref={sectionRef}
      style={backgroundStyle}
      className="relative w-full overflow-hidden transition-all duration-500"
    >
      {/* Semi-transparent overlay with blur */}
      <div
        style={{
          backgroundColor: isDarkMode ? 'rgba(10, 0, 8, 0.55)' : 'rgba(255, 255, 255, 0.45)',
          backdropFilter: 'blur(2px)',
          WebkitBackdropFilter: 'blur(2px)',
        }}
        className="absolute inset-0 transition-all duration-500"
      />

      {/* Grid Content Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4">
          <StatItem
            targetValue={stats.totalMemories}
            label="Memories"
            inView={inView}
            showDivider={true}
            isDarkMode={isDarkMode}
          />
          <StatItem
            targetValue={stats.totalPhotos}
            label="Photos"
            inView={inView}
            showDivider={true}
            isDarkMode={isDarkMode}
          />
          <StatItem
            targetValue={stats.totalVideos}
            label="Videos"
            inView={inView}
            showDivider={true}
            isDarkMode={isDarkMode}
          />
          <StatItem
            targetValue={stats.daysTogther}
            label="Days Together"
            inView={inView}
            showDivider={false}
            isDarkMode={isDarkMode}
          />
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
