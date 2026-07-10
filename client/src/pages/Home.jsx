import React, { useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { CaptureIcon, HeartIcon, NotesIcon, VideoIcon } from '../components/Icons';

const Petals = () => {
  const petals = useMemo(
    () =>
      Array.from({ length: 24 }, (_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        delay: `${Math.random() * 8}s`,
        duration: `${8 + Math.random() * 10}s`,
        size: 6 + Math.random() * 6,
      })),
    []
  );

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {petals.map((p) => (
        <span
          key={p.id}
          className="petal"
          style={{
            left: p.left,
            animationDelay: p.delay,
            animationDuration: p.duration,
            width: p.size,
            height: p.size * 1.6,
          }}
        />
      ))}
    </div>
  );
};

const Stars = () => {
  const stars = useMemo(
    () =>
      Array.from({ length: 40 }, (_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        size: 1 + Math.random() * 2,
        delay: `${Math.random() * 5}s`,
        duration: `${2 + Math.random() * 4}s`,
      })),
    []
  );

  return (
    <div className="absolute inset-0 pointer-events-none">
      {stars.map((s) => (
        <span
          key={s.id}
          className="star-dot"
          style={{
            left: s.left,
            top: s.top,
            width: s.size,
            height: s.size,
            animationDelay: s.delay,
            animationDuration: s.duration,
          }}
        />
      ))}
    </div>
  );
};

const Home = () => {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add('visible');
        });
      },
      { threshold: 0.15 }
    );

    document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-deep text-cream font-sans" id="home-view">
      {/* Hero */}
      <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-hero-gradient">
        <Petals />
        <Stars />

        <div className="relative z-10 text-center px-6 animate-fade-up max-w-4xl">
          <p className="section-label mb-6">For exactly two hearts</p>
          <h1 className="font-display text-gold-light text-4xl sm:text-6xl md:text-7xl leading-tight mb-3 drop-shadow-lg">
            Memento
          </h1>
          <p className="font-serif italic text-3xl sm:text-5xl md:text-6xl text-white mb-6 leading-none">
            Where love lives forever
          </p>
          <div className="w-32 h-px bg-gradient-to-r from-transparent via-gold to-transparent mx-auto mb-6" />
          <p className="font-serif italic text-rose text-lg sm:text-xl tracking-wide mb-10 opacity-90">
            A private sanctuary for you and your person — to save every smile, every adventure, every whispered &ldquo;I love you&rdquo; 🌸
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <Link to="/login" className="memento-btn w-full sm:w-auto text-center px-10 py-3">
              Enter Our Space
            </Link>
            <Link to="/signup" className="memento-btn-outline w-full sm:w-auto text-center px-10 py-3">
              Begin Together
            </Link>
          </div>
        </div>

        <a
          href="#letter"
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-50 hover:opacity-80 transition-opacity animate-bounce z-10"
        >
          <span className="text-[0.7rem] tracking-[0.3em] uppercase text-gold">Scroll</span>
          <div className="w-5 h-5 border-r border-b border-gold rotate-45" />
        </a>
      </section>

      {/* Love letter */}
      <section id="letter" className="py-24 px-6 bg-section-gradient">
        <div className="max-w-3xl mx-auto text-center reveal opacity-0 translate-y-8 transition-all duration-700">
          <p className="section-label mb-4">A letter from the heart</p>
          <h2 className="font-display text-gold-light text-2xl sm:text-3xl mb-8">
            To the one I chose
          </h2>
          <p className="font-serif text-lg sm:text-xl leading-relaxed text-cream/90 mb-6">
            Some moments are too precious for a camera roll that gets lost in the noise.
            Memento is our little corner of the world — where{' '}
            <em className="text-rose not-italic">ordinary days become treasures</em> and every
            memory we make together has a home.
          </p>
          <div className="w-32 h-px bg-gradient-to-r from-transparent via-gold to-transparent mx-auto my-8" />
          <p className="font-serif text-lg sm:text-xl leading-relaxed text-cream/90 mb-6">
            Upload the photos from that rainy café. Save the video from our first trip.
            Write the story of how we laughed until midnight. Tag it, date it, feel it again —
            just the two of us, always.
          </p>
          <p className="font-serif italic text-gold text-xl mt-10 inline-flex items-center gap-2 justify-center">
            <HeartIcon className="h-5 w-5" /> Forever yours, in every memory we keep
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6 bg-deep-card">
        <div className="max-w-5xl mx-auto reveal opacity-0 translate-y-8 transition-all duration-700">
          <div className="text-center mb-12">
            <p className="section-label mb-3">What we preserve</p>
            <h2 className="font-display text-gold-light text-2xl sm:text-3xl">
              Every chapter of us
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: CaptureIcon,
                title: 'Captured Light',
                text: 'Photos that hold the warmth of a glance, a sunset, a quiet morning together.',
              },
              {
                icon: VideoIcon,
                title: 'Moving Moments',
                text: 'Videos that let us hear our laughter again — even on the days we miss each other most.',
              },
              {
                icon: NotesIcon,
                title: 'Written in Love',
                text: 'Stories, notes, and comments — the words we say when feelings are too big for a caption.',
              },
            ].map((card) => (
              <div
                key={card.title}
                className="memento-card p-8 text-center hover:-translate-y-1.5 hover:border-gold/50 transition-all duration-300"
              >
                <span className="text-3xl block mb-4"><card.icon className="h-8 w-8" /></span>
                <h3 className="font-display text-sm text-gold tracking-wide mb-3">{card.title}</h3>
                <p className="font-serif italic text-cream/80 text-lg leading-relaxed">{card.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quote */}
      <section className="py-20 px-6 bg-deep text-center">
        <blockquote className="max-w-3xl mx-auto reveal opacity-0 translate-y-8 transition-all duration-700 relative px-8">
          <span className="absolute -top-4 left-0 text-7xl text-gold/30 font-serif leading-none">&ldquo;</span>
          <p className="font-serif italic text-2xl sm:text-3xl md:text-4xl text-cream leading-snug">
            The best thing to hold onto in life is each other — and every memory that proves it.
          </p>
          <footer className="mt-8 text-xs tracking-[0.3em] uppercase text-gold/70">
            Our private promise
          </footer>
        </blockquote>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 bg-hero-gradient text-center">
        <div className="max-w-xl mx-auto reveal opacity-0 translate-y-8 transition-all duration-700">
          <p className="text-4xl mb-4 animate-heartbeat inline-flex justify-center"><HeartIcon className="h-10 w-10 text-rose-400" /></p>
          <h2 className="font-display text-gold-light text-2xl sm:text-3xl mb-4">
            Ready to write your story?
          </h2>
          <p className="font-serif italic text-rose text-lg mb-8 opacity-90">
            Just for two. Private forever. Built with love.
          </p>
          <Link to="/signup" className="memento-btn inline-block px-12 py-3 text-base">
            Create Our Memento
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 text-center bg-[#060103] border-t border-gold/10">
        <p className="font-serif italic text-rose opacity-80">
          Made for lovers who never want to forget
        </p>
        <p className="font-display text-gold text-sm mt-3 tracking-widest">Memento</p>
      </footer>

      <style>{`
        .reveal.visible {
          opacity: 1 !important;
          transform: translateY(0) !important;
        }
      `}</style>
    </div>
  );
};

export default Home;
