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
    <section className="nm-page flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-lg">
        {/* Title */}
        <div className="text-center mb-12">
          <div className="nm-badge mx-auto mb-5">Pricing</div>
          <h2 className="font-bold mb-4" style={{color:'#e2e8f0', fontSize:'clamp(2rem,5vw,3rem)', lineHeight:'1.25'}}>
            Choose{' '}
            <span style={{background:'linear-gradient(135deg,#f59e0b,#f472b6)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text'}}>
              Signature
            </span>
          </h2>
          <p className="text-sm max-w-md mx-auto" style={{color:'#7f849c'}}>
            One-time purchase with the same experience for every wall.
          </p>
        </div>

        {/* Card */}
        <div className="nm-card p-10">
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-4">
              <div className="nm-circle w-12 h-12 text-2xl">✨</div>
              <h3 className="text-2xl font-bold" style={{color:'#e2e8f0'}}>{SIGNATURE.name}</h3>
            </div>
            <div className="flex flex-col items-end gap-2">
              <span className="nm-badge" style={{background:'linear-gradient(135deg,#f59e0b,#f472b6)',color:'#1e2235',boxShadow:'none'}}>One-time</span>
              <span className="nm-badge text-[10px]">{regionLabel}</span>
            </div>
          </div>

          <p className="text-xs mb-6 leading-relaxed" style={{color:'#7f849c'}}>{SIGNATURE.description}</p>

          <div className="nm-inset p-4 mb-6 rounded-2xl">
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-extrabold" style={{color:'#e2e8f0'}}>{price.display}</span>
              <span className="text-xs" style={{color:'#7f849c'}}>/one time</span>
            </div>
            <p className="text-xs mt-1" style={{color:'#4a4f6a'}}>Pay once. Keep your wall for the full Signature duration.</p>
          </div>

          <Link href="/checkout?plan=SIGNATURE" className="nm-btn nm-btn-accent block w-full text-center py-3.5 font-bold mb-8 text-sm">
            Buy Signature now
          </Link>

          <div className="nm-divider" />

          <ul className="space-y-3.5 mt-6">
            {SIGNATURE.features.map((text, idx) => (
              <li key={idx} className="flex items-start gap-3 text-xs" style={{color:'#e2e8f0'}}>
                <svg className="w-4 h-4 mt-0.5 flex-shrink-0" style={{color:'#f59e0b'}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                </svg>
                <span>{text}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
