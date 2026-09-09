"use client";

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useAuthModal } from '@/context/AuthModalContext';
import AnimatedLogo from './AnimatedLogo';
import ThemeToggle from './ThemeToggle';
import { LogOut, Menu, X, Camera } from 'lucide-react';
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
  const [hidden, setHidden] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      const currentY = window.scrollY;

      setScrolled(currentY > 10);

      // Dynamic hide/show based on scroll direction
      if (currentY > lastScrollY.current && currentY > 120) {
        setHidden(true); // scrolling down
      } else {
        setHidden(false); // scrolling up
      }

      lastScrollY.current = currentY;
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? 'hidden' : 'unset';
  }, [isMobileMenuOpen]);

  const handleSignOut = async () => {
    await signOut();
    setIsMobileMenuOpen(false);
    router.push('/');
  };

  const navItems = [
    { label: 'How It Works', href: '/how-it-works' },
    { label: 'Weddings', href: '/weddings' },
    { label: 'Parties', href: '/parties' },
    { label: 'Corporate', href: '/corporate-events' },
    { label: 'For Photographers', href: '/photographers' },
    { label: 'Pricing', href: '/pricing' },
    { label: 'Contact', href: '/contact' },
  ];

  return (
    <>
      <motion.header
        animate={{
          y: hidden && !isMobileMenuOpen ? -100 : 0,
          opacity: hidden && !isMobileMenuOpen ? 0 : 1,
        }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed top-4 md:top-6 left-1/2 -translate-x-1/2 w-[calc(100%-1rem)] md:w-[calc(100%-2rem)] max-w-[1480px] z-[9999] rounded-full transition-all duration-300 ${
          scrolled
            ? 'bg-surface/95 backdrop-blur-2xl border border-border shadow-[0_8px_30px_rgb(28,25,23,0.04)]'
            : 'bg-surface/85 backdrop-blur-xl border border-border/80 shadow-[0_4px_20px_rgb(28,25,23,0.02)]'
        }`}
      >
        <div className="h-16 md:h-20 flex items-center justify-between px-4 sm:px-6 md:px-8">
          <Link href="/" onClick={() => setIsMobileMenuOpen(false)}>
            <motion.div
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center flex-shrink-0 cursor-pointer"
            >
              <div className="h-10 md:h-12 flex items-center justify-center overflow-hidden">
                <AnimatedLogo width={140} height={44} />
              </div>
            </motion.div>
          </Link>

          {/* Desktop Menu */}
          {!mini && (
            <nav className="hidden lg:flex items-center gap-5 xl:gap-7">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="group relative text-xs xl:text-sm font-semibold text-text-secondary hover:text-text-primary transition-colors duration-200"
                >
                  {item.label}
                  <span className="absolute -bottom-1.5 left-0 h-0.5 w-0 bg-accent transition-all duration-300 group-hover:w-full" />
                </Link>
              ))}
            </nav>
          )}

          {/* Right Section */}
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link
              href="/photographers"
              className="hidden xl:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-primary/10 hover:bg-primary/15 border border-primary/25 text-primary text-xs font-bold tracking-wide transition-all shrink-0 cursor-pointer"
              title="Studio White-Labeling & Live Photo Walls"
            >
              <Camera className="w-3.5 h-3.5 text-primary" />
              <span>For Photographers</span>
            </Link>
            
            {!mini && showAuthButtons && (
              <div className="hidden md:flex items-center gap-2.5">
                {user ? (
                  <>
                    <Link
                      href="/studio"
                      className="px-4 py-2 rounded-full bg-primary hover:opacity-90 text-white text-xs font-bold tracking-wide transition-all shadow-sm hover:scale-105 active:scale-95 whitespace-nowrap"
                    >
                      Studio Portal
                    </Link>
                    <Link
                      href="/dashboard"
                      className="px-3.5 py-2 rounded-full text-text-secondary hover:text-text-primary text-xs font-bold transition-all whitespace-nowrap"
                    >
                      My Events
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="text-text-secondary hover:text-text-primary transition-colors p-2 rounded-full hover:bg-bg-subtle cursor-pointer"
                      title="Sign out"
                    >
                      <LogOut size={18} />
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => openAuth('login')}
                      className="px-3.5 py-2 rounded-full text-text-primary hover:text-primary text-xs font-bold transition-all cursor-pointer"
                    >
                      Log in
                    </button>
                    <Link
                      href="/studio"
                      className="px-3.5 py-2 rounded-full border border-primary/30 text-primary hover:bg-primary/5 text-xs font-bold transition-all cursor-pointer"
                    >
                      Studio Portal
                    </Link>
                    <button
                      onClick={() => openAuth('signup')}
                      className="px-4 py-2 rounded-full bg-accent hover:bg-[#D9932B] text-white text-xs font-bold tracking-wide shadow-sm hover:scale-105 active:scale-95 transition-all whitespace-nowrap cursor-pointer"
                    >
                      Create Event
                    </button>
                  </>
                )}
              </div>
            )}

            {/* Hamburger Toggle */}
            {!mini && (
              <button
                className="lg:hidden relative z-[101] min-w-[44px] min-h-[44px] flex items-center justify-center text-text-primary hover:bg-bg-subtle rounded-full transition-colors cursor-pointer"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            )}
          </div>
        </div>
      </motion.header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-surface/98 backdrop-blur-md lg:hidden overflow-y-auto flex flex-col"
          >
            <div className="flex flex-col flex-1 pt-28 px-6 pb-8">
              <nav className="flex flex-col gap-3">
                {navItems.map((item, i) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.03 + i * 0.03 }}
                  >
                    <Link
                      href={item.href}
                      className="min-h-[44px] flex items-center text-lg font-bold text-text-primary hover:text-primary transition-colors py-1"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {item.label}
                    </Link>
                  </motion.div>
                ))}
              </nav>

              <div className="mt-6 mb-4 flex flex-col gap-3">
                <Link
                  href="/photographers"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full min-h-[44px] py-3 px-4 rounded-xl bg-primary/10 border border-primary/25 text-primary font-bold text-sm flex items-center justify-center gap-2"
                >
                  <Camera className="w-4 h-4 text-primary" />
                  <span>For Photographers & Studios</span>
                </Link>
                <Link
                  href="/studio"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full min-h-[44px] py-3 px-4 rounded-xl bg-primary text-white font-bold text-sm flex items-center justify-center gap-2 shadow-sm"
                >
                  <span>Studio Portal</span>
                </Link>
                
                <div className="flex items-center justify-between py-2.5 px-4 rounded-xl bg-bg-subtle border border-border mt-1">
                  <span className="text-sm font-semibold text-text-primary">Appearance</span>
                  <ThemeToggle />
                </div>
              </div>

              <div className="mt-auto space-y-3 pt-6 border-t border-border">
                {user ? (
                  <>
                    <Link
                      href="/studio"
                      className="w-full min-h-[44px] flex items-center justify-center py-3.5 rounded-xl bg-primary text-white font-bold text-sm"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Studio Console
                    </Link>
                    <Link
                      href="/dashboard"
                      className="w-full min-h-[44px] flex items-center justify-center py-3.5 rounded-xl border border-border text-center text-text-primary font-bold text-sm"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Events Dashboard
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="w-full min-h-[44px] flex items-center justify-center py-3.5 rounded-xl bg-bg-subtle text-text-secondary font-semibold text-sm cursor-pointer"
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <div className="flex flex-col gap-3">
                    <button
                      onClick={() => { openAuth('login'); setIsMobileMenuOpen(false); }}
                      className="w-full min-h-[44px] flex items-center justify-center py-3.5 rounded-xl border border-border text-text-primary font-bold text-sm cursor-pointer"
                    >
                      Log in
                    </button>
                    <button
                      onClick={() => { openAuth('signup'); setIsMobileMenuOpen(false); }}
                      className="w-full min-h-[44px] flex items-center justify-center py-3.5 rounded-xl bg-accent text-white font-bold text-sm shadow-md cursor-pointer"
                    >
                      Create Event
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