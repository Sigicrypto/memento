"use client";

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useAuthModal } from '@/context/AuthModalContext';
import AnimatedLogo from './AnimatedLogo';
import MyMementoLogo from './MyMementoLogo';
import ThemeToggle from './ThemeToggle';
import { LogOut, Menu, X, Camera } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ThemedNavProps {
  showAuthButtons?: boolean;
  mini?: boolean;
  onOpenDemo?: () => void;
}

export default function ThemedNav({ showAuthButtons = true, mini = false, onOpenDemo }: ThemedNavProps) {
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

      setScrolled(currentY > 15);

      // Dynamic hide/show based on scroll direction
      if (currentY > lastScrollY.current && currentY > 160) {
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

  interface NavItem {
    label: string;
    href: string;
    desktopClass?: string;
  }

  const navItems: NavItem[] = [
    { label: 'How It Works', href: '/#how-it-works' },
    { label: 'Live Demo', href: '/#demo' },
    { label: 'Studio Advantage', href: '/#studio-advantage' },
    { label: 'Memento Live', href: '/#live-wall' },
    { label: 'Pricing', href: '/pricing' },
    { label: 'FAQ', href: '/#faq' },
    { label: 'For Photographers', href: '/photographers', desktopClass: 'text-amber-600 hover:text-amber-700 font-bold' },
  ];

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 w-full z-[9999] transition-all duration-300 transform ${
          hidden ? '-translate-y-full' : 'translate-y-0'
        } ${
          scrolled
            ? 'bg-white/95 backdrop-blur-xl border-b border-slate-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.04)] py-2 sm:py-2.5'
            : 'bg-white/80 backdrop-blur-md border-b border-black/[0.04] py-3.5 sm:py-4'
        }`}
      >
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between px-4 sm:px-6 lg:px-10">
          {/* Left Column: Brand Logo */}
          <div className="flex-1 flex items-center justify-start">
            <Link href="/" onClick={() => setIsMobileMenuOpen(false)}>
              <div className="flex items-center flex-shrink-0 cursor-pointer">
                <MyMementoLogo />
              </div>
            </Link>
          </div>

          {/* Center Column: Desktop Menu (Geometrically Centered) */}
          {!mini && (
            <nav className="hidden lg:flex items-center justify-center gap-5 xl:gap-7 shrink-0 flex-nowrap">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`group relative text-[13px] font-semibold tracking-wide text-slate-700 hover:text-[#0A2540] transition-colors duration-200 whitespace-nowrap shrink-0 ${item.desktopClass || ''}`}
                >
                  {item.label}
                  <span className="absolute -bottom-1 left-0 h-0.5 w-0 bg-amber-400 transition-all duration-300 group-hover:w-full" />
                </Link>
              ))}
            </nav>
          )}

          {/* Right Column: Actions & CTAs */}
          <div className="flex-1 flex items-center justify-end gap-2.5 sm:gap-3">
            {!mini && showAuthButtons && (
              <div className="hidden md:flex items-center gap-2 sm:gap-2.5 shrink-0 flex-nowrap">
                {user ? (
                  <>
                    <Link
                      href="/studio"
                      className="px-3.5 py-1.5 rounded-full bg-[#0A2540] hover:bg-[#0D355C] text-white text-xs font-bold tracking-wide transition-all shadow-sm whitespace-nowrap shrink-0"
                    >
                      Studio Portal
                    </Link>
                    <Link
                      href="/dashboard"
                      className="px-3 py-1.5 rounded-full text-slate-600 hover:text-slate-900 text-xs font-bold transition-all whitespace-nowrap shrink-0"
                    >
                      My Events
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="text-slate-500 hover:text-slate-900 transition-colors p-1.5 rounded-full hover:bg-slate-100 cursor-pointer shrink-0"
                      title="Sign out"
                    >
                      <LogOut size={16} />
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        if (onOpenDemo) onOpenDemo();
                        else {
                          const demoEl = document.getElementById('demo');
                          if (demoEl) demoEl.scrollIntoView({ behavior: 'smooth' });
                          else router.push('/#demo');
                        }
                      }}
                      className="px-3.5 py-1.5 text-slate-600 hover:text-[#0A2540] font-semibold text-xs transition-colors cursor-pointer whitespace-nowrap shrink-0"
                    >
                      See Live Demo
                    </button>
                    <button
                      onClick={() => openAuth('login')}
                      className="px-3.5 py-1.5 text-slate-700 hover:text-[#0A2540] font-semibold text-xs transition-colors cursor-pointer whitespace-nowrap shrink-0"
                    >
                      Login
                    </button>
                    <button
                      onClick={() => openAuth('signup')}
                      className="px-4 py-1.5 rounded-full bg-[#0A2540] hover:bg-[#0D355C] text-white font-bold text-xs tracking-wide shadow-sm hover:scale-[1.02] active:scale-[0.98] transition-all whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-1.5"
                    >
                      <span>Create Your Event</span>
                      <span className="text-amber-400">→</span>
                    </button>
                  </>
                )}
              </div>
            )}

            {/* Hamburger Toggle for Mobile */}
            {!mini && (
              <button
                className="lg:hidden relative z-[101] min-w-[40px] min-h-[40px] flex items-center justify-center text-slate-800 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
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
            className="fixed inset-0 z-[100] bg-surface/98 backdrop-blur-md lg:hidden overflow-y-auto flex flex-col"
          >
            <div className="flex flex-col flex-1 pt-24 px-6 pb-8 items-center text-center">
              <nav className="flex flex-col gap-3 w-full items-center">
                {navItems.map((item, i) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.02 + i * 0.03 }}
                    className="w-full flex justify-center"
                  >
                    <Link
                      href={item.href}
                      className="min-h-[44px] flex items-center justify-center text-center text-lg font-bold text-text-primary hover:text-amber-600 transition-colors py-1"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {item.label}
                    </Link>
                  </motion.div>
                ))}
              </nav>

              <div className="mt-6 mb-4 flex flex-col gap-3 w-full max-w-xs">
                <Link
                  href="/photographers"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full min-h-[44px] py-3 px-4 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-700 font-bold text-sm flex items-center justify-center gap-2"
                >
                  <Camera className="w-4 h-4 text-amber-600" />
                  <span>For Photographers & Studios</span>
                </Link>
                <Link
                  href="/studio"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full min-h-[44px] py-3 px-4 rounded-xl bg-[#0A2540] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-sm"
                >
                  <span>Studio Portal</span>
                </Link>
              </div>

              <div className="mt-auto space-y-3 pt-6 border-t border-border w-full max-w-xs">
                {user ? (
                  <>
                    <Link
                      href="/studio"
                      className="w-full min-h-[44px] flex items-center justify-center py-3.5 rounded-xl bg-[#0A2540] text-white font-bold text-sm"
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
                  <div className="flex flex-col gap-2.5">
                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        if (onOpenDemo) onOpenDemo();
                        else {
                          const demoEl = document.getElementById('demo');
                          if (demoEl) demoEl.scrollIntoView({ behavior: 'smooth' });
                          else router.push('/#demo');
                        }
                      }}
                      className="w-full min-h-[44px] flex items-center justify-center py-3 rounded-xl border border-slate-300 text-slate-800 font-bold text-sm cursor-pointer"
                    >
                      See Live Demo
                    </button>
                    <button
                      onClick={() => { openAuth('signup'); setIsMobileMenuOpen(false); }}
                      className="w-full min-h-[44px] flex items-center justify-center py-3.5 rounded-xl bg-[#0A2540] text-white font-bold text-sm shadow-md cursor-pointer"
                    >
                      Create Your Event →
                    </button>
                    <button
                      onClick={() => { openAuth('login'); setIsMobileMenuOpen(false); }}
                      className="text-xs text-slate-500 font-semibold py-1.5 hover:text-slate-800 cursor-pointer"
                    >
                      Already have an account? Log in
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