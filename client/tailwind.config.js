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
      },
      backgroundImage: {
        'hero-gradient': 'radial-gradient(ellipse at 50% 60%, #2d0a12 0%, #1a0a0e 60%, #0a0005 100%)',
        'section-gradient': 'linear-gradient(180deg, #1a0a0e 0%, #1f0810 50%, #1a0a0e 100%)',
      },
      animation: {
        'fade-up': 'fadeUp 1.8s ease forwards',
        bounce: 'bounceSoft 2s ease infinite',
        heartbeat: 'heartbeat 1.5s ease infinite',
        'slide-in-right': 'slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
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
      },
    },
  },
  plugins: [],
};
