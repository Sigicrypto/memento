"use client";

import { usePathname } from 'next/navigation';
import Navbar from "@/components/Navbar";
import MainContent from "@/components/MainContent";
import SocialFloat from "@/components/SocialFloat";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import CustomCursor from "@/components/CustomCursor";
import CookieBanner from "@/components/CookieBanner";
import { BackgroundBeams } from "@/components/BackgroundBeams";
import "@/styles/cursor.css";

/**
 * LayoutShell — Conditionally renders the full site chrome (navbar, footer,
 * background, floating buttons) for user-facing pages, or a bare shell
 * for admin routes so /admin is completely standalone.
 */
export default function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminRoute = pathname.startsWith('/admin');

  // Pages that render their own complete layout (nav, background, etc.)
  const isStandaloneRoute =
    pathname === '/' ||
    pathname?.startsWith('/weddings') ||
    pathname?.startsWith('/professionals') ||
    pathname?.startsWith('/corporate-events') ||
    pathname?.startsWith('/pricing') ||
    pathname?.startsWith('/privacy') ||
    pathname?.startsWith('/terms') ||
    pathname?.startsWith('/checkout') ||
    pathname?.startsWith('/system') ||
    pathname?.startsWith('/demo') ||
    pathname?.startsWith('/wall') ||
    pathname?.startsWith('/mobile') ||
    pathname?.startsWith('/create') ||
    pathname?.startsWith('/dashboard');

  // ── Admin & standalone routes: bare shell, no site chrome ──
  if (isAdminRoute || isStandaloneRoute) {
    return <>{children}</>;
  }

  // ── All other routes: full site chrome ──
  return (
    <>
      <BackgroundBeams />
      <div className="min-h-screen w-full flex flex-col relative z-10">
        <Navbar />
        <MainContent>
          {children}
        </MainContent>
        <WhatsAppFloat />
        <SocialFloat />
        <CookieBanner />
      </div>
      <CustomCursor />
    </>
  );
}
