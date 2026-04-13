import Link from 'next/link';
import { cookies, headers } from 'next/headers';
// import '../styles/neumorphic.css';

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
      { label: 'Up to 150 guests', included: true },
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
      { label: 'Up to 300 guests', included: true },
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
      { label: '💧 Branding-free experience', included: true },
      { label: '📊 Download analytics', included: true },
      { label: '👤 Face grouping (Beta)', included: true },
      { label: '☁️ Google Drive sync', included: true },
      { label: '🎯 Advanced moderation controls', included: true },
      { label: '📁 Multiple event walls', included: true },
      { label: '🚀 Priority processing', included: true },
      { label: '6 Months Storage', included: true },
      { label: 'Up to 500 guests (or unlimited)', included: true },
    ],
  },
  {
    name: 'White Label',
    priceIN: '₹10,000',
    priceGlobal: '$120',
    features: [
      { label: 'Everything in Premium +', included: true },
      { label: '🔥 White Label Features:', included: true },
      { label: '💧 Watermark control (own branding)', included: true },
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
            4 Tiers • One-time Payment
          </div>
          <h1 className="text-5xl font-bold text-gray-200 mb-4">
            Pricing That Grows With You
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Choose your perfect plan. No subscriptions, no hidden fees.
          </p>
        </div>

        {/* Pricing Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

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
                      : 'neumo-btn neumo-btn-dark text-gray-200'
                  }`}
                >
                  {plan.name === 'White Label' ? 'Contact Sales' : 'Get Started'}
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
                  <th className="text-center p-4 text-green-400">🟢 Starter</th>
                  <th className="text-center p-4 text-blue-400">🔵 Plus</th>
                  <th className="text-center p-4 text-purple-400">🟣 Premium</th>
                  <th className="text-center p-4 text-yellow-400">🟡 White Label</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-800">
                  <td className="p-4 text-gray-300">Unlimited Photos</td>
                  <td className="text-center p-4">✅</td>
                  <td className="text-center p-4">✅</td>
                  <td className="text-center p-4">✅</td>
                  <td className="text-center p-4">✅</td>
                </tr>
                <tr className="border-b border-gray-800">
                  <td className="p-4 text-gray-300">Download ZIP</td>
                  <td className="text-center p-4">✅</td>
                  <td className="text-center p-4">✅</td>
                  <td className="text-center p-4">✅</td>
                  <td className="text-center p-4">✅</td>
                </tr>
                <tr className="border-b border-gray-800">
                  <td className="p-4 text-gray-300">Guest Downloads</td>
                  <td className="text-center p-4">✅</td>
                  <td className="text-center p-4">✅</td>
                  <td className="text-center p-4">✅</td>
                  <td className="text-center p-4">✅</td>
                </tr>
                <tr className="border-b border-gray-800">
                  <td className="p-4 text-gray-300">Live Slideshow</td>
                  <td className="text-center p-4">✅</td>
                  <td className="text-center p-4">✅</td>
                  <td className="text-center p-4">✅</td>
                  <td className="text-center p-4">✅</td>
                </tr>
                <tr className="border-b border-gray-800">
                  <td className="p-4 text-gray-300">Video Uploads</td>
                  <td className="text-center p-4 text-red-400">❌</td>
                  <td className="text-center p-4">✅</td>
                  <td className="text-center p-4">✅</td>
                  <td className="text-center p-4">✅</td>
                </tr>
                <tr className="border-b border-gray-800">
                  <td className="p-4 text-gray-300">Storage</td>
                  <td className="text-center p-4">1 month</td>
                  <td className="text-center p-4">3 months</td>
                  <td className="text-center p-4">6 months</td>
                  <td className="text-center p-4">6 months</td>
                </tr>
                <tr className="border-b border-gray-800">
                  <td className="p-4 text-gray-300">Clean Wall (No Watermark)</td>
                  <td className="text-center p-4 text-red-400">❌</td>
                  <td className="text-center p-4 text-red-400">❌</td>
                  <td className="text-center p-4">✅</td>
                  <td className="text-center p-4">✅</td>
                </tr>
                <tr className="border-b border-gray-800">
                  <td className="p-4 text-gray-300">Custom Branding (Own Logo)</td>
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
                className="bg-gradient-to-r from-amber-500 to-pink-500 text-white px-8 py-4 rounded-lg font-semibold hover:shadow-lg transition"
              >
                Start at ₹2,500
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