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
    const onScroll = () => setScrolled(window.scrollY > 10);
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
      <header className={`fixed top-4 md:top-6 left-1/2 -translate-x-1/2 w-[95%] md:w-[90%] max-w-4xl z-[9999] transition-all duration-300 rounded-full ${scrolled ? 'glassmorphic-modal border-white/10' : 'bg-transparent border border-transparent'}`}>
        <div className="container h-[60px] flex items-center justify-between px-6">
          <Link href="/" onClick={() => setIsMobileMenuOpen(false)}>
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="relative z-[101]"
            >
              <AnimatedLogo width={140} height={32} />
            </motion.div>
          </Link>

          {/* Desktop Menu */}
          {!mini && (
            <nav className="hidden md:flex items-center gap-8">
              {navLinks.map((item) => (
                <Link 
                  key={item} 
                  href={`/#${item.toLowerCase().replace(/ /g, '')}`} 
                  className="text-sm font-medium text-white/70 hover:text-white transition-colors"
                >
                  {item}
                </Link>
              ))}
            </nav>
          )}

          {/* Right Section */}
          <div className="flex items-center gap-4">
            {!mini && showAuthButtons && (
              <div className="hidden md:flex items-center gap-3">
                {user ? (
                  <>
                    <Link href="/dashboard" className="btn btn-secondary btn-sm rounded-full">
                      Dashboard
                    </Link>
                    <button onClick={handleSignOut} className="text-white/50 hover:text-white transition-colors p-1" title="Sign out">
                      <LogOut size={18} />
                    </button>
                  </>
                ) : (
                  <>
                    <button onClick={() => openAuth('login')} className="btn btn-ghost btn-sm text-white/70 hover:text-white">
                      Log in
                    </button>
                    <button onClick={() => openAuth('signup')} className="btn btn-sm px-5 py-1.5 rounded-full border border-white/20 bg-white/5 hover:bg-white/10 text-white backdrop-blur-md transition-all">
                      Get Started
                    </button>
                  </>
                )}
              </div>
            )}
            
            {/* Theme Toggle omitted for purely dark landing page, or kept if needed. Keeping it for now. */}
            <div className="hidden md:block">
              <ThemeToggle />
            </div>

            {/* Hamburger Toggle */}
            {!mini && (
              <button 
                className="md:hidden relative z-[101] p-1 text-white hover:bg-white/10 rounded-md transition-colors"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-bg/98 backdrop-blur-md md:hidden overflow-hidden flex flex-col"
          >
            <div className="flex flex-col flex-1 pt-24 px-6 pb-8">
              <nav className="flex flex-col gap-6">
                {navLinks.map((item, i) => (
                  <motion.div
                    key={item}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + i * 0.1 }}
                  >
                    <Link 
                      href={`/#${item.toLowerCase().replace(/ /g, '')}`} 
                      className="text-2xl font-semibold text-text-primary hover:text-text-secondary transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {item}
                    </Link>
                  </motion.div>
                ))}
              </nav>

              <div className="mt-auto space-y-4">
                {user ? (
                  <>
                    <Link 
                      href="/dashboard" 
                      className="btn btn-primary w-full btn-lg"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Dashboard
                    </Link>
                    <button 
                      onClick={handleSignOut}
                      className="btn btn-secondary w-full btn-lg"
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <div className="flex flex-col gap-3">
                    <button 
                      onClick={() => { openAuth('signup'); setIsMobileMenuOpen(false); }}
                      className="btn btn-primary w-full btn-lg"
                    >
                      Get Started
                    </button>
                    <button 
                      onClick={() => { openAuth('login'); setIsMobileMenuOpen(false); }}
                      className="btn btn-secondary w-full btn-lg"
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
