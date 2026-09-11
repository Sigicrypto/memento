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
    default: "MyMemento — Live Photo Wall for Weddings, Events & Studios",
    template: "%s | MyMemento"
  },
  description: "The live photo sharing add-on for weddings, events, and photographers. Guests scan QR, candid photos stream to venue screens in real time, with a private gallery archive.",
  keywords: ["MyMemento", "live photo wall", "wedding photo wall", "event live photo sharing", "wedding guest photos", "white-label photo wall", "photographer add-on"],
  authors: [{ name: "MyMemento Team" }],
  creator: "MyMemento",
  publisher: "MyMemento",
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
    title: "MyMemento — Live Photo Wall for Weddings, Events & Studios",
    description: "The live photo sharing add-on for weddings, events, and photographers. Guests scan QR, candid photos stream to venue screens in real time, with a private gallery archive.",
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://www.mymementoapp.com',
    siteName: 'MyMemento',
    images: [
      {
        url: '/memento-camera-logo.png',
        width: 1024,
        height: 869,
        alt: 'MyMemento — Live Photo Wall',
      },
    ],
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "MyMemento — Live Photo Wall for Weddings, Events & Studios",
    description: "The live photo sharing add-on for weddings, events, and photographers. Guests scan QR, candid photos stream to venue screens in real time, with a private gallery archive.",
    images: ['/memento-camera-logo.png'],
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'MyMemento',
  },
  icons: {
    icon: '/favicon.png',
    shortcut: '/favicon.png',
    apple: '/memento-camera-logo.png',
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
