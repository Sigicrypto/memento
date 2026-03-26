"use client";

import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center px-4">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-500/20 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 text-center max-w-lg">
        {/* 404 Animation */}
        <div className="mb-8">
          <div className="text-9xl font-bold bg-gradient-to-r from-amber-400 to-rose-400 bg-clip-text text-transparent animate-pulse">
            404
          </div>
          <div className="text-6xl mt-4">📷</div>
        </div>

        {/* Message */}
        <h1 className="text-3xl font-bold text-white mb-4">
          Oops! This wall doesn't exist
        </h1>
        <p className="text-white/70 mb-8">
          The photo wall you're looking for might have been deleted, or the URL could be incorrect.
        </p>

        {/* Actions */}
        <div className="space-y-4">
          <Link href="/" className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-rose-500 text-white font-semibold rounded-full hover:from-amber-600 hover:to-rose-600 transition-all">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
            Back to Home
          </Link>
          
          <div className="text-white/50 text-sm">
            Or try creating a new wall for your event
          </div>
          
          <Link href="/create" className="inline-block text-amber-400 hover:text-amber-300 transition-colors">
            Create a New Wall →
          </Link>
        </div>

        {/* Fun animation */}
        <div className="mt-12 flex justify-center gap-2">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="w-2 h-2 bg-amber-400 rounded-full animate-bounce"
              style={{ animationDelay: `${i * 0.1}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
