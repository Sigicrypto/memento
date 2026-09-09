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
    <div className="min-h-screen bg-bg flex flex-col items-center w-full">
      <StudioNav />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 w-full flex flex-col items-center">
        {children}
      </main>
    </div>
  );
}
