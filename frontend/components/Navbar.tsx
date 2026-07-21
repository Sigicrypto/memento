"use client";

import { usePathname } from 'next/navigation';
import ThemedNav from './ThemedNav';

export default function Navbar() {
  const pathname = usePathname();
  const isExcludedRoute = 
    pathname?.startsWith('/wall/') || 
    pathname?.startsWith('/mobile/') || 
    pathname?.startsWith('/demo/') ||
    pathname?.startsWith('/create') || 
    pathname?.startsWith('/dashboard');

  if (isExcludedRoute) return null;

  return <ThemedNav />;
}
