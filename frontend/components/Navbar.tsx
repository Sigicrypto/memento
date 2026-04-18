"use client";

import { usePathname } from 'next/navigation';
import ThemedNav from './ThemedNav';

export default function Navbar() {
  const pathname = usePathname();
  const isSpecialRoute = 
    pathname?.startsWith('/wall/') || 
    pathname?.startsWith('/mobile/') || 
    pathname?.startsWith('/demo/');
  const isExcludedRoute = 
    pathname?.startsWith('/create') || 
    pathname?.startsWith('/dashboard');

  if (isSpecialRoute) return null;
  if (isExcludedRoute) return <ThemedNav mini={true} />;

  return <ThemedNav />;
}
