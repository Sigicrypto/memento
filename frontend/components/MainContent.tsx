"use client";

import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function MainContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Prevent hydration mismatch by using consistent initial state
  const isLanding = mounted ? pathname === '/' : false;

  return (
    <main className={`flex-1 w-full ${isLanding ? '' : 'pt-20'}`}>
      {children}
    </main>
  );
}
