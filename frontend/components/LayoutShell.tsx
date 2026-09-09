"use client";

import { usePathname } from 'next/navigation';
import SocialFloat from "@/components/SocialFloat";
import CookieBanner from "@/components/CookieBanner";

/**
 * LayoutShell — Provides site-wide floating utilities (WhatsApp, Cookie banner)
 * without injecting redundant navbars or extra wrapping containers that cause
 * layout skew or double navbars on pages.
 */
export default function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isBareRoute =
    pathname?.startsWith('/admin') ||
    pathname?.startsWith('/wall') ||
    pathname?.startsWith('/mobile') ||
    pathname?.startsWith('/camera');

  // Bare routes (Admin, Live Wall, Guest Mobile Camera): no overlays
  if (isBareRoute) {
    return <>{children}</>;
  }

  // All public & dashboard routes: render children directly + floating helpers
  return (
    <>
      {children}
      <SocialFloat />
      <CookieBanner />
    </>
  );
}
