import Link from 'next/link';
import Pricing from '@/components/Pricing';

export default function Home() {
  return (
    <div className="min-h-screen relative overflow-hidden bg-gray-950">
      {/* Enhanced dark background with more layers */}
      <div className="fixed inset-0 bg-gradient-to-br from-gray-950 via-purple-950/20 to-gray-900 pointer-events-none" />
      <div className="fixed inset-0 aurora-bg pointer-events-none opacity-60" />
      <div className="fixed inset-0 grid-pattern pointer-events-none opacity-30" />
      <div className="noise-overlay opacity-20" />

      {/* More ambient glows for depth */}
      <div className="glow-orb w-[800px] h-[800px] bg-purple-600/15 top-[-300px] left-[-200px] blur-3xl" />
      <div className="glow-orb w-[600px] h-[600px] bg-cyan-600/10 bottom-[-200px] right-[-100px] blur-2xl" />
      <div className="glow-orb w-[400px] h-[400px] bg-pink-600/8 top-1/2 left-1/2 blur-xl" />

      {/* ═══ HERO ═══ */}
      <section className="relative z-10 w-full flex flex-col items-center text-center px-6 pt-32 pb-24">
        {/* Enhanced floating polaroids showcase */}
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
          <div className="absolute top-1/4 left-[5%] w-48 h-56 glass rounded-2xl rotate-[-15deg] p-3 shadow-2xl opacity-60 xl:opacity-90 float">
            <div className="w-full h-40 bg-gradient-to-br from-pink-500/20 to-purple-500/20 rounded-lg flex items-center justify-center text-4xl">📸</div>
            <p className="text-[10px] text-center mt-2 font-medium tracking-wide text-gray-300">Wedding Vibes</p>
          </div>
          <div className="absolute top-1/3 right-[5%] w-56 h-64 glass rounded-2xl rotate-[12deg] p-4 shadow-2xl opacity-50 xl:opacity-80 float" style={{ animationDelay: '2s' }}>
            <div className="w-full h-48 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-lg flex items-center justify-center text-4xl">🎉</div>
            <p className="text-[10px] text-center mt-2 font-medium tracking-wide text-gray-300">Dance Floor!</p>
          </div>
          <div className="absolute top-1/2 left-[15%] w-44 h-52 glass rounded-2xl rotate-[-8deg] p-3 shadow-2xl opacity-40 xl:opacity-70 float" style={{ animationDelay: '4s' }}>
            <div className="w-full h-36 bg-gradient-to-br from-amber-500/20 to-pink-500/20 rounded-lg flex items-center justify-center text-4xl">🥂</div>
            <p className="text-[10px] text-center mt-2 font-medium tracking-wide text-gray-300">Cheers!</p>
          </div>
          <div className="absolute top-1/4 right-[20%] w-40 h-48 glass rounded-2xl rotate-[6deg] p-3 shadow-2xl opacity-30 xl:opacity-60 float" style={{ animationDelay: '1s' }}>
            <div className="w-full h-32 bg-gradient-to-br from-green-500/20 to-cyan-500/20 rounded-lg flex items-center justify-center text-4xl">🎊</div>
            <p className="text-[10px] text-center mt-2 font-medium tracking-wide text-gray-300">Party Time</p>
          </div>
        </div>

        <div className="fade-in-up inline-flex items-center gap-2 px-6 py-3 rounded-full border border-purple-400/30 bg-purple-900/30 backdrop-blur-sm text-purple-300 text-xs font-medium mb-8 relative z-10 shadow-lg">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span className="text-cyan-300">✨</span> Free for your next event
        </div>

        <h1
          className="fade-in-up-delay-1 font-extrabold tracking-tight text-white max-w-5xl mb-6"
          style={{ fontSize: 'clamp(3.5rem, 9vw, 6.5rem)', lineHeight: '1.1' }}
        >
          Share Every <span className="gradient-text">Moment.</span>
        </h1>

        <p className="fade-in-up-delay-2 text-xl text-gray-300 max-w-lg mb-12" style={{ lineHeight: '1.7' }}>
          Guests scan a QR code, upload photos, and watch them appear live in beautiful polaroid galleries.
        </p>

        <div className="fade-in-up-delay-3 flex flex-col sm:flex-row gap-4">
          <Link href="/create" className="btn-primary text-base px-14 py-4 glow-purple shadow-2xl">
            <span className="mr-2">✨</span> Create Your Wall
          </Link>
          <a href="#how" className="btn-secondary text-base px-14 py-4 bg-gray-800/50 backdrop-blur-sm border-gray-700/50 text-gray-200 hover:bg-gray-700/50">
            <span className="mr-2">📖</span> How It Works
          </a>
          </a>
        </div>
      </section>

      {/* ═══ STATS ═══ */}
      <section className="relative z-10 w-full flex justify-center px-6 pb-32">
        <div className="glass rounded-3xl py-16 px-16 flex flex-wrap justify-center gap-20 w-full max-w-3xl shadow-2xl backdrop-blur-xl bg-gray-900/30 border border-purple-500/20">
          {[
            { value: '∞', label: 'Photos', icon: '📸' },
            { value: '0', label: 'App needed', icon: '📱' },
            { value: '< 3s', label: 'Upload', icon: '⚡' },
            { value: 'Live', label: 'Updates', icon: '🔴' },
          ].map((stat) => (
            <div key={stat.label} className="text-center group">
              <div className="text-4xl mb-2 group-hover:scale-110 transition-transform">{stat.icon}</div>
              <p className="text-4xl font-bold gradient-text">{stat.value}</p>
              <p className="text-sm text-gray-400 mt-2 font-medium">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ HOW IT WORKS ═══ */}
      <section id="how" className="relative z-10 w-full flex flex-col items-center px-6 py-32">
        <p className="text-cyan-400 text-sm font-semibold uppercase tracking-widest mb-6">How it works</p>
        <h2
          className="font-bold text-white mb-20 text-center"
          style={{ fontSize: 'clamp(2.5rem, 6vw, 4rem)', lineHeight: '1.2' }}
        >
          Three steps. <span className="gradient-text">That's it.</span>
        </h2>

        <div className="grid md:grid-cols-3 gap-12 w-full max-w-5xl">
          {[
            { step: '01', icon: '🎉', title: 'Create', desc: 'Name your event. Get a QR code instantly.' },
            { step: '02', icon: '📱', title: 'Scan & Upload', desc: 'Guests scan and add photos in seconds.' },
            { step: '03', icon: '🖼️', title: 'Go Live', desc: 'Your wall updates in real-time with beautiful polaroids.' },
          ].map((item) => (
            <div key={item.step} className="relative p-[1px] rounded-3xl bg-gradient-to-br from-purple-500/30 to-indigo-500/20 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-[1.03] hover:-translate-y-2">
              <div className="flex flex-col justify-between overflow-hidden relative h-full bg-gray-900/40 backdrop-blur-xl group" style={{ padding: '2.5rem', borderRadius: '23px' }}>
                <div className="absolute top-0 right-0 text-[100px] font-black text-purple-500/10 leading-none select-none">
                  {item.step}
                </div>
                <div className="relative z-10">
                  <div className="text-5xl mb-6 group-hover:scale-110 transition-transform">{item.icon}</div>
                  <h3 className="text-2xl font-bold text-white mb-3" style={{ lineHeight: '1.4' }}>{item.title}</h3>
                  <p className="text-gray-300 text-sm" style={{ lineHeight: '1.7' }}>{item.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ FEATURES ═══ */}
      <section className="relative z-10 w-full flex flex-col items-center px-6 py-32">
        <p className="text-pink-400 text-sm font-semibold uppercase tracking-widest mb-6">Features</p>
        <h2
          className="font-bold text-white mb-20 text-center"
          style={{ fontSize: 'clamp(2.5rem, 6vw, 4rem)', lineHeight: '1.2' }}
        >
          Everything <span className="gradient-text">included.</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl px-4">
          {/* Main Feature / Large Card */}
          <div className="md:col-span-2 md:row-span-2 relative p-[1px] rounded-3xl bg-gradient-to-br from-purple-500/40 to-pink-500/30 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-[1.02] hover:-translate-y-2">
            <div className="flex flex-col justify-between overflow-hidden relative h-full bg-gray-900/40 backdrop-blur-xl group" style={{ padding: '2.5rem', borderRadius: '23px' }}>
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-pink-500/10 pointer-events-none" />
              <div className="relative z-10 flex flex-col h-full justify-between">
                <div>
                  <div className="w-14 h-14 rounded-xl bg-purple-500/20 flex items-center justify-center text-3xl mb-4">📺</div>
                  <h3 className="text-3xl font-bold text-white mb-3">Slideshow Mode</h3>
                  <p className="text-gray-300 max-w-md text-lg">Auto-plays on any screen in real-time. Simply open the URL on a TV or projector for immersive views.</p>
                </div>
                {/* Visual mockup inside card */}
                <div className="mt-8 glass rounded-xl border border-purple-500/20 p-4 transform group-hover:scale-[1.02] transition-all shadow-inner">
                  <div className="w-full h-36 bg-gradient-to-r from-purple-900/40 to-cyan-900/40 rounded-lg flex items-center justify-center gap-3">
                    <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-sm font-semibold uppercase tracking-wider text-gray-200">Live Slideshow</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="relative p-[1px] rounded-3xl bg-gradient-to-br from-cyan-500/30 to-purple-500/20 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-[1.03] hover:-translate-y-1">
            <div className="flex flex-col justify-between overflow-hidden h-full bg-gray-900/40 backdrop-blur-xl group" style={{ padding: '2rem', borderRadius: '23px' }}>
              <div>
                <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">📷</div>
                <h4 className="font-bold text-white text-xl mb-2">Polaroid View</h4>
                <p className="text-gray-300 text-sm">Framed photos with captions for a nostalgic live gallery.</p>
              </div>
            </div>
          </div>

          <div className="relative p-[1px] rounded-3xl bg-gradient-to-br from-pink-500/30 to-purple-500/20 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-[1.03] hover:-translate-y-1">
            <div className="flex flex-col justify-between overflow-hidden h-full bg-gray-900/40 backdrop-blur-xl group" style={{ padding: '2rem', borderRadius: '23px' }}>
              <div>
                <div className="w-12 h-12 rounded-xl bg-pink-500/20 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">🔒</div>
                <h4 className="font-bold text-white text-xl mb-2">Private Wall</h4>
                <p className="text-gray-300 text-sm">Optional guest password and wall locking features.</p>
              </div>
            </div>
          </div>

          <div className="relative p-[1px] rounded-3xl bg-gradient-to-br from-green-500/30 to-cyan-500/20 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-[1.03] hover:-translate-y-1">
            <div className="flex flex-col justify-between overflow-hidden h-full bg-gray-900/40 backdrop-blur-xl group" style={{ padding: '2rem', borderRadius: '23px' }}>
              <div>
                <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">📱</div>
                <h4 className="font-bold text-white text-xl mb-2">Mobile View</h4>
                <p className="text-gray-300 text-sm">Personal photo page for each guest with filtering.</p>
              </div>
            </div>
          </div>

          <div className="relative p-[1px] rounded-3xl bg-gradient-to-br from-amber-500/30 to-pink-500/20 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-[1.03] hover:-translate-y-1">
            <div className="flex flex-col justify-between overflow-hidden h-full bg-gray-900/40 backdrop-blur-xl group" style={{ padding: '2rem', borderRadius: '23px' }}>
              <div>
                <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">🎊</div>
                <h4 className="font-bold text-white text-xl mb-2">Confetti</h4>
                <p className="text-gray-300 text-sm">Celebration animations when new photos arrive.</p>
              </div>
            </div>
          </div>

          <div className="relative p-[1px] rounded-3xl bg-gradient-to-br from-yellow-500/30 to-purple-500/20 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-[1.03] hover:-translate-y-1">
            <div className="flex flex-col justify-between overflow-hidden h-full bg-gray-900/40 backdrop-blur-xl group" style={{ padding: '2rem', borderRadius: '23px' }}>
              <div>
                <div className="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">🛡️</div>
                <h4 className="font-bold text-white text-xl mb-2">Moderation</h4>
                <p className="text-gray-300 text-sm">Approve or remove any photo from the wall anytime.</p>
              </div>
            </div>
          </div>

          <div className="relative p-[1px] rounded-3xl bg-gradient-to-br from-purple-500/30 to-indigo-500/20 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-[1.03] hover:-translate-y-1">
            <div className="flex flex-col justify-between overflow-hidden h-full bg-gray-900/40 backdrop-blur-xl group" style={{ padding: '2rem', borderRadius: '23px' }}>
              <div>
                <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">⚡</div>
                <h4 className="font-bold text-white text-xl mb-2">Instant Updates</h4>
                <p className="text-gray-300 text-sm">Zero refresh, live updates streaming in real-time.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ USE CASES ═══ */}
      <section className="relative z-10 w-full flex flex-col items-center px-6 py-32 text-center">
        <h2
          className="font-bold text-white"
          style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', lineHeight: '1.2', marginBottom: '3rem' }}
        >
          For Every <span className="gradient-text">Occasion</span>
        </h2>
        <div className="flex flex-wrap justify-center gap-4 max-w-3xl">
          {['Weddings', 'Birthdays', 'Conferences', 'Festivals', 'Graduations', 'Reunions', 'Parties', 'Workshops', 'School Events'].map((tag) => (
            <span key={tag} className="px-6 py-3 rounded-full text-sm font-medium bg-gray-800/50 backdrop-blur-sm text-gray-200 border border-gray-700/50 hover:border-purple-500/50 transition-all cursor-default">
              {tag}
            </span>
          ))}
        </div>
      </section>

      <Pricing />

      {/* ═══ CTA ═══ */}
      <section className="relative z-10 w-full flex justify-center px-6 py-32">
        <div className="relative p-[1px] rounded-3xl bg-gradient-to-br from-purple-600 via-purple-500 to-cyan-400 shadow-2xl glow-purple-lg max-w-xl w-full text-center group">
          <div className="bg-gray-900/60 backdrop-blur-xl relative overflow-hidden h-full" style={{ padding: '4.5rem', borderRadius: '23px' }}>
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 via-transparent to-cyan-500/20 pointer-events-none" />
            <div className="relative z-10">
              <h2
                className="font-bold text-white"
                style={{ fontSize: 'clamp(2.5rem, 5vw, 3.25rem)', lineHeight: '1.2', marginBottom: '1.5rem' }}
              >
                <span className="gradient-text">Start for free.</span>
              </h2>
              <p className="text-gray-300 text-lg" style={{ lineHeight: '1.7', marginBottom: '3rem' }}>
                No credit card. No app. No friction.
              </p>
              <Link href="/create" className="btn-primary text-lg px-16 py-4 shadow-2xl">
                <span className="mr-2">✨</span> Create Your Wall
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="relative z-10 border-t border-gray-800/50 py-16">
        <div className="max-w-4xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-600 to-cyan-500 flex items-center justify-center text-white text-sm font-bold shadow-lg">M</div>
            <span className="text-lg text-gray-300 font-medium">Memento</span>
          </div>
          <p className="text-sm text-gray-400">© {new Date().getFullYear()} Memento - Share Every Moment</p>
        </div>
      </footer>
    </div>
  );
}