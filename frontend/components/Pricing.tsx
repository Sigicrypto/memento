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
      { label: 'Collect guest photos instantly', included: true },
      { label: 'Live photo wall', included: true },
      { label: 'Unlimited uploads', included: true },
      { label: 'Download all photos as ZIP', included: true },
      { label: '1 Month Storage', included: true },
      { label: 'Up to 150 guests', included: true }
    ],
  },
  {
    name: 'Standard',
    priceIN: '₹5,000',
    priceGlobal: '$60',
    highlight: true,
    features: [
      { label: 'Everything in Starter +', included: true },
      { label: '🎥 Auto album creation', included: true },
      { label: '🎨 Custom wall theme', included: true },
      { label: '📊 Simple analytics', included: true },
      { label: '📺 Slideshow TV Mode', included: true },
      { label: '❤️ Live reactions', included: true },
      { label: '3 Months Storage', included: true },
      { label: 'Up to 300 guests', included: true }
    ],
  },
  {
    name: 'Premium',
    priceIN: '₹7,500',
    priceGlobal: '$90',
    features: [
      { label: 'Everything in Standard +', included: true },
      { label: '🎶 Music slideshow', included: true },
      { label: '⏳ Expiring galleries', included: true },
      { label: '🛡️ Priority support', included: true },
      { label: '🔒 Advanced privacy options', included: true },
      { label: '☁️ Google Drive sync', included: true },
      { label: '6 Months Storage', included: true },
      { label: 'Unlimited guests', included: true }
    ],
  },
  {
    name: 'White Label',
    priceIN: '₹10,000',
    priceGlobal: '$120',
    features: [
      { label: 'Everything in Premium +', included: true },
      { label: '🔥 Full branding removal', included: true },
      { label: '🌐 Custom domain (e.g. photos.you.com)', included: true },
      { label: '💰 Partner resell rights', included: true },
      { label: '📊 Client management', included: true },
      { label: '🚀 Training & Priority Setup', included: true },
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


export default async function Pricing({ isEmbedded = false }: { isEmbedded?: boolean }) {
  const region = await getRegion();

  return (
    <section id="pricing" className={`${isEmbedded ? 'pb-24 pt-12' : 'nm-page pt-32 pb-24'} px-6`}>
      <div className="max-w-7xl mx-auto">
        {!isEmbedded && (
          <div className="flex items-center justify-between mb-8">
            <Link href="/" className="flex items-center gap-2 text-xs font-medium transition-colors" style={{color:'#7f849c'}}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
              Back to Home
            </Link>
            <Link href="/create" className="nm-btn px-4 py-2 text-xs font-bold" style={{color:'#f59e0b'}}>
              Get Started →
            </Link>
          </div>
        )}
        {/* Header */}
        <div className="text-center mb-12">
          <div className="nm-badge mx-auto mb-4 text-[10px]">One-time Payment • Per Event</div>
          <h2 className="text-2xl md:text-3xl font-bold mb-2" style={{color:'#e2e8f0', lineHeight:'1.2'}}>
            Pricing That{' '}
            <span style={{background:'linear-gradient(135deg,#f59e0b,#f472b6)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text'}}>
              Grows With You
            </span>
          </h2>
          <p className="text-sm max-w-sm mx-auto" style={{color:'#7f849c'}}>
            Simple, transparent pricing. No subscriptions, zero surprises.
          </p>
        </div>

        {/* Pricing Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
            {PLANS.map((plan, idx) => {
              const price = region === 'IN' ? plan.priceIN : plan.priceGlobal;
              return (
                <div key={idx} className={`nm-card p-8 flex flex-col justify-between transition-all duration-500 ${
                  plan.highlight ? 'ring-2 ring-[#f59e0b] scale-105 z-10' : 'hover:scale-[1.02]'
                }`}>
                  <div>
                    <h3 className="text-2xl font-bold text-center mb-2" style={{color:'#e2e8f0'}}>{plan.name}</h3>
                    <div className="text-center text-3xl font-bold mb-6" style={{color:'#e2e8f0'}}>
                      {price}
                      <div className="text-sm font-normal opacity-60">One-time</div>
                    </div>
                    <ul className="space-y-3.5 text-sm">
                      {plan.features.map((f, i) => {
                        const isStorage = f.label.includes('Storage');
                        const isGuests = f.label.includes('guests');
                        return (
                          <li key={i} className={`flex items-start gap-2.5 ${
                            f.included ? '' : 'line-through opacity-50'
                          }`} style={{color: f.included ? '#e2e8f0' : '#7f849c'}}>
                            <span className="mt-1 text-amber-500 flex-shrink-0">{f.included ? '✓' : '✕'}</span>
                            <span className={`leading-relaxed ${isStorage ? 'text-amber-300 font-semibold' : ''} ${isGuests ? 'text-blue-300' : ''}`}>
                              {f.label}
                            </span>
                          </li>
                        );
                      })}
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
          <h3 className="text-3xl font-bold text-center mb-12" style={{color:'#e2e8f0'}}>Compare at a Glance</h3>
          <div className="nm-card overflow-hidden p-0">
            <table className="w-full text-base">
              <thead>
                <tr className="nm-divider">
                  <th className="text-left p-4" style={{color:'#7f849c'}}>Feature</th>
                  <th className="text-center p-4" style={{color:'#22c55e'}}>🟢 Starter</th>
                  <th className="text-center p-4" style={{color:'#3b82f6'}}>🔵 Standard</th>
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
                  <td className="p-4" style={{color:'#e2e8f0'}}>Live Photo Wall</td>
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
                  <td className="p-4" style={{color:'#e2e8f0'}}>Auto Album (AI)</td>
                  <td className="text-center p-4" style={{color:'#f87171'}}>❌</td>
                  <td className="text-center p-4">✅</td>
                  <td className="text-center p-4">✅</td>
                  <td className="text-center p-4">✅</td>
                </tr>
                <tr className="border-b border-[#252c46]/20">
                  <td className="p-4" style={{color:'#e2e8f0'}}>Custom Wall Theme</td>
                  <td className="text-center p-4" style={{color:'#f87171'}}>❌</td>
                  <td className="text-center p-4">✅</td>
                  <td className="text-center p-4">✅</td>
                  <td className="text-center p-4">✅</td>
                </tr>
                <tr className="border-b border-[#252c46]/20">
                  <td className="p-4" style={{color:'#e2e8f0'}}>Music Slideshow</td>
                  <td className="text-center p-4" style={{color:'#f87171'}}>❌</td>
                  <td className="text-center p-4" style={{color:'#f87171'}}>❌</td>
                  <td className="text-center p-4">✅</td>
                  <td className="text-center p-4">✅</td>
                </tr>
                <tr className="border-b border-[#252c46]/20">
                  <td className="p-4" style={{color:'#e2e8f0'}}>Storage</td>
                  <td className="text-center p-4 font-semibold" style={{color:'#fcd34d'}}>1 month</td>
                  <td className="text-center p-4 font-semibold" style={{color:'#fcd34d'}}>3 months</td>
                  <td className="text-center p-4 font-semibold" style={{color:'#fcd34d'}}>6 months</td>
                  <td className="text-center p-4 font-semibold" style={{color:'#fcd34d'}}>6 months</td>
                </tr>
                <tr>
                  <td className="p-4" style={{color:'#e2e8f0'}}>White Label Branding</td>
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
