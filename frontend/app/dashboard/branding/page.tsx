"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AnimatedLogo from '@/components/AnimatedLogo';
import { 
  Building2, Image as ImageIcon, Palette, Globe, Shield, Save, CheckCircle2, 
  Upload, Sparkles, ExternalLink, ArrowLeft, RefreshCw, Eye, Smartphone, HelpCircle
} from 'lucide-react';

export default function BrandingPage() {
  const { user, profile, isLoading, isSuperAdmin } = useAuth();
  const router = useRouter();
  const isPro = profile?.plan === 'professional' || isSuperAdmin;

  // Branding Form State
  const [brandName, setBrandName] = useState('Apex Event Media');
  const [brandTagline, setBrandTagline] = useState('Exclusive Live Memory Experiences');
  const [brandLogoFile, setBrandLogoFile] = useState<File | null>(null);
  const [brandLogoPreview, setBrandLogoPreview] = useState<string | null>(null);
  const [faviconUrl, setFaviconUrl] = useState('');
  const [faviconFile, setFaviconFile] = useState<File | null>(null);
  const [faviconPreview, setFaviconPreview] = useState<string | null>(null);
  
  // Custom Domain State
  const [customDomain, setCustomDomain] = useState('live.apexevents.com');
  const [domainVerified, setDomainVerified] = useState(true);

  // Color & Aesthetic State
  const [primaryColor, setPrimaryColor] = useState('#06b6d4');
  const [secondaryColor, setSecondaryColor] = useState('#a855f7');
  const [wallTheme, setWallTheme] = useState<'onyx' | 'midnight' | 'velvet' | 'minimal'>('onyx');

  // White-Label Control Toggles
  const [removeWatermark, setRemoveWatermark] = useState(true);
  const [customSupportPhone, setCustomSupportPhone] = useState('+91 9866161775');
  const [customSupportEmail, setCustomSupportEmail] = useState('support@apexevents.com');
  const [footerCopyright, setFooterCopyright] = useState('© 2026 Apex Event Media. All rights reserved.');

  // UI state
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'identity' | 'domain' | 'colors' | 'whitelabel'>('identity');

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.push('/auth');
      return;
    }

    const fetchBranding = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      const metadata = user?.user_metadata;
      if (metadata) {
        if (metadata.brand_name) setBrandName(metadata.brand_name);
        if (metadata.brand_tagline) setBrandTagline(metadata.brand_tagline);
        if (metadata.brand_logo_url) setBrandLogoPreview(metadata.brand_logo_url);
        if (metadata.favicon_url) {
          setFaviconUrl(metadata.favicon_url);
          setFaviconPreview(metadata.favicon_url);
        }
        if (metadata.custom_domain) setCustomDomain(metadata.custom_domain);
        if (metadata.brand_colors?.primary) setPrimaryColor(metadata.brand_colors.primary);
        if (metadata.brand_colors?.secondary) setSecondaryColor(metadata.brand_colors.secondary);
        if (metadata.wall_theme) setWallTheme(metadata.wall_theme);
        if (metadata.remove_watermark !== undefined) setRemoveWatermark(metadata.remove_watermark);
        if (metadata.support_phone) setCustomSupportPhone(metadata.support_phone);
        if (metadata.support_email) setCustomSupportEmail(metadata.support_email);
        if (metadata.footer_copyright) setFooterCopyright(metadata.footer_copyright);
      }
      setLoading(false);
    };

    fetchBranding();
  }, [user, isLoading, router]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!isPro) return;

    setSaving(true);
    setSaveSuccess(false);

    try {
      let logoUrl = brandLogoPreview;
      if (brandLogoFile) {
        const filePath = `branding/${user.id}/logo_${Date.now()}`;
        const { error: uploadErr } = await supabase.storage.from('photos').upload(filePath, brandLogoFile, { upsert: true });
        if (!uploadErr) {
          logoUrl = supabase.storage.from('photos').getPublicUrl(filePath).data.publicUrl;
        }
      }

      let newFaviconUrl = faviconPreview;
      if (faviconFile) {
        const filePath = `branding/${user.id}/favicon_${Date.now()}`;
        const { error: uploadErr } = await supabase.storage.from('photos').upload(filePath, faviconFile, { upsert: true });
        if (!uploadErr) {
          newFaviconUrl = supabase.storage.from('photos').getPublicUrl(filePath).data.publicUrl;
        }
      }

      const { error } = await supabase.auth.updateUser({
        data: {
          ...user.user_metadata,
          brand_name: brandName,
          brand_tagline: brandTagline,
          brand_logo_url: logoUrl,
          favicon_url: newFaviconUrl,
          custom_domain: customDomain,
          brand_colors: { primary: primaryColor, secondary: secondaryColor },
          wall_theme: wallTheme,
          remove_watermark: removeWatermark,
          support_phone: customSupportPhone,
          support_email: customSupportEmail,
          footer_copyright: footerCopyright,
        },
      });

      if (error) {
        alert(`Failed to update branding settings: ${error.message}`);
      } else {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 4000);
      }
    } catch (err: any) {
      alert(`Error saving branding: ${err.message || err}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin" />
          <span className="text-xs font-mono text-slate-400">Loading White-Label Portal...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-slate-950 text-white relative overflow-x-hidden pt-20 pb-16 px-4 md:px-8 flex justify-center">
      {/* Background ambient lighting */}
      <div className="fixed top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-cyan-500/10 blur-[150px] rounded-full pointer-events-none z-0" />
      <div className="fixed top-2/3 right-1/4 w-[500px] h-[500px] bg-purple-500/10 blur-[140px] rounded-full pointer-events-none z-0" />

      <div className="relative z-10 w-full max-w-6xl flex flex-col gap-8">
        
        {/* Navigation Bar */}
        <div className="flex flex-col sm:flex-row items-start justify-between gap-4 border-b border-white/10 pb-6">
          <div className="flex items-start gap-3">
            <Link 
              href="/dashboard" 
              className="p-2.5 rounded-xl bg-slate-900 border border-white/10 text-slate-300 hover:text-white hover:border-cyan-400/40 transition-all mt-1"
            >
              <ArrowLeft size={18} />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">White-Label Management</h1>
                <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-400/40 text-cyan-400 text-[10px] font-black uppercase tracking-wider">
                  PRO AGENCY
                </span>
              </div>
              <p className="text-slate-400 text-xs mt-1">
                Customize agency logos, domain titles, color palettes, and remove Memento branding on live walls & cards.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 mt-1 sm:mt-2">
            <AnimatedLogo width={120} height={38} />
          </div>
        </div>

        {/* Success Alert */}
        {saveSuccess && (
          <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 flex items-center justify-between shadow-xl">
            <div className="flex items-center gap-3">
              <CheckCircle2 size={20} />
              <span className="text-sm font-bold">White-Label settings updated & synced across all client events!</span>
            </div>
            <span className="text-xs font-mono opacity-80">Saved to Supabase</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Main Controls Form (8 Cols) */}
          <div className="lg:col-span-8 flex flex-col gap-6">

            {/* Tab Selector */}
            <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-900/90 border border-white/10 flex-wrap">
              <button
                type="button"
                onClick={() => setActiveTab('identity')}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  activeTab === 'identity'
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Building2 size={15} />
                <span>Brand & Logo</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('domain')}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  activeTab === 'domain'
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Globe size={15} />
                <span>Custom Domain</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('colors')}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  activeTab === 'colors'
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Palette size={15} />
                <span>Colors & Wall Theme</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('whitelabel')}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  activeTab === 'whitelabel'
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Shield size={15} />
                <span>White-Label Controls</span>
              </button>
            </div>

            <form onSubmit={handleUpdate} className="flex flex-col gap-6">

              {/* TAB 1: BRAND IDENTITY & LOGO */}
              {activeTab === 'identity' && (
                <div className="p-6 md:p-8 rounded-3xl bg-slate-900/80 border border-white/10 backdrop-blur-xl shadow-2xl flex flex-col gap-6">
                  <div>
                    <h2 className="text-xl font-black text-white flex items-center gap-2">
                      <Building2 className="text-cyan-400" size={20} />
                      Brand Identity & Titles
                    </h2>
                    <p className="text-slate-400 text-xs mt-1">
                      Configure your agency name, tagline, logo, and icons shown on client galleries and QR cards.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                        Agency / Brand Name
                      </label>
                      <input
                        type="text"
                        value={brandName}
                        onChange={(e) => setBrandName(e.target.value)}
                        placeholder="e.g. Apex Event Media"
                        className="px-4 py-3 rounded-xl bg-slate-950 border border-white/15 text-white text-sm focus:border-cyan-400 focus:outline-none transition-all"
                        required
                      />
                      <span className="text-[10px] text-slate-400">Replaces 'Memento' across event titles and headers.</span>
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                        Tagline / Subtitle
                      </label>
                      <input
                        type="text"
                        value={brandTagline}
                        onChange={(e) => setBrandTagline(e.target.value)}
                        placeholder="e.g. Live Memory Wall Solutions"
                        className="px-4 py-3 rounded-xl bg-slate-950 border border-white/15 text-white text-sm focus:border-cyan-400 focus:outline-none transition-all"
                      />
                      <span className="text-[10px] text-slate-400">Displayed on welcome screens and printable cards.</span>
                    </div>
                  </div>

                  {/* Logo Upload Section */}
                  <div className="p-6 rounded-2xl bg-slate-950/80 border border-white/10 flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                        <ImageIcon size={16} className="text-cyan-400" />
                        Brand Logo (PNG / SVG)
                      </label>
                      <span className="text-[10px] font-mono text-cyan-400">Transparent PNG recommended</span>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-6">
                      <div className="w-full flex-1">
                        <input
                          type="file"
                          accept="image/png, image/jpeg, image/svg+xml"
                          onChange={(e) => {
                            const file = e.target.files?.[0] || null;
                            setBrandLogoFile(file);
                            if (file) {
                              setBrandLogoPreview(URL.createObjectURL(file));
                            }
                          }}
                          className="w-full text-xs text-slate-400 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-cyan-500/20 file:text-cyan-400 hover:file:bg-cyan-500/30 cursor-pointer transition-all border border-white/10 rounded-xl p-2 bg-slate-900"
                        />
                      </div>

                      {brandLogoPreview && (
                        <div className="w-36 h-20 rounded-xl bg-black/60 border border-white/15 p-2 flex items-center justify-center shrink-0">
                          <img src={brandLogoPreview} alt="Brand Logo Preview" className="max-h-full max-w-full object-contain" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Favicon Upload Section */}
                  <div className="p-6 rounded-2xl bg-slate-950/80 border border-white/10 flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                        <ImageIcon size={16} className="text-cyan-400" />
                        Favicon / Browser Tab Icon
                      </label>
                      <span className="text-[10px] font-mono text-cyan-400">.ICO or PNG</span>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-6">
                      <div className="w-full flex-1">
                        <input
                          type="file"
                          accept=".ico, image/png, image/jpeg"
                          onChange={(e) => {
                            const file = e.target.files?.[0] || null;
                            setFaviconFile(file);
                            if (file) {
                              setFaviconPreview(URL.createObjectURL(file));
                            }
                          }}
                          className="w-full text-xs text-slate-400 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-cyan-500/20 file:text-cyan-400 hover:file:bg-cyan-500/30 cursor-pointer transition-all border border-white/10 rounded-xl p-2 bg-slate-900"
                        />
                      </div>

                      {faviconPreview && (
                        <div className="w-16 h-16 rounded-xl bg-black/60 border border-white/15 p-2 flex items-center justify-center shrink-0">
                          <img src={faviconPreview} alt="Favicon Preview" className="max-h-full max-w-full object-contain" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: CUSTOM DOMAIN */}
              {activeTab === 'domain' && (
                <div className="p-6 md:p-8 rounded-3xl bg-slate-900/80 border border-white/10 backdrop-blur-xl shadow-2xl flex flex-col gap-6">
                  <div>
                    <h2 className="text-xl font-black text-white flex items-center gap-2">
                      <Globe className="text-cyan-400" size={20} />
                      Custom Domain Connection
                    </h2>
                    <p className="text-slate-400 text-xs mt-1">
                      Host live event walls and guest upload portals directly on your agency's domain.
                    </p>
                  </div>

                  <div className="p-6 rounded-2xl bg-slate-950/80 border border-white/10 flex flex-col gap-4">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                      Custom Subdomain / Hostname
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="text"
                        value={customDomain}
                        onChange={(e) => setCustomDomain(e.target.value)}
                        placeholder="live.youragency.com"
                        className="flex-1 px-4 py-3 rounded-xl bg-slate-900 border border-white/15 text-white text-sm font-mono focus:border-cyan-400 focus:outline-none transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => alert(`DNS check initiated for ${customDomain}`)}
                        className="px-4 py-3 rounded-xl bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 font-bold text-xs hover:bg-cyan-500/30 transition-all flex items-center gap-1.5"
                      >
                        <RefreshCw size={14} />
                        <span>Verify DNS</span>
                      </button>
                    </div>

                    <div className="mt-2 p-4 rounded-xl bg-slate-900/90 border border-white/10 text-xs font-mono flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Record Type:</span>
                        <span className="text-amber-400 font-bold">CNAME</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Host / Alias:</span>
                        <span className="text-cyan-400 font-bold">{customDomain.split('.')[0] || 'live'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Target Destination:</span>
                        <span className="text-emerald-400 font-bold">cname.mymementoapp.com</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: COLORS & WALL THEME */}
              {activeTab === 'colors' && (
                <div className="p-6 md:p-8 rounded-3xl bg-slate-900/80 border border-white/10 backdrop-blur-xl shadow-2xl flex flex-col gap-6">
                  <div>
                    <h2 className="text-xl font-black text-white flex items-center gap-2">
                      <Palette className="text-cyan-400" size={20} />
                      Color Palette & Live Wall Aesthetic
                    </h2>
                    <p className="text-slate-400 text-xs mt-1">
                      Set accent colors for buttons, interactive animations, and live screen wallpaper presets.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="p-5 rounded-2xl bg-slate-950 border border-white/10 flex flex-col gap-3">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                        Primary Accent Color
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          type="color"
                          value={primaryColor}
                          onChange={(e) => setPrimaryColor(e.target.value)}
                          className="w-10 h-10 rounded-xl cursor-pointer bg-transparent border-none"
                        />
                        <input
                          type="text"
                          value={primaryColor}
                          onChange={(e) => setPrimaryColor(e.target.value)}
                          className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white font-mono text-xs"
                        />
                      </div>
                    </div>

                    <div className="p-5 rounded-2xl bg-slate-950 border border-white/10 flex flex-col gap-3">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                        Secondary Glow Color
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          type="color"
                          value={secondaryColor}
                          onChange={(e) => setSecondaryColor(e.target.value)}
                          className="w-10 h-10 rounded-xl cursor-pointer bg-transparent border-none"
                        />
                        <input
                          type="text"
                          value={secondaryColor}
                          onChange={(e) => setSecondaryColor(e.target.value)}
                          className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white font-mono text-xs"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Wall Theme Preset */}
                  <div className="flex flex-col gap-3">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                      Live Screen Wall Wallpaper Preset
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {[
                        { id: 'onyx', label: 'Dark Onyx', bg: 'bg-slate-950' },
                        { id: 'midnight', label: 'Midnight Navy', bg: 'bg-slate-900' },
                        { id: 'velvet', label: 'Velvet Gold', bg: 'bg-stone-900' },
                        { id: 'minimal', label: 'Minimal Slate', bg: 'bg-zinc-900' },
                      ].map((preset) => (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => setWallTheme(preset.id as any)}
                          className={`p-3 rounded-xl border text-xs font-bold transition-all flex flex-col items-center gap-2 cursor-pointer ${
                            wallTheme === preset.id
                              ? 'border-cyan-400 bg-cyan-500/10 text-cyan-400 shadow-md'
                              : 'border-white/10 text-slate-400 hover:text-white'
                          }`}
                        >
                          <div className={`w-full h-8 rounded-lg ${preset.bg} border border-white/10`} />
                          <span>{preset.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: WHITE-LABEL CONTROLS */}
              {activeTab === 'whitelabel' && (
                <div className="p-6 md:p-8 rounded-3xl bg-slate-900/80 border border-white/10 backdrop-blur-xl shadow-2xl flex flex-col gap-6">
                  <div>
                    <h2 className="text-xl font-black text-white flex items-center gap-2">
                      <Shield className="text-cyan-400" size={20} />
                      White-Label & Branding Removal
                    </h2>
                    <p className="text-slate-400 text-xs mt-1">
                      Remove default Memento branding and customize support details for your client base.
                    </p>
                  </div>

                  <div className="p-5 rounded-2xl bg-slate-950 border border-white/10 flex items-center justify-between gap-4">
                    <div>
                      <h4 className="text-sm font-bold text-white">Remove "Powered by Memento" Watermark</h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Completely hides Memento badges. Your custom Brand Logo (if uploaded) will be used as a replacement on live walls and printed cards.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setRemoveWatermark(!removeWatermark)}
                      className={`w-14 h-8 rounded-full p-1 transition-colors duration-300 flex items-center cursor-pointer ${
                        removeWatermark ? 'bg-cyan-500 justify-end' : 'bg-slate-800 justify-start'
                      }`}
                    >
                      <div className="w-6 h-6 rounded-full bg-white shadow-md" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                        Custom Support WhatsApp / Phone
                      </label>
                      <input
                        type="text"
                        value={customSupportPhone}
                        onChange={(e) => setCustomSupportPhone(e.target.value)}
                        className="px-4 py-3 rounded-xl bg-slate-950 border border-white/15 text-white text-sm focus:border-cyan-400 focus:outline-none transition-all"
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                        Custom Support Email
                      </label>
                      <input
                        type="email"
                        value={customSupportEmail}
                        onChange={(e) => setCustomSupportEmail(e.target.value)}
                        className="px-4 py-3 rounded-xl bg-slate-950 border border-white/15 text-white text-sm focus:border-cyan-400 focus:outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                      Custom Footer Copyright Text
                    </label>
                    <input
                      type="text"
                      value={footerCopyright}
                      onChange={(e) => setFooterCopyright(e.target.value)}
                      className="px-4 py-3 rounded-xl bg-slate-950 border border-white/15 text-white text-sm focus:border-cyan-400 focus:outline-none transition-all"
                    />
                  </div>
                </div>
              )}

              {/* Submit Save Button */}
              <div className="pt-2">
                {isPro ? (
                  <button
                    type="submit"
                    disabled={saving}
                    className="w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-extrabold text-sm tracking-wider uppercase shadow-[0_0_30px_rgba(6,182,212,0.3)] hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <Save size={18} />
                    <span>{saving ? 'Saving All Settings...' : 'Save All Branding Settings'}</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => router.push('/pricing')}
                    className="w-full py-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-extrabold text-sm tracking-wider uppercase transition-all flex items-center justify-center gap-2 cursor-pointer border border-cyan-500/30 hover:border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.15)]"
                  >
                    <Sparkles size={18} className="text-cyan-400" />
                    <span className="text-cyan-50">Upgrade to Professional to Save Branding</span>
                  </button>
                )}
              </div>

            </form>
          </div>

          {/* Right Column: Live Realtime Preview Card (4 Cols) */}
          <div className="lg:col-span-4 flex flex-col gap-6 sticky top-24">
            <div className="p-6 rounded-3xl bg-slate-900/90 border border-white/10 backdrop-blur-xl shadow-2xl flex flex-col gap-5">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <span className="text-xs font-mono uppercase tracking-widest text-cyan-400 font-bold flex items-center gap-1.5">
                  <Eye size={14} /> Live Client Preview
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400">
                  REAL-TIME
                </span>
              </div>

              {/* Header Preview */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-white/10 flex flex-col gap-3">
                <span className="text-[10px] font-mono text-slate-500 uppercase">Guest Upload Header</span>
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-2">
                    {brandLogoPreview ? (
                      <img src={brandLogoPreview} alt="Logo" className="h-6 w-auto object-contain" />
                    ) : (
                      <span className="text-base font-black text-white">{brandName}</span>
                    )}
                  </div>
                  <span 
                    className="text-[10px] font-extrabold px-2.5 py-1 rounded-full text-white"
                    style={{ backgroundColor: primaryColor }}
                  >
                    SCAN & UPLOAD
                  </span>
                </div>
              </div>

              {/* Live Wall Header Preview */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-white/10 flex flex-col gap-3">
                <span className="text-[10px] font-mono text-slate-500 uppercase">Live Screen Watermark Preview</span>
                <div className="p-3 rounded-xl bg-black border border-white/10 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300">Live Memory Wall</span>
                  {removeWatermark ? (
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                      Watermark Removed
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono text-slate-400">
                      Powered by Memento
                    </span>
                  )}
                </div>
              </div>

              {/* Support Details Preview */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-white/10 flex flex-col gap-2 text-xs">
                <span className="text-[10px] font-mono text-slate-500 uppercase">Client Support Footer</span>
                <div className="text-slate-300 font-medium">{brandName} Support</div>
                <div className="text-cyan-400 font-mono text-[11px]">{customSupportPhone}</div>
                <div className="text-slate-400 text-[11px] truncate">{customSupportEmail}</div>
              </div>

              <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-[11px] flex items-center gap-2">
                <Sparkles size={14} className="shrink-0" />
                <span>Changes apply instantly to all active client event links and live walls.</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
