"use client";

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function CookieBanner() {
  const [show, setShow] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const consent = localStorage.getItem('memento_cookie_consent');
    if (!consent) {
      setShow(true);
    }
  }, []);

  const accept = () => {
    localStorage.setItem('memento_cookie_consent', 'accepted');
    setShow(false);
  };

  const decline = () => {
    localStorage.setItem('memento_cookie_consent', 'declined');
    setShow(false);
  };

  if (!show) return null;
  if (pathname?.startsWith('/wall/') || pathname?.startsWith('/mobile/')) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:bottom-6 md:max-w-sm bg-black/60 backdrop-blur-xl border border-border rounded-2xl p-5 shadow-[0_0_30px_rgba(0,0,0,0.5)] z-50 animate-in slide-in-from-bottom-5">
      <h3 className="font-bold mb-3 flex items-center gap-2 text-text-primary">
        <span className="text-xl">🍪</span> We value your privacy
      </h3>
      <p className="text-xs mb-5 text-text-primary leading-relaxed">
        We use essential cookies to make our site work. With your consent, we may also use non-essential cookies to improve user experience and analyze website traffic.
      </p>
      <div className="flex gap-3">
        <button onClick={accept} className="flex-1 py-2.5 rounded-xl bg-amber-500/20 text-amber-500 border border-amber-500/40 text-xs font-bold hover:bg-amber-500/30 transition-all shadow-[0_0_10px_rgba(245,158,11,0.1)]">
          Accept
        </button>
        <button onClick={decline} className="flex-1 py-2.5 rounded-xl bg-white/5 border border-border text-text-primary text-xs font-bold hover:bg-white/10 hover:text-text-primary transition-all">
          Decline Optional
        </button>
      </div>
    </div>
  );
}
