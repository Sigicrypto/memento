import Link from 'next/link';
import Pricing from '@/components/Pricing';

export default function Home() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="fixed inset-0 aurora-bg pointer-events-none" />
      <div className="fixed inset-0 grid-pattern pointer-events-none" />
      <div className="noise-overlay" />

      {/* Ambient Glows */}
      <div className="glow-orb w-[600px] h-[600px] bg-purple-500/10 top-[-200px] left-[-100px]" />
      <div className="glow-orb w-[600px] h-[600px] bg-cyan-500/5 bottom-[-100px] right-[-100px]" />

      {/* ═══ HERO ═══ */}
      <section className="relative z-10 w-full flex flex-col items-center text-center px-6 pt-32 pb-24">
        {/* Floating polaroids showcase */}
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
          <div className="absolute top-1/4 left-[8%] w-44 h-52 glass rounded-2xl rotate-[-12deg] p-3 shadow-2x opacity-40 xl:opacity-100 float">
            <div className="w-full h-36 bg-gradient-to-br from-pink-500/10 to-purple-500/10 rounded-lg flex items-center justify-center text-3xl">📸</div>
            <p className="text-[10px] text-center mt-2 font-medium tracking-wide text-gray-600 dark:text-gray-300">Wedding Vibes</p>
          </div>
          <div className="absolute top-1/3 right-[8%] w-52 h-60 glass rounded-2xl rotate-[8deg] p-4 shadow-2x opacity-30 xl:opacity-100 float" style={{ animationDelay: '2s' }}>
            <div className="w-full h-44 bg-gradient-to-br from-cyan-500/10 to-purple-500/10 rounded-lg flex items-center justify-center text-3xl">🎉</div>
            <p className="text-[10px] text-center mt-2 font-medium tracking-wide text-gray-600 dark:text-gray-300">Dance Floor!</p>
          </div>
        </div>

        <div className="fade-in-up inline-flex items-center gap-2 px-4 py-2 rounded-full border border-purple-300 dark:border-purple-700 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-300 text-xs font-medium mb-8 relative z-10">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
          Free for your next event
        </div>

        <h1
          className="fade-in-up-delay-1 font-extrabold tracking-tight text-gray-900 dark:text-white max-w-4xl mb-6"
          style={{ fontSize: 'clamp(3rem, 8vw, 5.5rem)', lineHeight: '1.15' }}
        >
          Share Every <span className="gradient-text">Moment.</span>
        </h1>

        <p className="fade-in-up-delay-2 text-xl text-gray-500 dark:text-gray-400 max-w-sm mb-10" style={{ lineHeight: '1.7' }}>
          Guests scan a QR code, upload photos, and watch them appear live.
        </p>

        <div className="fade-in-up-delay-3 flex flex-col sm:flex-row gap-4">
          <Link href="/create" className="btn-primary text-base px-12 py-4 glow-purple">
            ✨ Create Your Wall
          </Link>
          <a href="#how" className="btn-secondary text-base px-12 py-4">
            How It Works
          </a>
        </div>
      </section>

      {/* ═══ STATS ═══ */}
      <section className="relative z-10 w-full flex justify-center px-6 pb-32">
        <div className="glass rounded-2xl py-12 px-12 flex flex-wrap justify-center gap-16 w-full max-w-2xl">
          {[
            { value: '∞', label: 'Photos' },
            { value: '0', label: 'App needed' },
            { value: '< 3s', label: 'Upload' },
            { value: 'Live', label: 'Updates' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-3xl font-bold gradient-text">{stat.value}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ HOW IT WORKS ═══ */}
      <section id="how" className="relative z-10 w-full flex flex-col items-center px-6 py-32">
        <p className="text-cyan-500 text-sm font-semibold uppercase tracking-widest mb-5">How it works</p>
        <h2
          className="font-bold text-gray-900 dark:text-white mb-20 text-center"
          style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', lineHeight: '1.25' }}
        >
          Three steps. <span className="gradient-text">That's it.</span>
        </h2>

        <div className="grid md:grid-cols-3 gap-10 w-full max-w-4xl">
          {[
            { step: '01', icon: '🎉', title: 'Create', desc: 'Name your event. Get a QR code.' },
            { step: '02', icon: '📱', title: 'Scan & Upload', desc: 'Guests scan and add photos instantly.' },
            { step: '03', icon: '🖼️', title: 'Go Live', desc: 'Your wall updates in real time.' },
          ].map((item) => (
            <div key={item.step} className="relative p-[1px] rounded-3xl bg-gradient-to-br from-purple-500/20 to-indigo-500/10 shadow-lg hover:shadow-xl transition-all duration-500 hover:scale-[1.02] hover:-translate-y-1">
              <div className="flex flex-col justify-between overflow-hidden relative h-full bg-white/95 dark:bg-purple-950/40 backdrop-blur-xl group" style={{ padding: '2rem', borderRadius: '23px' }}>
                <div className="absolute top-0 right-0 text-[80px] font-black text-purple-500/10 dark:text-purple-500/5 leading-none select-none">
                  {item.step}
                </div>
                <div className="relative z-10">
                  <div className="text-4xl mb-6">{item.icon}</div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white" style={{ marginBottom: '0.75rem', lineHeight: '1.4' }}>{item.title}</h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm" style={{ lineHeight: '1.7' }}>{item.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ FEATURES ═══ */}
      <section className="relative z-10 w-full flex flex-col items-center px-6 py-32">
        <p className="text-pink-500 text-sm font-semibold uppercase tracking-widest mb-5">Features</p>
        <h2
          className="font-bold text-gray-900 dark:text-white mb-20 text-center"
          style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', lineHeight: '1.25' }}
        >
          Everything <span className="gradient-text">included.</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl px-4">
          {/* Main Feature / Large Card */}
          <div className="md:col-span-2 md:row-span-2 relative p-[1px] rounded-3xl bg-gradient-to-br from-purple-500/30 to-pink-500/20 shadow-lg hover:shadow-xl transition-all duration-500 hover:scale-[1.01] hover:-translate-y-1">
            <div className="flex flex-col justify-between overflow-hidden relative h-full bg-white/95 dark:bg-purple-950/40 backdrop-blur-xl group" style={{ padding: '2rem', borderRadius: '23px' }}>
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-pink-500/5 pointer-events-none" />
              <div className="relative z-10 flex flex-col h-full justify-between">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-2xl mb-4">📺</div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Slideshow Mode</h3>
                  <p className="text-gray-500 dark:text-gray-400 max-w-md">Auto-plays on any screen in real-time. Simply open the URL on a TV or projector for immersive views.</p>
                </div>
                {/* Visual mockup inside card */}
                <div className="mt-8 glass rounded-xl border border-purple-500/10 p-4 transform group-hover:scale-[1.01] transition-all shadow-inner">
                  <div className="w-full h-32 bg-gradient-to-r from-purple-900/30 to-cyan-900/30 rounded-lg flex items-center justify-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-gray-200">Live Slideshow preview</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="relative p-[1px] rounded-3xl bg-gradient-to-br from-cyan-500/20 to-purple-500/10 shadow-lg hover:shadow-xl transition-all duration-500 hover:scale-[1.02] hover:-translate-y-1">
            <div className="flex flex-col justify-between overflow-hidden h-full bg-white/95 dark:bg-purple-950/40 backdrop-blur-xl group" style={{ padding: '2rem', borderRadius: '23px' }}>
              <div>
                <div className="w-11 h-11 rounded-xl bg-cyan-500/10 flex items-center justify-center text-xl mb-4">📷</div>
                <h4 className="font-bold text-gray-900 dark:text-white text-lg">Polaroid View</h4>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">Framed photos with captions for a nostalgic live gallery.</p>
              </div>
            </div>
          </div>

          <div className="relative p-[1px] rounded-3xl bg-gradient-to-br from-pink-500/20 to-purple-500/10 shadow-lg hover:shadow-xl transition-all duration-500 hover:scale-[1.02] hover:-translate-y-1">
            <div className="flex flex-col justify-between overflow-hidden h-full bg-white/95 dark:bg-purple-950/40 backdrop-blur-xl group" style={{ padding: '2rem', borderRadius: '23px' }}>
              <div>
                <div className="w-11 h-11 rounded-xl bg-pink-500/10 flex items-center justify-center text-xl mb-4">🔒</div>
                <h4 className="font-bold text-gray-900 dark:text-white text-lg">Private Wall</h4>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">Optional guest password and wall locking features.</p>
              </div>
            </div>
          </div>

          <div className="relative p-[1px] rounded-3xl bg-gradient-to-br from-yellow-500/20 to-purple-500/10 shadow-lg hover:shadow-xl transition-all duration-500 hover:scale-[1.02] hover:-translate-y-1">
            <div className="flex flex-col justify-between overflow-hidden h-full bg-white/95 dark:bg-purple-950/40 backdrop-blur-xl group" style={{ padding: '2rem', borderRadius: '23px' }}>
              <div>
                <div className="w-11 h-11 rounded-xl bg-yellow-500/10 flex items-center justify-center text-xl mb-4">🛡️</div>
                <h4 className="font-bold text-gray-900 dark:text-white text-lg">Moderation</h4>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">Approve or remove any photo from the wall anytime.</p>
              </div>
            </div>
          </div>

          <div className="relative p-[1px] rounded-3xl bg-gradient-to-br from-purple-500/20 to-indigo-500/10 shadow-lg hover:shadow-xl transition-all duration-500 hover:scale-[1.02] hover:-translate-y-1">
            <div className="flex flex-col justify-between overflow-hidden h-full bg-white/95 dark:bg-purple-950/40 backdrop-blur-xl group" style={{ padding: '2rem', borderRadius: '23px' }}>
              <div>
                <div className="w-11 h-11 rounded-xl bg-purple-500/10 flex items-center justify-center text-xl mb-4">⚡</div>
                <h4 className="font-bold text-gray-900 dark:text-white text-lg">Instant Updates</h4>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">Zero refresh, live updates streaming over websockets.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ USE CASES ═══ */}
      <section className="relative z-10 w-full flex flex-col items-center px-6 py-24 text-center">
        <h2
          className="font-bold text-gray-900 dark:text-white"
          style={{ fontSize: 'clamp(1.75rem, 4vw, 2.75rem)', lineHeight: '1.3', marginBottom: '3rem' }}
        >
          For Every Occasion
        </h2>
        <div className="flex flex-wrap justify-center gap-4 max-w-2xl">
          {['Weddings', 'Birthdays', 'Conferences', 'Festivals', 'Graduations', 'Reunions', 'Parties', 'Workshops', 'School Events'].map((tag) => (
            <span key={tag} className="px-5 py-3 rounded-full text-xs font-medium bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-300 border border-purple-200 dark:border-purple-800 hover:border-purple-400 dark:hover:border-purple-600 transition-all cursor-default">
              {tag}
            </span>
          ))}
        </div>
      </section>

      <Pricing />

      {/* ═══ CTA ═══ */}
      <section className="relative z-10 w-full flex justify-center px-6 py-32">
        <div className="relative p-[1px] rounded-3xl bg-gradient-to-br from-purple-600 via-purple-500 to-cyan-400 shadow-2xl glow-purple-lg max-w-xl w-full text-center group">
          <div className="bg-white/95 dark:bg-purple-950/60 backdrop-blur-xl relative overflow-hidden h-full" style={{ padding: '4rem', borderRadius: '23px' }}>
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-cyan-500/10 pointer-events-none" />
            <div className="relative z-10">
              <h2
                className="font-bold text-gray-900 dark:text-white"
                style={{ fontSize: 'clamp(2rem, 4vw, 2.75rem)', lineHeight: '1.3', marginBottom: '1rem' }}
              >
                <span className="gradient-text">Start for free.</span>
              </h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm" style={{ lineHeight: '1.7', marginBottom: '2.5rem' }}>
                No credit card. No app. No friction.
              </p>
              <Link href="/create" className="btn-primary text-base px-12 py-4">
                ✨ Create Your Wall
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="relative z-10 border-t border-gray-200 dark:border-gray-800 py-12">
        <div className="max-w-4xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-gradient-to-br from-purple-600 to-cyan-500 flex items-center justify-center text-white text-[10px] font-bold">M</div>
            <span className="text-sm text-gray-600 dark:text-gray-400">Memento</span>
          </div>
          <p className="text-xs text-gray-500">© {new Date().getFullYear()} Memento</p>
        </div>
      </footer>
    </div>
  );
}