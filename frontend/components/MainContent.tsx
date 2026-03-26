"use client";

import { usePathname } from 'next/navigation';

export default function MainContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLanding = pathname === '/';

  return (
    <main className={`flex-1 w-full ${isLanding ? '' : 'pt-20'}`}>
      {children}
    </main>
  );
}
