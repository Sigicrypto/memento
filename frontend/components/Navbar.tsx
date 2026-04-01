"use client";

import { usePathname } from 'next/navigation';
import ThemedNav from './ThemedNav';
import '../app/landing.css';

export default function Navbar() {
  const pathname = usePathname();

  if (pathname === '/') return null;

  return <ThemedNav />;
}
