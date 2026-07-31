"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Shield, LogOut, Layout, BarChart2, Settings, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AnimatedLogo from '@/components/AnimatedLogo';
import ThemeToggle from '@/components/ThemeToggle';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function DashboardNavigation() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const navLinks = [
    { name: 'Events', href: '/dashboard', icon: Layout },
    { name: 'Analytics', href: '#', icon: BarChart2 },
    { name: 'Settings', href: '#', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Header */}
      <header className="md:hidden h-[64px] border-b border-border bg-surface/80 backdrop-blur-md sticky top-0 z-40 flex items-center justify-between px-4">
        <Link href="/">
          <AnimatedLogo width={100} height={24} />
        </Link>
        <button onClick={() => setIsOpen(true)} className="p-2 text-text-secondary hover:text-text-primary transition-colors">
          <Menu size={20} />
        </button>
      </header>

      {/* Desktop Sidebar & Mobile Drawer Overlay */}
      <AnimatePresence>
        {(isOpen || typeof window !== 'undefined' && window.innerWidth >= 768) && (
          <>
            {/* Mobile Backdrop */}
            {isOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsOpen(false)}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 md:hidden"
              />
            )}

            {/* Sidebar (Desktop sticky, Mobile absolute) */}
            <motion.aside
              initial={typeof window !== 'undefined' && window.innerWidth < 768 ? { x: '-100%' } : { x: 0 }}
              animate={{ x: 0 }}
              exit={typeof window !== 'undefined' && window.innerWidth < 768 ? { x: '-100%' } : { x: 0 }}
              transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
              className={`fixed md:sticky top-0 left-0 z-50 h-screen w-64 border-r border-border bg-surface flex flex-col ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
            >
              <div className="h-[64px] border-b border-border flex items-center justify-between px-6">
                <div className="flex items-center">
                  <Link href="/" onClick={() => setIsOpen(false)}>
                    <AnimatedLogo width={120} height={32} />
                  </Link>
                  <span className="ml-3 text-[10px] font-bold text-text-muted uppercase tracking-widest bg-bg-subtle px-2 py-0.5 rounded-full hidden sm:block">Studio</span>
                </div>
                {/* Mobile Close Button */}
                <button onClick={() => setIsOpen(false)} className="md:hidden p-2 text-text-secondary hover:text-text-primary">
                  <X size={20} />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto py-6 px-4 flex flex-col gap-1">
                <p className="px-2 text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">Overview</p>
                
                {navLinks.map((link) => {
                  const isActive = pathname === link.href;
                  return (
                    <Link 
                      key={link.name}
                      href={link.href} 
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2 rounded-md font-medium text-sm transition-colors border ${
                        isActive 
                          ? 'bg-bg-subtle text-text-primary border-border' 
                          : 'hover:bg-bg-subtle text-text-secondary hover:text-text-primary border-transparent'
                      }`}
                    >
                      <link.icon size={16} className={isActive ? 'text-accent-cyan' : ''} />
                      {link.name}
                    </Link>
                  );
                })}
              </div>
              
              <div className="p-4 border-t border-border flex items-center justify-between">
                <ThemeToggle />
                <button onClick={handleLogout} className="flex items-center justify-center p-2 rounded-md text-text-secondary hover:text-error hover:bg-error/10 transition-colors">
                  <LogOut size={16} />
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
