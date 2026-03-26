import Link from 'next/link';
import { cookies, headers } from 'next/headers';

type Region = 'IN' | 'GLOBAL';

const SIGNATURE = {
  name: 'Signature',
  description: 'Everything in Premium and more for top-tier events.',
  features: [
    'Upload for a full year',
    'Organize with unlimited walls',
    'Embed on your website',
    'Zapier integrations',
    'FTP Server Access',
    '1 Year Upload / 1 Year Storage',
    'Everything in Premium',
  ],
};

async function getRegion(): Promise<Region> {
  const cookieStore = await cookies();
  const cookieRegion = cookieStore.get('livewall_region')?.value;
  if (cookieRegion === 'IN') return 'IN';

  // Fallback for first render (middleware cookie may not be present yet)
  const h = await headers();
  const countryCode = h.get('x-vercel-ip-country') || h.get('cf-ipcountry') || h.get('x-country');
  return countryCode === 'IN' ? 'IN' : 'GLOBAL';
}

function getSignaturePrice(region: Region) {
  if (region === 'IN') {
    return {
      display: '5000 INR',
    };
  }

  return {
    display: '60 USD',
  };
}

export default async function Pricing() {
  const region = await getRegion();
  const price = getSignaturePrice(region);
  const regionLabel = region === 'IN' ? 'India pricing' : 'Global pricing';

  return (
    <section className="min-h-screen bg-gradient-to-br from-gray-900 via-amber-900 to-gray-900 flex items-center justify-center px-4">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-4xl">
        {/* Title & Subtitle */}
        <div className="text-center mb-12">
          <p className="text-amber-400 text-sm font-semibold uppercase tracking-widest mb-5">Pricing</p>
          <h2 className="font-bold text-white mb-6 text-center" style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', lineHeight: '1.25' }}>
            Choose <span className="bg-gradient-to-r from-amber-400 to-rose-400 bg-clip-text text-transparent">Signature</span> for your event
          </h2>
          <p className="text-gray-400 text-center max-w-md mx-auto text-sm">
            One-time purchase with the same experience for every wall.
          </p>
        </div>

        {/* Single Signature Card */}
        <div className="relative">
          <div className="relative p-[1px] rounded-3xl transition-all duration-500 hover:scale-[1.02] hover:-translate-y-1 bg-gradient-to-br from-amber-500/30 via-transparent to-rose-500/20">
            <div className="flex flex-col justify-between overflow-hidden relative h-full bg-gray-800/50 backdrop-blur-xl group" style={{ padding: '2.5rem', borderRadius: '23px' }}>
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-rose-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

              <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-start gap-4">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-500/20 to-rose-500/20 flex items-center justify-center text-2xl shadow-inner">
                      ✨
                    </div>
                    <h3 className="text-2xl font-bold text-white tracking-tight">{SIGNATURE.name}</h3>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-gradient-to-r from-amber-500 to-rose-500 text-white uppercase tracking-wider shadow-md">
                      One-time
                    </span>
                    <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-amber-500/10 border border-amber-500/20 text-amber-400">
                      {regionLabel}
                    </span>
                  </div>
                </div>

                <p className="text-gray-400 text-xs mb-6 min-h-[40px] leading-relaxed">
                  {SIGNATURE.description}
                </p>

                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold text-white transition-all duration-300">
                      {price.display}
                    </span>
                    <span className="text-gray-500 text-xs">/one time</span>
                  </div>
                  <div className="mt-2 text-xs text-gray-500">
                    Pay once. Keep your wall for the full Signature duration.
                  </div>
                </div>

                <Link
                  href="/checkout?plan=SIGNATURE"
                  className="block w-full text-center py-3.5 rounded-xl text-xs font-bold mb-8 transition-all duration-300 bg-gradient-to-r from-amber-500 to-rose-500 text-white hover:from-amber-600 hover:to-rose-600 shadow-md hover:shadow-amber-500/30 hover:scale-[1.01]"
                >
                  Buy Signature now
                </Link>

                <div className="border-t border-gray-700 mb-6" />

                <ul className="space-y-3.5">
                  {SIGNATURE.features.map((text, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-xs text-gray-300">
                      <svg
                        className="w-4 h-4 mt-0.5 flex-shrink-0 text-amber-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2.5"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span>{text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
