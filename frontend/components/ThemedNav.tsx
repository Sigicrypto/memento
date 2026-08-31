"use client";

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useAuthModal } from '@/context/AuthModalContext';
import AnimatedLogo from './AnimatedLogo';
import { LogOut, Menu, X, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ThemeToggle from '@/components/ThemeToggle';

import PartnerProgramModal from '@/components/PartnerProgramModal';

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
  const [isPartnerModalOpen, setIsPartnerModalOpen] = useState(false);
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
    { label: 'Product', href: '/#product' },
    { label: 'How It Works', href: '/#how-it-works' },
    { label: 'Weddings', href: '/weddings' },
    { label: 'Professionals', href: '/professionals' },
    { label: 'Corporate', href: '/corporate-events' },
    { label: 'Partner Program', href: '/partner' },
    { label: 'Pricing', href: '/#pricing' },
  ];

  return (
    <>
      <motion.header
        animate={{
          y: hidden && !isMobileMenuOpen ? -100 : 0,
          opacity: hidden && !isMobileMenuOpen ? 0 : 1,
        }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed top-4 md:top-6 left-1/2 -translate-x-1/2 w-[calc(100%-1rem)] md:w-[calc(100%-2rem)] max-w-[1480px] z-[9999] rounded-full transition-all duration-500 ${
          scrolled
            ? 'bg-slate-950/95 dark:bg-[#0a0a0a]/95 backdrop-blur-2xl border border-slate-800 dark:border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.4)]'
            : 'bg-slate-950/80 dark:bg-[#0a0a0a]/50 backdrop-blur-md border border-slate-800/80 dark:border-white/[0.06]'
        }`}
      >
        {/* subtle top gradient accent line */}
        <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

        <div className="h-16 md:h-20 flex items-center justify-between px-6 md:px-8">
          <Link href="/" onClick={() => setIsMobileMenuOpen(false)}>
            <motion.div
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center flex-shrink-0 cursor-pointer"
            >
              <div className="w-28 h-28 md:w-36 md:h-36 flex items-center justify-center overflow-hidden">
                <AnimatedLogo width={180} height={180} />
              </div>
            </motion.div>
          </Link>

          {/* Desktop Menu */}
          {!mini && (
            <nav className="hidden lg:flex items-center gap-6 xl:gap-8">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="group relative text-xs xl:text-sm font-medium text-slate-200 dark:text-white/80 hover:text-white transition-colors duration-200"
                >
                  {item.label}
                  <span className="absolute -bottom-1.5 left-0 h-px w-0 bg-cyan-400 transition-all duration-300 group-hover:w-full" />
                </Link>
              ))}
            </nav>
          )}

          {/* Right Section */}
          <div className="flex items-center gap-3">
            <Link
              href="/partner"
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-extrabold tracking-wider uppercase transition-all shrink-0 cursor-pointer"
              title="Earn 10% Referral Bonus for each user referred"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>10% Partner Bonus</span>
            </Link>

            <ThemeToggle />
            
            {!mini && showAuthButtons && (
              <div className="hidden md:flex items-center gap-3">
                {user ? (
                  <>
                    <Link
                      href="/dashboard"
                      className="px-4 py-2 rounded-full bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-extrabold tracking-wide transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)] hover:scale-105 active:scale-95 whitespace-nowrap"
                    >
                      Dashboard
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="text-white/50 hover:text-white transition-colors p-2 rounded-full hover:bg-white/5"
                      title="Sign out"
                    >
                      <LogOut size={18} />
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => openAuth('login')}
                      className="px-4 py-2 rounded-full text-white/90 hover:text-white hover:bg-white/10 text-xs font-bold transition-all"
                    >
                      Log in
                    </button>
                    <button
                      onClick={() => openAuth('signup')}
                      className="px-4 py-2 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-extrabold tracking-wide shadow-[0_0_15px_rgba(6,182,212,0.4)] hover:scale-105 active:scale-95 transition-all whitespace-nowrap"
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
                className="lg:hidden relative z-[101] p-2 text-white hover:bg-white/10 rounded-full transition-colors"
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
            className="fixed inset-0 z-[100] bg-[#050505]/98 backdrop-blur-md lg:hidden overflow-y-auto flex flex-col"
          >
            <div className="flex flex-col flex-1 pt-28 px-6 pb-8">
              <nav className="flex flex-col gap-5">
                {navItems.map((item, i) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 + i * 0.05 }}
                  >
                    <Link
                      href={item.href}
                      className="text-xl font-semibold text-white hover:text-cyan-400 transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {item.label}
                    </Link>
                  </motion.div>
                ))}
              </nav>

              <div className="mt-6 mb-4">
                <button
                  type="button"
                  onClick={() => { setIsPartnerModalOpen(true); setIsMobileMenuOpen(false); }}
                  className="w-full py-3.5 px-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-extrabold text-sm flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <span>Earn 10% Referral Bonus</span>
                </button>
              </div>

              <div className="mt-auto space-y-3 pt-6 border-t border-white/10">
                {user ? (
                  <>
                    <Link
                      href="/dashboard"
                      className="w-full block py-3.5 rounded-xl border border-white/20 text-center text-white font-bold text-sm"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Dashboard
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="w-full py-3.5 rounded-xl bg-white/5 text-white/70 font-semibold text-sm"
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <div className="flex flex-col gap-3">
                    <button
                      onClick={() => { openAuth('login'); setIsMobileMenuOpen(false); }}
                      className="w-full py-3.5 rounded-xl border border-white/20 text-white font-bold text-sm"
                    >
                      Log in
                    </button>
                    <button
                      onClick={() => { openAuth('signup'); setIsMobileMenuOpen(false); }}
                      className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-extrabold text-sm shadow-lg"
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
      <PartnerProgramModal
        isOpen={isPartnerModalOpen}
        onClose={() => setIsPartnerModalOpen(false)}
      />
    </>
  );
}