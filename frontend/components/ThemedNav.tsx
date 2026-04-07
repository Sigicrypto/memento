"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useAuthModal } from '@/context/AuthModalContext';
import AnimatedLogo from './AnimatedLogo';
import { LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ThemedNavProps {
  showAuthButtons?: boolean;
  mini?: boolean;
}

export default function ThemedNav({ showAuthButtons = true, mini = false }: ThemedNavProps) {
  const { user, signOut } = useAuth();
  const { openAuth } = useAuthModal();
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
    <motion.nav 
      initial={{ y: -100, opacity: 0 }}
      animate={{ 
        y: 0, 
        opacity: 1,
        backgroundColor: scrolled ? 'rgba(255, 255, 255, 0.65)' : 'transparent',
        backdropFilter: scrolled ? 'blur(32px) saturate(200%)' : 'blur(0px)',
        boxShadow: scrolled ? '0 10px 40px rgba(245, 158, 11, 0.15)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(245, 158, 11, 0.3)' : '1px solid transparent'
      }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="lp-nav !px-0"
    >
      <div className="w-full flex items-center justify-between px-6 md:px-16 lg:px-24">
        <Link href="/">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <AnimatedLogo width={180} height={60} />
          </motion.div>
        </Link>

        {!mini && (
          <div className="nav-mid" style={{ display: 'flex', gap: '2rem' }}>
            {['Features', 'How it works', 'Pricing'].map((item) => (
              <motion.div key={item} whileHover={{ scale: 1.05 }} transition={{ type: "spring", stiffness: 400 }}>
                <Link href={`/#${item.toLowerCase().replace(/ /g, '')}`} className="relative group overflow-hidden block pb-1">
                  <span className="relative z-10 transition-colors duration-300 group-hover:text-primary">{item}</span>
                  <motion.div 
                    className="absolute bottom-0 left-0 w-full h-[2px]"
                    style={{ background: 'linear-gradient(90deg, #f59e0b, #ec4899)' }}
                    initial={{ x: '-101%' }}
                    whileHover={{ x: 0 }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                  />
                </Link>
              </motion.div>
            ))}
          </div>
        )}

        {!mini && showAuthButtons && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {user ? (
              <>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link href="/dashboard" className="nav-btn">
                    Dashboard
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </Link>
                </motion.div>
                <motion.button 
                  whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.8)' }}
                  whileTap={{ scale: 0.95 }}
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
                </motion.button>
              </>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                <button 
                  onClick={() => openAuth('login')} 
                  className="glass-pill hover:text-primary transition-colors"
                  style={{ 
                    padding: '1.2rem', 
                    color: 'var(--color-text-secondary)', 
                    fontSize: '0.85rem', 
                    fontWeight: 700,
                    cursor: 'pointer', 
                    background: 'none',
                    border: 'none'
                  }}
                >
                  Sign In
                </button>
                <motion.button 
                  whileHover={{ scale: 1.05, boxShadow: '0 8px 30px rgba(245, 158, 11, 0.4)' }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => openAuth('signup')} 
                  className="nav-btn"
                >
                  Get Started
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </motion.button>
              </div>
            )}
          </div>
        )}
      </div>
    </motion.nav>
  );
}
