import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import StarsBackground from '../components/StarsBackground';
import PetalEffect from '../components/PetalEffect';
import ThemeToggle from '../components/ThemeToggle';
import useReveal from '../hooks/useReveal';
import {
  FloralWreath,
  HeroFloralAccent,
  LeafBracket,
  SafeImage,
  ShowcaseCard,
  StatItem,
} from '../components/landing/LandingDecor';
import {
  FlowerIcon,
  ArrowForwardIcon,
  CaptureIcon,
  VideoIcon,
  TimelineIcon,
  CalendarIcon,
  SearchIcon,
  MailIcon,
  HeartIcon,
  LockIcon,
  SparklesIcon,
  PlayIcon,
  ShieldIcon,
  UploadIcon,
} from '../components/Icons';

const IMG = {
  // Hero collage — four couple photos
  heroMain:     'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=700&q=85',
  heroSecond:   'https://images.unsplash.com/photo-1529636798458-92182e662485?auto=format&fit=crop&w=600&q=80',
  heroThird:    'https://images.unsplash.com/photo-1474552226712-ac0f0961a954?auto=format&fit=crop&w=400&q=80',
  heroFourth:   'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=400&q=80',
  // Intro three circle portraits
  wreathLeft:   'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=400&q=80',
  wreathCenter: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=500&q=80',
  wreathRight:  'https://images.unsplash.com/photo-1523438885200-e635ba2c371e?auto=format&fit=crop&w=400&q=80',
};

const STEPS = [
  {
    icon: CaptureIcon,
    title: 'Create Your Space',
    desc: 'Sign up and invite your partner with a secure link. Only the two of you can ever access your memories.',
  },
  {
    icon: UploadIcon,
    title: 'Upload Memories',
    desc: 'Add photos, videos, and write the story behind each moment. Tag them, add dates and locations.',
  },
  {
    icon: HeartIcon,
    title: 'Relive Together',
    desc: 'Browse your timeline, search memories, and celebrate anniversaries. Your love story, beautifully organized.',
  },
];

const SERVICES = [
  {
    icon: CaptureIcon,
    title: 'Photo Gallery',
    desc: 'Upload unlimited photos organized beautifully by memory. Browse by album or date.',
    image: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=600&q=80',
  },
  {
    icon: VideoIcon,
    title: 'Video Memories',
    desc: 'Save videos with smooth playback. Relive the moments words cannot describe.',
    image: 'https://images.unsplash.com/photo-1511285560929-80b456fea0df?auto=format&fit=crop&w=600&q=80',
  },
  {
    icon: TimelineIcon,
    title: 'Timeline View',
    desc: 'See your entire relationship story told chronologically from day one.',
    image: 'https://images.unsplash.com/photo-1474552226712-ac0f0961a954?auto=format&fit=crop&w=600&q=80',
  },
  {
    icon: CalendarIcon,
    title: 'Anniversaries',
    desc: 'Browse memories by date with a beautiful calendar. Never forget an anniversary.',
    image: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=600&q=80',
  },
  {
    icon: SearchIcon,
    title: 'Smart Search',
    desc: 'Find any memory instantly by title, date, location, or tag.',
    image: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=600&q=80',
  },
  {
    icon: MailIcon,
    title: 'Love Letters',
    desc: 'Write private letters to each other, saved forever in your shared space.',
    image: 'https://images.unsplash.com/photo-1518199266791-5375a57590ae?auto=format&fit=crop&w=600&q=80',
  },
];

const SHOWCASE = [
  { title: 'Sunset Moments',  tag: 'Photo Memories',   image: 'https://images.unsplash.com/photo-1523438885200-e635ba2c371e?auto=format&fit=crop&w=500&q=80' },
  { title: 'Adventure Days',  tag: 'Timeline Stories', image: 'https://images.unsplash.com/photo-1474552226712-ac0f0961a954?auto=format&fit=crop&w=500&q=80' },
  { title: 'Date Nights',     tag: 'Video Memories',   image: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=500&q=80' },
  { title: 'Love Letters',    tag: 'Private Notes',    image: 'https://images.unsplash.com/photo-1518199266791-5375a57590ae?auto=format&fit=crop&w=500&q=80' },
];

const STATS = [
  { value: '∞',    label: 'Unlimited Memories' },
  { value: '100%', label: 'Private & Secure' },
  { value: '2',    label: 'Exclusively Yours' },
  { value: '♥',   label: 'Forever Preserved' },
];

const NAV_LINKS = [
  { label: 'Home', id: 'top' },
  { label: 'Features', id: 'services' },
  { label: 'How it Works', id: 'how-it-works' },
  { label: 'About', id: 'about' },
];

/* ─── inline FeatureImageCard ─── */
const FeatureImageCard = ({ icon: Icon, title, desc, image }) => (
  <article className="group relative overflow-hidden rounded-2xl shadow-lg cursor-default">
    <SafeImage
      src={image}
      alt={title}
      className="h-60 w-full object-cover transition-transform duration-700 group-hover:scale-110"
    />
    {/* gradient overlay */}
    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent transition-all duration-300 group-hover:from-black/90 group-hover:via-black/50" />
    {/* icon badge */}
    <div className="absolute top-4 right-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm transition-all duration-300 group-hover:bg-[#C96B60] dark:group-hover:bg-[#8C5D5D]">
      <Icon className="h-4 w-4 text-white" />
    </div>
    {/* bottom info */}
    <div className="absolute bottom-0 left-0 right-0 p-5">
      <h3 className="font-serif text-lg font-bold text-white mb-1">{title}</h3>
      <p className="text-xs text-white/80 leading-relaxed max-h-0 overflow-hidden opacity-0 transition-all duration-300 group-hover:max-h-16 group-hover:opacity-100">
        {desc}
      </p>
    </div>
  </article>
);

/* ─── step screen helpers ─── */
const NavSidebar = ({ active }) => (
  <div className="w-36 shrink-0 bg-white/60 p-3 flex flex-col gap-1 border-r border-black/8">
    {/* Couple names header */}
    <div className="flex items-center gap-1.5 mb-3 px-1">
      <HeartIcon className="h-3.5 w-3.5 text-[#C96B60] fill-[#C96B60]" />
      <span className="font-serif text-[11px] font-bold text-[#1A2B48]">Alex &amp; Sam</span>
    </div>
    {['Timeline', 'Gallery', 'Letters', 'Calendar'].map((item, i) => (
      <div
        key={item}
        className={`rounded-lg px-3 py-1.5 text-[11px] font-medium transition-colors ${
          i === active ? 'bg-[#C96B60] text-white' : 'text-[#1A2B48]/50'
        }`}
      >
        {item}
      </div>
    ))}
  </div>
);

const LandingPage = () => {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [stepProgress, setStepProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* auto-advance how-it-works */
  useEffect(() => {
    setStepProgress(0);
    let p = 0;
    const DURATION = 3500;
    const TICK = 80;
    const inc = (TICK / DURATION) * 100;

    const timer = setInterval(() => {
      p += inc;
      if (p >= 100) {
        clearInterval(timer);
        setActiveStep(s => (s + 1) % 3);
      } else {
        setStepProgress(p);
      }
    }, TICK);
    return () => clearInterval(timer);
  }, [activeStep]);

  const scrollToSection = (id) => {
    if (id === 'top') { window.scrollTo({ top: 0, behavior: 'smooth' }); return; }
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  const jumpStep = (idx) => { setActiveStep(idx); setStepProgress(0); };

  const heroReveal     = useReveal();
  const introReveal    = useReveal();
  const statsReveal    = useReveal();
  const howReveal      = useReveal();
  const servicesReveal = useReveal();
  const showcaseReveal = useReveal();
  const ctaReveal      = useReveal();

  return (
    <div id="top" className="relative min-h-screen overflow-hidden bg-[#FDF0EE] text-gray-900 transition-colors duration-300 dark:bg-[#40110D] dark:text-white">
      <StarsBackground />
      <PetalEffect />

      {/* NAVBAR */}
      <header className={`sticky top-0 z-50 border-b transition-all duration-300 ${
        scrolled
          ? 'border-[#E8BFB6]/50 bg-[#FDF0EE]/95 shadow-md backdrop-blur-md dark:border-[#D9C1BF]/10 dark:bg-[#40110D]/95'
          : 'border-[#E8BFB6]/30 bg-[#FDF0EE] dark:border-[#D9C1BF]/10 dark:bg-[#40110D]'
      }`}>
        <div className="relative mx-auto flex h-[72px] max-w-7xl items-center justify-between px-6">
          <Link to="/" className="z-10 flex items-center gap-2 font-serif text-2xl font-bold text-[#1A2B48] dark:text-[#D9C1BF]">
            <FlowerIcon className="h-7 w-7 text-[#C96B60] dark:text-[#D9C1BF]" />
            Memento
          </Link>

          <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-8 md:flex">
            {NAV_LINKS.map(({ label, id }) => (
              <button key={label} type="button" onClick={() => scrollToSection(id)}
                className="text-sm font-medium text-[#1A2B48]/80 transition-colors hover:text-[#C96B60] dark:text-[#BF8F8F] dark:hover:text-[#D9C1BF]">
                {label}
              </button>
            ))}
          </nav>

          <div className="z-10 flex items-center gap-3">
            <ThemeToggle />
            <Link to="/login"
              className="hidden rounded-md border border-[#C96B60]/40 px-4 py-2 text-sm font-medium text-[#C96B60] transition-all hover:bg-[#C96B60]/10 dark:border-[#D9C1BF]/30 dark:text-[#D9C1BF] dark:hover:bg-white/5 sm:inline-block">
              Login
            </Link>
            <Link to="/signup"
              className="rounded-md bg-[#C96B60] px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-[#B05A50] dark:bg-[#591F12] dark:text-[#D9C1BF] dark:hover:bg-[#8C5D5D]">
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section ref={heroReveal} className="reveal relative bg-[#FDF0EE] py-14 dark:bg-[#40110D] lg:py-20">
        <div className="relative mx-auto max-w-5xl px-6">
          <HeroFloralAccent className="absolute -left-2 top-4 h-16 w-16 opacity-35 lg:h-24 lg:w-24" />
          <HeroFloralAccent className="absolute bottom-0 right-0 h-20 w-20 scale-x-[-1] opacity-25" />

          <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-2 lg:gap-12">

            {/* ── LEFT: text ── */}
            <div className="space-y-6">
              <span className="font-serif text-sm italic text-[#C96B60] dark:text-[#BF8F8F]">Your private memory space</span>
              <h1 className="font-serif text-4xl font-bold leading-[1.15] text-[#1A2B48] dark:text-[#D9C1BF] md:text-5xl lg:text-[3.25rem]">
                Preserve Every<br />Moment You<br />Share Together
              </h1>
              <p className="max-w-sm text-sm leading-relaxed text-[#1A2B48]/70 dark:text-[#BF8F8F] md:text-base">
                Photos, videos, and stories — private, beautiful, forever yours.
              </p>
              <div className="flex flex-wrap items-center gap-4 pt-1">
                <button type="button" onClick={() => navigate('/signup')}
                  className="inline-flex items-center gap-2 rounded-md bg-[#C96B60] px-7 py-3 text-sm font-semibold text-white transition-all hover:bg-[#B05A50] dark:bg-[#591F12] dark:text-[#D9C1BF] dark:hover:bg-[#8C5D5D]">
                  Start Your Story
                  <ArrowForwardIcon className="h-4 w-4" />
                </button>
                <button type="button" onClick={() => scrollToSection('how-it-works')}
                  className="group inline-flex items-center gap-3 text-sm font-semibold text-[#1A2B48] dark:text-[#D9C1BF]">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/60 shadow ring-1 ring-[#E8BFB6] transition-shadow group-hover:shadow-md dark:bg-[#591F12] dark:ring-[#D9C1BF]/20">
                    <PlayIcon className="h-6 w-6 text-[#C96B60] dark:text-[#D9C1BF]" />
                  </span>
                  See How It Works
                </button>
              </div>
              <div className="flex flex-wrap gap-4 text-xs text-[#1A2B48]/60 dark:text-[#8C5D5D]">
                <span className="inline-flex items-center gap-1"><ShieldIcon className="h-3.5 w-3.5 text-[#C96B60]" /> Secure</span>
                <span className="inline-flex items-center gap-1"><LockIcon className="h-3.5 w-3.5 text-[#C96B60]" /> Private</span>
                <span className="inline-flex items-center gap-1"><HeartIcon className="h-3.5 w-3.5 text-[#C96B60]" /> For Two</span>
              </div>
            </div>

            {/* ── RIGHT: 4-image collage ── */}
            <div className="relative mx-auto h-[480px] w-full max-w-[420px] lg:mx-0 lg:h-[520px]">

              {/* Image 1 — top-left small, rotated +3deg */}
              <div className="absolute left-0 top-0 z-10 w-[42%] overflow-hidden rounded-2xl shadow-lg"
                style={{ transform: 'rotate(3deg)' }}>
                <SafeImage
                  src={IMG.heroThird}
                  alt="Couple adventure"
                  className="h-[160px] w-full object-cover lg:h-[180px]"
                />
                <div className="absolute inset-0 rounded-2xl ring-1 ring-white/20" />
              </div>

              {/* Image 2 — left-center large, rotated -4deg */}
              <div className="absolute left-0 bottom-0 z-10 w-[50%] overflow-hidden rounded-3xl shadow-xl"
                style={{ transform: 'rotate(-4deg)' }}>
                <SafeImage
                  src={IMG.heroSecond}
                  alt="Couple memory"
                  className="h-[270px] w-full object-cover lg:h-[300px]"
                />
                <div className="absolute inset-0 rounded-3xl ring-1 ring-white/25" />
              </div>

              {/* Image 3 — right-center tall (main), front */}
              <div className="absolute right-0 top-0 z-20 w-[58%] overflow-hidden rounded-3xl shadow-2xl">
                <SafeImage
                  src={IMG.heroMain}
                  alt="Couple together"
                  className="h-[340px] w-full object-cover lg:h-[380px]"
                />
                <div className="absolute inset-0 rounded-3xl ring-1 ring-white/20" />
              </div>

              {/* Image 4 — bottom-right small, rotated -3deg */}
              <div className="absolute right-2 bottom-0 z-20 w-[40%] overflow-hidden rounded-2xl shadow-lg"
                style={{ transform: 'rotate(-3deg)' }}>
                <SafeImage
                  src={IMG.heroFourth}
                  alt="Couple moments"
                  className="h-[140px] w-full object-cover lg:h-[155px]"
                />
                <div className="absolute inset-0 rounded-2xl ring-1 ring-white/20" />
              </div>

              {/* Floating memory badge — centred at the overlap */}
              <div className="absolute bottom-[148px] left-[44%] z-30 flex items-center gap-2 rounded-2xl bg-white/90 dark:bg-[#291008]/90 backdrop-blur-sm shadow-xl px-3 py-2 border border-white/60 dark:border-[#D9C1BF]/10">
                <span className="text-base">💕</span>
                <div className="leading-none">
                  <p className="text-[10px] font-bold text-[#1A2B48] dark:text-[#D9C1BF]">Our Memories</p>
                  <p className="text-[9px] text-[#C96B60] dark:text-[#BF8F8F] mt-0.5">Forever preserved</p>
                </div>
              </div>

              {/* Decorative floral accent */}
              <HeroFloralAccent className="absolute -right-2 top-[350px] h-18 w-18 opacity-40 dark:opacity-25" />
            </div>

          </div>
        </div>
      </section>

      {/* INTRO */}
      <section id="about" ref={introReveal} className="reveal bg-[#F8E4DF] py-20 dark:bg-[#8E5B60]/20 lg:py-28">
        <div className="mx-auto max-w-4xl px-6 text-center">

          {/* Three circle portraits */}
          <div className="flex items-end justify-center gap-4 mb-12 md:gap-6">
            {/* Left circle — slightly smaller */}
            <div className="relative shrink-0">
              <div className="h-28 w-28 md:h-36 md:w-36 overflow-hidden rounded-full border-4 border-white shadow-xl dark:border-[#591F12]">
                <SafeImage src={IMG.wreathLeft} alt="Couple moment" className="h-full w-full object-cover" />
              </div>
            </div>
            {/* Center circle — largest */}
            <div className="relative shrink-0 -mb-3">
              <div className="h-36 w-36 md:h-48 md:w-48 overflow-hidden rounded-full border-4 border-white shadow-2xl dark:border-[#591F12] ring-4 ring-[#C96B60]/20">
                <SafeImage src={IMG.wreathCenter} alt="Couple together" className="h-full w-full object-cover" />
              </div>
            </div>
            {/* Right circle — slightly smaller */}
            <div className="relative shrink-0">
              <div className="h-28 w-28 md:h-36 md:w-36 overflow-hidden rounded-full border-4 border-white shadow-xl dark:border-[#591F12]">
                <SafeImage src={IMG.wreathRight} alt="Couple memory" className="h-full w-full object-cover" />
              </div>
            </div>
          </div>

          {/* Decorative label with lines */}
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="h-px w-12 bg-[#C96B60]/40 dark:bg-[#BF8F8F]/30" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.35em] text-[#C96B60] dark:text-[#BF8F8F]">Built for Couples</span>
            <div className="h-px w-12 bg-[#C96B60]/40 dark:bg-[#BF8F8F]/30" />
          </div>

          {/* Big heading */}
          <h2 className="font-serif text-3xl font-bold leading-snug text-[#1A2B48] dark:text-[#D9C1BF] md:text-4xl lg:text-[2.6rem] mb-5">
            Not another cluttered photo app.<br className="hidden md:block" />
            A quiet, private world for the story<br className="hidden md:block" />
            only the two of you are living.
          </h2>

          <p className="mx-auto max-w-md text-sm leading-relaxed text-[#1A2B48]/60 dark:text-[#BF8F8F]">
            Every feature is designed around a partnership — shared spaces,
            gentle reminders of the days that mattered, and room for the words
            you never want to forget.
          </p>
        </div>
      </section>

      {/* STATS */}
      <section ref={statsReveal} className="reveal border-y border-[#E8BFB6]/50 bg-white py-8 dark:border-[#D9C1BF]/10 dark:bg-[#40110D] lg:py-12">
        <div className="mx-auto flex max-w-6xl items-center justify-center px-6">
          <LeafBracket className="hidden h-28 w-14 shrink-0 md:block" />
          <div className="grid flex-1 grid-cols-2 md:grid-cols-4">
            {STATS.map(({ value, label }) => (
              <StatItem key={label} value={value} label={label} />
            ))}
          </div>
          <LeafBracket className="hidden h-28 w-14 shrink-0 scale-x-[-1] md:block" />
        </div>
      </section>

      {/* HOW IT WORKS — two-column: mockup left · steps right */}
      <section id="how-it-works" ref={howReveal} className="reveal bg-[#F8E4DF] dark:bg-[#3D0E0A] py-20 lg:py-28">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">

            {/* ── LEFT: interactive browser mockup ── */}
            <div className="overflow-hidden rounded-2xl shadow-2xl border border-[#E8BFB6]/60 dark:border-white/10">
              {/* Browser chrome */}
              <div className="flex items-center gap-2 bg-[#E8BFB6] dark:bg-[#591F12] px-4 py-3">
                <span className="h-3 w-3 rounded-full bg-rose-400/80" />
                <span className="h-3 w-3 rounded-full bg-amber-400/80" />
                <span className="h-3 w-3 rounded-full bg-emerald-400/80" />
                <div className="mx-3 flex flex-1 items-center gap-2 rounded-full bg-[#1A2B48]/10 dark:bg-white/10 px-3 py-1">
                  <LockIcon className="h-3 w-3 text-[#1A2B48]/40 dark:text-white/50" />
                  <span className="text-[11px] text-[#1A2B48]/50 dark:text-white/60">memento.app / our space</span>
                </div>
                <SparklesIcon className="h-4 w-4 text-[#1A2B48]/30 dark:text-white/40" />
              </div>

            {/* App screen area */}
              <div className="relative bg-[#FDF0EE]" style={{ minHeight: '340px' }}>

              {/* ── STEP 0: Create Your Space ── */}
              <div className={`absolute inset-0 flex ${activeStep === 0 ? 'opacity-100 translate-x-0 duration-500 delay-150 transition-all' : 'opacity-0 translate-x-8 duration-200 delay-0 transition-all pointer-events-none'}`}>
                <NavSidebar active={0} />
                <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6">
                  <div className="text-center">
                    <p className="font-serif text-xl font-bold text-[#1A2B48] dark:text-[#D9C1BF]">Welcome to Memento! 🌸</p>
                    <p className="text-xs text-[#1A2B48]/60 dark:text-[#BF8F8F] mt-1">Invite your partner to start your shared space</p>
                  </div>
                  <div className="w-full max-w-xs rounded-xl border border-[#C96B60]/30 bg-white dark:bg-[#8E5B60]/30 p-3 shadow-md">
                    <p className="text-[10px] font-semibold text-[#C96B60] dark:text-[#D9C1BF] mb-2">Partner Invite Link</p>
                    <div className="flex gap-1 items-center">
                      <div className="flex-1 rounded bg-[#FDF0EE]/30 dark:bg-[#40110D]/60 px-2 py-1 text-[9px] text-gray-500 dark:text-[#BF8F8F] truncate font-mono">
                        memento.app/join/♥-abc123
                      </div>
                      <span className="rounded bg-[#C96B60] px-2 py-1 text-[9px] text-white font-semibold">Copy</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col items-center gap-1">
                      <div className="h-12 w-12 rounded-full bg-[#C96B60]/20 border-2 border-[#C96B60] flex items-center justify-center text-[#C96B60] text-xs font-bold">You</div>
                      <span className="text-[9px] text-[#1A2B48]/60 dark:text-[#BF8F8F]">Joined ✓</span>
                    </div>
                    <HeartIcon className="h-6 w-6 text-[#C96B60] animate-pulse" />
                    <div className="flex flex-col items-center gap-1">
                      <div className="h-12 w-12 rounded-full border-2 border-dashed border-[#E8BFB6] flex items-center justify-center text-[9px] text-[#E8BFB6] dark:text-[#BF8F8F]">Partner</div>
                      <span className="text-[9px] text-[#1A2B48]/40 dark:text-[#8C5D5D]">Pending…</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── STEP 1: Upload Memories ── */}
              <div className={`absolute inset-0 flex ${activeStep === 1 ? 'opacity-100 translate-x-0 duration-500 delay-150 transition-all' : 'opacity-0 translate-x-8 duration-200 delay-0 transition-all pointer-events-none'}`}>
                <NavSidebar active={1} />
                <div className="flex-1 p-5">
                  <h3 className="font-serif text-base font-bold text-[#1A2B48] dark:text-[#D9C1BF] mb-3">Add a Memory</h3>
                  <div className="border-2 border-dashed border-[#C96B60]/40 rounded-xl p-4 flex flex-col items-center gap-1.5 mb-3 bg-white/30 dark:bg-[#8E5B60]/20">
                    <UploadIcon className="h-6 w-6 text-[#C96B60]" />
                    <span className="text-[10px] text-[#C96B60] font-medium">Drop photos or videos here</span>
                    <span className="text-[9px] text-[#1A2B48]/50 dark:text-[#BF8F8F]">JPG · PNG · MP4</span>
                  </div>
                  <div className="space-y-2">
                    <div className="h-7 rounded-lg border border-black/10 bg-white/60 dark:bg-[#8E5B60]/30 dark:border-[#BF8F8F]/20 px-2.5 flex items-center">
                      <span className="text-[9px] text-gray-400 dark:text-[#BF8F8F]">Memory title…</span>
                    </div>
                    <div className="flex gap-2">
                      <div className="h-7 flex-1 rounded-lg border border-black/10 bg-white/60 dark:bg-[#8E5B60]/30 dark:border-[#BF8F8F]/20 px-2.5 flex items-center">
                        <CalendarIcon className="h-3 w-3 text-gray-300 dark:text-[#BF8F8F] mr-1" /><span className="text-[9px] text-gray-400 dark:text-[#BF8F8F]">Date</span>
                      </div>
                      <div className="h-7 flex-1 rounded-lg border border-black/10 bg-white/60 dark:bg-[#8E5B60]/30 dark:border-[#BF8F8F]/20 px-2.5 flex items-center">
                        <span className="text-[9px] text-gray-400 dark:text-[#BF8F8F]">📍 Location</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex gap-1">
                        {['#beach','#us','#2025'].map(tag => (
                          <span key={tag} className="rounded-full bg-[#C96B60]/10 px-2 py-0.5 text-[8px] text-[#C96B60] dark:bg-[#8C5D5D]/20 dark:text-[#BF8F8F]">{tag}</span>
                        ))}
                      </div>
                      <div className="h-7 w-24 rounded-lg bg-[#C96B60] dark:bg-[#8C5D5D] flex items-center justify-center text-[9px] text-white font-semibold">Save Memory</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── STEP 2: Relive Together ── */}
              <div className={`absolute inset-0 flex ${activeStep === 2 ? 'opacity-100 translate-x-0 duration-500 delay-150 transition-all' : 'opacity-0 translate-x-8 duration-200 delay-0 transition-all pointer-events-none'}`}>
                <NavSidebar active={0} />
                <div className="flex-1 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-serif text-sm font-bold text-[#1A2B48]">Your Timeline</h3>
                    <div className="flex items-center gap-1 text-[9px] text-[#C96B60]">
                      <HeartIcon className="h-3 w-3 fill-[#C96B60]" /> 42 memories
                    </div>
                  </div>
                  {/* Three couple photo thumbnails — mirrors image 3 */}
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    {[
                      'https://images.unsplash.com/photo-1518568814500-bf0f8d125f46?auto=format&fit=crop&w=300&q=80',
                      'https://images.unsplash.com/photo-1511285560929-80b456fea0df?auto=format&fit=crop&w=300&q=80',
                      'https://images.unsplash.com/photo-1529636798458-92182e662485?auto=format&fit=crop&w=300&q=80',
                    ].map((src, i) => (
                      <div key={i} className="rounded-xl overflow-hidden h-[85px] bg-[#E8BFB6]/30">
                        <SafeImage src={src} alt="" className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                  {/* Placeholder text bars */}
                  <div className="space-y-1.5 px-0.5">
                    <div className="h-2 rounded-full bg-[#C96B60]/40 w-2/3" />
                    <div className="h-1.5 rounded-full bg-[#1A2B48]/10 w-full" />
                    <div className="h-1.5 rounded-full bg-[#1A2B48]/10 w-5/6" />
                    <div className="h-1.5 rounded-full bg-[#1A2B48]/10 w-4/5" />
                  </div>
                </div>
              </div>

            </div>
            </div>{/* end browser mockup */}

            {/* ── RIGHT: heading + vertical steps ── */}
            <div className="space-y-8">
              <div>
                <span className="text-xs font-semibold uppercase tracking-[0.3em] text-[#C96B60]">How Memento Works</span>
                <h2 className="mt-3 font-serif text-3xl font-bold leading-snug text-[#1A2B48] dark:text-white md:text-4xl lg:text-[2.5rem]">
                  Three simple steps to a<br />lifetime of memories
                </h2>
              </div>

              <div className="space-y-6">
                {STEPS.map((step, idx) => {
                  const isActive = activeStep === idx;
                  return (
                    <button
                      key={step.title}
                      type="button"
                      onClick={() => jumpStep(idx)}
                      className={`w-full text-left flex gap-4 rounded-2xl p-4 transition-all duration-300 ${
                        isActive
                          ? 'bg-white/80 dark:bg-white/10 border border-[#C96B60]/20 dark:border-white/15 shadow-sm'
                          : 'hover:bg-white/40 dark:hover:bg-white/5'
                      }`}
                    >
                      <span className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold transition-colors ${
                        isActive
                          ? 'bg-[#C96B60] text-white'
                          : 'border border-[#1A2B48]/20 dark:border-white/20 text-[#1A2B48]/40 dark:text-white/40'
                      }`}>{idx + 1}</span>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-semibold mb-1 ${
                          isActive ? 'text-[#1A2B48] dark:text-white' : 'text-[#1A2B48]/40 dark:text-white/50'
                        }`}>
                          {step.title}
                        </p>
                        <p className={`text-xs leading-relaxed mb-3 ${
                          isActive ? 'text-[#1A2B48]/60 dark:text-white/70' : 'text-[#1A2B48]/25 dark:text-white/30'
                        }`}>
                          {step.desc}
                        </p>
                        <div className="h-0.5 w-full overflow-hidden rounded-full bg-[#1A2B48]/10 dark:bg-white/10">
                          <div className="h-full rounded-full bg-[#C96B60]"
                            style={{ width: isActive ? `${stepProgress}%` : '0%', transition: 'width 80ms linear' }} />
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* SERVICES — image grid */}
      <section id="services" ref={servicesReveal} className="reveal bg-[#F8E4DF] py-20 dark:bg-[#8E5B60]/20 lg:py-28">
        <div className="mx-auto max-w-5xl px-6">
          <div className="mb-14 text-center">
            <span className="mb-3 inline-block text-xs font-semibold uppercase tracking-[0.2em] text-[#C96B60] dark:text-[#BF8F8F]">
              Features
            </span>
            <h2 className="font-serif text-3xl font-bold text-[#1A2B48] dark:text-[#D9C1BF] md:text-4xl lg:text-5xl">
              Everything You Need
            </h2>
            <p className="mt-3 text-sm text-[#1A2B48]/70 dark:text-[#BF8F8F]">
              Built for couples who want to remember everything
            </p>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {SERVICES.map((service) => (
              <FeatureImageCard
                key={service.title}
                icon={service.icon}
                title={service.title}
                desc={service.desc}
                image={service.image}
              />
            ))}
          </div>
        </div>
      </section>

      {/* SHOWCASE */}
      <section id="showcase" ref={showcaseReveal} className="reveal bg-[#F5E2DB] py-20 dark:bg-[#40110D] lg:py-28">
        <div className="mx-auto max-w-5xl px-6">
          <div className="mb-14 text-center">
            <span className="mb-3 inline-block text-xs font-semibold uppercase tracking-[0.2em] text-[#C96B60] dark:text-[#BF8F8F]">
              Your Gallery
            </span>
            <h2 className="font-serif text-3xl font-bold text-[#1A2B48] dark:text-[#D9C1BF] md:text-4xl lg:text-5xl">
              Special Memories For You
            </h2>
            <p className="mt-3 text-sm text-[#1A2B48]/70 dark:text-[#BF8F8F]">
              A glimpse of what awaits — your story, beautifully preserved
            </p>
          </div>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {SHOWCASE.map((item) => (
              <ShowcaseCard key={item.title} {...item} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA — Start preserving your story */}
      <section ref={ctaReveal} className="reveal bg-[#FDF0EE] py-20 dark:bg-[#40110D] lg:py-28">
        <div className="mx-auto max-w-2xl px-6 text-center">
          {/* Sparkle icon */}
          <div className="mb-6 flex justify-center">
            <SparklesIcon className="h-8 w-8 text-[#C96B60]/60 dark:text-[#BF8F8F]/50" />
          </div>
          <h2 className="font-serif text-3xl font-bold leading-snug text-[#40110D] dark:text-[#D9C1BF] md:text-4xl lg:text-[2.5rem] mb-4">
            Start preserving your story today
          </h2>
          <p className="mx-auto max-w-sm text-sm leading-relaxed text-[#1A2B48]/60 dark:text-[#BF8F8F] mb-10">
            Create your private space and gather everything that makes<br className="hidden md:block" />
            the two of you, you.
          </p>
          {/* Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 mb-8">
            <button type="button" onClick={() => navigate('/signup')}
              className="inline-flex items-center gap-2 rounded-xl bg-[#40110D] px-8 py-3.5 text-sm font-semibold text-white transition-all hover:bg-[#591F12] dark:bg-[#591F12] dark:hover:bg-[#8E5B60]">
              Start your space
              <ArrowForwardIcon className="h-4 w-4" />
            </button>
            <button type="button" onClick={() => scrollToSection('services')}
              className="rounded-xl border border-[#C96B60]/40 px-8 py-3.5 text-sm font-semibold text-[#C96B60] transition-all hover:bg-[#C96B60]/8 dark:border-[#BF8F8F]/30 dark:text-[#BF8F8F]">
              Explore features
            </button>
          </div>
          {/* Trust badges */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-[#1A2B48]/45 dark:text-[#8C5D5D]">
            <span className="flex items-center gap-1.5">
              <span className="text-[#C96B60]">✓</span> Private by design
            </span>
            <span className="flex items-center gap-1.5">
              <span className="text-[#C96B60]">✓</span> Free to start
            </span>
            <span className="flex items-center gap-1.5">
              <span className="text-[#C96B60]">✓</span> For two, forever
            </span>
          </div>
        </div>
      </section>

      <footer className="border-t border-[#E8BFB6]/50 bg-[#F8E4DF] py-4 dark:border-[#D9C1BF]/10 dark:bg-[#40110D]">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-3 px-6 text-sm text-[#1A2B48]/50 dark:text-[#8C5D5D]">
          <p className="inline-flex items-center gap-1">
            © 2026 Memento · Made with
            <HeartIcon className="h-3.5 w-3.5 text-white dark:text-[#BF8F8F]" />
          </p>
          <ThemeToggle />
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
