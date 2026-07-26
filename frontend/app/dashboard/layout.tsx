import { Metadata } from 'next';
import Link from 'next/link';
import { Shield, LogOut, Layout, BarChart2, Settings, Menu } from 'lucide-react';
import AnimatedLogo from '@/components/AnimatedLogo';
import ThemeToggle from '@/components/ThemeToggle';

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Manage your events, view analytics, and control your photo walls.',
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-bg-subtle flex">
      {/* Sidebar (Desktop) */}
      <aside className="hidden md:flex flex-col w-64 border-r border-border bg-surface h-screen sticky top-0 left-0 z-40">
        <div className="h-[64px] border-b border-border flex items-center px-6">
          <Link href="/">
            <AnimatedLogo width={120} height={32} />
          </Link>
          <span className="ml-3 text-[10px] font-bold text-text-muted uppercase tracking-widest bg-bg-subtle px-2 py-0.5 rounded-full">Studio</span>
        </div>
        
        <div className="flex-1 overflow-y-auto py-6 px-4 flex flex-col gap-1">
          <p className="px-2 text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">Overview</p>
          
          <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2 rounded-md bg-bg-subtle text-text-primary font-medium text-sm transition-colors border border-border">
            <Layout size={16} className="text-accent-cyan" />
            Events
          </Link>
          
          <Link href="#" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-bg-subtle text-text-secondary hover:text-text-primary font-medium text-sm transition-colors border border-transparent">
            <BarChart2 size={16} />
            Analytics
          </Link>
          
          <Link href="#" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-bg-subtle text-text-secondary hover:text-text-primary font-medium text-sm transition-colors border border-transparent">
            <Settings size={16} />
            Settings
          </Link>
        </div>
        
        <div className="p-4 border-t border-border flex items-center justify-between">
          <ThemeToggle />
          <button className="flex items-center justify-center p-2 rounded-md text-text-secondary hover:text-error hover:bg-error/10 transition-colors">
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        {/* Mobile Header */}
        <header className="md:hidden h-[64px] border-b border-border bg-surface sticky top-0 z-40 flex items-center justify-between px-4">
          <Link href="/">
            <AnimatedLogo width={100} height={24} />
          </Link>
          <button className="p-2 text-text-secondary">
            <Menu size={20} />
          </button>
        </header>

        {children}
      </div>
    </div>
  );
}
