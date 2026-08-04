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
    <div className="min-h-screen bg-bg flex relative overflow-hidden">
      {/* Landing page background elements */}
      <div className="grain" />
      <div className="orbs">
        <div className="orb orb-primary opacity-40" />
        <div className="orb orb-secondary opacity-40" />
      </div>

      <DashboardNavigation />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto relative z-10 bg-bg">
        <div className="flex-1 flex flex-col h-full w-full p-4 md:p-8 lg:p-10">
          {children}
        </div>
      </div>
    </div>
  );
}
