"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AnimatedLogo from '@/components/AnimatedLogo';
import { 
  Building2, Image as ImageIcon, Palette, Globe, Shield, Save, CheckCircle2, 
  Upload, Sparkles, ExternalLink, ArrowLeft, RefreshCw, Eye, Smartphone, HelpCircle,
  Users, UserCheck
} from 'lucide-react';

interface CustomerOption {
  id: string;
  full_name: string;
  email: string;
  plan: string;
}

export default function BrandingPage() {
  const { user, profile, isLoading, isSuperAdmin, isAdmin } = useAuth();
  const router = useRouter();
  
  const isUserAdmin = isAdmin || isSuperAdmin;
  const isPro = profile?.plan === 'whitelabel' || isSuperAdmin || isUserAdmin;

  // Customer selection for Admins
  const [customers, setCustomers] = useState<CustomerOption[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>('self');
  const [fetchingTargetUser, setFetchingTargetUser] = useState<boolean>(false);

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

  // Fetch initial profile branding
  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.push('/auth');
      return;
    }

    const fetchBranding = async () => {
      setLoading(true);
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      applyMetadata(currentUser?.user_metadata || {});
      setLoading(false);
    };

    fetchBranding();
  }, [user, isLoading, router]);

  // Load customer list if Admin
  useEffect(() => {
    if (isUserAdmin) {
      supabase
        .from('profiles')
        .select('id, full_name, email, plan')
        .order('created_at', { ascending: false })
        .then(({ data }) => {
          if (data) setCustomers(data as CustomerOption[]);
        });
    }
  }, [isUserAdmin]);

  const applyMetadata = (metadata: any) => {
    setBrandName(metadata.brand_name || 'Apex Event Media');
    setBrandTagline(metadata.brand_tagline || 'Exclusive Live Memory Experiences');
    setBrandLogoPreview(metadata.brand_logo_url || null);
    setFaviconUrl(metadata.favicon_url || '');
    setFaviconPreview(metadata.favicon_url || null);
    setCustomDomain(metadata.custom_domain || 'live.apexevents.com');
    setPrimaryColor(metadata.brand_colors?.primary || '#06b6d4');
    setSecondaryColor(metadata.brand_colors?.secondary || '#a855f7');
    setWallTheme(metadata.wall_theme || 'onyx');
    setRemoveWatermark(metadata.remove_watermark !== undefined ? metadata.remove_watermark : true);
    setCustomSupportPhone(metadata.support_phone || '+91 9866161775');
    setCustomSupportEmail(metadata.support_email || 'support@apexevents.com');
    setFooterCopyright(metadata.footer_copyright || '© 2026 Apex Event Media. All rights reserved.');
  };

  const loadTargetUserBranding = async (targetId: string) => {
    setFetchingTargetUser(true);
    try {
      if (targetId === 'self') {
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        applyMetadata(currentUser?.user_metadata || {});
      } else {
        const { data: { session } } = await supabase.auth.getSession();
        const res = await fetch(`/api/admin/user-branding?userId=${targetId}`, {
          headers: {
            'Authorization': `Bearer ${session?.access_token || ''}`
          }
        });
        const data = await res.json();
        if (data.success && data.metadata) {
          applyMetadata(data.metadata);
        } else {
          alert(data.error || 'Failed to load customer branding settings');
        }
      }
    } catch (err: any) {
      console.error('Error fetching target user branding:', err);
    } finally {
      setFetchingTargetUser(false);
    }
  };

  const handleSelectCustomer = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newId = e.target.value;
    setSelectedUserId(newId);
    loadTargetUserBranding(newId);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!isPro) return;

    setSaving(true);
    setSaveSuccess(false);

    try {
      const targetId = selectedUserId === 'self' ? user.id : selectedUserId;

      let logoUrl = brandLogoPreview;
      if (brandLogoFile) {
        const filePath = `branding/${targetId}/logo_${Date.now()}`;
        const { error: uploadErr } = await supabase.storage.from('photos').upload(filePath, brandLogoFile, { upsert: true });
        if (!uploadErr) {
          logoUrl = supabase.storage.from('photos').getPublicUrl(filePath).data.publicUrl;
        }
      }

      let newFaviconUrl = faviconPreview;
      if (faviconFile) {
        const filePath = `branding/${targetId}/favicon_${Date.now()}`;
        const { error: uploadErr } = await supabase.storage.from('photos').upload(filePath, faviconFile, { upsert: true });
        if (!uploadErr) {
          newFaviconUrl = supabase.storage.from('photos').getPublicUrl(filePath).data.publicUrl;
        }
      }

      const metadataPayload = {
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
      };

      if (selectedUserId === 'self') {
        const { error } = await supabase.auth.updateUser({
          data: {
            ...user.user_metadata,
            ...metadataPayload,
          },
        });
        if (error) throw error;
      } else {
        const { data: { session } } = await supabase.auth.getSession();
        const res = await fetch('/api/admin/user-branding', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.access_token || ''}`
          },
          body: JSON.stringify({
            userId: selectedUserId,
            metadata: metadataPayload
          })
        });
        const data = await res.json();
        if (!data.success) {
          throw new Error(data.error || 'Failed to save branding for customer');
        }
      }

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
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

  const selectedCustomerInfo = customers.find(c => c.id === selectedUserId);

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

        {/* Admin Whitelabel Customer Selector Bar */}
        {isUserAdmin && (
          <div className="p-4 md:p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-cyan-950/40 to-slate-900 border border-cyan-500/30 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                <Users size={20} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-white">Whitelabel & Customer Selector</h3>
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    ADMIN MODE
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Select any customer account to inspect or edit their White-Label branding configuration.
                </p>
              </div>
            </div>

            <div className="w-full md:w-auto flex flex-col sm:flex-row items-center gap-3">
              <select
                value={selectedUserId}
                onChange={handleSelectCustomer}
                disabled={fetchingTargetUser}
                className="w-full md:w-80 px-3.5 py-2.5 rounded-xl bg-slate-950 border border-cyan-500/40 text-xs font-bold text-white focus:outline-none focus:border-cyan-400 shadow-lg cursor-pointer"
              >
                <option value="self">👤 My Admin Account ({user?.email})</option>
                <optgroup label="👑 Whitelabel Customers">
                  {customers.filter(c => c.plan === 'whitelabel').map(c => (
                    <option key={c.id} value={c.id}>
                      👑 {c.full_name || 'Whitelabel User'} ({c.email})
                    </option>
                  ))}
                </optgroup>
                <optgroup label="👥 All Other Accounts">
                  {customers.filter(c => c.plan !== 'whitelabel').map(c => (
                    <option key={c.id} value={c.id}>
                      {c.full_name || 'User'} ({c.email}) — [{c.plan ? c.plan.toUpperCase() : 'STARTER'}]
                    </option>
                  ))}
                </optgroup>
              </select>
              {fetchingTargetUser && (
                <div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin shrink-0" />
              )}
            </div>
          </div>
        )}

        {/* Selected Customer Banner */}
        {selectedUserId !== 'self' && selectedCustomerInfo && (
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold flex items-center justify-between">
            <span className="flex items-center gap-2">
              <UserCheck size={16} />
              <span>Editing White-Label settings for:</span>
              <span className="underline font-mono">
                {selectedCustomerInfo.full_name || selectedCustomerInfo.email}
              </span>
              <span className="text-[10px] uppercase px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-200">
                {selectedCustomerInfo.plan || 'STARTER'}
              </span>
            </span>
            <button
              type="button"
              onClick={() => { setSelectedUserId('self'); loadTargetUserBranding('self'); }}
              className="text-[11px] underline text-amber-200 hover:text-white"
            >
              Switch back to My Account
            </button>
          </div>
        )}

        {/* Success Alert */}
        {saveSuccess && (
          <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 flex items-center justify-between shadow-xl">
            <div className="flex items-center gap-3">
              <CheckCircle2 size={20} />
              <span className="text-sm font-bold">
                {selectedUserId === 'self' 
                  ? 'White-Label settings updated & synced across all client events!'
                  : `White-Label settings successfully updated for ${selectedCustomerInfo?.full_name || selectedCustomerInfo?.email || 'customer'}!`
                }
              </span>
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

              {/* TAB 1: BRAND IDENTITY */}
              {activeTab === 'identity' && (
                <div className="p-6 md:p-8 rounded-3xl bg-slate-900/80 border border-white/10 backdrop-blur-xl flex flex-col gap-6 shadow-2xl">
                  <div>
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                      <Building2 size={18} className="text-cyan-400" /> Agency Identity & Assets
                    </h2>
                    <p className="text-xs text-slate-400 mt-1">
                      Upload custom agency logo, favicon, and primary brand titles used on client galleries.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-bold text-slate-300">Agency / Brand Name</label>
                      <input 
                        type="text" 
                        value={brandName}
                        onChange={(e) => setBrandName(e.target.value)}
                        placeholder="e.g. Apex Event Media"
                        className="w-full mt-1.5 px-4 py-3 rounded-xl bg-slate-950 border border-white/10 text-xs font-medium text-white focus:outline-none focus:border-cyan-400"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-300">Brand Tagline</label>
                      <input 
                        type="text" 
                        value={brandTagline}
                        onChange={(e) => setBrandTagline(e.target.value)}
                        placeholder="e.g. Premium Live Memory Experiences"
                        className="w-full mt-1.5 px-4 py-3 rounded-xl bg-slate-950 border border-white/10 text-xs font-medium text-white focus:outline-none focus:border-cyan-400"
                      />
                    </div>

                    {/* Logo Upload */}
                    <div className="pt-2">
                      <label className="text-xs font-bold text-slate-300">Brand Header Logo</label>
                      <div className="mt-2 flex items-center gap-4">
                        <div className="w-32 h-16 rounded-xl bg-slate-950 border border-white/10 flex items-center justify-center p-2 overflow-hidden">
                          {brandLogoPreview ? (
                            <img src={brandLogoPreview} alt="Logo preview" className="max-h-full max-w-full object-contain" />
                          ) : (
                            <span className="text-[10px] text-slate-500 font-mono">No Logo Uploaded</span>
                          )}
                        </div>
                        <label className="px-4 py-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-bold hover:bg-cyan-500/20 cursor-pointer flex items-center gap-2 transition-all">
                          <Upload size={14} /> Upload New Logo
                          <input 
                            type="file" 
                            accept="image/*" 
                            className="hidden" 
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                setBrandLogoFile(file);
                                setBrandLogoPreview(URL.createObjectURL(file));
                              }
                            }}
                          />
                        </label>
                      </div>
                    </div>

                    {/* Favicon Upload */}
                    <div className="pt-2">
                      <label className="text-xs font-bold text-slate-300">Browser Favicon (.ico or .png)</label>
                      <div className="mt-2 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-slate-950 border border-white/10 flex items-center justify-center p-2 overflow-hidden">
                          {faviconPreview ? (
                            <img src={faviconPreview} alt="Favicon preview" className="w-6 h-6 object-contain" />
                          ) : (
                            <Globe size={18} className="text-slate-600" />
                          )}
                        </div>
                        <label className="px-4 py-2.5 rounded-xl bg-slate-800 border border-white/10 text-slate-300 text-xs font-bold hover:bg-slate-700 cursor-pointer flex items-center gap-2 transition-all">
                          <Upload size={14} /> Choose Favicon
                          <input 
                            type="file" 
                            accept="image/x-icon,image/png" 
                            className="hidden" 
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                setFaviconFile(file);
                                setFaviconPreview(URL.createObjectURL(file));
                              }
                            }}
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: CUSTOM DOMAIN */}
              {activeTab === 'domain' && (
                <div className="p-6 md:p-8 rounded-3xl bg-slate-900/80 border border-white/10 backdrop-blur-xl flex flex-col gap-6 shadow-2xl">
                  <div>
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                      <Globe size={18} className="text-cyan-400" /> Custom Domain Configuration
                    </h2>
                    <p className="text-xs text-slate-400 mt-1">
                      Serve all client galleries under your agency sub-domain (CNAME setup required).
                    </p>
                  </div>

                  <div className="space-y-5">
                    <div>
                      <label className="text-xs font-bold text-slate-300">Target Agency Domain</label>
                      <div className="mt-1.5 flex items-center gap-2">
                        <input 
                          type="text" 
                          value={customDomain}
                          onChange={(e) => setCustomDomain(e.target.value)}
                          placeholder="e.g. live.youragency.com"
                          className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-white/10 text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-400"
                        />
                        <button
                          type="button"
                          className="px-4 py-3 rounded-xl bg-cyan-500/20 border border-cyan-400/30 text-cyan-300 text-xs font-bold shrink-0 hover:bg-cyan-500/30"
                        >
                          Check DNS
                        </button>
                      </div>
                    </div>

                    {/* CNAME Instructions Card */}
                    <div className="p-5 rounded-2xl bg-slate-950 border border-white/10 flex flex-col gap-3">
                      <div className="flex items-center justify-between text-xs font-bold text-white">
                        <span>DNS CNAME Setup Instructions</span>
                        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                          RECORD READY
                        </span>
                      </div>
                      <div className="text-xs text-slate-400 font-mono space-y-1">
                        <div>Type: <span className="text-white">CNAME</span></div>
                        <div>Name: <span className="text-white">live</span> (or your subdomain)</div>
                        <div>Value: <span className="text-cyan-400">cname.mymementoapp.com</span></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: COLORS & THEME */}
              {activeTab === 'colors' && (
                <div className="p-6 md:p-8 rounded-3xl bg-slate-900/80 border border-white/10 backdrop-blur-xl flex flex-col gap-6 shadow-2xl">
                  <div>
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                      <Palette size={18} className="text-cyan-400" /> Color Accent & Live Wall Aesthetic
                    </h2>
                    <p className="text-xs text-slate-400 mt-1">
                      Customize color tokens applied to live wall headers, guest buttons, and moderation interfaces.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-slate-950 border border-white/10 flex flex-col gap-3">
                      <label className="text-xs font-bold text-slate-300">Primary Brand Accent</label>
                      <div className="flex items-center gap-3">
                        <input 
                          type="color" 
                          value={primaryColor}
                          onChange={(e) => setPrimaryColor(e.target.value)}
                          className="w-10 h-10 rounded-xl bg-transparent border-0 cursor-pointer"
                        />
                        <span className="text-xs font-mono text-cyan-400 font-bold">{primaryColor}</span>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-950 border border-white/10 flex flex-col gap-3">
                      <label className="text-xs font-bold text-slate-300">Secondary Highlight Color</label>
                      <div className="flex items-center gap-3">
                        <input 
                          type="color" 
                          value={secondaryColor}
                          onChange={(e) => setSecondaryColor(e.target.value)}
                          className="w-10 h-10 rounded-xl bg-transparent border-0 cursor-pointer"
                        />
                        <span className="text-xs font-mono text-purple-400 font-bold">{secondaryColor}</span>
                      </div>
                    </div>
                  </div>

                  {/* Theme Presets */}
                  <div>
                    <label className="text-xs font-bold text-slate-300 mb-2 block">Live Memory Wall Background Theme</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {[
                        { id: 'onyx', label: 'Onyx Dark', bg: 'bg-black' },
                        { id: 'midnight', label: 'Midnight Blue', bg: 'bg-slate-950' },
                        { id: 'velvet', label: 'Velvet Purple', bg: 'bg-purple-950' },
                        { id: 'minimal', label: 'Minimal White', bg: 'bg-slate-100 text-slate-900' },
                      ].map((t) => (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => setWallTheme(t.id as any)}
                          className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-2 transition-all cursor-pointer ${
                            wallTheme === t.id
                              ? 'border-cyan-400 bg-cyan-500/10 text-cyan-300'
                              : 'border-white/10 text-slate-400 hover:border-white/20'
                          }`}
                        >
                          <div className={`w-full h-8 rounded-lg ${t.bg} border border-white/20`} />
                          <span>{t.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: WHITE-LABEL CONTROLS */}
              {activeTab === 'whitelabel' && (
                <div className="p-6 md:p-8 rounded-3xl bg-slate-900/80 border border-white/10 backdrop-blur-xl flex flex-col gap-6 shadow-2xl">
                  <div>
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                      <Shield size={18} className="text-cyan-400" /> White-Label Overrides & Support Contact
                    </h2>
                    <p className="text-xs text-slate-400 mt-1">
                      Remove default Memento branding and customize support details for your client base.
                    </p>
                  </div>

                  <div className="space-y-5">
                    {/* Watermark Toggle */}
                    <div className="p-4 rounded-2xl bg-slate-950 border border-white/10 flex items-center justify-between">
                      <div>
                        <div className="text-xs font-bold text-white">Remove "Powered by Memento" Watermark</div>
                        <div className="text-[11px] text-slate-400">Completely hides Memento logos from live walls and guest scan cards.</div>
                      </div>
                      <input 
                        type="checkbox" 
                        checked={removeWatermark}
                        onChange={(e) => setRemoveWatermark(e.target.checked)}
                        className="w-5 h-5 accent-cyan-500 cursor-pointer"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-300">Custom Support Helpline Phone</label>
                      <input 
                        type="text" 
                        value={customSupportPhone}
                        onChange={(e) => setCustomSupportPhone(e.target.value)}
                        placeholder="e.g. +91 9866161775"
                        className="w-full mt-1.5 px-4 py-3 rounded-xl bg-slate-950 border border-white/10 text-xs font-medium text-white focus:outline-none focus:border-cyan-400"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-300">Custom Support Email</label>
                      <input 
                        type="email" 
                        value={customSupportEmail}
                        onChange={(e) => setCustomSupportEmail(e.target.value)}
                        placeholder="e.g. support@apexevents.com"
                        className="w-full mt-1.5 px-4 py-3 rounded-xl bg-slate-950 border border-white/10 text-xs font-medium text-white focus:outline-none focus:border-cyan-400"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-300">Footer Copyright Notice</label>
                      <input 
                        type="text" 
                        value={footerCopyright}
                        onChange={(e) => setFooterCopyright(e.target.value)}
                        placeholder="e.g. © 2026 Apex Event Media. All rights reserved."
                        className="w-full mt-1.5 px-4 py-3 rounded-xl bg-slate-950 border border-white/10 text-xs font-medium text-white focus:outline-none focus:border-cyan-400"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <div className="pt-2">
                {isPro ? (
                  <button
                    type="submit"
                    disabled={saving}
                    className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-cyan-500/20 hover:shadow-cyan-500/30 transition-all flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50"
                  >
                    {saving ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Saving White-Label Configuration...</span>
                      </>
                    ) : (
                      <>
                        <Save size={18} />
                        <span>
                          {selectedUserId === 'self'
                            ? 'Save White-Label Branding Settings'
                            : `Save White-Label Branding for ${selectedCustomerInfo?.full_name || selectedCustomerInfo?.email || 'Customer'}`
                          }
                        </span>
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => router.push('/checkout?plan=whitelabel')}
                    className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-sm shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
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
