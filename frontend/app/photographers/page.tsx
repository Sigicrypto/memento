import { Metadata } from 'next';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { MonitorPlay, Layers, Download, ShieldCheck, LayoutDashboard, Palette, Camera } from 'lucide-react';
import ProfitCalculator from './ProfitCalculator';

export const metadata: Metadata = {
  title: 'For Photographers & Studios | Memento — Per-Event Photo Sharing',
  description: 'Collect every guest photo, run a live wall, and white-label it as your own. Simple per-event pricing from ₹999. No app installs for guests.',
};

const ThemedNav = dynamic(() => import('@/components/ThemedNav'));
const Footer = dynamic(() => import('@/components/sections/Footer'));

export default function PhotographersPage() {
  return (
    <div className="min-h-screen bg-bg text-text-primary font-sans">
      <ThemedNav />

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 lg:px-8 max-w-7xl mx-auto text-center">
        <div className="flex justify-center gap-4 mb-8 flex-wrap">
          <span className="px-4 py-1.5 rounded-full bg-surface border border-border text-sm font-medium shadow-sm text-text-primary">100% No-App</span>
          <span className="px-4 py-1.5 rounded-full bg-surface border border-border text-sm font-medium shadow-sm text-text-primary">Sub-2s Live Wall</span>
          <span className="px-4 py-1.5 rounded-full bg-surface border border-border text-sm font-medium shadow-sm text-text-primary">From ₹999/event</span>
        </div>
        <h1 className="text-4xl md:text-6xl font-display font-bold tracking-tight text-text-primary max-w-4xl mx-auto mb-6">
          Collect every guest photo, run a live wall, and look like a hero—without extra gear.
        </h1>
        <p className="text-lg md:text-xl text-text-secondary max-w-3xl mx-auto mb-10">
          No-app QR flow guests actually use. Studio white-labeling. Multi-event dashboard. Simple per-event pricing.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/create" className="px-8 py-4 bg-accent hover:bg-[#D9932B] text-white rounded-full font-semibold shadow-sm transition-all w-full sm:w-auto">
            Start Your Free Event
          </Link>
          <Link href="/pricing" className="px-8 py-4 bg-surface border border-border text-text-primary rounded-full font-semibold hover:bg-bg-subtle transition-colors w-full sm:w-auto">
            View Pricing
          </Link>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 md:py-28 px-6 lg:px-8 bg-bg-subtle border-y border-border">
        <div className="max-w-7xl mx-auto flex flex-col items-center text-center">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-center mb-16 text-text-primary">How It Works for Studios</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 w-full">
            {[
              { title: "Create Event", desc: "Set up your client's event in 60 seconds. Name, date, venue, guest tier." },
              { title: "Brand It", desc: "Apply your studio logo, colors, and couple monogram. Guests see YOUR brand." },
              { title: "Hand Off QR Kit", desc: "Download printable table cards and posters. Send event link to couple via WhatsApp." },
              { title: "Guests Scan & Share", desc: "No app install. Guests scan QR, snap photos, and everything appears on the live wall instantly." },
              { title: "Deliver & Earn", desc: "Download full-resolution ZIP. Deliver to your client. Charge your markup." },
            ].map((step, i) => (
              <div key={i} className="relative flex flex-col items-center text-center p-6 rounded-2xl bg-surface border border-border shadow-card h-full justify-start">
                <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-display font-bold text-xl mb-5 relative z-10 mx-auto shadow-sm shrink-0">
                  {i + 1}
                </div>
                <h3 className="text-lg font-bold mb-2 text-center text-text-primary">{step.title}</h3>
                <p className="text-text-secondary text-sm text-center leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 md:py-28 px-6 lg:px-8 max-w-7xl mx-auto flex flex-col items-center text-center">
        <h2 className="text-3xl md:text-4xl font-display font-bold text-center mb-16 text-text-primary">Features Built for Pros</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 w-full">
          {[
            { icon: <Palette className="w-6 h-6 text-primary" />, title: "Studio White-Labeling", desc: "Your logo, your colors, your brand on every touchpoint. Clients never see 'Memento'." },
            { icon: <LayoutDashboard className="w-6 h-6 text-primary" />, title: "Multi-Event Dashboard", desc: "Manage all your client events from one command center. Track guests, photos, and revenue." },
            { icon: <MonitorPlay className="w-6 h-6 text-primary" />, title: "Live Photo Wall", desc: "Project guest photos in real-time at the reception. Guests love seeing their photos appear instantly." },
            { icon: <ShieldCheck className="w-6 h-6 text-primary" />, title: "Host Moderation", desc: "Approve or reject uploads before they appear. Full content control during live events." },
            { icon: <Layers className="w-6 h-6 text-primary" />, title: "Unlimited Photos & Videos", desc: "No per-photo limits. Guests can capture as many memories as they want." },
            { icon: <Download className="w-6 h-6 text-primary" />, title: "1-Click 4K ZIP", desc: "Download every photo in full resolution. Ready for editing and client delivery." },
          ].map((feat, i) => (
            <div key={i} className="rounded-2xl border border-border bg-surface p-6 shadow-card hover:shadow-card-hover transition-shadow flex flex-col items-center text-center h-full">
              <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-6 mx-auto">
                {feat.icon}
              </div>
              <h3 className="text-xl font-semibold mb-3 text-text-primary text-center">{feat.title}</h3>
              <p className="text-text-secondary leading-relaxed text-center">{feat.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 p-6 rounded-2xl border border-primary/20 bg-primary/5 flex flex-col items-center justify-center text-center gap-4 w-full max-w-2xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 text-center">
            <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center text-primary shrink-0 mx-auto">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-base text-text-primary text-center">Shooting on Mirrorless or DSLR?</h4>
              <p className="text-xs text-text-secondary text-center">Read our step-by-step wireless tethering & live sync guide for professional cameras.</p>
            </div>
          </div>
          <Link
            href="/photographers/dslr-guide"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-surface border border-border hover:border-primary text-xs font-bold text-text-primary shrink-0 transition-colors shadow-sm mx-auto"
          >
            <span>Read DSLR Guide</span>
            <span>→</span>
          </Link>
        </div>
      </section>

      {/* Pricing Summary */}
      <section className="py-20 md:py-28 px-6 lg:px-8 bg-bg-subtle border-y border-border text-center flex flex-col items-center">
        <div className="max-w-7xl mx-auto flex flex-col items-center text-center w-full">
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-16 text-text-primary text-center">Per-Event Pricing Summary</h2>
          <div className="flex flex-col md:flex-row justify-center items-center md:items-stretch gap-6 max-w-4xl w-full mx-auto mb-10 pt-4">
            {[
              { name: "Small", price: "₹999", desc: "Up to 100 Guests" },
              { name: "Medium", price: "₹1,999", desc: "100-300 Guests", highlighted: true },
              { name: "Large", price: "₹3,499", desc: "300+ Guests" },
            ].map((tier, i) => (
              <div key={i} className={`flex-1 w-full md:w-auto rounded-2xl p-8 flex flex-col items-center justify-center text-center bg-surface border shadow-card transition-all ${tier.highlighted ? 'border-2 border-accent ring-2 ring-accent/10 shadow-card-hover transform md:-translate-y-2' : 'border-border'}`}>
                <h3 className={`text-xl font-bold mb-3 text-center ${tier.highlighted ? 'text-accent' : 'text-text-primary'}`}>{tier.name}</h3>
                <div className="text-4xl font-display font-black text-text-primary mb-3 text-center">{tier.price}</div>
                <p className="text-text-secondary text-sm text-center">{tier.desc}</p>
              </div>
            ))}
          </div>
          <p className="text-base md:text-lg text-text-secondary mb-6 text-center">All features included at every tier. No hidden charges.</p>
          <div className="inline-block px-6 py-2 rounded-full bg-accent/10 border border-accent/20 text-accent font-bold text-sm mb-10 mx-auto">
            Studio Bundle: Book 5+ events → Save 15%
          </div>
          <div className="flex justify-center">
            <Link href="/pricing" className="inline-flex px-8 py-4 bg-surface border border-border text-text-primary rounded-full font-semibold hover:bg-bg-subtle transition-colors shadow-sm">
              See Full Pricing
            </Link>
          </div>
        </div>
      </section>

      {/* Profit Calculator Section */}
      <section className="py-20 md:py-28 px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-4 text-text-primary">Calculate Your Studio ROI</h2>
          <p className="text-text-secondary text-lg">See how much extra revenue you can generate by offering Memento live walls to your clients.</p>
        </div>
        <ProfitCalculator />
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 lg:px-8 bg-gradient-to-b from-amber-50/50 to-bg border-t border-border text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-display font-black text-text-primary mb-6 tracking-tight">Ready to add live photo sharing to every event?</h2>
          <p className="text-xl text-text-secondary mb-10">Join 500+ photographers and studios already using Memento.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <a 
              href="https://wa.me/919866161775?text=Hi,%20I'm%20a%20photographer%20interested%20in%20Memento%20for%20my%20studio.%20I'd%20like%20a%20demo." 
              target="_blank" 
              rel="noopener noreferrer"
              className="px-8 py-4 bg-[#25D366] hover:bg-[#20b858] text-white rounded-full font-bold shadow-sm transition-colors w-full sm:w-auto"
            >
              Book a Free Demo
            </a>
            <span className="text-text-muted text-sm">or</span>
            <Link href="/create" className="text-primary font-bold hover:underline transition-all">
              Start with a free event →
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
