import { Metadata } from 'next';
import Link from 'next/link';
import { Camera, ArrowLeft, Laptop, Wifi, CheckCircle2, ShieldCheck, Zap, Download, ExternalLink } from 'lucide-react';
import ThemedNav from '@/components/ThemedNav';
import Footer from '@/components/sections/Footer';

export const metadata: Metadata = {
  title: 'DSLR & Mirrorless Camera Live Sync Guide | Memento for Photographers',
  description: 'Complete guide for wedding photographers to wirelessly beam professional DSLR/mirrorless photos to the Memento Live Wall in real-time.',
};

export default function DSLRGuidePage() {
  return (
    <div className="min-h-screen bg-bg text-text-primary flex flex-col items-center w-full">
      <ThemedNav />

      <main className="w-full max-w-4xl mx-auto px-4 sm:px-6 pt-32 pb-24 flex flex-col items-center text-center">
        {/* Breadcrumb */}
        <div className="w-full flex justify-center mb-8">
          <Link
            href="/photographers"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-text-secondary hover:text-text-primary transition-colors mx-auto"
          >
            <ArrowLeft size={14} /> Back to For Photographers
          </Link>
        </div>

        {/* Hero Header */}
        <div className="mb-12 text-center flex flex-col items-center w-full max-w-3xl mx-auto">
          <span className="px-3.5 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-mono font-bold uppercase tracking-wider mb-4 inline-block mx-auto">
            Professional Studio Guide
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-text-primary tracking-tight font-display mb-4 text-center">
            How to Stream DSLR Photos Directly to the Live Wall
          </h1>
          <p className="text-text-secondary text-base sm:text-lg leading-relaxed max-w-2xl mx-auto text-center">
            Give your clients goosebumps during the reception: stream your professional portraits, first dance, and ceremony shots onto the venue screen alongside guest captures.
          </p>
        </div>

        {/* Architecture Overview */}
        <div className="rounded-2xl border border-border bg-surface p-6 sm:p-8 shadow-card mb-12 w-full flex flex-col items-center text-center">
          <h2 className="text-xl font-bold text-text-primary mb-3 font-display text-center">How It Works</h2>
          <p className="text-text-secondary text-sm leading-relaxed mb-6 text-center max-w-2xl mx-auto">
            Memento’s ingestion pipeline supports dual-stream inputs. While guests capture candid angles via their browser QR flow, the photographer’s mirrorless/DSLR camera can beam high-resolution JPEG selects to the live gallery simultaneously.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center w-full">
            <div className="p-5 rounded-xl bg-bg-subtle border border-border flex flex-col items-center text-center">
              <div className="w-10 h-10 rounded-xl bg-accent/10 text-accent flex items-center justify-center font-bold text-base mb-3 mx-auto">
                1
              </div>
              <h3 className="font-bold text-sm text-text-primary mb-1 text-center">Shoot & Rate</h3>
              <p className="text-xs text-text-secondary text-center leading-relaxed">
                Flag your best shots with in-camera 5-star ratings or lock button.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-bg-subtle border border-border flex flex-col items-center text-center">
              <div className="w-10 h-10 rounded-xl bg-accent/10 text-accent flex items-center justify-center font-bold text-base mb-3 mx-auto">
                2
              </div>
              <h3 className="font-bold text-sm text-text-primary mb-1 text-center">Wireless Sync</h3>
              <p className="text-xs text-text-secondary text-center leading-relaxed">
                Camera transfers selects via FTP / Wi-Fi to a folder or web uploader.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-bg-subtle border border-border flex flex-col items-center text-center">
              <div className="w-10 h-10 rounded-xl bg-accent/10 text-accent flex items-center justify-center font-bold text-base mb-3 mx-auto">
                3
              </div>
              <h3 className="font-bold text-sm text-text-primary mb-1 text-center">Instant Wall Sync</h3>
              <p className="text-xs text-text-secondary text-center leading-relaxed">
                Photos render in under 2s with your studio watermark or monogram.
              </p>
            </div>
          </div>
        </div>

        {/* Setup Methods */}
        <div className="space-y-8 mb-16 w-full text-center flex flex-col items-center max-w-3xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-text-primary font-display text-center">
            2 Battle-Tested Setup Methods
          </h2>

          {/* Method 1 */}
          <div className="rounded-2xl border border-border bg-surface p-6 sm:p-8 shadow-card w-full flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center mx-auto mb-3">
              <Laptop size={24} />
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-text-primary text-center">
              Method A: Tethered Laptop + Auto-Upload
            </h3>
            <span className="text-xs text-text-muted text-center block mt-1 mb-3">
              Recommended for receptions, studio booths & key ceremonies
            </span>
            <p className="text-sm text-text-secondary leading-relaxed mb-6 text-center max-w-xl mx-auto">
              Connect your camera via USB-C to an assistant's laptop running Capture One, Lightroom Tether, or Sony Imaging Edge. Set the export destination to an auto-sync web folder or drag selects into the Host Upload Portal.
            </p>
            <div className="flex flex-col items-center gap-2.5 max-w-md mx-auto text-center w-full">
              <div className="inline-flex items-center gap-2 text-xs text-text-secondary text-center justify-center">
                <CheckCircle2 size={15} className="text-green-600 shrink-0" />
                <span>Zero wireless latency — 100% reliable in packed reception halls</span>
              </div>
              <div className="inline-flex items-center gap-2 text-xs text-text-secondary text-center justify-center">
                <CheckCircle2 size={15} className="text-green-600 shrink-0" />
                <span>Instant color grading presets applied before hitting the Live Wall</span>
              </div>
            </div>
          </div>

          {/* Method 2 */}
          <div className="rounded-2xl border border-border bg-surface p-6 sm:p-8 shadow-card w-full flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center mx-auto mb-3">
              <Wifi size={24} />
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-text-primary text-center">
              Method B: Camera Wi-Fi / FTP Direct Transfer
            </h3>
            <span className="text-xs text-text-muted text-center block mt-1 mb-3">
              For Sony (A7 IV, A1), Canon (R5, R6), Nikon (Z8, Z9)
            </span>
            <p className="text-sm text-text-secondary leading-relaxed mb-6 text-center max-w-xl mx-auto">
              Modern mirrorless bodies support background FTP upload over Wi-Fi. Tether your camera to a mobile 5G hotspot and configure background transfer of tagged photos.
            </p>
            <div className="flex flex-col items-center gap-2.5 max-w-md mx-auto text-center w-full">
              <div className="inline-flex items-center gap-2 text-xs text-text-secondary text-center justify-center">
                <CheckCircle2 size={15} className="text-green-600 shrink-0" />
                <span>Roam untethered across the entire venue</span>
              </div>
              <div className="inline-flex items-center gap-2 text-xs text-text-secondary text-center justify-center">
                <CheckCircle2 size={15} className="text-green-600 shrink-0" />
                <span>Transmit medium-size JPEGs in seconds while keeping RAWs on your SD card</span>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Box */}
        <div className="rounded-2xl border border-accent/30 bg-accent/5 p-8 sm:p-10 text-center w-full max-w-2xl mx-auto flex flex-col items-center justify-center">
          <h3 className="text-xl font-bold text-text-primary mb-2 font-display text-center">
            Need Custom Tethering Setup Assistance?
          </h3>
          <p className="text-text-secondary text-sm max-w-lg mx-auto mb-6 text-center">
            Our photographer concierge can help configure your camera model, presets, and live wall resolution for your upcoming wedding.
          </p>
          <a
            href="https://api.whatsapp.com/send?phone=919866161775&text=Hi%2C%20I%20am%20a%20photographer%20and%20want%20to%20set%20up%20DSLR%20sync%20with%20Memento."
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-accent hover:bg-[#B8882F] text-white font-bold text-sm shadow-md transition-all cursor-pointer mx-auto text-center"
          >
            <span>Chat on WhatsApp (+91 9866161775)</span>
            <ExternalLink size={16} />
          </a>
        </div>
      </main>

      <Footer />
    </div>
  );
}
