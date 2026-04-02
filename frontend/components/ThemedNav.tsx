"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import AnimatedLogo from './AnimatedLogo';
import { LogOut } from 'lucide-react';

interface ThemedNavProps {
  showAuthButtons?: boolean;
  mini?: boolean;
}

export default function ThemedNav({ showAuthButtons = true, mini = false }: ThemedNavProps) {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  return (
    <nav className={`lp-nav ${scrolled ? 'scrolled' : ''}`}>
      <Link href="/">
        <AnimatedLogo width={180} height={60} />
      </Link>

      {!mini && (
        <div className="nav-mid">
          <Link href="/#features">Features</Link>
          <Link href="/#how">How it works</Link>
          <Link href="/#pricing">Pricing</Link>
        </div>
      )}

      {!mini && showAuthButtons && (
        <>
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Link href="/dashboard" className="nav-btn">
                Dashboard
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
              <button 
                onClick={handleSignOut} 
                className="glass-pill"
                style={{ 
                  padding: '1.2rem', 
                  color: 'var(--color-text-secondary)', 
                  fontSize: '0.8rem', 
                  cursor: 'pointer', 
                  transition: 'all 0.2s'
                }}
              >
                <LogOut size={14} /> Sign Out
              </button>
            </div>
          ) : (
            <Link href="/#pricing" className="nav-btn">
              Get Started
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          )}
        </>
      )}
    </nav>
  );
}
