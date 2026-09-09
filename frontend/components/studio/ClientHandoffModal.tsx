"use client";

import { useState } from 'react';
import { X, MessageSquare, Mail, Copy, Check, Download, QrCode, ExternalLink, Send } from 'lucide-react';

interface ClientHandoffModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventName: string;
  clientName?: string | null;
  clientPhone?: string | null;
  clientEmail?: string | null;
  slug: string;
}

export default function ClientHandoffModal({
  isOpen,
  onClose,
  eventName,
  clientName,
  clientPhone,
  clientEmail,
  slug,
}: ClientHandoffModalProps) {
  const [copiedLink, setCopiedLink] = useState<string | null>(null);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailStatus, setEmailStatus] = useState<'idle' | 'success' | 'error'>('idle');

  if (!isOpen) return null;

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://www.mymementoapp.com';
  const guestUploadUrl = `${origin}/mobile/${slug}`;
  const liveWallUrl = `${origin}/wall/${slug}`;

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLink(id);
    setTimeout(() => setCopiedLink(null), 2000);
  };

  const whatsappMessage = 
    `Hi ${clientName || 'there'}! 🎉 Here is your official Memento Live Photo Sharing kit for ${eventName}:\n\n` +
    `📸 1. Your Guests' Camera & Upload Link:\n${guestUploadUrl}\n\n` +
    `📺 2. Your Reception Live Wall:\n${liveWallUrl}\n\n` +
    `Simply display or print your QR code on guest tables so everyone can snap and share their photos instantly!`;

  const handleOpenWhatsApp = () => {
    const cleanPhone = (clientPhone || '').replace(/[^0-9]/g, '');
    const url = cleanPhone
      ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(whatsappMessage)}`
      : `https://api.whatsapp.com/send?text=${encodeURIComponent(whatsappMessage)}`;
    window.open(url, '_blank');
  };

  const handleSendEmail = async () => {
    if (!clientEmail) return;
    setSendingEmail(true);
    setEmailStatus('idle');

    try {
      const res = await fetch('/api/studio/handoff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientEmail,
          clientName: clientName || 'Client',
          eventName,
          slug,
          guestUploadUrl,
          liveWallUrl,
        }),
      });

      if (!res.ok) throw new Error('Failed to send email');
      setEmailStatus('success');
    } catch (e) {
      console.error(e);
      setEmailStatus('error');
    } finally {
      setSendingEmail(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-xl rounded-2xl bg-surface border border-border shadow-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-text-muted hover:text-text-primary p-2 rounded-full hover:bg-bg-subtle transition-colors cursor-pointer"
        >
          <X size={20} />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
            <QrCode size={20} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-text-primary font-display">Client Handoff Kit</h3>
            <p className="text-xs text-text-secondary">Deliver QR codes and links directly to {clientName || 'your client'}</p>
          </div>
        </div>

        {/* Links Preview */}
        <div className="space-y-4 mb-6">
          <div className="p-4 rounded-xl border border-border bg-bg-subtle">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-text-secondary">Guest Camera & Upload Link</span>
              <button
                onClick={() => copyToClipboard(guestUploadUrl, 'guest')}
                className="flex items-center gap-1 text-xs text-accent font-semibold hover:underline cursor-pointer"
              >
                {copiedLink === 'guest' ? <Check size={14} /> : <Copy size={14} />}
                {copiedLink === 'guest' ? 'Copied' : 'Copy'}
              </button>
            </div>
            <p className="text-xs text-text-primary font-mono truncate">{guestUploadUrl}</p>
          </div>

          <div className="p-4 rounded-xl border border-border bg-bg-subtle">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-text-secondary">Live Wall Display Link</span>
              <button
                onClick={() => copyToClipboard(liveWallUrl, 'wall')}
                className="flex items-center gap-1 text-xs text-accent font-semibold hover:underline cursor-pointer"
              >
                {copiedLink === 'wall' ? <Check size={14} /> : <Copy size={14} />}
                {copiedLink === 'wall' ? 'Copied' : 'Copy'}
              </button>
            </div>
            <p className="text-xs text-text-primary font-mono truncate">{liveWallUrl}</p>
          </div>
        </div>

        {/* Handoff Actions */}
        <div className="space-y-3">
          <button
            onClick={handleOpenWhatsApp}
            className="w-full flex items-center justify-center gap-2.5 py-3.5 px-5 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold text-sm shadow-sm transition-all cursor-pointer"
          >
            <MessageSquare size={18} />
            <span>Send Handoff via WhatsApp</span>
          </button>

          {clientEmail && (
            <button
              onClick={handleSendEmail}
              disabled={sendingEmail}
              className="w-full flex items-center justify-center gap-2.5 py-3.5 px-5 rounded-xl border border-border bg-surface hover:bg-bg-subtle text-text-primary font-bold text-sm transition-all cursor-pointer disabled:opacity-50"
            >
              <Mail size={18} className="text-accent" />
              <span>{sendingEmail ? 'Sending Email...' : `Email Kit to ${clientEmail}`}</span>
            </button>
          )}

          {emailStatus === 'success' && (
            <p className="text-xs text-green-600 text-center font-medium">
              ✓ Email sent successfully to {clientEmail}!
            </p>
          )}
          {emailStatus === 'error' && (
            <p className="text-xs text-red-500 text-center font-medium">
              Failed to send email. You can copy the message or send via WhatsApp above.
            </p>
          )}

          <a
            href={`/dashboard/${slug}/qr-assets`}
            className="w-full flex items-center justify-center gap-2 py-3 px-5 rounded-xl border border-border text-text-secondary hover:text-text-primary text-xs font-bold transition-all text-center"
          >
            <Download size={15} />
            <span>Download High-Res Printable QR Asset Pack</span>
          </a>
        </div>
      </div>
    </div>
  );
}
