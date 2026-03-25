import Link from 'next/link';
import { cookies } from 'next/headers';

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

function getRegionFromCookie(): Region {
  const region = cookies().get('livewall_region')?.value;
  return region === 'IN' ? 'IN' : 'GLOBAL';
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

export default function Pricing() {
  const region = getRegionFromCookie();
  const price = getSignaturePrice(region);
  const regionLabel = region === 'IN' ? 'India pricing' : 'Global pricing';

  return (
    <section id="pricing" className="relative z-10 w-full flex flex-col items-center px-6 py-32 bg-gradient-to-b from-transparent via-purple-500/5 to-transparent">
      {/* Title & Subtitle */}
      <p className="text-purple-500 text-sm font-semibold uppercase tracking-widest mb-5">Pricing</p>
      <h2
        className="font-bold text-gray-900 dark:text-white mb-6 text-center"
        style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', lineHeight: '1.25' }}
      >
        Choose <span className="gradient-text">Signature</span> for your event
      </h2>
      <p className="text-gray-500 dark:text-gray-400 text-center max-w-md mb-12 text-sm">
        One-time purchase with the same experience for every wall.
      </p>

      {/* Single Signature Card */}
      <div className="grid grid-cols-1 w-full max-w-5xl px-4">
        <div className="relative p-[1px] rounded-3xl transition-all duration-500 hover:scale-[1.02] hover:-translate-y-1 shadow-lg hover:shadow-xl bg-gradient-to-br from-purple-500/30 via-transparent to-pink-500/20">
          <div
            className="flex flex-col justify-between overflow-hidden relative h-full bg-white/95 dark:bg-purple-950/60 backdrop-blur-xl group"
            style={{ padding: '2.5rem', borderRadius: '23px' }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

            <div className="relative z-10">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-purple-600/15 to-cyan-400/10 flex items-center justify-center text-2xl shadow-inner">
                    ✨
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">{SIGNATURE.name}</h3>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-gradient-to-r from-purple-600 to-indigo-600 text-white uppercase tracking-wider shadow-md">
                    One-time
                  </span>
                  <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-white/40 dark:bg-white/10 border border-purple-500/20 text-purple-700 dark:text-purple-300">
                    {regionLabel}
                  </span>
                </div>
              </div>

              <p className="text-gray-500 dark:text-gray-400 text-xs mb-6 min-h-[40px] leading-relaxed">
                {SIGNATURE.description}
              </p>

              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-gray-900 dark:text-white transition-all duration-300">
                    {price.display}
                  </span>
                  <span className="text-gray-400 dark:text-gray-500 text-xs">/one time</span>
                </div>
                <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  Pay once. Keep your wall for the full Signature duration.
                </div>
              </div>

              <Link
                href="/checkout?plan=SIGNATURE"
                className="block w-full text-center py-3.5 rounded-xl text-xs font-bold mb-8 transition-all duration-300 border bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-transparent hover:from-purple-700 hover:to-indigo-700 shadow-md hover:shadow-purple-500/30 hover:scale-[1.01]"
              >
                Buy Signature now
              </Link>

              <div className="border-t border-gray-100/80 dark:border-purple-800/10 mb-6" />

              <ul className="space-y-3.5">
                {SIGNATURE.features.map((text, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-xs text-gray-600 dark:text-gray-300">
                    <svg
                      className="w-4 h-4 mt-0.5 flex-shrink-0 text-purple-500"
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
    </section>
  );
}
