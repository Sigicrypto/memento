import { Metadata } from 'next';
import Link from 'next/link';
import { Shield, LogOut, Layout, BarChart2, Settings, Menu } from 'lucide-react';
import AnimatedLogo from '@/components/AnimatedLogo';
import ThemeToggle from '@/components/ThemeToggle';
import DashboardNavigation from '@/components/DashboardNavigation';

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
      <DashboardNavigation />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto relative bg-bg">

        {/* IBelick Grid + Hero Patterns Background */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none w-full h-full">
          {/* IBelick subtle grid */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
          {/* Hero Patterns dots overlay */}
          <div className="absolute inset-0 bg-[radial-gradient(#80808020_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
        </div>

        <div className="relative z-10 flex-1 flex flex-col h-full w-full">
          {children}
        </div>
      </div>
    </div>
  );
}
