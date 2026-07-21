"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useAuthModal } from '@/context/AuthModalContext';
import AnimatedLogo from './AnimatedLogo';
import ThemeToggle from './ThemeToggle';
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
          y: scrolled ? 12 : 0, 
          opacity: 1,
          width: scrolled ? '92%' : '100%',
          maxWidth: scrolled ? '1400px' : '100%',
          backgroundColor: scrolled ? 'rgba(3, 3, 4, 0.98)' : (isMobileMenuOpen ? 'rgba(3, 3, 4, 0.98)' : 'transparent'),
          backdropFilter: scrolled || isMobileMenuOpen ? 'blur(20px)' : 'blur(0px)',
          borderRadius: scrolled ? '24px' : '0px',
          border: scrolled ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid transparent',
          boxShadow: scrolled ? '0 25px 50px -12px rgba(0, 0, 0, 0.5)' : 'none'
        }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        style={{ zIndex: 9999 }}
        className="fixed top-0 left-1/2 -translate-x-1/2 w-full h-20 flex items-center"
      >
        <div className="w-full flex items-center justify-between px-6 md:px-12">
          <Link href="/" onClick={() => setIsMobileMenuOpen(false)}>
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="relative z-[101]"
            >
              <AnimatedLogo width={scrolled ? 180 : 200} height={50} />
            </motion.div>
          </Link>

          {/* Desktop Menu */}
          {!mini && (
            <div className="hidden md:flex items-center gap-10">
              {navLinks.map((item) => (
                <Link 
                  key={item} 
                  href={`/#${item.toLowerCase().replace(/ /g, '')}`} 
                  className="text-sm font-medium text-text-secondary hover:text-white transition-colors relative group"
                >
                  {item}
                  <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-primary transition-all duration-300 group-hover:w-full" />
                </Link>
              ))}
            </div>
          )}

          {/* Right Section */}
          <div className="flex items-center gap-6">
            {!mini && showAuthButtons && (
              <div className="hidden md:flex items-center gap-4">
                {user ? (
                  <>
                    <Link href="/dashboard" className="btn-secondary px-5 py-2 text-sm font-semibold rounded-xl transition-all">
                      Dashboard
                    </Link>
                    <button onClick={handleSignOut} className="text-text-secondary hover:text-white transition-colors p-2">
                      <LogOut size={18} />
                    </button>
                  </>
                ) : (
                  <>
                    <button onClick={() => openAuth('login')} className="text-sm font-medium text-text-secondary hover:text-white transition-colors">
                      Log in
                    </button>
                    <button onClick={() => openAuth('signup')} className="btn-primary px-6 py-2.5 text-sm font-bold rounded-xl shadow-lg shadow-primary/20">
                      Get Started
                    </button>
                  </>
                )}
              </div>
            )}
            
            <ThemeToggle />

            {/* Hamburger Toggle */}
            {!mini && (
              <button 
                className="md:hidden relative z-[101] p-2 text-white hover:bg-white/5 rounded-xl transition-colors"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            )}
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-bg/98 backdrop-blur-2xl md:hidden overflow-hidden"
          >
            <div className="flex flex-col h-full pt-32 px-10 pb-12">
              <div className="flex flex-col gap-10">
                {navLinks.map((item, i) => (
                  <motion.div
                    key={item}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + i * 0.1 }}
                  >
                    <Link 
                      href={`/#${item.toLowerCase().replace(/ /g, '')}`} 
                      className="text-4xl font-bold text-white hover:text-primary transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {item}
                    </Link>
                  </motion.div>
                ))}
              </div>

              <div className="mt-auto space-y-6">
                {user ? (
                  <>
                    <Link 
                      href="/dashboard" 
                      className="w-full h-14 rounded-2xl bg-primary text-white flex items-center justify-center font-bold text-lg"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Go to Dashboard
                    </Link>
                    <button 
                      onClick={handleSignOut}
                      className="w-full h-14 rounded-2xl border border-white/10 text-text-secondary font-bold text-lg"
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <div className="flex flex-col gap-4">
                    <button 
                      onClick={() => { openAuth('signup'); setIsMobileMenuOpen(false); }}
                      className="w-full h-14 rounded-2xl bg-primary text-white font-bold text-lg shadow-xl shadow-primary/20"
                    >
                      Get Started
                    </button>
                    <button 
                      onClick={() => { openAuth('login'); setIsMobileMenuOpen(false); }}
                      className="w-full h-14 rounded-2xl border border-white/10 text-white font-bold text-lg"
                    >
                      Log In
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
