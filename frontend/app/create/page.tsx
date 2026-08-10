"use client";

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { QRCodeSVG, QRCodeCanvas } from 'qrcode.react';
import jsPDF from 'jspdf';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Layout, Shield, Copy, Image as ImageIcon, ArrowRight, Printer, CheckCircle, 
  AlertTriangle, Sparkles, QrCode, Palette, MessageSquare, Megaphone, Upload, Check,
  Camera, Heart, Wine, PartyPopper, Award
} from 'lucide-react';
import AnimatedLogo from '@/components/AnimatedLogo';
import ThemeToggle from '@/components/ThemeToggle';

function generateSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    + '-' + Math.random().toString(36).substring(2, 7);
}

const QR_THEMES = [
  { id: 'cyan', name: 'Cyan Neon', fg: '#00e5ff', bg: '#09090b', border: 'border-cyan-500/40' },
  { id: 'gold', name: 'Gold Luxury', fg: '#f59e0b', bg: '#09090b', border: 'border-amber-500/40' },
  { id: 'rose', name: 'Sunset Rose', fg: '#f43f5e', bg: '#09090b', border: 'border-rose-500/40' },
  { id: 'emerald', name: 'Emerald Glow', fg: '#10b981', bg: '#09090b', border: 'border-emerald-500/40' },
  { id: 'mono', name: 'Classic Dark', fg: '#ffffff', bg: '#000000', border: 'border-white/20' },
];

const QR_CENTER_ICONS = [
  { id: 'sparkles', label: 'Sparkle ✨' },
  { id: 'camera', label: 'Camera 📸' },
  { id: 'heart', label: 'Heart 💖' },
  { id: 'champagne', label: 'Cheers 🥂' },
  { id: 'crown', label: 'Crown 👑' },
];

export default function CreateEventPage() {
  const { user, isLoading, plan, isPaid, isApproved } = useAuth();
  const router = useRouter();

  // Form State
  const [name, setName] = useState('');
  const [customSlug, setCustomSlug] = useState('');
  const [password, setPassword] = useState('');

  // Ad Space, Custom Print Message & Logo State
  const [printMessage, setPrintMessage] = useState('Scan QR code to share your favorite photos live on screen!');
  const [sponsorAdText, setSponsorAdText] = useState('');
  const [sponsorLogoUrl, setSponsorLogoUrl] = useState('');

  // QR Customizer State
  const [qrThemeId, setQrThemeId] = useState('cyan');
  const [qrCenterIcon, setQrCenterIcon] = useState('sparkles');

  // Creation State
  const [loading, setLoading] = useState(false);
  const [createdSlug, setCreatedSlug] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);

  const qrCanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (isLoading) return;
    if (!user) { router.push('/auth?redirect=/create'); return; }
    if (!isApproved) { router.push('/pending'); return; }
  }, [user, isLoading, isApproved, router]);

  const activeQrTheme = QR_THEMES.find((t) => t.id === qrThemeId) || QR_THEMES[0];

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { router.push('/auth'); return; }
    if (!isApproved) { router.push('/pending'); return; }
    if (!isPaid) { router.push('/dashboard'); return; }
    setLoading(true);
    setError('');

    const slug = customSlug.trim() || generateSlug(name);
    
    if (customSlug) {
      const { data: existing } = await supabase.from('events').select('id').eq('slug', slug).single();
      if (existing) {
        setError('This custom link is already taken. Please try another.');
        setLoading(false);
        return;
      }
    }

    const { error: dbError } = await supabase.from('events').insert({
      name, slug, owner_id: user.id, owner_email: user.email, created_at: new Date().toISOString(),
      password: password || null,
      plan_type: (plan || 'STARTER').toUpperCase(),
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    });

    if (dbError) { setError(dbError.message); setLoading(false); return; }
    
    setCreatedSlug(slug);
    setLoading(false);
  };

  const uploadUrl = createdSlug
    ? `${typeof window !== 'undefined' ? window.location.origin : ''}/mobile/${createdSlug}` 
    : `${typeof window !== 'undefined' ? window.location.origin : ''}/mobile/${customSlug || 'my-event'}`;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const generatePDFPoster = async () => {
    const qrCanvas = qrCanvasRef.current;
    if (!qrCanvas) return;
    const qrDataUrl = qrCanvas.toDataURL('image/png');

    const container = document.createElement('div');
    container.style.width = '794px'; 
    container.style.height = '1123px';
    container.style.background = '#09090b'; 
    container.style.color = '#fff';
    container.style.display = 'flex'; 
    container.style.flexDirection = 'column';
    container.style.alignItems = 'center'; 
    container.style.justifyContent = 'space-between';
    container.style.padding = '48px'; 
    container.style.fontFamily = 'Inter, system-ui, sans-serif';
    container.style.position = 'fixed'; 
    container.style.left = '-9999px'; 
    container.style.top = '0';

    container.innerHTML = `
      <div style="width: 100%; height: 100%; border: 2px solid rgba(255,255,255,0.1); border-radius: 40px; padding: 48px; box-sizing: border-box; display: flex; flex-direction: column; align-items: center; justify-content: space-between; background: radial-gradient(circle at top center, rgba(0,229,255,0.08) 0%, transparent 70%);">
        
        <!-- Header & Custom Sponsor Logo / Ad Space -->
        <div style="text-align: center; width: 100%;">
          ${sponsorLogoUrl ? `<img src="${sponsorLogoUrl}" style="max-height: 70px; margin-bottom: 20px; object-fit: contain;" />` : ''}
          <h1 style="font-size: 56px; font-weight: 900; color: #ffffff; margin-bottom: 12px; line-height: 1.1; letter-spacing: -0.03em;">${name || 'Event Photo Wall'}</h1>
          ${sponsorAdText ? `<div style="display: inline-block; padding: 6px 20px; border-radius: 999px; background: rgba(245,158,11,0.15); border: 1px solid rgba(245,158,11,0.3); color: #f59e0b; font-size: 16px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 16px;">${sponsorAdText}</div>` : ''}
          <p style="font-size: 22px; color: #a1a1aa; max-width: 580px; margin: 0 auto; line-height: 1.4; font-weight: 500;">${printMessage}</p>
        </div>

        <!-- Modern QR Code Card with Theme Border -->
        <div style="background: #000000; padding: 36px; border-radius: 36px; border: 3px solid ${activeQrTheme.fg}; box-shadow: 0 30px 80px rgba(0,0,0,0.8); text-align: center; position: relative;">
          <img src="${qrDataUrl}" style="width: 320px; height: 320px; display: block; border-radius: 16px;" />
        </div>

        <!-- Instructions & Footer -->
        <div style="text-align: center; width: 100%;">
          <h2 style="font-size: 32px; font-weight: 800; color: #00e5ff; margin-bottom: 8px;">SCAN WITH PHONE CAMERA</h2>
          <p style="font-size: 16px; color: #71717a; font-family: monospace; font-weight: 600;">${uploadUrl}</p>
          <div style="margin-top: 24px; padding-top: 20px; border-t: 1px solid rgba(255,255,255,0.1); display: flex; justify-content: space-between; align-items: center; width: 100%;">
            <span style="font-size: 12px; color: #52525b; font-weight: 800; text-transform: uppercase; letter-spacing: 0.15em;">POWERED BY MEMENTO PRO</span>
            <span style="font-size: 12px; color: #52525b; font-weight: 800; text-transform: uppercase; letter-spacing: 0.15em;">NO APP DOWNLOAD REQUIRED</span>
          </div>
        </div>

      </div>
    `;

    document.body.appendChild(container);
    try {
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(container, { scale: 2, backgroundColor: '#09090b' });
      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      doc.addImage(imgData, 'JPEG', 0, 0, 210, 297);
      doc.save(`Memento-Print-Sign-${createdSlug || 'event'}.pdf`);
    } catch (err) {
      alert('Failed to generate print PDF.');
    } finally {
      document.body.removeChild(container);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-white">
        <div className="w-10 h-10 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // ── Success View ──
  if (createdSlug) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-zinc-950 text-white relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-900/20 via-zinc-950 to-zinc-950" />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative z-10 w-full max-w-2xl bg-zinc-900/90 border border-zinc-800 backdrop-blur-2xl rounded-3xl p-8 sm:p-12 text-center shadow-2xl space-y-6"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold border border-emerald-500/30">
            <CheckCircle size={16} /> Photo Wall Live & Ready
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">Your Event Space is Ready!</h1>
          <p className="text-zinc-400 text-sm max-w-md mx-auto">Share your QR code poster or URL link with guests to start receiving real-time photos.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center p-6 bg-zinc-950/80 rounded-2xl border border-zinc-800 text-left">
            <div className="flex flex-col items-center p-4 bg-black rounded-2xl border border-zinc-800">
              <QRCodeSVG 
                value={uploadUrl} 
                size={180} 
                bgColor="transparent" 
                fgColor={activeQrTheme.fg} 
                level="H"
                includeMargin
              />
              <div style={{ display: 'none' }}>
                <QRCodeCanvas ref={qrCanvasRef} value={uploadUrl} size={600} bgColor="#000000" fgColor={activeQrTheme.fg} level="H" />
              </div>
              <p className="mt-3 text-[11px] font-mono font-bold text-cyan-400 uppercase tracking-widest">Scan to Join Wall</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block mb-1.5">Direct Event Link</label>
                <div className="flex gap-2">
                  <input type="text" readOnly value={uploadUrl} className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-mono text-white focus:outline-none" />
                  <button 
                    onClick={() => copyToClipboard(uploadUrl)} 
                    className="px-3.5 py-2.5 rounded-xl bg-zinc-800 text-zinc-200 hover:text-white font-bold text-xs flex items-center gap-1.5 transition-colors"
                  >
                    {copiedLink ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button 
                  onClick={() => {
                    const canvas = qrCanvasRef.current;
                    if (!canvas) return;
                    canvas.toBlob((blob) => {
                      if (blob) {
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `memento-${createdSlug}-qr.png`;
                        a.click();
                      }
                    });
                  }} 
                  className="py-2.5 px-3 rounded-xl bg-zinc-800 text-zinc-200 font-bold text-xs hover:bg-zinc-700 transition-colors flex items-center justify-center gap-1.5"
                >
                  <ImageIcon size={14} /> PNG QR Code
                </button>

                <button 
                  onClick={generatePDFPoster} 
                  className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-400 to-orange-400 text-black font-extrabold text-xs shadow-md hover:brightness-110 transition-all flex items-center justify-center gap-1.5"
                >
                  <Printer size={14} /> Print PDF Sign
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button 
              onClick={() => router.push(`/wall/${createdSlug}`)} 
              className="flex-1 py-4 rounded-2xl bg-gradient-to-r from-cyan-400 to-emerald-400 text-black font-extrabold text-sm shadow-xl hover:brightness-110 transition-all flex items-center justify-center gap-2"
            >
              <Layout size={18} /> Open Live Photo Wall
            </button>

            <button 
              onClick={() => router.push('/dashboard')} 
              className="flex-1 py-4 rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-300 font-bold text-sm hover:bg-zinc-800 transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // ── Create Form & Live Print Poster Preview ──
  return (
    <div className="min-h-screen bg-zinc-950 text-white relative overflow-x-hidden font-sans">
      {/* Background Radial Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Navigation Header */}
      <nav className="fixed top-0 inset-x-0 z-50 h-16 bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-800/80 flex items-center justify-between px-6">
        <Link href="/dashboard" className="text-zinc-400 hover:text-white transition-colors flex items-center gap-2 text-xs font-bold">
          <ArrowRight size={16} className="rotate-180" />
          <span>Back to Dashboard</span>
        </Link>
        
        <AnimatedLogo width={120} height={30} />

        <div className="flex items-center gap-3">
          <ThemeToggle />
        </div>
      </nav>

      {/* Main Container: Realigned Split Grid */}
      <main className="max-w-6xl mx-auto pt-24 pb-16 px-4 sm:px-6">
        <div className="text-center max-w-xl mx-auto mb-10 space-y-2">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">Create Event Photo Wall</h1>
          <p className="text-zinc-400 text-sm">Design your event space, customize sponsor branding, and generate modern QR print signs.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Realigned Form */}
          <div className="lg:col-span-7 bg-zinc-900/90 border border-zinc-800 backdrop-blur-2xl rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
            
            <form onSubmit={handleCreate} className="space-y-6">
              
              {/* SECTION 1: Event Essentials */}
              <div className="space-y-4">
                <h3 className="text-xs font-extrabold text-cyan-400 uppercase tracking-widest flex items-center gap-2 border-b border-zinc-800 pb-2">
                  <Sparkles size={14} /> 1. Event Essentials
                </h3>

                <div>
                  <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider block mb-1.5">Event Name *</label>
                  <input 
                    type="text" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    placeholder="Rohan & Priya's Wedding / Gala 2026" 
                    required 
                    autoFocus 
                    className="w-full px-4 py-3 rounded-2xl bg-zinc-950 border border-zinc-800 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-cyan-400 font-medium transition-colors"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider">Custom Event URL</label>
                    {plan === 'starter' && (
                      <Link href="/#pricing" className="text-[11px] font-bold text-cyan-400 hover:underline">
                        Upgrade for Custom Link
                      </Link>
                    )}
                  </div>
                  <div className="flex">
                    <span className="px-4 py-3 rounded-l-2xl bg-zinc-800 border border-r-0 border-zinc-700 text-zinc-400 font-mono text-xs flex items-center">
                      memento.live/
                    </span>
                    <input 
                      type="text" 
                      value={customSlug} 
                      disabled={plan === 'starter'}
                      onChange={(e) => setCustomSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                      placeholder={plan === 'starter' ? 'standard-link' : 'rohan-priya-wedding'} 
                      className="w-full px-4 py-3 rounded-r-2xl bg-zinc-950 border border-zinc-800 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-cyan-400 font-medium transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider block mb-1.5">Privacy Password (Optional)</label>
                  <div className="relative">
                    <Shield size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                    <input 
                      type="password" 
                      value={password} 
                      onChange={(e) => setPassword(e.target.value)} 
                      placeholder="Optional guest password" 
                      className="w-full pl-12 pr-4 py-3 rounded-2xl bg-zinc-950 border border-zinc-800 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-cyan-400 font-medium transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 2: Print Poster & Sponsor Branding (Ads & Print Messages) */}
              <div className="space-y-4 pt-2">
                <h3 className="text-xs font-extrabold text-amber-400 uppercase tracking-widest flex items-center gap-2 border-b border-zinc-800 pb-2">
                  <Megaphone size={14} /> 2. Print Sign & Sponsor Ad Space
                </h3>

                <div>
                  <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider block mb-1.5">Print Invitation Message</label>
                  <textarea 
                    value={printMessage}
                    onChange={(e) => setPrintMessage(e.target.value)}
                    rows={2}
                    placeholder="Scan QR code to share your favorite photos live on screen!"
                    className="w-full px-4 py-3 rounded-2xl bg-zinc-950 border border-zinc-800 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-amber-400 font-medium transition-colors resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider block mb-1.5">Sponsor Ad / Tagline</label>
                    <input 
                      type="text" 
                      value={sponsorAdText}
                      onChange={(e) => setSponsorAdText(e.target.value)}
                      placeholder="Sponsored by Red Bull / ABC Events"
                      className="w-full px-4 py-3 rounded-2xl bg-zinc-950 border border-zinc-800 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-amber-400 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider block mb-1.5">Sponsor / Host Logo URL</label>
                    <input 
                      type="url" 
                      value={sponsorLogoUrl}
                      onChange={(e) => setSponsorLogoUrl(e.target.value)}
                      placeholder="https://example.com/logo.png"
                      className="w-full px-4 py-3 rounded-2xl bg-zinc-950 border border-zinc-800 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-amber-400 transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 3: Modern QR Code Theme Styling */}
              <div className="space-y-4 pt-2">
                <h3 className="text-xs font-extrabold text-emerald-400 uppercase tracking-widest flex items-center gap-2 border-b border-zinc-800 pb-2">
                  <Palette size={14} /> 3. Modern QR Code Customizer
                </h3>

                <div>
                  <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider block mb-2">QR Color Theme</label>
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                    {QR_THEMES.map((theme) => (
                      <button
                        key={theme.id}
                        type="button"
                        onClick={() => setQrThemeId(theme.id)}
                        className={`p-2.5 rounded-2xl border text-left transition-all flex flex-col items-center gap-1.5 ${
                          qrThemeId === theme.id 
                            ? 'bg-zinc-800 border-cyan-400 shadow-md scale-105' 
                            : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                        }`}
                      >
                        <div className="w-5 h-5 rounded-full border border-white/20 shadow-inner" style={{ backgroundColor: theme.fg }} />
                        <span className="text-[10px] font-bold">{theme.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {error && (
                <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold flex items-center gap-2">
                  <AlertTriangle size={16} />
                  <span>{error}</span>
                </div>
              )}

              <button 
                type="submit" 
                disabled={loading || !user} 
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-400 via-teal-400 to-emerald-400 text-black font-extrabold text-sm uppercase tracking-wider shadow-xl shadow-cyan-500/20 hover:brightness-110 active:scale-98 transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Create Photo Wall & Signs</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>

            </form>
          </div>

          {/* Right Column: Live Real-Time Poster & QR Code Preview */}
          <div className="lg:col-span-5 sticky top-24 space-y-4">
            <div className="text-center sm:text-left">
              <h3 className="text-xs font-extrabold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                <QrCode size={14} className="text-cyan-400" /> Live Print Sign Preview
              </h3>
              <p className="text-[11px] text-zinc-500 mt-0.5">Real-time preview of your table tent poster & QR code.</p>
            </div>

            <div className="bg-zinc-900 border-2 border-zinc-800 rounded-3xl p-6 shadow-2xl flex flex-col items-center justify-between text-center relative overflow-hidden min-h-[440px]">
              
              {/* Ambient Glow */}
              <div className="absolute -top-12 inset-x-0 h-32 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

              {/* Header & Logo */}
              <div className="space-y-2 z-10 w-full">
                {sponsorLogoUrl && (
                  <img src={sponsorLogoUrl} alt="Sponsor Logo" className="max-h-10 mx-auto object-contain mb-2" />
                )}

                <h2 className="text-xl font-extrabold text-white tracking-tight line-clamp-2">
                  {name.trim() || 'Your Event Title'}
                </h2>

                {sponsorAdText && (
                  <span className="inline-block px-3 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-extrabold uppercase tracking-wider">
                    {sponsorAdText}
                  </span>
                )}

                <p className="text-xs text-zinc-400 max-w-xs mx-auto line-clamp-2 leading-relaxed">
                  {printMessage}
                </p>
              </div>

              {/* QR Code Center Box */}
              <div className={`my-6 p-5 rounded-3xl bg-black border-2 ${activeQrTheme.border} shadow-2xl relative z-10`}>
                <QRCodeSVG 
                  value={uploadUrl} 
                  size={160} 
                  bgColor="transparent" 
                  fgColor={activeQrTheme.fg} 
                  level="H"
                  includeMargin
                />
              </div>

              {/* Footer Banner */}
              <div className="z-10 w-full border-t border-zinc-800/80 pt-3 flex items-center justify-between text-[10px] font-mono text-zinc-500">
                <span className="text-cyan-400 font-bold">SCAN WITH PHONE CAMERA</span>
                <span>NO APP NEEDED</span>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
