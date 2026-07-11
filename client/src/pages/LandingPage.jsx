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
  heroMain:     '/hero.jpg',
  heroSecond:   '/couple1.jpg',
  heroThird:    '/couple2.jpg',
  heroFourth:   '/couple3.jpg',
  // Intro three circle portraits
  wreathLeft:   '/gallery1.jpg',
  wreathCenter: '/couple_background.png',
  wreathRight:  '/gallery2.jpg',
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
    image: '/couple1.jpg',
  },
  {
    icon: VideoIcon,
    title: 'Video Memories',
    desc: 'Save videos with smooth playback. Relive the moments words cannot describe.',
    image: '/couple2.jpg',
  },
  {
    icon: TimelineIcon,
    title: 'Timeline View',
    desc: 'See your entire relationship story told chronologically from day one.',
    image: '/couple3.jpg',
  },
  {
    icon: CalendarIcon,
    title: 'Anniversaries',
    desc: 'Browse memories by date with a beautiful calendar. Never forget an anniversary.',
    image: '/gallery1.jpg',
  },
  {
    icon: SearchIcon,
    title: 'Smart Search',
    desc: 'Find any memory instantly by title, date, location, or tag.',
    image: '/gallery2.jpg',
  },
  {
    icon: MailIcon,
    title: 'Love Letters',
    desc: 'Write private letters to each other, saved forever in your shared space.',
    image: '/gallery3.jpg',
  },
];

const SHOWCASE = [
  { title: 'Sunset Moments',  tag: 'Photo Memories',   image: '/gallery4.jpg' },
  { title: 'Adventure Days',  tag: 'Timeline Stories', image: '/couple1.jpg' },
  { title: 'Date Nights',     tag: 'Video Memories',   image: '/gallery3.jpg' },
  { title: 'Love Letters',    tag: 'Private Notes',    image: '/couple2.jpg' },
];

const STATS = [
  { value: '∞',    label: 'Unlimited Memories', Icon: CaptureIcon   },
  { value: '100%', label: 'Private & Secure',   Icon: ShieldIcon    },
  { value: '2',    label: 'Exclusively Yours',  Icon: HeartIcon     },
  { value: '♥',   label: 'Forever Preserved',  Icon: SparklesIcon  },
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
    <div className="absolute top-4 right-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm transition-all duration-300 group-hover:bg-[#B8863E] dark:group-hover:bg-[#CBA24A]">
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
  <div className="w-36 shrink-0 bg-[#FAF3F0] dark:bg-[#5A2532]/70 p-3 flex flex-col gap-1 border-r border-[#E8BFB6]/50 dark:border-[#CBA24A]/15">
    {/* Couple names header */}
    <div className="flex items-center gap-1.5 mb-3 px-1">
      <HeartIcon className="h-3.5 w-3.5 text-[#5C1A28] fill-[#5C1A28] dark:text-[#CBA24A] dark:fill-[#CBA24A]" />
      <span className="font-serif text-[11px] font-bold text-[#5C1A28] dark:text-[#CBA24A]">Alex &amp; Sam</span>
    </div>
    {['Timeline', 'Gallery', 'Letters', 'Calendar'].map((item, i) => (
      <div
        key={item}
        className={`rounded-lg px-3 py-1.5 text-[11px] font-medium transition-colors ${
          i === active
            ? 'bg-[#5C1A28]/12 text-[#5C1A28] dark:bg-[#CBA24A]/18 dark:text-[#CBA24A]'
            : 'text-[#1A2B48]/45 dark:text-[#D9C1BF]/45'
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
    <div id="top" className="relative min-h-screen bg-[#FDF6F0] text-gray-900 transition-colors duration-300 dark:bg-[#2A1218] dark:text-white">
      <StarsBackground />
      <PetalEffect />

      {/* NAVBAR — fixed so it always stays at top while scrolling */}
      <header className={`fixed top-0 left-0 right-0 z-50 border-b transition-all duration-500 ${
        scrolled
          ? 'border-[#E8BFB6]/60 bg-[#FDF6F0]/96 shadow-[0_4px_28px_rgba(201,107,96,0.10)] backdrop-blur-xl dark:border-[#CBA24A]/15 dark:bg-[#2A1218]/97 dark:shadow-[0_4px_28px_rgba(203,162,74,0.08)]'
          : 'border-transparent bg-[#FDF6F0]/80 backdrop-blur-sm dark:bg-[#2A1218]/85'
      }`}>
        {/*
          Symmetric flex layout:
          • Left wing  (w-[240px] fixed) — Logo
          • Centre     (flex-1)          — Nav links, justify-center
          • Right wing (w-[240px] fixed) — ThemeToggle + Login + CTA
          Both wings are the same width → nav is always perfectly centred
          with equal breathing room on each side (~107 px at max-w-5xl).
        */}
        <div className="mx-auto flex h-[95px] max-w-5xl items-center px-6">

          {/* LEFT — Logo (fixed width, mirrors right wing) */}
          <div className="flex w-[260px] shrink-0 items-center">
            <Link to="/" className="flex items-center gap-2.5 group">
              <FlowerIcon className="h-7 w-7 text-[#5C1A28] dark:text-[#CBA24A] transition-all duration-300 group-hover:scale-110 group-hover:rotate-12" />
              <span className="font-serif text-2xl font-bold tracking-wide text-[#1A2B48] dark:text-[#D9C1BF] transition-colors group-hover:text-[#B8863E] dark:group-hover:text-[#CBA24A]">
                Memento
              </span>
            </Link>
          </div>

          {/* CENTRE — Nav links, perfectly centred in remaining space */}
          <nav className="hidden flex-1 items-center justify-center gap-1 md:flex">
            {NAV_LINKS.map(({ label, id }) => (
              <button key={label} type="button" onClick={() => scrollToSection(id)}
                className="group relative whitespace-nowrap px-4 py-2.5 text-[15px] font-medium text-[#1A2B48]/70 transition-colors duration-200 hover:text-[#B8863E] dark:text-[#D9C1BF]/75 dark:hover:text-[#CBA24A]">
                {label}
                <span className="absolute bottom-1.5 left-4 right-4 h-[2px] scale-x-0 rounded-full bg-[#5C1A28] dark:bg-[#CBA24A] transition-transform duration-300 origin-center group-hover:scale-x-100" />
              </button>
            ))}
          </nav>

          {/* RIGHT — Actions (same fixed width as left wing) */}
          <div className="flex w-[260px] shrink-0 items-center justify-end gap-2">
            <ThemeToggle />
            <Link to="/login"
              className="hidden whitespace-nowrap rounded-xl px-4 py-2.5 text-[14px] font-medium text-[#1A2B48]/70 transition-all duration-200 hover:bg-[#B8863E]/8 hover:text-[#B8863E] dark:text-[#D9C1BF]/75 dark:hover:bg-[#CBA24A]/8 dark:hover:text-[#CBA24A] sm:inline-block">
              Login
            </Link>
            <Link to="/signup"
              className="whitespace-nowrap rounded-xl bg-[#5C1A28] px-5 py-2.5 text-[14px] font-semibold text-white shadow-sm transition-all duration-200 hover:bg-[#B8863E] hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 dark:bg-[#CBA24A] dark:text-[#2A1218] dark:hover:bg-[#D4B05A] dark:shadow-[0_2px_12px_rgba(203,162,74,0.3)]">
              Start your space
            </Link>
          </div>
        </div>
      </header>

      {/* Spacer for fixed header */}
      <div className="h-[95px]" />

      {/* HERO */}
      <section ref={heroReveal} className="reveal relative bg-[#FDF6F0] py-14 dark:bg-[#2A1218] lg:py-20">
        <div className="relative mx-auto max-w-5xl px-6">
          <HeroFloralAccent className="absolute -left-2 top-4 h-16 w-16 opacity-35 lg:h-24 lg:w-24" />
          <HeroFloralAccent className="absolute bottom-0 right-0 h-20 w-20 scale-x-[-1] opacity-25" />

          <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-2 lg:gap-12">

            {/* ── LEFT: text ── */}
            <div className="space-y-6">
              <span className="font-serif text-sm italic text-[#5C1A28] dark:text-[#BF8F8F]">Your private memory space</span>
              <h1 className="font-serif text-4xl font-bold leading-[1.15] text-[#1A2B48] dark:text-[#D9C1BF] md:text-5xl lg:text-[3.25rem]">
                Preserve Every<br />Moment You<br />Share Together
              </h1>
              <p className="max-w-sm text-sm leading-relaxed text-[#1A2B48]/70 dark:text-[#BF8F8F] md:text-base">
                Photos, videos, and stories — private, beautiful, forever yours.
              </p>
              <div className="flex flex-wrap items-center gap-4 pt-1">
                <button type="button" onClick={() => navigate('/signup')}
                  className="inline-flex items-center gap-2 rounded-md bg-[#5C1A28] px-7 py-3 text-sm font-semibold text-white transition-all hover:bg-[#B8863E] dark:bg-[#CBA24A] dark:text-[#2A1218] dark:hover:bg-[#D4B05A]">
                  Start Your Story
                  <ArrowForwardIcon className="h-4 w-4" />
                </button>
                <button type="button" onClick={() => scrollToSection('how-it-works')}
                  className="group inline-flex items-center gap-3 text-sm font-semibold text-[#1A2B48] dark:text-[#D9C1BF]">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white shadow ring-1 ring-[#E8BFB6] transition-shadow group-hover:shadow-md dark:bg-[#5A2532] dark:ring-[#CBA24A]/20">
                    <PlayIcon className="h-6 w-6 text-[#5C1A28] dark:text-[#D9C1BF]" />
                  </span>
                  See How It Works
                </button>
              </div>
              <div className="flex flex-wrap gap-4 text-xs text-[#1A2B48]/60 dark:text-[#CBA24A]/70">
                <span className="inline-flex items-center gap-1"><ShieldIcon className="h-3.5 w-3.5 text-[#5C1A28]" /> Secure</span>
                <span className="inline-flex items-center gap-1"><LockIcon className="h-3.5 w-3.5 text-[#5C1A28]" /> Private</span>
                <span className="inline-flex items-center gap-1"><HeartIcon className="h-3.5 w-3.5 text-[#5C1A28]" /> For Two</span>
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
              <div className="absolute bottom-[148px] left-[44%] z-30 flex items-center gap-2 rounded-2xl bg-white/90 dark:bg-[#2A1218]/90 backdrop-blur-sm shadow-xl px-3 py-2 border border-white/60 dark:border-[#CBA24A]/15">
                <span className="text-base">💕</span>
                <div className="leading-none">
                  <p className="text-[10px] font-bold text-[#1A2B48] dark:text-[#D9C1BF]">Our Memories</p>
                  <p className="text-[9px] text-[#5C1A28] dark:text-[#BF8F8F] mt-0.5">Forever preserved</p>
                </div>
              </div>

              {/* Decorative floral accent */}
              <HeroFloralAccent className="absolute -right-2 top-[350px] h-18 w-18 opacity-40 dark:opacity-25" />
            </div>

          </div>
        </div>
      </section>

      {/* INTRO */}
      <section id="about" ref={introReveal} className="reveal bg-[#F8E4DF] py-20 dark:bg-[#5A2532] lg:py-28">
        <div className="mx-auto max-w-4xl px-6 text-center">

          {/* Three circle portraits */}
          <div className="flex items-end justify-center gap-4 mb-12 md:gap-6">
            {/* Left circle — slightly smaller */}
            <div className="relative shrink-0">
              <div className="h-28 w-28 md:h-36 md:w-36 overflow-hidden rounded-full border-4 border-white shadow-xl dark:border-[#5A2532]">
                <SafeImage src={IMG.wreathLeft} alt="Couple moment" className="h-full w-full object-cover" />
              </div>
            </div>
            {/* Center circle — largest */}
            <div className="relative shrink-0 -mb-3">
              <div className="h-36 w-36 md:h-48 md:w-48 overflow-hidden rounded-full border-4 border-white shadow-2xl dark:border-[#5A2532] ring-4 ring-[#5C1A28]/20">
                <SafeImage src={IMG.wreathCenter} alt="Couple together" className="h-full w-full object-cover" />
              </div>
            </div>
            {/* Right circle — slightly smaller */}
            <div className="relative shrink-0">
              <div className="h-28 w-28 md:h-36 md:w-36 overflow-hidden rounded-full border-4 border-white shadow-xl dark:border-[#5A2532]">
                <SafeImage src={IMG.wreathRight} alt="Couple memory" className="h-full w-full object-cover" />
              </div>
            </div>
          </div>

          {/* Decorative label with lines */}
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="h-px w-12 bg-[#5C1A28]/40 dark:bg-[#BF8F8F]/30" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.35em] text-[#5C1A28] dark:text-[#BF8F8F]">Built for Couples</span>
            <div className="h-px w-12 bg-[#5C1A28]/40 dark:bg-[#BF8F8F]/30" />
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
      <section ref={statsReveal} className="reveal bg-[#FDF6F0] py-10 dark:bg-[#2A1218] lg:py-14">
        <div className="mx-auto max-w-5xl px-6">
          <div className="grid grid-cols-2 divide-x divide-y divide-[#E8BFB6]/30 dark:divide-[#CBA24A]/10 md:grid-cols-4 md:divide-y-0">
            {STATS.map(({ value, label, Icon }) => (
              <div
                key={label}
                className="group flex flex-col items-center gap-3 px-4 py-8 text-center transition-all duration-300 cursor-default hover:bg-[#B8863E]/5 dark:hover:bg-[#CBA24A]/5 rounded-xl"
              >
                {/* Icon badge */}
                <div className="flex h-11 w-11 items-center justify-center rounded-full border border-[#5C1A28]/25 dark:border-[#CBA24A]/25 bg-[#5C1A28]/8 dark:bg-[#CBA24A]/8 transition-all duration-300 group-hover:scale-110 group-hover:border-[#B8863E]/50 dark:group-hover:border-[#CBA24A]/50 group-hover:bg-[#B8863E]/15 dark:group-hover:bg-[#CBA24A]/15">
                  <Icon className="h-5 w-5 text-[#5C1A28] dark:text-[#CBA24A]" />
                </div>
                {/* Bold gold value */}
                <span className="font-serif text-4xl font-bold leading-none tracking-tight text-[#1A2B48] dark:text-[#CBA24A] transition-colors duration-300 group-hover:text-[#B8863E] dark:group-hover:text-[#D4B05A] md:text-5xl lg:text-6xl">
                  {value}
                </span>
                {/* Label */}
                <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#1A2B48]/45 dark:text-[#D9C1BF]/45 transition-colors duration-300 group-hover:text-[#1A2B48]/70 dark:group-hover:text-[#D9C1BF]/70">
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS — two-column: mockup left · steps right */}
      <section id="how-it-works" ref={howReveal} className="reveal bg-[#F8E4DF] dark:bg-[#2A1218] py-20 lg:py-28">
        <div className="mx-auto max-w-5xl px-6">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">

            {/* ── LEFT: interactive browser mockup ── */}
            <div className="overflow-hidden rounded-2xl shadow-2xl border border-[#E8BFB6]/60 dark:border-[#CBA24A]/20">
              {/* Browser chrome */}
              <div className="flex items-center gap-2 bg-[#EDE0D8] dark:bg-[#5A2532] px-4 py-3">
                <span className="h-3 w-3 rounded-full bg-rose-400/80" />
                <span className="h-3 w-3 rounded-full bg-amber-400/80" />
                <span className="h-3 w-3 rounded-full bg-emerald-400/80" />
                <div className="mx-3 flex flex-1 items-center gap-2 rounded-full bg-[#1A2B48]/8 dark:bg-white/10 px-3 py-1">
                  <LockIcon className="h-3 w-3 text-[#1A2B48]/35 dark:text-[#CBA24A]/60" />
                  <span className="text-[11px] text-[#1A2B48]/45 dark:text-[#D9C1BF]/60">memento.app / our space</span>
                </div>
                <SparklesIcon className="h-4 w-4 text-[#1A2B48]/25 dark:text-[#CBA24A]/50" />
              </div>

            {/* App screen area */}
              <div className="relative bg-[#FEFEFE] dark:bg-[#2A1218]" style={{ minHeight: '340px' }}>

              {/* ── STEP 0: Create Your Space ── */}
              <div className={`absolute inset-0 flex ${activeStep === 0 ? 'opacity-100 translate-x-0 duration-500 delay-150 transition-all' : 'opacity-0 translate-x-8 duration-200 delay-0 transition-all pointer-events-none'}`}>
                <NavSidebar active={0} />
                <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6">
                  <div className="text-center">
                    <p className="font-serif text-xl font-bold text-[#1A2B48] dark:text-[#D9C1BF]">Welcome to Memento! 🌸</p>
                    <p className="text-xs text-[#1A2B48]/60 dark:text-[#BF8F8F] mt-1">Invite your partner to start your shared space</p>
                  </div>
                  <div className="w-full max-w-xs rounded-xl border border-[#5C1A28]/30 dark:border-[#CBA24A]/25 bg-[#FAF3F0] dark:bg-[#5A2532]/40 p-3 shadow-md">
                    <p className="text-[10px] font-semibold text-[#5C1A28] dark:text-[#CBA24A] mb-2">Partner Invite Link</p>
                    <div className="flex gap-1 items-center">
                      <div className="flex-1 rounded bg-[#F5EFEC] dark:bg-[#2A1218]/80 px-2 py-1 text-[9px] text-gray-500 dark:text-[#BF8F8F] truncate font-mono">
                        memento.app/join/♥-abc123
                      </div>
                      <span className="rounded bg-[#5C1A28] px-2 py-1 text-[9px] text-white font-semibold">Copy</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col items-center gap-1">
                      <div className="h-12 w-12 rounded-full bg-[#5C1A28]/20 border-2 border-[#5C1A28] flex items-center justify-center text-[#5C1A28] text-xs font-bold">You</div>
                      <span className="text-[9px] text-[#1A2B48]/60 dark:text-[#BF8F8F]">Joined ✓</span>
                    </div>
                    <HeartIcon className="h-6 w-6 text-[#5C1A28] animate-pulse" />
                    <div className="flex flex-col items-center gap-1">
                      <div className="h-12 w-12 rounded-full border-2 border-dashed border-[#E8BFB6] flex items-center justify-center text-[9px] text-[#E8BFB6] dark:text-[#BF8F8F]">Partner</div>
                      <span className="text-[9px] text-[#1A2B48]/40 dark:text-[#CBA24A]/70">Pending…</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── STEP 1: Upload Memories ── */}
              <div className={`absolute inset-0 flex ${activeStep === 1 ? 'opacity-100 translate-x-0 duration-500 delay-150 transition-all' : 'opacity-0 translate-x-8 duration-200 delay-0 transition-all pointer-events-none'}`}>
                <NavSidebar active={1} />
                <div className="flex-1 p-5">
                  <h3 className="font-serif text-base font-bold text-[#1A2B48] dark:text-[#D9C1BF] mb-3">Add a Memory</h3>
                  <div className="border-2 border-dashed border-[#5C1A28]/40 rounded-xl p-4 flex flex-col items-center gap-1.5 mb-3 bg-[#FAF3F0] dark:bg-[#5A2532]/20">
                    <UploadIcon className="h-6 w-6 text-[#5C1A28]" />
                    <span className="text-[10px] text-[#5C1A28] font-medium">Drop photos or videos here</span>
                    <span className="text-[9px] text-[#1A2B48]/50 dark:text-[#BF8F8F]">JPG · PNG · MP4</span>
                  </div>
                  <div className="space-y-2">
                    <div className="h-7 rounded-lg border border-[#E8BFB6] dark:border-[#CBA24A]/20 bg-[#FAF3F0] dark:bg-[#5A2532]/40 px-2.5 flex items-center">
                      <span className="text-[9px] text-gray-400 dark:text-[#BF8F8F]">Memory title…</span>
                    </div>
                    <div className="flex gap-2">
                      <div className="h-7 flex-1 rounded-lg border border-[#E8BFB6] dark:border-[#CBA24A]/20 bg-[#FAF3F0] dark:bg-[#5A2532]/40 px-2.5 flex items-center">
                        <CalendarIcon className="h-3 w-3 text-gray-300 dark:text-[#BF8F8F] mr-1" /><span className="text-[9px] text-gray-400 dark:text-[#BF8F8F]">Date</span>
                      </div>
                      <div className="h-7 flex-1 rounded-lg border border-[#E8BFB6] dark:border-[#CBA24A]/20 bg-[#FAF3F0] dark:bg-[#5A2532]/40 px-2.5 flex items-center">
                        <span className="text-[9px] text-gray-400 dark:text-[#BF8F8F]">📍 Location</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex gap-1">
                        {['#beach','#us','#2025'].map(tag => (
                          <span key={tag} className="rounded-full bg-[#5C1A28]/10 px-2 py-0.5 text-[8px] text-[#5C1A28] dark:bg-[#CBA24A]/20 dark:text-[#BF8F8F]">{tag}</span>
                        ))}
                      </div>
                      <div className="h-7 w-24 rounded-lg bg-[#5C1A28] dark:bg-[#CBA24A] flex items-center justify-center text-[9px] text-white font-semibold">Save Memory</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── STEP 2: Relive Together ── */}
              <div className={`absolute inset-0 flex ${activeStep === 2 ? 'opacity-100 translate-x-0 duration-500 delay-150 transition-all' : 'opacity-0 translate-x-8 duration-200 delay-0 transition-all pointer-events-none'}`}>
                <NavSidebar active={0} />
                <div className="flex-1 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-serif text-sm font-bold text-[#1A2B48] dark:text-[#D9C1BF]">Your Timeline</h3>
                    <div className="flex items-center gap-1 text-[9px] text-[#5C1A28] dark:text-[#CBA24A]">
                      <HeartIcon className="h-3 w-3 fill-[#5C1A28] dark:fill-[#CBA24A]" /> 42 memories
                    </div>
                  </div>
                  {/* Three couple photo thumbnails */}
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    {[
                      '/gallery1.jpg',
                      '/gallery2.jpg',
                      '/gallery3.jpg',
                    ].map((src, i) => (
                      <div key={i} className="rounded-xl overflow-hidden h-[85px] bg-[#E8BFB6]/30 dark:bg-[#5A2532]/40">
                        <SafeImage src={src} alt="" className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                  {/* Placeholder content card */}
                  <div className="rounded-xl border border-[#E8BFB6]/70 dark:border-[#CBA24A]/20 bg-[#FEFEFE] dark:bg-[#5A2532]/40 p-3 space-y-1.5">
                    <div className="h-2 rounded-full bg-[#CBA24A]/60 dark:bg-[#CBA24A]/50 w-2/3" />
                    <div className="h-1.5 rounded-full bg-[#1A2B48]/10 dark:bg-[#D9C1BF]/12 w-full" />
                    <div className="h-1.5 rounded-full bg-[#1A2B48]/10 dark:bg-[#D9C1BF]/12 w-5/6" />
                    <div className="h-1.5 rounded-full bg-[#1A2B48]/10 dark:bg-[#D9C1BF]/12 w-4/5" />
                  </div>
                </div>
              </div>

            </div>
            </div>{/* end browser mockup */}

            {/* ── RIGHT: heading + vertical steps ── */}
            <div className="space-y-8">
              <div>
                <span className="text-xs font-semibold uppercase tracking-[0.3em] text-[#5C1A28] dark:text-[#CBA24A]">How Memento Works</span>
                <h2 className="mt-3 font-serif text-3xl font-bold leading-snug text-[#1A2B48] dark:text-[#D9C1BF] md:text-4xl lg:text-[2.5rem]">
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
                          ? 'bg-[#FEFEFE] dark:bg-[#5A2532]/50 border border-[#5C1A28]/25 dark:border-[#CBA24A]/20 shadow-sm'
                          : 'hover:bg-[#FEFEFE]/60 dark:hover:bg-[#5A2532]/20'
                      }`}
                    >
                      <span className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold transition-colors ${
                        isActive
                          ? 'bg-[#5C1A28] text-white dark:bg-[#CBA24A] dark:text-[#2A1218]'
                          : 'border border-[#1A2B48]/20 dark:border-[#CBA24A]/25 text-[#1A2B48]/40 dark:text-[#CBA24A]/50'
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
                        <div className="h-0.5 w-full overflow-hidden rounded-full bg-[#1A2B48]/10 dark:bg-[#CBA24A]/15">
                          <div className="h-full rounded-full bg-[#5C1A28] dark:bg-[#CBA24A]"
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
      <section id="services" ref={servicesReveal} className="reveal bg-[#F8E4DF] py-20 dark:bg-[#2A1218] lg:py-28">
        <div className="mx-auto max-w-5xl px-6">
          <div className="mb-14 text-center">
            <span className="mb-3 inline-block text-xs font-semibold uppercase tracking-[0.2em] text-[#5C1A28] dark:text-[#BF8F8F]">
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
      <section id="showcase" ref={showcaseReveal} className="reveal bg-[#F8E4DF] py-20 dark:bg-[#5A2532] lg:py-28">
        <div className="mx-auto max-w-5xl px-6">
          <div className="mb-14 text-center">
            <span className="mb-3 inline-block text-xs font-semibold uppercase tracking-[0.2em] text-[#5C1A28] dark:text-[#BF8F8F]">
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
      <section ref={ctaReveal} className="reveal bg-[#FDF6F0] py-20 dark:bg-[#2A1218] lg:py-28">
        <div className="mx-auto max-w-2xl px-6 text-center">
          {/* Sparkle icon */}
          <div className="mb-6 flex justify-center">
            <SparklesIcon className="h-8 w-8 text-[#5C1A28]/60 dark:text-[#BF8F8F]/50" />
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
              className="inline-flex items-center gap-2 rounded-xl bg-[#40110D] px-8 py-3.5 text-sm font-semibold text-white transition-all hover:bg-[#591F12] dark:bg-[#CBA24A] dark:text-[#2A1218] dark:hover:bg-[#D4B05A]">
              Start your space
              <ArrowForwardIcon className="h-4 w-4" />
            </button>
            <button type="button" onClick={() => scrollToSection('services')}
              className="rounded-xl border border-[#5C1A28]/40 px-8 py-3.5 text-sm font-semibold text-[#5C1A28] transition-all hover:bg-[#B8863E]/8 dark:border-[#CBA24A]/40 dark:text-[#CBA24A] dark:hover:bg-[#CBA24A]/10">
              Explore features
            </button>
          </div>
          {/* Trust badges */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-[#1A2B48]/45 dark:text-[#CBA24A]/70">
            <span className="flex items-center gap-1.5">
              <span className="text-[#5C1A28]">✓</span> Private by design
            </span>
            <span className="flex items-center gap-1.5">
              <span className="text-[#5C1A28]">✓</span> Free to start
            </span>
            <span className="flex items-center gap-1.5">
              <span className="text-[#5C1A28]">✓</span> For two, forever
            </span>
          </div>
        </div>
      </section>

      <footer className="border-t border-[#E8BFB6]/50 bg-[#F8E4DF] py-4 dark:border-[#CBA24A]/10 dark:bg-[#2A1218]">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-3 px-6 text-sm text-[#1A2B48]/50 dark:text-[#CBA24A]/70">
          <p className="inline-flex items-center gap-1">
            © 2026 Memento · Made with
            <HeartIcon className="h-3.5 w-3.5 text-[#5C1A28] fill-[#5C1A28] dark:text-[#CBA24A] dark:fill-[#CBA24A]" />
          </p>
          <ThemeToggle />
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
