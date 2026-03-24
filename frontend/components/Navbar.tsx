"use client";

import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useEffect, useState } from 'react';
import ThemeToggle from './ThemeToggle';

export default function Navbar() {
  const { user, signOut } = useAuth();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? 'glass py-3' : 'py-5'}`}>
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-sm font-bold group-hover:scale-110 transition-transform">
            M
          </div>
          <span className="text-xl font-bold gradient-text">Memento</span>
        </Link>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          {user && (
            <Link href="/dashboard" className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
              Dashboard
            </Link>
          )}
          {user ? (
            <button onClick={signOut} className="btn-secondary text-xs !py-2 !px-4">
              Sign Out
            </button>
          ) : (
            <Link href="/auth" className="btn-primary text-xs !py-2 !px-4">
              Get Started
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
