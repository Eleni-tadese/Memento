import React, { useState } from 'react';

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=600&q=80';

export const SafeImage = ({ src, alt, className, fallback = FALLBACK_IMAGE }) => {
  const [imgSrc, setImgSrc] = useState(src);

  return (
    <img
      src={imgSrc}
      alt={alt}
      className={className}
      loading="lazy"
      onError={() => {
        if (imgSrc !== fallback) setImgSrc(fallback);
      }}
    />
  );
};

export const FloralWreath = ({ src, alt }) => (
  <div className="group relative h-40 w-40 shrink-0 md:h-48 md:w-48">
    <svg
      className="absolute -inset-3 h-[calc(100%+1.5rem)] w-[calc(100%+1.5rem)]"
      viewBox="0 0 220 220"
      fill="none"
      aria-hidden="true"
    >
      <ellipse cx="110" cy="28" rx="14" ry="10" fill="#e8a0a8" opacity="0.85" />
      <ellipse cx="88" cy="36" rx="10" ry="8" fill="#d4727a" opacity="0.8" />
      <ellipse cx="132" cy="36" rx="10" ry="8" fill="#d4727a" opacity="0.8" />
      <ellipse cx="192" cy="110" rx="14" ry="10" fill="#e8a0a8" opacity="0.85" />
      <ellipse cx="28" cy="110" rx="14" ry="10" fill="#e8a0a8" opacity="0.85" />
      <ellipse cx="110" cy="192" rx="14" ry="10" fill="#e8a0a8" opacity="0.85" />
      <ellipse cx="168" cy="48" rx="9" ry="7" fill="#c45c6a" opacity="0.75" />
      <ellipse cx="52" cy="48" rx="9" ry="7" fill="#c45c6a" opacity="0.75" />
      <path d="M110 18 Q95 50 78 72" stroke="#5a8f6a" strokeWidth="2.5" fill="none" opacity="0.6" />
      <path d="M110 18 Q125 50 142 72" stroke="#5a8f6a" strokeWidth="2.5" fill="none" opacity="0.6" />
      <circle cx="110" cy="110" r="78" stroke="#2D6A4F" strokeWidth="1" strokeDasharray="4 6" opacity="0.25" />
    </svg>
    <div className="relative z-10 h-full w-full overflow-hidden rounded-full border-4 border-white shadow-lg dark:border-[#591F12]">
      <SafeImage src={src} alt={alt} className="h-full w-full object-cover" />
    </div>
  </div>
);

export const LeafBracket = ({ className = '' }) => (
  <svg
    className={`pointer-events-none opacity-40 dark:opacity-25 ${className}`}
    viewBox="0 0 80 120"
    fill="none"
    aria-hidden="true"
  >
    <path d="M70 10 C50 30 40 60 45 90 C48 105 55 112 60 115" stroke="#2D6A4F" strokeWidth="2" fill="none" />
    <path d="M65 25 C55 35 50 50 52 65" stroke="#5a8f6a" strokeWidth="1.5" fill="none" />
    <ellipse cx="58" cy="22" rx="8" ry="5" fill="#2D6A4F" opacity="0.35" transform="rotate(-30 58 22)" />
  </svg>
);

export const HeroFloralAccent = ({ className = '' }) => (
  <svg className={`pointer-events-none ${className}`} viewBox="0 0 120 120" fill="none" aria-hidden="true">
    <ellipse cx="60" cy="35" rx="18" ry="14" fill="#e8a0a8" opacity="0.7" />
    <ellipse cx="40" cy="50" rx="12" ry="9" fill="#d4727a" opacity="0.65" />
    <ellipse cx="80" cy="50" rx="12" ry="9" fill="#d4727a" opacity="0.65" />
    <path d="M60 20 Q45 55 30 75" stroke="#5a8f6a" strokeWidth="2" fill="none" opacity="0.5" />
    <path d="M60 20 Q75 55 90 75" stroke="#5a8f6a" strokeWidth="2" fill="none" opacity="0.5" />
  </svg>
);

export const StatItem = ({ value, label }) => (
  <div className="flex flex-col items-center px-4 py-6 text-center">
    <span className="font-serif text-4xl font-bold text-[#1A2B48] dark:text-[#D9C1BF] md:text-5xl lg:text-6xl">
      {value}
    </span>
    <span className="mt-2 text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-[#BF8F8F] md:text-sm">
      {label}
    </span>
  </div>
);

const CARD_STYLES = [
  {
    wrapper: 'bg-white border-[#C96B60]/20',
    iconBg: 'bg-[#C96B60]/10 text-[#C96B60]',
    titleColor: 'text-[#B05A50]',
    barColor: 'bg-[#C96B60]',
  },
  {
    wrapper: 'bg-white border-[#8BA3B8]/30',
    iconBg: 'bg-[#B0C3D4]/40 text-[#1A2B48]',
    titleColor: 'text-[#1A2B48]',
    barColor: 'bg-[#8BA3B8]',
  },
  {
    wrapper: 'bg-white border-[#C96B60]/20',
    iconBg: 'bg-[#C96B60]/10 text-[#C96B60]',
    titleColor: 'text-[#B05A50]',
    barColor: 'bg-[#E8907A]',
  },
  {
    wrapper: 'bg-white border-[#8BA3B8]/30',
    iconBg: 'bg-[#B0C3D4]/40 text-[#1A2B48]',
    titleColor: 'text-[#1A2B48]',
    barColor: 'bg-[#B0C3D4]',
  },
  {
    wrapper: 'bg-white border-[#C96B60]/20',
    iconBg: 'bg-[#C96B60]/10 text-[#C96B60]',
    titleColor: 'text-[#B05A50]',
    barColor: 'bg-[#C96B60]',
  },
  {
    wrapper: 'bg-white border-[#8BA3B8]/30',
    iconBg: 'bg-[#B0C3D4]/40 text-[#1A2B48]',
    titleColor: 'text-[#1A2B48]',
    barColor: 'bg-[#8BA3B8]',
  },
];

export const ServiceCard = ({ icon: Icon, title, desc, index = 0 }) => {
  const style = CARD_STYLES[index % CARD_STYLES.length];
  return (
    <article
      className={`group relative flex flex-col overflow-hidden rounded-2xl border shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:border-[#D9C1BF]/10 dark:bg-[#591F12]/70 dark:hover:border-[#D9C1BF]/20 dark:hover:shadow-[#D9C1BF]/5 ${style.wrapper}`}
    >
      <div className={`h-1 w-full ${style.barColor} dark:bg-[#8C5D5D]`} />
      <div className="flex flex-col items-start p-7">
        <div className={`mb-5 flex h-14 w-14 items-center justify-center rounded-xl ${style.iconBg} dark:bg-[#40110D] dark:text-[#D9C1BF]`}>
          <Icon className="h-6 w-6" />
        </div>
        <h3 className={`mb-2 font-serif text-xl font-bold ${style.titleColor} dark:text-[#D9C1BF]`}>{title}</h3>
        <p className="text-sm leading-relaxed text-gray-600 dark:text-[#8C5D5D]">{desc}</p>
      </div>
    </article>
  );
};

export const ShowcaseCard = ({ image, title, tag }) => (
  <article className="group text-center">
    <div className="relative mb-4 overflow-hidden rounded-2xl shadow-md">
      <SafeImage
        src={image}
        alt={title}
        className="h-72 w-full object-cover transition-transform duration-500 group-hover:scale-105 md:h-80"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-4 text-left">
        <span className="inline-block rounded-full bg-white/20 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-white backdrop-blur-sm dark:bg-[#591F12]/70">
          {tag}
        </span>
      </div>
    </div>
    <h3 className="font-serif text-lg font-bold text-[#1A2B48] dark:text-[#D9C1BF]">{title}</h3>
  </article>
);
