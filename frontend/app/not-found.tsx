"use client";

import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="nm-page flex items-center justify-center px-4">
      <div className="text-center max-w-lg">
        <div className="nm-card p-12 mb-6">
          <div className="mb-6">
            <div
              className="text-9xl font-bold animate-pulse"
              style={{background:'linear-gradient(135deg,#f59e0b,#f472b6)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text'}}
            >
              404
            </div>
            <div className="text-6xl mt-4">📷</div>
          </div>

          <h1 className="text-3xl font-bold mb-4" style={{color:'var(--text1)'}}>
            This wall doesn't exist
          </h1>
          <p className="text-sm mb-8" style={{color:'var(--text2)'}}>
            The photo wall you're looking for might have been deleted, or the URL could be incorrect.
          </p>

          <div className="flex flex-col items-center gap-4">
            <Link href="/" className="nm-btn nm-btn-accent px-6 py-3 font-bold flex items-center gap-2">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
              Back to Home
            </Link>
            <span className="text-xs" style={{color:'#4a4f6a'}}>or</span>
            <Link href="/create" className="nm-btn px-5 py-2.5 text-sm font-semibold" style={{color:'#f59e0b'}}>
              Create a New Wall →
            </Link>
          </div>
        </div>

        <div className="flex justify-center gap-2">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="w-2 h-2 rounded-full animate-bounce"
              style={{background:'#f59e0b', animationDelay:`${i * 0.1}s`}} />
          ))}
        </div>
      </div>
    </div>
  );
}

