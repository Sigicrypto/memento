"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useAuthModal } from '@/context/AuthModalContext';
import AnimatedLogo from './AnimatedLogo';
import { LogOut, Menu, X } from 'lucide-react';
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isMobileMenuOpen]);

  const handleSignOut = async () => {
    await signOut();
    setIsMobileMenuOpen(false);
    router.push('/');
  };

  const navLinks = ['Features', 'How it works', 'Pricing'];

  return (
    <>
      <motion.nav 
        initial={{ y: -100, opacity: 0 }}
        animate={{ 
          y: 0, 
          opacity: 1,
          backgroundColor: scrolled || isMobileMenuOpen ? 'rgba(10, 10, 11, 0.95)' : 'transparent',
          backdropFilter: scrolled || isMobileMenuOpen ? 'blur(20px) saturate(180%)' : 'blur(0px)',
          boxShadow: scrolled ? '0 10px 40px rgba(0, 0, 0, 0.3)' : 'none',
          borderBottom: scrolled || isMobileMenuOpen ? '1px solid rgba(255, 255, 255, 0.05)' : '1px solid transparent'
        }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="lp-nav !px-0"
      >
        <div className="w-full flex items-center justify-between px-6 md:px-16 lg:px-24">
          <Link href="/" onClick={() => setIsMobileMenuOpen(false)}>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
              className="relative z-[101]"
            >
              <AnimatedLogo width={isMobileMenuOpen ? 180 : 220} height={60} />
            </motion.div>
          </Link>

          {/* Desktop Menu */}
          {!mini && (
            <div className="hidden md:flex nav-mid" style={{ display: 'flex', gap: '2rem' }}>
              {navLinks.map((item) => (
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

          {/* Right Section */}
          <div className="flex items-center gap-4">
            {!mini && showAuthButtons && (
              <div className="hidden md:flex items-center gap-3">
                {user ? (
                  <>
                    <Link href="/dashboard" className="nav-btn">
                      Dashboard
                    </Link>
                    <button onClick={handleSignOut} className="glass-pill px-4 py-2 text-sm font-bold text-slate-400 border border-white/10 hover:bg-white/5 transition-all">
                      <LogOut size={14} className="inline mr-2" /> Sign Out
                    </button>
                  </>
                ) : (
                  <button onClick={() => openAuth('signup')} className="nav-btn">
                    Get Started
                  </button>
                )}
              </div>
            )}

            {/* Hamburger Toggle */}
            {!mini && (
              <button 
                className="md:hidden relative z-[101] p-2 text-white hover:bg-white/5 rounded-xl transition-colors"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
              </button>
            )}
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="fixed inset-0 z-[100] bg-bg/95 backdrop-blur-2xl md:hidden flex flex-col pt-32 px-8 pb-12"
          >
            <div className="flex flex-col gap-8 mb-12">
              {navLinks.map((item, i) => (
                <motion.div
                  key={item}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Link 
                    href={`/#${item.toLowerCase().replace(/ /g, '')}`} 
                    className="text-4xl font-black text-white hover:text-primary transition-colors inline-block"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item}
                  </Link>
                </motion.div>
              ))}
            </div>

            <div className="mt-auto space-y-4">
              {user ? (
                <>
                  <Link 
                    href="/dashboard" 
                    className="w-full py-4 rounded-2xl bg-gradient-to-r from-primary to-accent text-white flex items-center justify-center font-bold text-lg"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <button 
                    onClick={handleSignOut}
                    className="w-full py-4 rounded-2xl bg-white/5 border border-white/10 text-slate-400 font-bold text-lg"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <button 
                  onClick={() => { openAuth('signup'); setIsMobileMenuOpen(false); }}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-primary to-accent text-white font-bold text-lg shadow-lg shadow-primary/20"
                >
                  Get Started
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
