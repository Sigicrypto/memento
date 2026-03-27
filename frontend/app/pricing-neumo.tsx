import Link from 'next/link';
import { cookies, headers } from 'next/headers';
import '../styles/neumorphic.css';

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

  const h = await headers();
  const countryCode =
    h.get('x-vercel-ip-country') ||
    h.get('cf-ipcountry') ||
    h.get('x-country');

  return countryCode === 'IN' ? 'IN' : 'GLOBAL';
}

export default async function PricingPage() {
  const region = await getRegion();

  return (
    <div className="neumo-dark min-h-screen pt-20 px-6 pb-12">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold bg-amber-500/20 text-amber-400 mb-6">
            5 Tiers • One-time Payment
          </div>
          <h1 className="text-5xl font-bold text-gray-200 mb-4">
            Pricing That Grows With You
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Start free, upgrade when you're ready. No subscriptions, no hidden fees.
          </p>
        </div>

        {/* Pricing Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">

          {PLANS.map((plan, idx) => {
            const price = region === 'IN' ? plan.priceIN : plan.priceGlobal;

            return (
              <div
                key={idx}
                className={`neumo-container neumo-container-dark p-6 flex flex-col justify-between ${
                  plan.highlight ? 'scale-105 border border-blue-500' : ''
                }`}
              >
                <div>
                  {plan.highlight && (
                    <div className="text-center text-sm text-amber-400 mb-2 font-semibold">
                      💎 Sweet Spot
                    </div>
                  )}
                  {plan.name === 'Free' && (
                    <div className="text-center text-sm text-green-400 mb-2 font-semibold">
                      🎯 Try It Free
                    </div>
                  )}
                  {plan.name === 'White Label' && (
                    <div className="text-center text-sm text-purple-400 mb-2 font-semibold">
                      🏢 For Agencies
                    </div>
                  )}

                  <h2 className="text-2xl font-bold text-gray-200 text-center mb-2">
                    {plan.name}
                  </h2>

                  <div className="text-center text-3xl font-bold text-gray-200 mb-6">
                    {price}
                    <div className="text-sm text-gray-400 font-normal">One-time</div>
                  </div>

                  <ul className="space-y-2 text-sm">
                    {plan.features.map((f, i) => (
                      <li
                        key={i}
                        className={`flex items-start gap-2 ${
                          f.included ? 'text-gray-300' : 'text-gray-500 line-through'
                        }`}
                      >
                        <span className="mt-0.5">{f.included ? '✓' : '✕'}</span>
                        <span>{f.label}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Link
                  href={`/checkout?plan=${plan.name.toUpperCase()}`}
                  className={`mt-6 text-center py-3 rounded-lg font-semibold transition ${
                    plan.highlight
                      ? 'bg-gradient-to-r from-amber-500 to-pink-500 text-white hover:shadow-lg'
                      : plan.name === 'Free'
                      ? 'bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30'
                      : 'neumo-btn neumo-btn-dark text-gray-200'
                  }`}
                >
                  {plan.name === 'Free' ? 'Start Free' : plan.name === 'White Label' ? 'Contact Sales' : 'Get Started'}
                </Link>
              </div>
            );
          })}
        </div>

        {/* Feature Comparison Table */}
        <div className="mt-20">
          <h2 className="text-3xl font-bold text-gray-200 text-center mb-12">
            Compare at a Glance
          </h2>
          <div className="neumo-container neumo-container-dark overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left p-4 text-gray-400">Feature</th>
                  <th className="text-center p-4 text-gray-200">Free</th>
                  <th className="text-center p-4 text-gray-200">₹2,500</th>
                  <th className="text-center p-4 text-amber-400">₹5,000</th>
                  <th className="text-center p-4 text-gray-200">₹7,500</th>
                  <th className="text-center p-4 text-purple-400">₹10,000</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-800">
                  <td className="p-4 text-gray-300">Photo Upload</td>
                  <td className="text-center p-4">✅</td>
                  <td className="text-center p-4">✅</td>
                  <td className="text-center p-4">✅</td>
                  <td className="text-center p-4">✅</td>
                  <td className="text-center p-4">✅</td>
                </tr>
                <tr className="border-b border-gray-800">
                  <td className="p-4 text-gray-300">Download ZIP</td>
                  <td className="text-center p-4 text-red-400">❌</td>
                  <td className="text-center p-4">✅</td>
                  <td className="text-center p-4">✅</td>
                  <td className="text-center p-4">✅</td>
                  <td className="text-center p-4">✅</td>
                </tr>
                <tr className="border-b border-gray-800">
                  <td className="p-4 text-gray-300">Watermark</td>
                  <td className="text-center p-4">✅</td>
                  <td className="text-center p-4">✅</td>
                  <td className="text-center p-4 text-green-400">❌</td>
                  <td className="text-center p-4 text-green-400">❌</td>
                  <td className="text-center p-4 text-green-400">❌</td>
                </tr>
                <tr className="border-b border-gray-800">
                  <td className="p-4 text-gray-300">Live Slideshow</td>
                  <td className="text-center p-4 text-red-400">❌</td>
                  <td className="text-center p-4 text-red-400">❌</td>
                  <td className="text-center p-4">✅</td>
                  <td className="text-center p-4">✅</td>
                  <td className="text-center p-4">✅</td>
                </tr>
                <tr className="border-b border-gray-800">
                  <td className="p-4 text-gray-300">Video Uploads</td>
                  <td className="text-center p-4 text-red-400">❌</td>
                  <td className="text-center p-4 text-red-400">❌</td>
                  <td className="text-center p-4 text-red-400">❌</td>
                  <td className="text-center p-4">✅</td>
                  <td className="text-center p-4">✅</td>
                </tr>
                <tr className="border-b border-gray-800">
                  <td className="p-4 text-gray-300">Storage</td>
                  <td className="text-center p-4">2 days</td>
                  <td className="text-center p-4">30 days</td>
                  <td className="text-center p-4">3 months</td>
                  <td className="text-center p-4">6 months</td>
                  <td className="text-center p-4">1 year</td>
                </tr>
                <tr>
                  <td className="p-4 text-gray-300">White Label</td>
                  <td className="text-center p-4 text-red-400">❌</td>
                  <td className="text-center p-4 text-red-400">❌</td>
                  <td className="text-center p-4 text-red-400">❌</td>
                  <td className="text-center p-4 text-red-400">❌</td>
                  <td className="text-center p-4">✅</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-20">
          <div className="neumo-container neumo-container-dark p-8">
            <h2 className="text-3xl font-bold text-gray-200 mb-4">
              Ready to capture every moment?
            </h2>
            <p className="text-gray-400 mb-8">
              Join thousands of events using Memento
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/create"
                className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-8 py-4 rounded-lg font-semibold hover:shadow-lg transition"
              >
                Start Free Event
              </Link>
              <Link
                href="/demo"
                className="neumo-btn neumo-btn-dark px-8 py-4 font-semibold"
              >
                View Demo
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}