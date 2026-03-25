import Link from 'next/link';
import Pricing from '@/components/Pricing';

export default function Home() {
  return (
    <div className="min-h-screen relative overflow-hidden">

      {/* ── BACKGROUND LAYERS ── */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute rounded-full" style={{ top: '-20%', left: '-10%', width: '70vw', height: '70vw', background: 'radial-gradient(circle, #f59e0b, transparent 70%)', filter: 'blur(100px)', opacity: 0.06 }} />
        <div className="absolute rounded-full" style={{ top: '5%', right: '-15%', width: '50vw', height: '50vw', background: 'radial-gradient(circle, #f472b6, transparent 70%)', filter: 'blur(80px)', opacity: 0.05 }} />
        <div className="absolute rounded-full" style={{ bottom: '-10%', left: '15%', width: '65vw', height: '45vw', background: 'radial-gradient(circle, #7c3aed, transparent 70%)', filter: 'blur(90px)', opacity: 0.05 }} />
        <div className="absolute inset-0 grid-pattern" style={{ opacity: 0.04 }} />
        <div className="noise-overlay" style={{ opacity: 0.05 }} />
      </div>

      {/* ══════════════════════════════════
          HERO
      ══════════════════════════════════ */}
      <section className="relative z-10 min-h-[100svh] flex flex-col items-center justify-center px-6 pt-24 pb-20 overflow-hidden">

        {/* Floating Polaroids — Left */}
        <div className="absolute left-0 top-0 bottom-0 w-[30%] pointer-events-none hidden xl:flex flex-col items-start justify-center gap-8 pl-12">
          <div className="polaroid-hero" style={{ transform: 'rotate(-12deg) translateX(-15%)', animationDelay: '0s' }}>
            <div className="polaroid-photo" style={{ background: 'linear-gradient(135deg, #8b5e3c 0%, #d4956a 40%, #f5c6a0 100%)' }}>
              <span style={{ fontSize: '1.8rem' }}>📸</span>
            </div>
            <p className="polaroid-caption">Golden Hour</p>
          </div>
          <div className="polaroid-hero" style={{ transform: 'rotate(8deg) translateX(35%)', animationDelay: '2s' }}>
            <div className="polaroid-photo" style={{ background: 'linear-gradient(135deg, #3b1f6a 0%, #7c3aed 50%, #c4b5fd 100%)' }}>
              <span style={{ fontSize: '1.8rem' }}>🥂</span>
            </div>
            <p className="polaroid-caption">Cheers!</p>
          </div>
          <div className="polaroid-hero" style={{ transform: 'rotate(-5deg) translateX(5%)', animationDelay: '4s' }}>
            <div className="polaroid-photo" style={{ background: 'linear-gradient(135deg, #14302a 0%, #2d6a4f 50%, #95d5b2 100%)' }}>
              <span style={{ fontSize: '1.8rem' }}>🎉</span>
            </div>
            <p className="polaroid-caption">First Dance</p>
          </div>
        </div>

        {/* Floating Polaroids — Right */}
        <div className="absolute right-0 top-0 bottom-0 w-[30%] pointer-events-none hidden xl:flex flex-col items-end justify-center gap-8 pr-12">
          <div className="polaroid-hero" style={{ transform: 'rotate(11deg) translateX(20%)', animationDelay: '1s' }}>
            <div className="polaroid-photo" style={{ background: 'linear-gradient(135deg, #7c2d12 0%, #ea580c 50%, #fed7aa 100%)' }}>
              <span style={{ fontSize: '1.8rem' }}>🎊</span>
            </div>
            <p className="polaroid-caption">Party Time!</p>
          </div>
          <div className="polaroid-hero" style={{ transform: 'rotate(-8deg) translateX(-30%)', animationDelay: '2.5s' }}>
            <div className="polaroid-photo" style={{ background: 'linear-gradient(135deg, #831843 0%, #db2777 50%, #fbcfe8 100%)' }}>
              <span style={{ fontSize: '1.8rem' }}>💕</span>
            </div>
            <p className="polaroid-caption">With Love</p>
          </div>
          <div className="polaroid-hero" style={{ transform: 'rotate(5deg) translateX(15%)', animationDelay: '3.5s' }}>
            <div className="polaroid-photo" style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #2563eb 50%, #bfdbfe 100%)' }}>
              <span style={{ fontSize: '1.8rem' }}>🎓</span>
            </div>
            <p className="polaroid-caption">We Did It!</p>
          </div>
        </div>

        {/* Center Content */}
        <div className="relative z-10 flex flex-col items-center text-center max-w-3xl mx-auto">
          <div className="hero-badge fade-in-up mb-10">
            <span className="badge-dot" />
            Free for your next event
          </div>

          <h1 className="hero-title fade-in-up-delay-1 mb-6">
            <span className="block">Every Memory</span>
            <em className="hero-title-accent not-italic">Preserved.</em>
          </h1>

          <p className="hero-desc fade-in-up-delay-2 mb-12 mx-auto" style={{ maxWidth: '38ch' }}>
            Guests scan a QR code, snap photos, and watch them appear
            live in a beautiful polaroid gallery — zero app needed.
          </p>

          <div className="fade-in-up-delay-3 flex flex-col sm:flex-row gap-4 items-center">
            <Link href="/create" className="btn-hero-primary">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" className="mr-2 flex-shrink-0">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
              Create Your Wall
            </Link>
            <a href="#how" className="btn-hero-ghost">
              See How It Works
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="ml-2">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </a>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-36 pointer-events-none" style={{ background: 'linear-gradient(to top, #07050c, transparent)' }} />
      </section>

      {/* ══════════════════════════════════
          STATS
      ══════════════════════════════════ */}
      <section className="relative z-10 w-full flex justify-center px-6 pb-28">
        <div className="stats-strip">
          {[
            { value: '∞',     label: 'Photos per wall' },
            { value: '0s',    label: 'App install time' },
            { value: '< 3s',  label: 'Upload speed' },
            { value: '100%',  label: 'Free to start' },
          ].map((stat, i) => (
            <div key={i} className="flex items-center">
              {i > 0 && <div className="stat-divider" />}
              <div className="stat-item">
                <div className="stat-value">{stat.value}</div>
                <div className="stat-label">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════
          HOW IT WORKS
      ══════════════════════════════════ */}
      <section id="how" className="relative z-10 w-full flex flex-col items-center px-6 py-28">
        <div className="section-tag">How it works</div>
        <h2 className="section-title mb-5">
          Three steps. <span className="gradient-text">That's it.</span>
        </h2>
        <p className="text-center mb-20" style={{ color: '#6b6070', fontSize: '0.95rem', maxWidth: '34ch' }}>
          No downloads. No accounts. No friction.
        </p>

        <div className="relative w-full max-w-5xl">
          <div
            className="absolute top-[3.5rem] left-[22%] right-[22%] h-px hidden md:block"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(245,158,11,0.25) 30%, rgba(245,158,11,0.25) 70%, transparent)' }}
          />
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { n: '01', icon: '🎉', title: 'Create Your Event',    desc: 'Name it, choose a theme, and get a shareable QR code in under a minute.' },
              { n: '02', icon: '📲', title: 'Guests Scan & Share',  desc: 'No app download. No login. Just scan and upload — done in seconds.' },
              { n: '03', icon: '✨', title: 'Watch It Come Alive',  desc: 'Every photo streams live into a stunning polaroid gallery for all to enjoy.' },
            ].map((step) => (
              <div key={step.n} className="step-card group">
                <span className="step-number">{step.n}</span>
                <div className="step-icon-wrap">
                  <span className="text-2xl group-hover:scale-110 transition-transform inline-block">{step.icon}</span>
                </div>
                <h3 className="step-title">{step.title}</h3>
                <p className="step-desc">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════
          FEATURES BENTO
      ══════════════════════════════════ */}
      <section className="relative z-10 w-full flex flex-col items-center px-6 py-28">
        <div className="section-tag">Features</div>
        <h2 className="section-title mb-16">
          Everything <span className="gradient-text">built in.</span>
        </h2>

        <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-12 gap-4">

          {/* Hero feature card */}
          <div className="md:col-span-7 feature-card-hero group">
            <div className="feature-icon-lg">📺</div>
            <h3 className="feature-title-lg">Live Slideshow Mode</h3>
            <p className="feature-desc-lg">
              Auto-plays on any screen in real-time. Open on a TV or
              projector — your guests will be amazed.
            </p>
            <div className="slideshow-mockup">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse flex-shrink-0" />
                <span style={{ fontSize: '0.68rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(245,158,11,0.55)', fontWeight: 600 }}>Live Now</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { bg: 'linear-gradient(135deg,#4a1830,#c2185b)', emoji: '💒' },
                  { bg: 'linear-gradient(135deg,#1a3a2a,#2d8a5f)', emoji: '🎂' },
                  { bg: 'linear-gradient(135deg,#1a2a5e,#1565c0)', emoji: '🏖️' },
                ].map((item, i) => (
                  <div key={i} className="h-16 rounded-lg flex items-center justify-center text-xl" style={{ background: item.bg }}>
                    {item.emoji}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right column — 2 tall cards */}
          <div className="md:col-span-5 grid grid-rows-2 gap-4">
            <div className="feature-card group">
              <div className="feature-icon">📷</div>
              <h4 className="feature-title">Polaroid Gallery</h4>
              <p className="feature-desc">Framed, nostalgic photos with captions and gentle float animations.</p>
            </div>
            <div className="feature-card group" style={{ borderColor: 'rgba(244,114,182,0.12)' }}>
              <div className="feature-icon" style={{ background: 'rgba(244,114,182,0.08)', borderColor: 'rgba(244,114,182,0.14)' }}>🔒</div>
              <h4 className="feature-title">Private Walls</h4>
              <p className="feature-desc">Password-protect your wall with guest approval controls.</p>
            </div>
          </div>

          {/* Bottom row — 4 small cards */}
          {[
            { icon: '📱', title: 'Mobile First',      desc: 'Each guest gets their own personal photo page.',           border: 'rgba(16,185,129,0.12)',  iconBg: 'rgba(16,185,129,0.08)'  },
            { icon: '🎊', title: 'Confetti Bursts',   desc: 'Celebration animations trigger on each new upload.',      border: 'rgba(251,191,36,0.12)',  iconBg: 'rgba(251,191,36,0.08)'  },
            { icon: '🛡️', title: 'Moderation',        desc: 'Approve or remove any photo instantly.',                  border: 'rgba(139,92,246,0.12)',  iconBg: 'rgba(139,92,246,0.08)'  },
            { icon: '⚡', title: 'Real-time Updates', desc: "Zero delay — photos stream as they're uploaded.",         border: 'rgba(249,115,22,0.12)',  iconBg: 'rgba(249,115,22,0.08)'  },
          ].map((f, i) => (
            <div key={i} className="md:col-span-3 feature-card group" style={{ borderColor: f.border }}>
              <div className="feature-icon" style={{ background: f.iconBg, borderColor: f.border }}>{f.icon}</div>
              <h4 className="feature-title">{f.title}</h4>
              <p className="feature-desc">{f.desc}</p>
            </div>
          ))}

        </div>
      </section>

      {/* ══════════════════════════════════
          USE CASES — Scrolling Marquee
      ══════════════════════════════════ */}
      <section className="relative z-10 w-full py-24 overflow-hidden">
        <div className="text-center mb-14 px-6">
          <div className="section-tag" style={{ justifyContent: 'center' }}>Perfect for</div>
          <h2 className="section-title mt-2">
            Every <span className="gradient-text">Occasion.</span>
          </h2>
        </div>

        <div className="marquee-track mb-3">
          <div className="marquee-inner">
            {['Weddings','Birthdays','Conferences','Graduations','Reunions','Festivals','Parties','Workshops','Concerts','School Events',
              'Weddings','Birthdays','Conferences','Graduations','Reunions','Festivals','Parties','Workshops','Concerts','School Events'].map((tag, i) => (
              <span key={i} className="marquee-tag">{tag}</span>
            ))}
          </div>
        </div>

        <div className="marquee-track marquee-reverse">
          <div className="marquee-inner">
            {['Corporate Events','Baby Showers','Engagements','Award Nights','Sports Events','Art Shows','Fundraisers','Trade Shows','Family Gatherings','Holiday Parties',
              'Corporate Events','Baby Showers','Engagements','Award Nights','Sports Events','Art Shows','Fundraisers','Trade Shows','Family Gatherings','Holiday Parties'].map((tag, i) => (
              <span key={i} className="marquee-tag marquee-tag-alt">{tag}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════
          PRICING
      ══════════════════════════════════ */}
      <Pricing />

      {/* ══════════════════════════════════
          CTA
      ══════════════════════════════════ */}
      <section className="relative z-10 w-full px-6 py-32 flex justify-center">
        <div className="cta-card max-w-2xl w-full text-center relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-[32px]">
            <div className="absolute rounded-full" style={{ top: '-60%', left: '-20%', width: '70%', height: '130%', background: 'radial-gradient(circle,#f59e0b,transparent 70%)', filter: 'blur(50px)', opacity: 0.14 }} />
            <div className="absolute rounded-full" style={{ top: '-40%', right: '-20%', width: '60%', height: '110%', background: 'radial-gradient(circle,#f472b6,transparent 70%)', filter: 'blur(50px)', opacity: 0.10 }} />
          </div>
          <div className="relative z-10 py-16 px-8 sm:px-16">
            <div className="text-5xl mb-6" aria-hidden>✨</div>
            <h2 className="cta-title">
              Start for free.
              <br />
              <span className="gradient-text">No card needed.</span>
            </h2>
            <p className="cta-desc mb-10 mt-4">Zero friction. Your wall is live in under a minute.</p>
            <Link href="/create" className="btn-hero-primary" style={{ fontSize: '1rem', padding: '1rem 2.75rem' }}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" className="mr-2 flex-shrink-0">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
              Create Your Wall — It's Free
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════
          FOOTER
      ══════════════════════════════════ */}
      <footer className="relative z-10 py-12" style={{ borderTop: '1px solid rgba(245,158,11,0.08)' }}>
        <div className="max-w-5xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold shadow-lg" style={{ background: 'linear-gradient(135deg,#f59e0b,#f472b6)', color: '#0a0600' }}>M</div>
            <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.15rem', fontWeight: 600, color: '#f5f0e8', letterSpacing: '0.02em' }}>Memento</span>
          </div>
          <p style={{ fontSize: '0.82rem', color: '#4a4050' }}>© {new Date().getFullYear()} Memento — Share Every Moment</p>
          <div className="flex gap-6" style={{ fontSize: '0.82rem', color: '#4a4050' }}>
            {['Privacy', 'Terms', 'Contact'].map((link) => (
              <a key={link} href="#" className="footer-link">
                {link}
              </a>
            ))}
          </div>
        </div>
      </footer>

    </div>
  );
}