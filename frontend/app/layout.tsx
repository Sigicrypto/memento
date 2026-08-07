// Trigger fresh deployment
import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { AppProviders } from "@/components/AppProviders";
import LayoutShell from "@/components/LayoutShell";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Analytics } from "@vercel/analytics/next";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#07080B",
};

export const metadata: Metadata = {
  title: {
    default: "Memento — Capture Every Moment",
    template: "%s | Memento"
  },
  description: "QR-based live photo sharing for events, weddings, and parties. Guests scan, upload, and relive memories together in real-time.",
  keywords: ["photo sharing", "event photos", "wedding photo wall", "live gallery", "QR photo upload", "event app"],
  authors: [{ name: "Memento Team" }],
  creator: "Memento",
  publisher: "Memento",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://www.mymementoapp.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "Memento — Capture Every Moment",
    description: "QR-based live photo sharing for events, weddings, and parties. Guests scan, upload, and relive memories together in real-time.",
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://www.mymementoapp.com',
    siteName: 'Memento',
    images: [
      {
        url: '/og-image.jpg', // User should add this to public/
        width: 1200,
        height: 630,
        alt: 'Memento - Live Event Photo Sharing',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Memento — Capture Every Moment",
    description: "QR-based live photo sharing for events, weddings, and parties. Guests scan, upload, and relive memories together in real-time.",
    images: ['/og-image.jpg'],
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Memento Hub',
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable}`} suppressHydrationWarning>
      <body className="min-h-screen w-full antialiased font-sans" suppressHydrationWarning>
        <AppProviders>
          <ErrorBoundary>
            <LayoutShell>
              {children}
            </LayoutShell>
          </ErrorBoundary>
        </AppProviders>
        <Analytics />
      </body>
    </html>
  );
}
