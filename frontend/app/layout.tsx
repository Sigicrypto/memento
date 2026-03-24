import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { ThemeProvider } from "../components/ThemeProvider";

const inter = Inter({
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
    <html lang="en" className={inter.className}>
      <body className="min-h-screen w-full antialiased transition-colors duration-300">
        <ThemeProvider>
          <div className="min-h-screen w-full flex flex-col">
            <Navbar />
            <main className="flex-1 w-full pt-20">
              {children}
            </main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
