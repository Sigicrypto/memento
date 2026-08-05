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
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 32px 64px' }}>
        {children}
      </div>
      <DashboardWhatsApp />
    </div>
  );
}
