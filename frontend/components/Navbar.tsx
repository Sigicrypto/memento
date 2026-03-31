"use client";

import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import AnimatedLogo from './AnimatedLogo';

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
        padding: scrolled ? '1rem 0' : '1.5rem 0',
      }}
    >
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        <Link href="/">
          <AnimatedLogo width={200} height={60} />
        </Link>
        <div className="flex items-center gap-3">
          {user && (
            <Link
              href="/dashboard"
              className="text-base transition-colors font-medium px-2"
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
              className="nm-btn text-sm py-2.5 px-5"
              style={{ color: '#7f849c' }}
            >
              Sign Out
            </button>
          ) : (
            <Link href="/#pricing" className="nm-btn nm-btn-accent text-sm py-2.5 px-6 font-bold">
              Get Started
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
