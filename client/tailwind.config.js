/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        memento: {
          green: '#2D6A4F',
          navy: '#1A2B48',
        },
        /* ── Premium romantic palette ── */
        romance: {
          bg: '#FFF8F8',        // primary background
          bg2: '#FFF1F3',       // secondary background
          card: '#FFFFFF',      // cards
          primary: '#E85D75',   // primary rose
          pink: '#F7CAD0',      // secondary pink
          accent: '#C44569',    // deep accent
          ink: '#352F36',       // text
          muted: '#7A6A73',     // secondary text
          border: '#F1D7DD',    // borders
          success: '#9BC995',   // success
          error: '#E85D75',     // error
        },
        deep: {
          DEFAULT: '#1a0a0e',
          light: '#1f0810',
          darker: '#0a0005',
          card: '#0e0408',
        },
        gold: {
          DEFAULT: '#c9a84c',
          light: '#e8d08a',
        },
        rose: {
          DEFAULT: '#e8a0a8',
        },
        cream: {
          DEFAULT: '#fdf6ec',
        },
        warm: {
          DEFAULT: '#f5e6d3',
        },
      },
      fontFamily: {
        display: ['"Cinzel Decorative"', 'serif'],
        serif: ['"Cormorant Garamond"', 'serif'],
        sans: ['Lato', 'sans-serif'],
        /* ── App (logged-in) romantic type system ── */
        heading: ['"Playfair Display"', 'Georgia', 'serif'],
        body: ['Poppins', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        romance: '24px',
      },
      boxShadow: {
        romance: '0 15px 45px rgba(196, 69, 105, 0.10)',
        'romance-lg': '0 25px 60px rgba(196, 69, 105, 0.16)',
        'romance-soft': '0 8px 30px rgba(0, 0, 0, 0.06)',
      },
      backgroundImage: {
        'romance-page': 'linear-gradient(180deg, #FFF8F8 0%, #FFF3F5 100%)',
        'romance-primary': 'linear-gradient(135deg, #E85D75 0%, #C44569 100%)',
        'hero-gradient': 'radial-gradient(ellipse at 50% 60%, #2d0a12 0%, #1a0a0e 60%, #0a0005 100%)',
        'section-gradient': 'linear-gradient(180deg, #1a0a0e 0%, #1f0810 50%, #1a0a0e 100%)',
      },
      animation: {
        'fade-up': 'fadeUp 1.8s ease forwards',
        bounce: 'bounceSoft 2s ease infinite',
        heartbeat: 'heartbeat 1.5s ease infinite',
        'slide-in-right': 'slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'float-slow': 'floatSlow 14s ease-in-out infinite',
        'sparkle': 'sparkleTwinkle 5s ease-in-out infinite',
        'drift': 'driftDown 22s linear infinite',
      },
      keyframes: {
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(40px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          from: { opacity: '0', transform: 'translateX(120%)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        bounceSoft: {
          '0%, 100%': { transform: 'translateX(-50%) translateY(0)' },
          '50%': { transform: 'translateX(-50%) translateY(8px)' },
        },
        heartbeat: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.12)' },
        },
        floatSlow: {
          '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
          '50%': { transform: 'translateY(-26px) rotate(8deg)' },
        },
        sparkleTwinkle: {
          '0%, 100%': { opacity: '0', transform: 'scale(0.6)' },
          '50%': { opacity: '1', transform: 'scale(1)' },
        },
        driftDown: {
          '0%': { transform: 'translateY(-8vh) translateX(0) rotate(0deg)', opacity: '0' },
          '10%': { opacity: '1' },
          '90%': { opacity: '1' },
          '100%': { transform: 'translateY(108vh) translateX(60px) rotate(360deg)', opacity: '0' },
        },
      },
    },
  },
  plugins: [],
};
