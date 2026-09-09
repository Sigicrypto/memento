"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, PlusCircle, Settings, ArrowLeft } from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';

const NAV_ITEMS = [
  { href: '/studio', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/studio/new-event', label: 'New Event', icon: PlusCircle },
  { href: '/studio/settings', label: 'Settings', icon: Settings },
];

export default function StudioNav() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-50 w-full bg-surface/95 backdrop-blur-md border-b border-border">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors"
            >
              <ArrowLeft size={16} />
              <span className="text-xs font-medium hidden sm:inline">Back to Site</span>
            </Link>
            <div className="w-px h-6 bg-border" />
            <Link href="/studio" className="flex items-center gap-2.5">
              <div className="h-9 px-2 rounded-lg bg-[#141210] border border-[#292524] shadow-sm flex items-center justify-center">
                <img
                  src="/CC logo.png"
                  alt="Memento Logo"
                  className="h-6 w-auto object-contain"
                />
              </div>
              <span className="font-bold text-text-primary text-sm tracking-tight hidden sm:inline">
                Studio <span className="text-accent">Hub</span>
              </span>
            </Link>
          </div>

          {/* Nav Links + Theme Toggle */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-1">
              {NAV_ITEMS.map((item) => {
                const isActive = pathname === item.href ||
                  (item.href !== '/studio' && pathname.startsWith(item.href));
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-200 ${
                      isActive
                        ? 'bg-accent/10 text-accent border border-accent/20'
                        : 'text-text-secondary hover:text-text-primary hover:bg-bg-subtle'
                    }`}
                  >
                    <Icon size={16} />
                    <span className="hidden sm:inline">{item.label}</span>
                  </Link>
                );
              })}
            </div>
            <div className="w-px h-5 bg-border hidden sm:block" />
            <ThemeToggle />
          </div>
        </div>
      </div>
    </nav>
  );
}
