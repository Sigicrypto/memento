"use client";

import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function MainContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Use pathname directly to ensure server and client render the same layout
  const isLanding = pathname === '/';

  return (
    <main className={`flex-1 w-full ${isLanding ? '' : 'pt-32'}`}>
      {children}
    </main>
  );
}
