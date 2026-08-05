import { Metadata } from 'next';
import DashboardNavigation from '@/components/DashboardNavigation';
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
    <div className="min-h-screen bg-bg relative">
      <DashboardNavigation />

      {/* Main Content Area — pushed right by sidebar width on desktop */}
      <div
        style={{ paddingLeft: '256px' }}
        className="hidden md:block"
      >
        <div style={{ padding: '40px 48px' }}>
          {children}
        </div>
      </div>

      {/* Mobile: no sidebar offset, just top padding for the mobile header */}
      <div className="md:hidden">
        <div style={{ padding: '24px 16px' }}>
          {children}
        </div>
      </div>

      <DashboardWhatsApp />
    </div>
  );
}
