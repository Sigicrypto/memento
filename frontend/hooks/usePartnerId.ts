"use client";

import { useState, useEffect } from 'react';

const PARTNER_KEY = 'memento_partner_id';

function generateRandomPartnerId(): string {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `MEM-${code}`;
}

export function getOrCreatePartnerId(): string {
  if (typeof window === 'undefined') return 'MEM-2026';
  
  try {
    let existingId = localStorage.getItem(PARTNER_KEY);
    if (!existingId) {
      existingId = generateRandomPartnerId();
      localStorage.setItem(PARTNER_KEY, existingId);
    }
    return existingId;
  } catch {
    return 'MEM-2026';
  }
}

export function usePartnerId() {
  const [partnerId, setPartnerId] = useState<string>('MEM-2026');
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    setPartnerId(getOrCreatePartnerId());
  }, []);

  const copyPartnerId = () => {
    if (typeof navigator !== 'undefined' && partnerId) {
      navigator.clipboard.writeText(partnerId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return { partnerId, copyPartnerId, copied };
}
