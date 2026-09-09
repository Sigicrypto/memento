import StudioNav from '@/components/studio/StudioNav';

export const metadata = {
  title: 'Studio Dashboard | Memento',
  description: 'Manage your events, track guests, and deliver photo memories from your photographer studio dashboard.',
};

export default function StudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-bg">
      <StudioNav />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
