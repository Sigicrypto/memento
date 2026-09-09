// Trigger fresh deployment
import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import "./auth-dialog.css";
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
  themeColor: "#FAFAF9",
};

export const metadata: Metadata = {
  title: {
    default: "Memento — Live Photo Wall for Wedding Photographers & Studios",
    template: "%s | Memento"
  },
  description: "The live photo sharing add-on for wedding photographers and studios. Guests scan QR, candid photos stream to venue screens in real time, all branded under your studio.",
  keywords: ["wedding photographer tools", "live photo wall", "wedding studio add-on", "DSLR live sync", "wedding guest photos", "white-label photo wall", "event live wall"],
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
    title: "Memento — Live Photo Wall for Wedding Photographers & Studios",
    description: "The live photo sharing add-on for wedding photographers and studios. Guests scan QR, candid photos stream to venue screens in real time, all branded under your studio.",
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://www.mymementoapp.com',
    siteName: 'Memento',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Memento - Live Photo Wall for Wedding Photographers & Studios',
      },
    ],
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Memento — Live Photo Wall for Wedding Photographers & Studios",
    description: "The live photo sharing add-on for wedding photographers and studios. Guests scan QR, candid photos stream to venue screens in real time, all branded under your studio.",
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
      <body className="min-h-screen w-full antialiased font-sans bg-bg text-text-primary" suppressHydrationWarning>
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
