"use client";

import { usePathname } from 'next/navigation';
import ThemedNav from './ThemedNav';
import '../app/landing.css';

export default function Navbar() {
  const pathname = usePathname();
  const isMini = pathname?.startsWith('/wall/') || pathname?.startsWith('/mobile/');

  if (pathname === '/') return <ThemedNav />;
  if (isMini) return <ThemedNav mini={true} />;
  if (pathname?.startsWith('/create') || pathname?.startsWith('/dashboard')) return null;

  return <ThemedNav />;
}
