"use client";

import { usePathname } from 'next/navigation';
import ThemedNav from './ThemedNav';
import '../app/landing.css';

export default function Navbar() {
  const pathname = usePathname();

  if (pathname === '/') return <ThemedNav />;
  if (pathname?.startsWith('/wall/')) return null;
  if (pathname?.startsWith('/mobile/')) return null;
  if (pathname?.startsWith('/create')) return null;
  if (pathname?.startsWith('/dashboard')) return null;

  return <ThemedNav />;
}
