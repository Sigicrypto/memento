import Link from 'next/link';
import { cookies } from 'next/headers';
import { headers } from 'next/headers';
import '../styles/neumorphic.css';

type Region = 'IN' | 'GLOBAL';

const SIGNATURE = {
  name: 'Signature',
  description: 'Everything you need for professional events',
  features: [
    'Upload for a full year',
    'Unlimited photo uploads',
    'Beautiful gallery views',
    'Password protection',
    'Download all photos',
    'Priority support',
    'Custom branding',
    'Advanced moderation'
  ],
};

async function getRegion(): Promise<Region> {
  const cookieStore = await cookies();
  const cookieRegion = cookieStore.get('livewall_region')?.value;
  if (cookieRegion === 'IN') return 'IN';

  const h = await headers();
  const countryCode = h.get('x-vercel-ip-country') || h.get('cf-ipcountry') || h.get('x-country');
  return countryCode === 'IN' ? 'IN' : 'GLOBAL';
}

function getSignaturePrice(region: Region) {
  if (region === 'IN') {
    return { display: '₹5,000' };
  }
  return { display: '$60' };
}

export default async function NeumorphicPricingPage() {
  const region = await getRegion();
  const price = getSignaturePrice(region);
  const regionLabel = region === 'IN' ? 'India pricing' : 'Global pricing';

  return (
    <div className="neumo-dark min-h-screen">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 py-4 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/page-neumo" className="flex items-center gap-2">
                <div className="neumo-icon neumo-icon-dark w-10 h-10">
                  📷
                </div>
                <span className="text-xl font-bold text-gray-200">Memento</span>
              </Link>
            </div>
            
            <div className="flex items-center gap-4">
              <Link href="/page-neumo#features" className="text-gray-400 hover:text-gray-200 transition-colors">Features</Link>
              <Link href="/auth-neumo" className="neumo-btn neumo-btn-dark px-4 py-2">
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="pt-20 px-6 pb-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold bg-blue-500/20 text-blue-400 mb-6">
              Pricing
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-200 mb-6">
              Simple
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                {" "}Pricing
              </span>
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              One-time payment. No subscriptions. No hidden fees.
            </p>
          </div>

          {/* Pricing Card */}
          <div className="max-w-2xl mx-auto">
            <div className="neumo-container neumo-container-dark neumo-float">
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-3 mb-4">
                  <div className="neumo-icon neumo-icon-dark w-16 h-16 text-3xl">
                    ✨
                  </div>
                  <h2 className="text-3xl font-bold text-gray-200">{SIGNATURE.name}</h2>
                </div>
                <p className="text-gray-400 mb-6">{SIGNATURE.description}</p>
                
                <div className="mb-6">
                  <div className="text-5xl font-bold text-gray-200 mb-2">{price.display}</div>
                  <p className="text-gray-400 text-sm">One-time payment</p>
                </div>
                
                <div className="flex justify-center gap-3 mb-8">
                  <span className="neumo-icon neumo-icon-dark px-3 py-1 text-xs font-semibold text-blue-400">
                    One-time
                  </span>
                  <span className="neumo-icon neumo-icon-dark px-3 py-1 text-xs font-semibold text-gray-400">
                    {regionLabel}
                  </span>
                </div>
              </div>

              <Link
                href="/checkout?plan=SIGNATURE"
                className="neumo-btn neumo-btn-dark w-full py-4 text-lg font-semibold bg-gradient-to-r from-blue-500 to-purple-500 text-white mb-8"
              >
                Get Started Now
              </Link>

              <div className="border-t border-gray-700 pt-8">
                <h3 className="text-lg font-semibold text-gray-200 mb-6 text-center">Everything Included</h3>
                <ul className="space-y-4">
                  {SIGNATURE.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-3 text-gray-300">
                      <div className="neumo-icon neumo-icon-dark w-6 h-6 text-green-400 flex-shrink-0">
                        ✓
                      </div>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="mt-20 text-center">
            <h2 className="text-3xl font-bold text-gray-200 mb-8">Frequently Asked Questions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {[
                { q: "How long do photos stay?", a: "Photos are stored for 1 year with the Signature plan." },
                { q: "Can I upgrade later?", a: "Yes, you can upgrade at any time." },
                { q: "Is there a free trial?", a: "Try our live demo to see all features." },
                { q: "What payment methods?", a: "We accept all major credit cards and PayPal." }
              ].map((faq, i) => (
                <div key={i} className="neumo-card neumo-card-dark p-6 text-left">
                  <h3 className="text-lg font-semibold text-gray-200 mb-3">{faq.q}</h3>
                  <p className="text-gray-400">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="mt-16 text-center">
            <div className="neumo-container neumo-container-dark">
              <h2 className="text-3xl font-bold text-gray-200 mb-4">
                Ready to get started?
              </h2>
              <p className="text-gray-400 mb-8">
                Join thousands of events using Memento
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/create" className="neumo-btn neumo-btn-dark px-8 py-4 font-semibold">
                  Start Free
                </Link>
                <Link href="/demo" className="neumo-btn neumo-btn-dark px-8 py-4 font-semibold">
                  View Demo
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
