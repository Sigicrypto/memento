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
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [origin, setOrigin] = useState<string>('https://mymementoapp.com');

  useEffect(() => {
    setPartnerId(getOrCreatePartnerId());
    if (typeof window !== 'undefined') {
      setOrigin(window.location.origin);
    }
  }, []);

  const partnerLink = `${origin}/join?ref=${partnerId}`;

  const copyPartnerId = () => {
    if (typeof navigator !== 'undefined' && partnerId) {
      navigator.clipboard.writeText(partnerId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const copyPartnerLink = () => {
    if (typeof navigator !== 'undefined' && partnerLink) {
      navigator.clipboard.writeText(partnerLink);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const shareText = `Check out Memento for live event photo walls & instant guest downloads! Join using my referral link: ${partnerLink}`;
  const whatsappShareUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;

  return {
    partnerId,
    partnerLink,
    copyPartnerId,
    copyPartnerLink,
    copied,
    copiedLink,
    whatsappShareUrl,
  };
}
