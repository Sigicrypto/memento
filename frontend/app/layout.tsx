// Trigger fresh deployment
import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { AppProviders } from "@/components/AppProviders";
import MainContent from "@/components/MainContent";
import SocialFloat from "@/components/SocialFloat";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import CustomCursor from "@/components/CustomCursor";
import "../styles/cursor.css";
import CookieBanner from "@/components/CookieBanner";
import BackgroundDecoration from "@/components/BackgroundDecoration";

const inter = Nunito({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Memento — Capture Every Moment",
  description: "QR-based live photo sharing for events, weddings, and parties. Guests scan, upload, and relive memories together in real-time.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.className}`}>
      <body className="min-h-screen w-full antialiased transition-colors duration-300" suppressHydrationWarning={true}>
        <AppProviders>
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
        </AppProviders>
      </body>
    </html>
  );
}
