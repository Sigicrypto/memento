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
    name: 'Free',
    priceIN: '₹0',
    priceGlobal: '$0',
    features: [
      { label: 'Up to 100 photos', included: true },
      { label: 'QR Upload', included: true },
      { label: 'Basic live wall', included: true },
      { label: 'Memento watermark', included: true },
      { label: 'No downloads', included: false },
      { label: 'Storage: 48 hours', included: true },
      { label: 'No moderation', included: false },
    ],
  },
  {
    name: 'Starter',
    priceIN: '₹2,500',
    priceGlobal: '$30',
    features: [
      { label: 'Unlimited photos', included: true },
      { label: 'Download ZIP', included: true },
      { label: 'Guest downloads', included: true },
      { label: 'Basic customization', included: true },
      { label: 'QR code designs', included: true },
      { label: 'Storage: 30 days', included: true },
      { label: 'Memento watermark', included: true },
    ],
  },
  {
    name: 'Pro',
    priceIN: '₹5,000',
    priceGlobal: '$60',
    highlight: true,
    features: [
      { label: 'Live slideshow mode', included: true },
      { label: 'Photo moderation', included: true },
      { label: 'Password protection', included: true },
      { label: 'Remove watermark', included: true },
      { label: 'Multiple QR variants', included: true },
      { label: 'Storage: 3 months', included: true },
      { label: 'Extended customization', included: true },
    ],
  },
  {
    name: 'Premium',
    priceIN: '₹7,500',
    priceGlobal: '$90',
    features: [
      { label: 'Video uploads', included: true },
      { label: 'Google Drive sync', included: true },
      { label: 'AI moderation', included: true },
      { label: 'Upload notifications', included: true },
      { label: 'Luxury themes', included: true },
      { label: 'Multiple albums', included: true },
      { label: 'Storage: 6 months', included: true },
    ],
  },
  {
    name: 'White Label',
    priceIN: '₹10,000',
    priceGlobal: '$120',
    features: [
      { label: 'No Memento branding', included: true },
      { label: 'Custom domain', included: true },
      { label: 'Full brand control', included: true },
      { label: 'Embed in client sites', included: true },
      { label: 'Admin dashboard', included: true },
      { label: 'Bulk event creation', included: true },
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
    <section className="nm-page px-4 py-16">
      <div className="max-w-7xl mx-auto">
        {/* Top Nav */}
        <div className="flex items-center justify-between mb-12">
          <Link href="/" className="flex items-center gap-2 text-sm font-medium transition-colors" style={{color:'#7f849c'}}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            Back to Home
          </Link>
          <Link href="/create" className="nm-btn px-4 py-2 text-sm font-semibold" style={{color:'#f59e0b'}}>
            Get Started →
          </Link>
        </div>
        {/* Header */}
        <div className="text-center mb-16">
          <div className="nm-badge mx-auto mb-6">5 Tiers • One-time Payment</div>
          <h2 className="font-bold mb-4" style={{color:'#e2e8f0', fontSize:'clamp(2.5rem,6vw,4rem)', lineHeight:'1.2'}}>
            Pricing That{' '}
            <span style={{background:'linear-gradient(135deg,#f59e0b,#f472b6)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text'}}>
              Grows With You
            </span>
          </h2>
          <p className="text-lg max-w-2xl mx-auto" style={{color:'#7f849c'}}>
            Start free, upgrade when you're ready. No subscriptions, no hidden fees.
          </p>
        </div>

        {/* Pricing Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-20">
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
                  href={plan.name === 'Free' ? '/create' : `/checkout?plan=${plan.name.toUpperCase().replace(' ', '_')}`}
                  className={`mt-6 text-center py-3 rounded-lg font-semibold transition block ${
                    plan.highlight
                      ? 'bg-gradient-to-r from-amber-500 to-pink-500 text-white'
                      : plan.name === 'Free'
                      ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                      : 'nm-btn'
                  }`}>
                  {plan.name === 'Free' ? 'Start Free' : plan.name === 'White Label' ? 'Contact Sales' : 'Get Started'}
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
                  <th className="text-center p-4" style={{color:'#e2e8f0'}}>Free</th>
                  <th className="text-center p-4" style={{color:'#e2e8f0'}}>{region === 'IN' ? '₹2,500' : '$30'}</th>
                  <th className="text-center p-4" style={{color:'#f59e0b'}}>{region === 'IN' ? '₹5,000' : '$60'}</th>
                  <th className="text-center p-4" style={{color:'#e2e8f0'}}>{region === 'IN' ? '₹7,500' : '$90'}</th>
                  <th className="text-center p-4" style={{color:'#a78bfa'}}>{region === 'IN' ? '₹10,000' : '$120'}</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-[#252c46]/20">
                  <td className="p-4" style={{color:'#e2e8f0'}}>Photo Upload</td>
                  <td className="text-center p-4">✅</td>
                  <td className="text-center p-4">✅</td>
                  <td className="text-center p-4">✅</td>
                  <td className="text-center p-4">✅</td>
                  <td className="text-center p-4">✅</td>
                </tr>
                <tr className="border-b border-[#252c46]/20">
                  <td className="p-4" style={{color:'#e2e8f0'}}>Download ZIP</td>
                  <td className="text-center p-4" style={{color:'#f87171'}}>❌</td>
                  <td className="text-center p-4">✅</td>
                  <td className="text-center p-4">✅</td>
                  <td className="text-center p-4">✅</td>
                  <td className="text-center p-4">✅</td>
                </tr>
                <tr className="border-b border-[#252c46]/20">
                  <td className="p-4" style={{color:'#e2e8f0'}}>Watermark</td>
                  <td className="text-center p-4">✅</td>
                  <td className="text-center p-4">✅</td>
                  <td className="text-center p-4" style={{color:'#4ade80'}}>❌</td>
                  <td className="text-center p-4" style={{color:'#4ade80'}}>❌</td>
                  <td className="text-center p-4" style={{color:'#4ade80'}}>❌</td>
                </tr>
                <tr className="border-b border-[#252c46]/20">
                  <td className="p-4" style={{color:'#e2e8f0'}}>Live Slideshow</td>
                  <td className="text-center p-4" style={{color:'#f87171'}}>❌</td>
                  <td className="text-center p-4" style={{color:'#f87171'}}>❌</td>
                  <td className="text-center p-4">✅</td>
                  <td className="text-center p-4">✅</td>
                  <td className="text-center p-4">✅</td>
                </tr>
                <tr className="border-b border-[#252c46]/20">
                  <td className="p-4" style={{color:'#e2e8f0'}}>Video Uploads</td>
                  <td className="text-center p-4" style={{color:'#f87171'}}>❌</td>
                  <td className="text-center p-4" style={{color:'#f87171'}}>❌</td>
                  <td className="text-center p-4" style={{color:'#f87171'}}>❌</td>
                  <td className="text-center p-4">✅</td>
                  <td className="text-center p-4">✅</td>
                </tr>
                <tr className="border-b border-[#252c46]/20">
                  <td className="p-4" style={{color:'#e2e8f0'}}>Storage</td>
                  <td className="text-center p-4">2 days</td>
                  <td className="text-center p-4">30 days</td>
                  <td className="text-center p-4">3 months</td>
                  <td className="text-center p-4">6 months</td>
                  <td className="text-center p-4">1 year</td>
                </tr>
                <tr>
                  <td className="p-4" style={{color:'#e2e8f0'}}>White Label</td>
                  <td className="text-center p-4" style={{color:'#f87171'}}>❌</td>
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
              <Link href="/create" className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-8 py-4 rounded-lg font-semibold">Start Free Event</Link>
              <Link href="/demo" className="nm-btn px-8 py-4 font-semibold">View Demo</Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
