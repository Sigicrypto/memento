"use client";

import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function MainContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Pages that manage their own layout (have custom navbars + padding)
  const isSelfManaged =
    pathname === '/' ||
    pathname?.startsWith('/dashboard') ||
    pathname?.startsWith('/create') ||
    pathname?.startsWith('/wall/') ||
    pathname?.startsWith('/mobile/') ||
    pathname?.startsWith('/moderate/');

  return (
    <main className={`flex-1 w-full ${isSelfManaged ? '' : 'pt-32'}`}>
      {children}
    </main>
  );
}
