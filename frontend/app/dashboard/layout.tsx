import { Metadata } from 'next';
import DashboardWhatsApp from '@/components/DashboardWhatsApp';

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
    <div className="min-h-screen bg-bg text-text-primary flex flex-col items-center w-full">
      {children}
      <DashboardWhatsApp />
    </div>
  );
}
