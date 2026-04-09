import Link from 'next/link';
import { cookies, headers } from 'next/headers';

type Region = 'IN' | 'GLOBAL';

type Plan = {
  name: string;
  priceIN: string;
  priceGlobal: string;
  highlight?: boolean;
  stats: string;
  description: string;
  emoji: string;
  features: { label: string; included: boolean }[];
};

const PLANS: Plan[] = [
  {
    name: 'Starter',
    priceIN: '₹2,500',
    priceGlobal: '$30',
    emoji: '🟢',
    description: 'Perfect for small, basic events',
    stats: 'Up to 150 guests',
    features: [
      { label: 'Collect guest photos instantly', included: true },
      { label: 'Live photo wall', included: true },
      { label: 'Unlimited uploads', included: true },
      { label: 'Download all photos as ZIP', included: true },
      { label: '1 Month Storage', included: true }
    ],
  },
  {
    name: 'Standard',
    priceIN: '₹5,000',
    priceGlobal: '$60',
    highlight: true,
    emoji: '🔵',
    description: 'For interactive and lively events',
    stats: 'Up to 300 guests',
    features: [
      { label: 'Everything in Starter +', included: true },
      { label: '🎥 Auto album creation', included: true },
      { label: '🎨 Custom wall theme', included: true },
      { label: '📊 Simple analytics', included: true },
      { label: '📺 Slideshow TV Mode', included: true },
      { label: '❤️ Live reactions', included: true },
      { label: '3 Months Storage', included: true }
    ],
  },
  {
    name: 'Premium',
    priceIN: '₹7,500',
    priceGlobal: '$90',
    emoji: '🟣',
    description: 'For weddings & luxury experiences',
    stats: 'Unlimited guests',
    features: [
      { label: 'Everything in Standard +', included: true },
      { label: '🎶 Music slideshow', included: true },
      { label: '⏳ Expiring galleries', included: true },
      { label: '🛡️ Priority support', included: true },
      { label: '🔒 Advanced privacy options', included: true },
      { label: '☁️ Google Drive sync', included: true },
      { label: '6 Months Storage', included: true }
    ],
  },
  {
    name: 'White Label',
    priceIN: '₹10,000',
    priceGlobal: '$120',
    emoji: '🟡',
    description: 'For agencies & photographers',
    stats: 'Multi-event dashboard',
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

export default async function Pricing({ isEmbedded = false, eventId }: { isEmbedded?: boolean, eventId?: string }) {
  const region = await getRegion();

  return (
    <section id="pricing" className={`${isEmbedded ? 'pb-24 pt-12' : 'pt-32 pb-24'} px-6 relative z-10`}>
      <div className="max-w-7xl mx-auto">
        {!isEmbedded && (
          <div className="flex items-center justify-between mb-8">
            <Link href="/" className="flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-white transition-colors">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
              Back to Home
            </Link>
          </div>
        )}
        
        {/* Header */}
        <div className="text-center mb-16">
          <span className="kicker">One-time Payment • Per Event</span>
          <h2 className="text-4xl md:text-5xl font-extrabold mb-6 text-white tracking-tight">
            Pricing That <span className="gradient-text-vibrant">Grows With You</span>
          </h2>
          <p className="text-lg max-w-xl mx-auto text-slate-400">
            Simple, transparent pricing. No subscriptions, zero surprises.
          </p>
        </div>

        {/* Pricing Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-24">
          {PLANS.map((plan, idx) => {
            const price = region === 'IN' ? plan.priceIN : plan.priceGlobal;
            return (
              <div key={idx} className={`gcard price-card ${plan.highlight ? 'popular ring-2 ring-[#f59e0b] scale-105 z-10' : ''} cinematic-glow transition-all duration-500 hover:scale-[1.03] hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(245,158,11,0.2)]`}>
                <div className="gcard-border" />
                <div className="gcard-inner flex flex-col h-full">
                  {plan.highlight && <span className="popular-tag absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 to-rose-500 text-white text-[10px] font-black uppercase tracking-widest px-4 py-1 rounded-full shadow-lg">⭐ Most Popular</span>}

                  <div className="flex items-center gap-2 mb-2 mt-4">
                    <span className="text-2xl">{plan.emoji}</span>
                    <p className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-100 to-slate-400">{plan.name}</p>
                  </div>
                  
                  <p className="text-slate-400 text-sm mb-4 h-10">{plan.description}</p>
                  
                  <div className="text-4xl font-extrabold text-white mb-2 tracking-tight">
                    {price}
                  </div>
                  <span className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-8 block">per event • one-time</span>
                  
                  <Link
                    href={`/checkout?plan=${plan.name.toUpperCase().replace(' ', '_')}${eventId ? `&eventId=${eventId}` : ''}`}
                    className={`price-btn ${plan.highlight ? 'filled bg-gradient-to-r from-amber-500 to-rose-500 text-white border-0 py-3 shadow-lg shadow-amber-500/25' : 'bg-white/5 border border-white/10 hover:bg-white/10 text-white'} w-full text-center py-3 rounded-xl font-bold transition-all block mb-8 relative group overflow-hidden`}
                  >
                    <span className="relative z-10">{plan.name === 'White Label' ? 'Contact Sales' : 'Get Started'}</span>
                    {plan.highlight && <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />}
                  </Link>

                  <div className="w-full h-px bg-white/5 mb-6" />

                  <div className="mb-6">
                    <span className="text-xs uppercase tracking-widest text-[#f59e0b] font-bold">{plan.stats}</span>
                  </div>

                  <ul className="space-y-4 text-sm flex-grow">
                    {plan.features.map((f, i) => {
                      const isStorage = f.label.includes('Storage');
                      const isGuests = f.label.includes('guests');
                      return (
                        <li key={i} className={`flex items-start gap-3 ${f.included ? 'text-slate-300' : 'text-slate-600 line-through'}`}>
                          <span className={`mt-0.5 flex-shrink-0 ${f.included ? 'text-amber-500' : 'text-slate-700'}`}>
                            {f.included ? (
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                            ) : (
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                            )}
                          </span>
                          <span className={`leading-relaxed ${isStorage ? 'text-amber-200/90 font-medium' : ''} ${isGuests ? 'text-cyan-200/90 font-medium' : ''}`}>
                            {f.label}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>

        {/* Feature Comparison Table */}
        <div className="mb-24">
          <h3 className="text-3xl font-bold text-center mb-12 text-white">Compare at a Glance</h3>
          <div className="gcard cinematic-glow p-0 overflow-hidden border border-white/10 rounded-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-sm sm:text-base text-left text-slate-300">
                <thead className="bg-white/5 text-xs uppercase tracking-wider font-bold text-slate-400 border-b border-white/10">
                  <tr>
                    <th scope="col" className="px-6 py-5">Feature</th>
                    <th scope="col" className="px-6 py-5 text-center text-emerald-400">🟢 Starter</th>
                    <th scope="col" className="px-6 py-5 text-center text-blue-400">🔵 Standard</th>
                    <th scope="col" className="px-6 py-5 text-center text-purple-400">🟣 Premium</th>
                    <th scope="col" className="px-6 py-5 text-center text-amber-400">🟡 White Label</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  <tr className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4 font-medium text-white">Unlimited Photos</td>
                    <td className="px-6 py-4 text-center">✅</td>
                    <td className="px-6 py-4 text-center">✅</td>
                    <td className="px-6 py-4 text-center">✅</td>
                    <td className="px-6 py-4 text-center">✅</td>
                  </tr>
                  <tr className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4 font-medium text-white">Live Photo Wall</td>
                    <td className="px-6 py-4 text-center">✅</td>
                    <td className="px-6 py-4 text-center">✅</td>
                    <td className="px-6 py-4 text-center">✅</td>
                    <td className="px-6 py-4 text-center">✅</td>
                  </tr>
                  <tr className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4 font-medium text-white">Download ZIP</td>
                    <td className="px-6 py-4 text-center">✅</td>
                    <td className="px-6 py-4 text-center">✅</td>
                    <td className="px-6 py-4 text-center">✅</td>
                    <td className="px-6 py-4 text-center">✅</td>
                  </tr>
                  <tr className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4 font-medium text-white">Auto Album (AI)</td>
                    <td className="px-6 py-4 text-center opacity-40">❌</td>
                    <td className="px-6 py-4 text-center">✅</td>
                    <td className="px-6 py-4 text-center">✅</td>
                    <td className="px-6 py-4 text-center">✅</td>
                  </tr>
                  <tr className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4 font-medium text-white">Custom Wall Theme</td>
                    <td className="px-6 py-4 text-center opacity-40">❌</td>
                    <td className="px-6 py-4 text-center">✅</td>
                    <td className="px-6 py-4 text-center">✅</td>
                    <td className="px-6 py-4 text-center">✅</td>
                  </tr>
                  <tr className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4 font-medium text-white">Music Slideshow</td>
                    <td className="px-6 py-4 text-center opacity-40">❌</td>
                    <td className="px-6 py-4 text-center opacity-40">❌</td>
                    <td className="px-6 py-4 text-center">✅</td>
                    <td className="px-6 py-4 text-center">✅</td>
                  </tr>
                  <tr className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4 font-medium text-white">Storage</td>
                    <td className="px-6 py-4 text-center font-bold text-amber-200">1 month</td>
                    <td className="px-6 py-4 text-center font-bold text-amber-200">3 months</td>
                    <td className="px-6 py-4 text-center font-bold text-amber-200">6 months</td>
                    <td className="px-6 py-4 text-center font-bold text-amber-200">6 months</td>
                  </tr>
                  <tr className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4 font-medium text-white">White Label Branding</td>
                    <td className="px-6 py-4 text-center opacity-40">❌</td>
                    <td className="px-6 py-4 text-center opacity-40">❌</td>
                    <td className="px-6 py-4 text-center opacity-40">❌</td>
                    <td className="px-6 py-4 text-center">✅</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center max-w-3xl mx-auto">
          <div className="gcard cinematic-glow p-12 overflow-hidden relative">
            <div className="gcard-border" />
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-rose-500/10 -z-10" />
            <div className="relative z-10">
              <h3 className="text-3xl font-bold mb-4 text-white tracking-tight">Ready to capture every moment?</h3>
              <p className="mb-10 text-slate-400 text-lg">Join thousands of events using Memento</p>
              <div className="flex flex-col sm:flex-row gap-5 justify-center">
                <Link href="/create" className="btn-hero-primary shadow-xl shadow-amber-500/20 text-center">Start for ₹2,500</Link>
                <Link href="/demo" className="px-8 py-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all font-semibold text-white text-center flex items-center justify-center gap-2">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                  View Demo
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
