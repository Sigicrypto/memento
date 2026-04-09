// Trigger fresh deployment
import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";
import { AppProviders } from "@/components/AppProviders";
import LayoutShell from "@/components/LayoutShell";

const inter = Nunito({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

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
    <html lang="en" className={`${inter.className}`}>
      <body className="min-h-screen w-full antialiased transition-colors duration-300" suppressHydrationWarning={true}>
        <AppProviders>
          <LayoutShell>
            {children}
          </LayoutShell>
        </AppProviders>
      </body>
    </html>
  );
}
