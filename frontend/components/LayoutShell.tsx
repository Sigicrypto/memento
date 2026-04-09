"use client";

import { usePathname } from 'next/navigation';
import Navbar from "@/components/Navbar";
import MainContent from "@/components/MainContent";
import SocialFloat from "@/components/SocialFloat";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import CustomCursor from "@/components/CustomCursor";
import CookieBanner from "@/components/CookieBanner";
import BackgroundDecoration from "@/components/BackgroundDecoration";
import "@/styles/cursor.css";

/**
 * LayoutShell — Conditionally renders the full site chrome (navbar, footer,
 * background, floating buttons) for user-facing pages, or a bare shell
 * for admin routes so /admin is completely standalone.
 */
export default function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminRoute = pathname.startsWith('/admin');

  // ── Admin routes: bare shell, no site chrome ──
  if (isAdminRoute) {
    return <>{children}</>;
  }

  // ── All other routes: full site chrome ──
  return (
    <>
      <div className="min-h-screen w-full flex flex-col">
        <BackgroundDecoration />
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
