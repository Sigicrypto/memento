import Link from 'next/link';
import { cookies, headers } from 'next/headers';

type Region = 'IN' | 'GLOBAL';

type Plan = {
  name: string;
  priceIN: string;
  priceGlobal: string;
  highlight?: boolean;
  features: { label: string; included: boolean }[];
};

const PLANS: Plan[] = [
  {
    name: 'Starter',
    priceIN: '₹2,500',
    priceGlobal: '$30',
    features: [
      { label: 'Unlimited high-resolution photos', included: true },
      { label: 'Ultra-fast uploads worldwide', included: true },
      { label: 'Live Slideshow Wall', included: true },
      { label: 'Download all photos as ZIP', included: true },
      { label: 'Guests can download photos', included: true },
      { label: 'QR Code Access for uploads', included: true },
      { label: 'Password-protected gallery', included: true },
      { label: '1 Month Storage', included: true },
      { label: 'Up to 150 guests', included: true }
    ],
  },
  {
    name: 'Plus',
    priceIN: '₹5,000',
    priceGlobal: '$60',
    highlight: true,
    features: [
      { label: 'Everything in Starter +', included: true },
      { label: '🎥 Video uploads', included: true },
      { label: '🖼️ Polaroid-style Wall layout', included: true },
      { label: '❤️ Live reactions on photos', included: true },
      { label: '📺 Slideshow TV Mode', included: true },
      { label: '🎨 Custom styling (match your theme)', included: true },
      { label: '🔔 Notifications on uploads', included: true },
      { label: '🛡️ Automatic safety filter', included: true },
      { label: '🕒 Expiring gallery option', included: true },
      { label: '📘 Photo Book (PDF – Beta)', included: true },
      { label: '3 Months Storage', included: true },
      { label: 'Up to 300 guests', included: true }
    ],
  },
  {
    name: 'Premium',
    priceIN: '₹7,500',
    priceGlobal: '$90',
    features: [
      { label: 'Everything in Plus +', included: true },
      { label: '🤖 AI Auto Album (best shots selection)', included: true },
      { label: '🔒 Smart Privacy Downloads (guests only download photos they\'re in)', included: true },
      { label: '💧 Watermark control', included: true },
      { label: '📊 Download analytics', included: true },
      { label: '👤 Face grouping (Beta)', included: true },
      { label: '☁️ Google Drive sync', included: true },
      { label: '🎯 Advanced moderation controls', included: true },
      { label: '📁 Multiple event walls', included: true },
      { label: '🚀 Priority processing', included: true },
      { label: '6 Months Storage', included: true },
      { label: 'Up to 500 guests (or unlimited)', included: true }
    ],
  },
  {
    name: 'White Label',
    priceIN: '₹10,000',
    priceGlobal: '$120',
    features: [
      { label: 'Everything in Premium +', included: true },
      { label: '🔥 White Label Features:', included: true },
      { label: 'Full branding removal (your platform, your identity)', included: true },
      { label: 'Custom domain (e.g. photos.yourbrand.com)', included: true },
      { label: 'Upload your own logo & brand colors', included: true },
      { label: 'Multi-event dashboard', included: true },
      { label: 'Client access panels', included: true },
      { label: 'Resell rights 💰', included: true },
      { label: 'API / Zapier integrations', included: true },
      { label: 'Advanced analytics dashboard', included: true },
      { label: 'Priority support', included: true },
    ],
  },
];

async function getRegion(): Promise<Region> {
  const cookieStore = await cookies();
  const cookieRegion = cookieStore.get('livewall_region')?.value;
  if (cookieRegion === 'IN') return 'IN';

  // Fallback for first render (middleware cookie may not be present yet)
  const h = await headers();
  const countryCode = h.get('x-vercel-ip-country') || h.get('cf-ipcountry') || h.get('x-country');
  return countryCode === 'IN' ? 'IN' : 'GLOBAL';
}


export default async function Pricing() {
  const region = await getRegion();

  return (
    <section className="nm-page px-4 py-12">
      <div className="max-w-7xl mx-auto">
        {/* Top Nav */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/" className="flex items-center gap-2 text-xs font-medium transition-colors" style={{color:'#7f849c'}}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            Back to Home
          </Link>
          <Link href="/create" className="nm-btn px-4 py-2 text-xs font-bold" style={{color:'#f59e0b'}}>
            Get Started →
          </Link>
        </div>
        {/* Header */}
        <div className="text-center mb-12">
          <div className="nm-badge mx-auto mb-4 text-[10px]">4 Tiers • One-time Payment</div>
          <h2 className="text-2xl md:text-3xl font-bold mb-2" style={{color:'#e2e8f0', lineHeight:'1.2'}}>
            Pricing That{' '}
            <span style={{background:'linear-gradient(135deg,#f59e0b,#f472b6)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text'}}>
              Grows With You
            </span>
          </h2>
          <p className="text-sm max-w-sm mx-auto" style={{color:'#7f849c'}}>
            Choose your perfect plan. No subscriptions, no hidden fees.
          </p>
        </div>

        {/* Pricing Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {PLANS.map((plan, idx) => {
            const price = region === 'IN' ? plan.priceIN : plan.priceGlobal;
            return (
              <div key={idx} className={`nm-card p-6 flex flex-col justify-between ${
                plan.highlight ? 'ring-2 ring-[#f59e0b]' : ''
              }`}>
                <div>
                  <h3 className="text-xl font-bold text-center mb-2" style={{color:'#e2e8f0'}}>{plan.name}</h3>
                  <div className="text-center text-2xl font-bold mb-6" style={{color:'#e2e8f0'}}>
                    {price}
                    <div className="text-xs font-normal" style={{color:'#7f849c'}}>One-time</div>
                  </div>
                  <ul className="space-y-2 text-xs">
                    {plan.features.map((f, i) => (
                      <li key={i} className={`flex items-start gap-2 ${
                        f.included ? '' : 'line-through opacity-50'
                      }`} style={{color: f.included ? '#e2e8f0' : '#7f849c'}}>
                        <span className="mt-0.5">{f.included ? '✓' : '✕'}</span>
                        <span>{f.label}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <Link
                  href={`/checkout?plan=${plan.name.toUpperCase().replace(' ', '_')}`}
                  className={`mt-6 text-center py-3 rounded-lg font-semibold transition block ${
                    plan.highlight
                      ? 'bg-gradient-to-r from-amber-500 to-pink-500 text-white'
                      : 'nm-btn'
                  }`}>
                  {plan.name === 'White Label' ? 'Contact Sales' : 'Get Started'}
                </Link>
              </div>
            );
          })}
        </div>

        {/* Feature Comparison Table */}
        <div className="mb-20">
          <h3 className="text-2xl font-bold text-center mb-12" style={{color:'#e2e8f0'}}>Compare at a Glance</h3>
          <div className="nm-card overflow-hidden p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="nm-divider">
                  <th className="text-left p-4" style={{color:'#7f849c'}}>Feature</th>
                  <th className="text-center p-4" style={{color:'#22c55e'}}>🟢 Starter</th>
                  <th className="text-center p-4" style={{color:'#3b82f6'}}>🔵 Plus</th>
                  <th className="text-center p-4" style={{color:'#a855f7'}}>🟣 Premium</th>
                  <th className="text-center p-4" style={{color:'#eab308'}}>🟡 White Label</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-[#252c46]/20">
                  <td className="p-4" style={{color:'#e2e8f0'}}>Unlimited Photos</td>
                  <td className="text-center p-4">✅</td>
                  <td className="text-center p-4">✅</td>
                  <td className="text-center p-4">✅</td>
                  <td className="text-center p-4">✅</td>
                </tr>
                <tr className="border-b border-[#252c46]/20">
                  <td className="p-4" style={{color:'#e2e8f0'}}>Download ZIP</td>
                  <td className="text-center p-4">✅</td>
                  <td className="text-center p-4">✅</td>
                  <td className="text-center p-4">✅</td>
                  <td className="text-center p-4">✅</td>
                </tr>
                <tr className="border-b border-[#252c46]/20">
                  <td className="p-4" style={{color:'#e2e8f0'}}>Guest Downloads</td>
                  <td className="text-center p-4">✅</td>
                  <td className="text-center p-4">✅</td>
                  <td className="text-center p-4">✅</td>
                  <td className="text-center p-4">✅</td>
                </tr>
                <tr className="border-b border-[#252c46]/20">
                  <td className="p-4" style={{color:'#e2e8f0'}}>Live Slideshow</td>
                  <td className="text-center p-4">✅</td>
                  <td className="text-center p-4">✅</td>
                  <td className="text-center p-4">✅</td>
                  <td className="text-center p-4">✅</td>
                </tr>
                <tr className="border-b border-[#252c46]/20">
                  <td className="p-4" style={{color:'#e2e8f0'}}>Video Uploads</td>
                  <td className="text-center p-4" style={{color:'#f87171'}}>❌</td>
                  <td className="text-center p-4">✅</td>
                  <td className="text-center p-4" style={{color:'#f87171'}}>❌</td>
                  <td className="text-center p-4">✅</td>
                  <td className="text-center p-4">✅</td>
                </tr>
                <tr className="border-b border-[#252c46]/20">
                  <td className="p-4" style={{color:'#e2e8f0'}}>Storage</td>
                  <td className="text-center p-4">1 month</td>
                  <td className="text-center p-4">3 months</td>
                  <td className="text-center p-4">6 months</td>
                  <td className="text-center p-4">6 months</td>
                </tr>
                <tr>
                  <td className="p-4" style={{color:'#e2e8f0'}}>White Label</td>
                  <td className="text-center p-4" style={{color:'#f87171'}}>❌</td>
                  <td className="text-center p-4" style={{color:'#f87171'}}>❌</td>
                  <td className="text-center p-4" style={{color:'#f87171'}}>❌</td>
                  <td className="text-center p-4">✅</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <div className="nm-card p-8">
            <h3 className="text-2xl font-bold mb-4" style={{color:'#e2e8f0'}}>Ready to capture every moment?</h3>
            <p className="mb-8" style={{color:'#7f849c'}}>Join thousands of events using Memento</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/create" className="bg-gradient-to-r from-amber-500 to-pink-500 text-white px-8 py-4 rounded-lg font-semibold">Start at ₹2,500</Link>
              <Link href="/demo" className="nm-btn px-8 py-4 font-semibold">View Demo</Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
