"use client";

import { useState, useEffect } from 'react';

export default function CookieBanner() {
  const [show, setShow] = useState(false);

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

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5 shadow-2xl z-50 animate-in slide-in-from-bottom-5">
      <h3 className="font-bold mb-2 flex items-center gap-2" style={{color:'var(--text1)'}}>
        <span>🍪</span> We value your privacy
      </h3>
      <p className="text-xs mb-4" style={{color:'var(--text2)'}}>
        We use essential cookies to make our site work. With your consent, we may also use non-essential cookies to improve user experience and analyze website traffic.
      </p>
      <div className="flex gap-3">
        <button onClick={accept} className="nm-btn nm-btn-accent flex-1 py-2 text-sm font-semibold">
          Accept
        </button>
        <button onClick={decline} className="nm-btn flex-1 py-2 text-sm" style={{color:'var(--text2)'}}>
          Decline Optional
        </button>
      </div>
    </div>
  );
}
