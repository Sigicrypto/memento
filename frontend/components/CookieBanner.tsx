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
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:bottom-6 md:max-w-sm bg-surface/95 backdrop-blur-xl border border-border rounded-2xl p-5 shadow-xl z-50 animate-in slide-in-from-bottom-5">
      <h3 className="font-bold mb-3 flex items-center gap-2 text-text-primary">
        <span className="text-xl">🍪</span> We value your privacy
      </h3>
      <p className="text-xs mb-5 text-text-primary leading-relaxed">
        We use essential cookies to make our site work. With your consent, we may also use non-essential cookies to improve user experience and analyze website traffic.
      </p>
      <div className="flex gap-3">
        <button onClick={accept} className="btn btn-primary flex-1 py-2.5 rounded-xl text-xs font-bold">
          Accept
        </button>
        <button onClick={decline} className="btn btn-secondary flex-1 py-2.5 rounded-xl text-xs font-bold">
          Decline Optional
        </button>
      </div>
    </div>
  );
}
