"use client";

import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import ThemeToggle from './ThemeToggle';

export default function Navbar() {
  const { user, signOut } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (pathname === '/') return null;

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        background: '#1e2235',
        boxShadow: scrolled
          ? '0 4px 20px #14182a, 0 1px 0 #252c46'
          : '0 2px 8px #14182a',
        padding: scrolled ? '0.65rem 0' : '1rem 0',
      }}
    >
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2 group">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold transition-all duration-300 group-hover:scale-110"
            style={{
              background: '#1e2235',
              boxShadow: '4px 4px 8px #14182a, -4px -4px 8px #252c46',
              color: '#f59e0b',
            }}
          >
            M
          </div>
          <span
            className="text-xl font-bold"
            style={{
              background: 'linear-gradient(135deg,#f59e0b,#f472b6)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Memento
          </span>
        </Link>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          {user && (
            <Link
              href="/dashboard"
              className="text-sm transition-colors"
              style={{ color: '#7f849c' }}
              onMouseOver={(e) => (e.currentTarget.style.color = '#e2e8f0')}
              onMouseOut={(e) => (e.currentTarget.style.color = '#7f849c')}
            >
              Dashboard
            </Link>
          )}
          {user ? (
            <button
              onClick={signOut}
              className="nm-btn text-xs py-2 px-4"
              style={{ color: '#7f849c' }}
            >
              Sign Out
            </button>
          ) : (
            <Link href="/auth" className="nm-btn nm-btn-accent text-xs py-2 px-4 font-bold">
              Get Started
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
