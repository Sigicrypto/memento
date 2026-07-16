// Trigger fresh deployment
import type { Metadata, Viewport } from "next";
import { Outfit, Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import { AppProviders } from "@/components/AppProviders";
import LayoutShell from "@/components/LayoutShell";
import { ErrorBoundary } from "@/components/ErrorBoundary";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-outfit",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#0A0A0B",
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
  metadataBase: new URL('https://memento.app'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "Memento — Capture Every Moment",
    description: "QR-based live photo sharing for events, weddings, and parties. Guests scan, upload, and relive memories together in real-time.",
    url: 'https://memento.app',
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
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${outfit.variable} ${cormorant.variable}`}>
      <body className="min-h-screen w-full antialiased transition-colors duration-300 font-sans" suppressHydrationWarning={true}>
        <AppProviders>
          <ErrorBoundary>
            <LayoutShell>
              {children}
            </LayoutShell>
          </ErrorBoundary>
        </AppProviders>
      </body>
    </html>
  );
}
