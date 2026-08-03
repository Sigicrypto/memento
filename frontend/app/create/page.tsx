"use client";
 
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { QRCodeSVG, QRCodeCanvas } from 'qrcode.react';
import jsPDF from 'jspdf';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Plus, Layout, Shield, Copy, Image as ImageIcon, ArrowRight, Printer, CheckCircle, AlertTriangle, Sparkles } from 'lucide-react';
import AnimatedLogo from '@/components/AnimatedLogo';
import FloatingParticles from '@/components/FloatingParticles';
 
function generateSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    + '-' + Math.random().toString(36).substring(2, 7);
}
 
export default function CreateEventPage() {
  const { user, isLoading, plan, isPaid, isApproved } = useAuth();
  const router = useRouter();
  const [name, setName] = useState('');
  const [customSlug, setCustomSlug] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [createdSlug, setCreatedSlug] = useState<string | null>(null);
  const [error, setError] = useState('');
 
  useEffect(() => {
    if (isLoading) return;
    if (!user) { router.push('/auth?redirect=/create'); return; }
    if (!isApproved) { router.push('/pending'); return; }
  }, [user, isLoading, isApproved, router]);
 
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
    ? `${typeof window !== 'undefined' ? window.location.origin : ''}/mobile/${createdSlug}` : '';
  const qrCanvasRef = useRef<HTMLCanvasElement>(null);
 
  if (isLoading) {
    return (
      <div className="lp flex items-center justify-center p-6">
        <div className="w-8 h-8 border-2 border-border border-t-primary rounded-full animate-spin" />
      </div>
    );
  }
 
  // ── Success View ──
  if (createdSlug) {
    return (
      <div className="lp flex items-center justify-center p-6 relative">
        <div className="grain" />
        <div className="orbs"><div className="orb orb-primary" /><div className="orb orb-secondary" /></div>
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="card w-full max-w-2xl text-center"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-success/10 text-success text-xs font-medium mb-6">
            <CheckCircle size={14} /> Wall Created Successfully
          </div>
          
          <h1 className="h1-text mb-2">Wall Ready!</h1>
          <p className="text-text-secondary mb-8 text-sm max-w-md mx-auto">Your event space is now live. Capture every moment with your guests.</p>
 
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center mb-8 text-left">
            <div className="flex flex-col items-center p-6 bg-bg-subtle rounded-lg border border-border">
              <QRCodeSVG value={uploadUrl} size={160} bgColor="transparent" fgColor="currentColor" className="text-text-primary" />
              <div style={{display:'none'}}>
                <QRCodeCanvas ref={qrCanvasRef} value={uploadUrl} size={600} bgColor="#ffffff" fgColor="#000000" />
              </div>
              <p className="mt-4 text-xs font-medium text-text-muted uppercase">Scan to join</p>
            </div>
 
            <div className="space-y-4">
               <div className="input-group">
                 <label className="label">Event URL</label>
                 <div className="flex gap-2">
                    <input type="text" readOnly value={uploadUrl} className="input" />
                    <button onClick={() => navigator.clipboard.writeText(uploadUrl)} className="btn btn-secondary px-3" title="Copy link">
                      <Copy size={16} />
                    </button>
                 </div>
               </div>
               
               <div className="grid grid-cols-2 gap-2">
                 <button onClick={() => {
                   const canvas = qrCanvasRef.current;
                   if (!canvas) return;
                   canvas.toBlob((blob) => {
                     if (blob) { const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `memento-${createdSlug}-qr.png`; a.click(); URL.revokeObjectURL(url); }
                   });
                 }} className="btn btn-secondary w-full">
                    <ImageIcon size={14} />
                    <span>PNG Image</span>
                 </button>
                 <button onClick={async () => {
                   const qrCanvas = qrCanvasRef.current;
                   if (!qrCanvas) return;
                   const qrDataUrl = qrCanvas.toDataURL('image/png');
                   const container = document.createElement('div');
                   container.style.width = '794px'; container.style.height = '1123px';
                   container.style.background = '#030303'; container.style.color = '#fff';
                   container.style.display = 'flex'; container.style.flexDirection = 'column';
                   container.style.alignItems = 'center'; container.style.justifyContent = 'center';
                   container.style.padding = '40px'; container.style.fontFamily = 'Outfit, system-ui, sans-serif';
                   container.style.position = 'fixed'; container.style.left = '-9999px'; container.style.top = '0';
                   container.innerHTML = `
                     <div style="flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center; width: 100%; border: 1px solid rgba(255,255,255,0.08); border-radius: 40px; padding: 60px; box-sizing: border-box; background: radial-gradient(circle at top right, rgba(99,102,241,0.05) 0%, transparent 70%);">
                       <h1 style="font-size: 64px; font-weight: 800; color: #fff; margin-bottom: 24px; text-align: center; line-height: 1.1; letter-spacing: -0.04em;">${name || 'Event Photo Wall'}</h1>
                       <p style="font-size: 26px; color: #94a3b8; font-weight: 400; margin-bottom: 80px; text-align: center; max-width: 550px; line-height: 1.5;">Scan to share your favorite memories instantly with everyone!</p>
                       <div style="background: white; padding: 40px; border-radius: 40px; margin-bottom: 80px; box-shadow: 0 40px 100px rgba(0,0,0,0.6);"><img src="${qrDataUrl}" style="width: 380px; height: 380px; display: block;" /></div>
                       <h2 style="font-size: 38px; font-weight: 700; margin-bottom: 16px; color: #f8fafc; letter-spacing: -0.02em;">Scan to Join</h2>
                       <p style="font-size: 18px; color: #64748b; font-family: monospace; opacity: 0.8;">${uploadUrl}</p>
                       <div style="margin-top: auto; padding-top: 40px;"><p style="font-size: 14px; color: #475569; font-weight: 900; text-transform: uppercase; letter-spacing: 5px;">MEMENTO PREMIUM</p></div>
                     </div>
                   `;
                   document.body.appendChild(container);
                   try {
                     const html2canvas = (await import('html2canvas')).default;
                     const canvas = await html2canvas(container, { scale: 2, backgroundColor: '#030303' });
                     const imgData = canvas.toDataURL('image/jpeg', 0.95);
                     const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
                     doc.addImage(imgData, 'JPEG', 0, 0, 210, 297);
                     doc.save(`Memento-Sign-${createdSlug}.pdf`);
                   } catch (err) { alert('Failed to generate PDF.'); } finally { document.body.removeChild(container); }
                 }} className="btn btn-secondary w-full">
                    <Printer size={14} />
                    <span>PDF Poster</span>
                 </button>
               </div>
            </div>
          </div>
 
          <div className="flex gap-4">
            <button onClick={() => router.push(`/wall/${createdSlug}`)} className="btn btn-primary flex-1 btn-lg">
              <Layout size={18} /> Open Live Wall
            </button>
            <button onClick={() => router.push('/dashboard')} className="btn btn-secondary flex-1 btn-lg">
              Back to Dashboard
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // ── Create Form ──
  return (
    <div className="min-h-screen flex items-center justify-center py-16 px-4 bg-bg relative overflow-hidden">
      {/* Background Orbs & Grain */}
      <div className="grain" />
      <div className="orbs">
        <div className="orb orb-primary opacity-40" />
        <div className="orb orb-secondary opacity-40" />
      </div>

      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 h-[64px] bg-surface/60 backdrop-blur-xl border-b border-white/10 flex items-center px-6">
        <Link href="/dashboard" className="text-text-muted hover:text-white transition-colors flex items-center gap-2 text-xs font-semibold">
          <ArrowRight size={18} className="rotate-180" />
          <span className="hidden sm:inline">Back to Dashboard</span>
        </Link>
        <div className="flex-1 flex justify-center">
          <AnimatedLogo width={110} height={28} />
        </div>
        <div className="w-16" />
      </nav>

      <main className="w-full max-w-md mx-auto relative z-10 pt-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl bg-gradient-to-b from-surface/80 via-surface/60 to-bg-subtle/70 backdrop-blur-2xl border border-white/10 p-6 sm:p-8 shadow-2xl relative overflow-hidden"
        >
          {/* Subtle Ambient Radial Glow inside Card */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -mt-16 w-48 h-48 bg-accent-cyan/10 rounded-full blur-3xl pointer-events-none" />

          <div className="mb-8 text-center relative z-10">
            <h1 className="text-2xl sm:text-3xl font-extrabold mb-2 tracking-tight bg-gradient-to-r from-white via-slate-100 to-accent-cyan bg-clip-text text-transparent">
              Create a Photo Wall
            </h1>
            <p className="text-text-secondary text-xs sm:text-sm">Set up your event space in seconds.</p>
          </div>

          <form onSubmit={handleCreate} className="space-y-5 relative z-10">
            <div className="input-group">
              <label className="label text-xs font-bold text-text-secondary uppercase tracking-wider">Event Name</label>
              <input 
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                placeholder="The Midnight Gala" 
                required 
                autoFocus 
                className="input bg-white/5 border-white/10 rounded-xl py-3 px-4 focus:border-accent-cyan text-sm"
              />
            </div>

            <div className="input-group">
              <div className="flex items-center justify-between mb-1">
                <label className="label text-xs font-bold text-text-secondary uppercase tracking-wider mb-0">Personalized Link</label>
                {plan === 'starter' && (
                  <Link href="/#pricing" className="text-[10px] text-accent-cyan font-bold hover:underline">Upgrade for Custom</Link>
                )}
              </div>
              <div className="flex">
                <span className="inline-flex items-center px-3 border border-r-0 border-white/10 bg-white/5 text-text-muted text-xs rounded-l-xl font-mono shrink-0">
                  memento.live/
                </span>
                <input 
                  type="text" 
                  value={customSlug} 
                  disabled={plan === 'starter'}
                  onChange={(e) => setCustomSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                  placeholder={plan === 'starter' ? 'Standard Plan' : 'my-event'} 
                  className="input rounded-l-none rounded-r-xl bg-white/5 border-white/10 py-3 text-sm"
                />
              </div>
            </div>

            <div className="input-group">
              <label className="label text-xs font-bold text-text-secondary uppercase tracking-wider">Privacy Password (Optional)</label>
              <div className="relative">
                <Shield size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
                <input 
                  type="password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  placeholder="Set a guest password" 
                  className="input pl-10 bg-white/5 border-white/10 rounded-xl py-3 text-sm"
                />
              </div>
            </div>

            {error && (
              <div className="p-3.5 rounded-xl bg-error/10 border border-error/20 flex items-center gap-2.5 text-error text-xs font-semibold">
                <AlertTriangle size={16} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="pt-2">
              <button 
                type="submit" 
                disabled={loading || !user} 
                className="btn btn-primary w-full !py-3.5 flex items-center justify-center gap-2 group shadow-lg shadow-purple-500/25 rounded-xl font-bold"
              >
                 {loading ? <div className="w-5 h-5 border-2 border-white/20 border-t-accent-cyan rounded-full animate-spin" /> : (
                   <>
                     <span>Create Wall</span>
                     <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                   </>
                 )}
              </button>
            </div>
          </form>
        </motion.div>
      </main>
    </div>
  );
}
