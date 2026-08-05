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
    pathname?.startsWith('/checkout') ||
    pathname?.startsWith('/system') ||
    pathname?.startsWith('/privacy') ||
    pathname?.startsWith('/terms') ||
    pathname?.startsWith('/auth') ||
    pathname?.startsWith('/pending') ||
    pathname?.startsWith('/dashboard');

  if (isExcludedRoute) return null;

  return <ThemedNav />;
}
