"use client";

import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="lp min-h-screen relative overflow-hidden flex items-center justify-center px-4">
      <div className="aurora-bg fixed inset-0 z-0" />
      <div className="grain fixed inset-0 z-1 opacity-[0.03] pointer-events-none" />
      <div className="orbs fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="orb orb1" />
        <div className="orb orb2" />
        <div className="orb orb3" />
      </div>
      
      <div className="relative z-10 text-center max-w-lg w-full">
        <div className="gcard cinematic-glow mb-8 shadow-2xl">
          <div className="gcard-border" />
          <div className="gcard-inner p-10 lg:p-14">
            <div className="mb-10 flex flex-col items-center">
              <Link href="/" className="mb-8 hover:scale-105 transition-transform duration-300">
                <img src="/CC logo.png" alt="Memento" className="h-10 w-auto" />
              </Link>
              <div className="relative">
                <div className="text-9xl font-black tracking-tighter animate-pulse text-transparent bg-clip-text bg-gradient-to-br from-amber-400 to-rose-500 drop-shadow-[0_0_30px_rgba(245,158,11,0.3)]">
                  404
                </div>
                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-4xl">📸</div>
              </div>
            </div>

            <h1 className="text-2xl lg:text-3xl font-black mb-4 text-white tracking-tight">
              This wall doesn't exist
            </h1>
            <p className="text-sm mb-10 text-slate-400 leading-relaxed font-medium">
              The photo wall you're looking for might have been deleted, or the URL could be incorrect.
            </p>

            <div className="flex flex-col items-center gap-5">
              <Link href="/" className="btn-glow w-full flex justify-center items-center gap-2">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
                  <polyline points="9 22 9 12 15 12 15 22"/>
                </svg>
                Back to Home
              </Link>
              <div className="flex items-center gap-4 w-full">
                <div className="h-px bg-white/10 flex-1" />
                <span className="text-[10px] uppercase tracking-[0.2em] font-black text-slate-600">or</span>
                <div className="h-px bg-white/10 flex-1" />
              </div>
              <Link href="/create" className="btn-outline w-full py-3.5 text-sm uppercase tracking-widest font-black">
                Create a New Wall
              </Link>
            </div>
          </div>
        </div>

        <div className="flex justify-center gap-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="w-2 h-2 rounded-full animate-pulse shadow-[0_0_10px_rgba(245,158,11,0.5)]"
              style={{background:'#f59e0b', animationDelay:`${i * 0.15}s`}} />
          ))}
        </div>
      </div>
    </main>
  );
}
