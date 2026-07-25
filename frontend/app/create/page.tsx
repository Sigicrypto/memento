"use client";
 
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { QRCodeSVG, QRCodeCanvas } from 'qrcode.react';
import jsPDF from 'jspdf';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Camera, Layout, Shield, Copy, Trash2, Sparkles, BarChart2, Image as ImageIcon, LogOut, Settings, ArrowRight, Printer, CheckCircle, AlertTriangle } from 'lucide-react';
import AnimatedLogo from '@/components/AnimatedLogo';
 
function generateSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    + '-' + Math.random().toString(36).substring(2, 7);
}
 
export default function CreateEventPage() {
  const { user, profile, isLoading, plan, isPaid, isApproved } = useAuth();
  const router = useRouter();
  const [name, setName] = useState('');
  const [customSlug, setCustomSlug] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [createdSlug, setCreatedSlug] = useState<string | null>(null);
  const [error, setError] = useState('');
 
  useEffect(() => {
    if (isLoading) return;
    if (!user) { router.push('/'); return; }
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
        <div className="orbs"><div className="orb orb-primary" /><div className="orb orb-secondary" /></div>
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin relative z-10" />
      </div>
    );
  }
 
  // ── Success View ──
  if (createdSlug) {
    return (
      <div className="lp flex items-center justify-center p-6">
        <div className="orbs"><div className="orb orb-primary" /><div className="orb orb-secondary" /></div>
        <div className="grain" />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="glass-container w-full max-w-2xl p-8 md:p-12 text-center relative z-10"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20 text-green-500 text-[10px] font-black uppercase tracking-widest mb-10 shadow-lg shadow-green-500/5">
            <CheckCircle size={14} /> Wall Created Successfully
          </div>
          
          <h1 className="display-text mb-4 text-gradient">Wall Ready!</h1>
          <p className="text-text-secondary mb-12 max-w-md mx-auto text-lg">Your event space is now live. Capture every moment with your guests.</p>
 
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center mb-12">
            <div className="flex flex-col items-center">
              <div className="p-6 bg-white rounded-[2.5rem] shadow-[0_0_60px_rgba(255,255,255,0.15)] group transition-transform hover:scale-105 duration-500">
                <QRCodeSVG value={uploadUrl} size={200} bgColor="#ffffff" fgColor="#000000" />
              </div>
              <div style={{display:'none'}}>
                <QRCodeCanvas ref={qrCanvasRef} value={uploadUrl} size={600} bgColor="#ffffff" fgColor="#000000" />
              </div>
              <p className="mt-6 text-[10px] font-bold uppercase tracking-[0.3em] text-text-muted">Scan to join wall</p>
            </div>
 
            <div className="text-left space-y-6">
               <div className="space-y-2">
                 <p className="text-[10px] font-black tracking-widest text-primary uppercase ml-1">Event URL</p>
                 <div className="flex items-center gap-3 p-4 rounded-2xl bg-bg-subtle border border-border group hover:border-black/20 dark:border-black/20 dark:border-black/10 dark:border-white/20 transition-all shadow-inner">
                    <span className="text-sm font-medium text-text-secondary truncate flex-grow italic">{uploadUrl}</span>
                    <button onClick={() => navigator.clipboard.writeText(uploadUrl)} className="p-2.5 rounded-lg bg-bg-subtle text-text-muted hover:text-black dark:hover:text-text-primary hover:bg-border transition-all">
                      <Copy size={16} />
                    </button>
                 </div>
               </div>
               
               <div className="grid grid-cols-2 gap-4">
                 <button onClick={() => {
                   const canvas = qrCanvasRef.current;
                   if (!canvas) return;
                   canvas.toBlob((blob) => {
                     if (blob) { const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `memento-${createdSlug}-qr.png`; a.click(); URL.revokeObjectURL(url); }
                   });
                 }} className="btn-secondary py-4 !rounded-2xl flex items-center justify-center gap-2 group">
                    <ImageIcon size={16} className="text-text-muted group-hover:text-primary transition-colors" />
                    <span className="text-xs font-bold">PNG Image</span>
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
                 }} className="btn-secondary py-4 !rounded-2xl flex items-center justify-center gap-2 group">
                    <Printer size={16} className="text-text-muted group-hover:text-secondary transition-colors" />
                    <span className="text-xs font-bold">PDF Poster</span>
                 </button>
               </div>
            </div>
          </div>
 
          <div className="flex flex-col sm:flex-row gap-5">
            <button onClick={() => router.push(`/wall/${createdSlug}`)} className="btn-premium flex-1 !py-5 flex items-center justify-center gap-3 text-lg">
              <Layout size={20} /> Open Live Wall
            </button>
            <button onClick={() => router.push('/dashboard')} className="flex-1 py-5 rounded-2xl bg-bg-subtle border border-border font-bold hover:bg-border transition-all text-lg">
              Back to Dashboard
            </button>
          </div>
        </motion.div>
      </div>
    );
  }
 
  // ── Create Form ──
  return (
    <div className="lp flex flex-col">
      <div className="orbs"><div className="orb orb-primary" /><div className="orb orb-secondary" /></div>
      <div className="grain" />
 
      {/* ── Standardized Nav ── */}
      <nav className="fixed top-0 left-0 right-0 z-[100] h-20 border-b border-black/5 dark:border-black/20 dark:border-black/10 dark:border-white/5 /70 backdrop-blur-2xl flex items-center justify-between px-6 md:px-12">
        <Link href="/dashboard" className="flex items-center gap-3 text-text-muted hover:text-black dark:hover:text-text-primary transition-all font-bold text-xs uppercase tracking-widest group">
           <ArrowRight size={16} className="rotate-180 group-hover:-translate-x-1 transition-transform" /> Dashboard
        </Link>
        <Link href="/">
          <AnimatedLogo width={160} height={44} />
        </Link>
        <div className="w-24 hidden md:block" />
      </nav>

      <main className="flex-grow flex items-center justify-center p-6 relative z-10 pt-28 pb-24">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="glass-container w-full max-w-xl p-10 md:p-14"
        >
          <div className="text-center mb-12">
            <div className="w-20 h-20 rounded-[2rem] bg-primary/10 border border-primary/20 flex items-center justify-center text-4xl mx-auto mb-8 shadow-2xl shadow-primary/10">
              ✨
            </div>
            <h1 className="h1-text mb-4 text-gradient">Create a Photo Wall</h1>
            <p className="text-text-secondary text-lg">Set up your cinematic event space in seconds.</p>
          </div>
 
          <form onSubmit={handleCreate} className="space-y-10">
            <div className="space-y-8">
              {/* Event Name */}
              <div className="space-y-3 font-medium">
                <label className="text-[10px] font-black tracking-[0.2em] uppercase text-text-muted ml-1">Event Identity</label>
                <input 
                  type="text" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  placeholder="The Midnight Gala…" 
                  required 
                  autoFocus 
                  className="w-full bg-bg-subtle border border-border rounded-2xl px-6 py-5 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-xl placeholder:/5 font-semibold"
                />
              </div>
 
              {/* Custom Link */}
              <div className="space-y-3 font-medium">
                <div className="flex items-center justify-between ml-1">
                  <label className="text-[10px] font-black tracking-[0.2em] uppercase text-text-muted">Personalized Link</label>
                  {plan === 'starter' && (
                    <Link href="/#pricing" className="text-[9px] font-black px-3 py-1 rounded-full bg-secondary/10 text-secondary border border-secondary/20 uppercase tracking-widest hover:bg-secondary/20 transition-all">Upgrade for Custom</Link>
                  )}
                </div>
                <div className="relative group">
                  <span className="absolute left-6 top-1/2 -translate-y-1/2 text-sm /20 font-bold pointer-events-none group-focus-within:text-primary/50 transition-colors uppercase tracking-tighter">memento.live/mobile/</span>
                  <input 
                    type="text" 
                    value={customSlug} 
                    disabled={plan === 'starter'}
                    onChange={(e) => setCustomSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                    placeholder={plan === 'starter' ? 'Standard Plan' : 'my-event'} 
                    className={`w-full bg-bg-subtle border border-border rounded-2xl px-6 py-5 !pl-[175px] text-text-primary focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-base font-bold ${plan === 'starter' ? 'opacity-30 cursor-not-allowed' : 'group-hover:border-black/20 dark:border-black/20 dark:border-black/10 dark:border-white/20'}`}
                  />
                </div>
              </div>
 
              {/* Password */}
              <div className="space-y-3 font-medium">
                <label className="text-[10px] font-black tracking-[0.2em] uppercase text-text-muted ml-1">Privacy Shield <span className="opacity-40 italic font-normal">(Optional)</span></label>
                <div className="relative">
                  <Shield size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-text-muted" />
                  <input 
                    type="password" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    placeholder="Set a guest password…" 
                    className="w-full bg-bg-subtle border border-border rounded-2xl px-6 py-5 !pl-[56px] focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-base placeholder:/5"
                  />
                </div>
              </div>
            </div>
 
            {error && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="p-5 rounded-2xl bg-pink-500/10 border border-pink-500/20 flex items-center gap-4 text-pink-500 text-sm font-bold">
                <AlertTriangle size={20} />
                <span>{error}</span>
              </motion.div>
            )}
 
            <div className="pt-4">
              <button 
                type="submit" 
                disabled={loading || !user} 
                className="btn-premium w-full flex items-center justify-center gap-3 !py-6 shadow-2xl shadow-primary/20 hover:shadow-primary/40 active:scale-[0.98] transition-all text-lg"
              >
                {loading ? (
                  <>
                    <div className="w-6 h-6 border-3 border-black/20 dark:border-black/20 dark:border-black/10 dark:border-white/20 border-t-white rounded-full animate-spin" />
                    <span>Creating your space...</span>
                  </>
                ) : (
                  <>
                    <Plus size={24} />
                    <span>Launch Photo Wall</span>
                  </>
                )}
              </button>
              <p className="text-center text-[10px] text-text-muted mt-6 font-medium uppercase tracking-[0.2em]">Instantly live across all devices</p>
            </div>
          </form>
        </motion.div>
      </main>
    </div>
  );
}
