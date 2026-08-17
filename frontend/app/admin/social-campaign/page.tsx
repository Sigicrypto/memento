'use client';

import React, { useState } from 'react';
import {
  Send,
  CheckCircle2,
  RefreshCw,
  Sparkles,
  Layers,
  Image as ImageIcon,
  ExternalLink,
  Globe,
  Share2,
  Sliders,
  Check,
  Flame,
  CheckCircle,
  AlertCircle,
  Briefcase,
  Users,
  MapPin,
  Calendar,
  Phone,
  MessageSquare,
  Zap,
  IndianRupee,
  ShieldCheck,
  TrendingUp,
  Radio,
  Copy,
  Search,
  Filter,
  Eye,
  Award,
  Smartphone,
  Paintbrush
} from 'lucide-react';
import { generateRandomCampaign } from '@/lib/metaSocial';

const PRESETS = [
  {
    id: 'wedding',
    badge: '💍 Luxury Weddings',
    title: 'Wedding Memory Wall',
    desc: 'Target engaged couples & luxury wedding planners across India with instant live guest photo sharing.',
    imageUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1200&auto=format&fit=crop',
    caption: `💍 Stop waiting 4 weeks for wedding photos! With Memento, guests scan a QR code at their table, snap photos on their phones, and watch them appear live on the big screen! \n\n✨ Custom branding\n✨ Zero app downloads required\n✨ Instant guest photo sharing\n\nBook your live QR wall today at www.mymementoapp.com 🥂❤️\n\n#WeddingInspiration #LivePhotoWall #WeddingTech #Memento #EventPlanner #WeddingPlanning #InteractiveWeddings`,
  },
  {
    id: 'corporate',
    badge: '🚀 B2B & Galas',
    title: 'Corporate Gala & Brand Activation',
    desc: 'Target HR teams, event directors, and enterprise brand managers nationwide.',
    imageUrl: 'https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=1200&auto=format&fit=crop',
    caption: `🚀 Transform corporate event engagement in 1 scan! Memento turns every attendee's smartphone into a live camera feed for your main stage screen.\n\n📈 3x higher guest participation\n🎨 Custom corporate branding & logo overlay\n🛡️ Real-time photo moderation\n\nElevate your brand experience at www.mymementoapp.com 🌟\n\n#CorporateEvents #EventMarketing #BrandActivation #EventPlanner #Memento #EventTech #LiveEngagement`,
  },
  {
    id: 'birthday',
    badge: '🎉 Parties & VIP',
    title: 'Birthday & Private Celebrations',
    desc: 'Target birthday hosts, milestone anniversaries, and VIP parties across India.',
    imageUrl: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=1200&auto=format&fit=crop',
    caption: `🎉 Make your party unforgettable! Capture every angle of your celebration with Memento's live QR photo wall.\n\n📱 Guests just scan & upload\n✨ Live wall slideshow with animations\n💖 Download the full photo album after the party!\n\nSetup your wall in 2 minutes at www.mymementoapp.com 🥳\n\n#PartyIdeas #BirthdayCelebration #PhotoWall #MementoApp #LivePartyFeed #EventTech`,
  },
  {
    id: 'product',
    badge: '⚡ Tech Feature',
    title: 'Product Spotlight (Zero App Download)',
    desc: 'Focus on frictionless guest experience and zero setup friction.',
    imageUrl: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?q=80&w=1200&auto=format&fit=crop',
    caption: `⚡ Why event hosts love Memento: No app downloads, no complicated setup, and instant live photo sharing for any venue screen or TV.\n\nCreate your memory wall for your next event at www.mymementoapp.com!\n\n#EventTech #DigitalPhotoWall #Memento #LiveEvents #EventOrganizers`,
  },
  {
    id: 'hiring',
    badge: '💼 10% Commission Hiring',
    title: 'Pan-India Sales Partner & Affiliate Hiring',
    desc: 'Target promoters, freelancers, and event coordinators to earn flat 10% commission on every sale (no fixed salary) with instant payout upon lead monetization.',
    imageUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=1200&auto=format&fit=crop',
    caption: `💼 HIRING: PAN-INDIA EVENT SALES PARTNER (100% COMMISSION BASIS - NO FIXED SALARY!)\n\nIntroduce Memento's Live QR Photo Wall to wedding planners, corporate event hosts & venues across India!\n\n💰 10% Flat Commission per Closed Booking (No Fixed Salary)\n⚡ INSTANT PAYOUT as soon as the lead is monetized (No waiting period!)\n🕒 Flexible Part-Time / Work-From-Anywhere Hours\n\n🎁 Benefits: Unlimited earning potential + 10% Flat Commission per Deal + INSTANT Payout on Monetization (UPI/Bank Transfer)!\n\nApply via WhatsApp: +91 9866161775 | Learn more at www.mymementoapp.com 🚀\n\n#CommissionJobs #EventJobs #PanIndiaHiring #NoFixedSalary #InstantPayout #EventPromoter #MementoPartner`,
  },
];

const JOB_ROLES = [
  { id: 'partner', title: 'Event Sales Partner / Affiliate', defaultPay: '10% Flat Commission / Deal (No Fixed Salary)', desc: 'Promote live QR photo walls to wedding planners, venues & event hosts across India' },
  { id: 'promoter', title: 'Commission Event Promoter', defaultPay: '10% Direct Sales Commission (No Fixed Salary)', desc: 'Pitch Memento to client leads and receive instant payout upon lead monetization' },
  { id: 'ambassador', title: 'Venue & Brand Ambassador', defaultPay: '10% Commission / Activated Lead (No Fixed Salary)', desc: 'Activate venue partnerships, clubs & private party bookings nationwide' },
  { id: 'freelancer', title: 'Event Agency Referral Partner', defaultPay: '10% Referral Commission (No Fixed Salary)', desc: 'Refer wedding & corporate clients to Memento and get paid immediately when booked' },
];

const DAILY_HOOKS = [
  "💼 HIRING: PAN-INDIA EVENT SALES PARTNER (100% COMMISSION BASIS - NO FIXED SALARY)",
  "🚀 WORK FROM ANYWHERE IN INDIA: Earn 10% Flat Commission per Deal + Instant Payout on Monetization!",
  "⚡ EARN 10% ON EVERY EVENT BOOKING: Live QR Photo Wall Sales Partners Needed Nationwide!",
  "🔥 PAN-INDIA FREELANCE OPPORTUNITY: 10% Commission per Deal (Paid Immediately on Monetization!)",
  "💰 TURN YOUR EVENT & WEDDING NETWORK INTO REVENUE: 10% Flat Commission per Sale (No Fixed Salary)!"
];

const DAILY_IMAGE_BACKDROPS = [
  'https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=1200&auto=format&fit=crop',
];

export default function SocialCampaignStudio() {
  const [activeTab, setActiveTab] = useState<'job_launcher' | 'campaign'>('job_launcher');

  // Campaign State
  const [selectedPreset, setSelectedPreset] = useState(PRESETS[4]); // Default to 10% Hiring
  const [caption, setCaption] = useState(PRESETS[4].caption);
  const [imageUrl, setImageUrl] = useState(PRESETS[4].imageUrl);
  const [target, setTarget] = useState<'both' | 'facebook' | 'instagram'>('both');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);

  // Job Launcher State (Pan-India & 10% Commission Focus)
  const [selectedRole, setSelectedRole] = useState(JOB_ROLES[0]);
  const [jobPay, setJobPay] = useState('10% Flat Commission per Closed Deal (No Fixed Salary)');
  const [jobDate, setJobDate] = useState('Flexible / Freelance Hours (Work From Anywhere)');
  const [jobContact, setJobContact] = useState('+91 9866161775');
  const [jobExtraNote, setJobExtraNote] = useState('NO FIXED SALARY. 100% Commission Basis. Instant Payout released immediately upon lead monetization!');
  const [dailyHookIndex, setDailyHookIndex] = useState<number>(0);
  const [copiedSuccess, setCopiedSuccess] = useState(false);
  const [imageCopiedSuccess, setImageCopiedSuccess] = useState(false);

  const handleSelectPreset = (preset: typeof PRESETS[0]) => {
    setSelectedPreset(preset);
    setCaption(preset.caption);
    setImageUrl(preset.imageUrl);
  };

  const handleGenerateAIVariation = () => {
    const variation = generateRandomCampaign(selectedPreset.id);
    setCaption(variation.caption);
    setImageUrl(variation.imageUrl);
  };

  const handleRotateDailyCopy = () => {
    setDailyHookIndex(prev => (prev + 1) % DAILY_HOOKS.length);
  };

  const handleTriggerAutoPilot = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch('/api/cron/publish-social', { method: 'POST' });
      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Auto-pilot trigger failed');
      }
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Auto-pilot failed');
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch('/api/meta/campaign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          presetKey: selectedPreset.id,
          customCaption: caption,
          customImageUrl: imageUrl,
          target,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Campaign publishing failed');
      }

      setResult(data);
    } catch (err: any) {
      setError(err.message || 'An error occurred during publishing');
    } finally {
      setLoading(false);
    }
  };

  // Dynamic Daily Job Offer Copy Generator
  const getFormattedJobCopy = () => {
    const currentHook = DAILY_HOOKS[dailyHookIndex];
    return `${currentHook}

📍 Target Location: All India (Work From Anywhere / Pan-India)
💰 Commission Structure: ${jobPay}
⚡ Payout Schedule: INSTANT PAYOUT as soon as lead is monetized (No waiting period!)
📅 Work Flexibility: ${jobDate}
📞 WhatsApp Direct: ${jobContact}

📋 Role & Opportunity:
• ${selectedRole.desc}
• Introduce Memento's Live QR Photo Wall to wedding planners, corporate event hosts & venues across India.
• Earn 10% commission on every closed deal, transferred immediately when monetized!

✨ Candidate Requirements:
✔️ Open to anyone across India (Students, Freelancers, Event Planners & Sales Enthusiasts)
✔️ Good communication or network in weddings, corporate galas & private parties
✔️ No Fixed Salary — Only Flat 10% Commission per Monetized Sale!
${jobExtraNote ? `✔️ ${jobExtraNote}\n` : ''}
🎁 Benefits: Unlimited earning potential + 10% Flat Commission per Deal + INSTANT Payout on Monetization (UPI/Bank Transfer)!

👇 HOW TO APPLY:
Send your Name & State/City via WhatsApp to ${jobContact} or DM us!
Learn more about Memento: www.mymementoapp.com

#CommissionJobs #EventJobs #PanIndiaJobs #10PercentCommission #NoFixedSalary #InstantPayout #EventPromoter #MementoPartner #AllIndiaHiring`;
  };

  const handleCopyJobText = () => {
    const postText = getFormattedJobCopy();
    navigator.clipboard.writeText(postText);
    setCopiedSuccess(true);
    setTimeout(() => setCopiedSuccess(false), 4000);
  };

  // Directly copy the dynamic poster image onto Clipboard (Ctrl+V ready)
  const handleCopyAdImageToClipboard = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1080;
    canvas.height = 1080;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const currentBackdropUrl = DAILY_IMAGE_BACKDROPS[dailyHookIndex % DAILY_IMAGE_BACKDROPS.length];
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = currentBackdropUrl;

    const drawPosterContent = () => {
      // Dark Overlay
      const overlayGrad = ctx.createLinearGradient(0, 0, 0, 1080);
      overlayGrad.addColorStop(0, 'rgba(7, 9, 14, 0.88)');
      overlayGrad.addColorStop(0.5, 'rgba(15, 23, 42, 0.92)');
      overlayGrad.addColorStop(1, 'rgba(7, 9, 14, 0.96)');
      ctx.fillStyle = overlayGrad;
      ctx.fillRect(0, 0, 1080, 1080);

      // Neon Outer Border
      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 12;
      ctx.strokeRect(30, 30, 1020, 1020);

      // Top Badge: PAN-INDIA HIRING
      ctx.fillStyle = '#06b6d4';
      ctx.fillRect(340, 75, 400, 52);
      ctx.fillStyle = '#07090E';
      ctx.font = 'bold 24px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('🇮🇳 PAN-INDIA HIRING • ALL STATES', 540, 110);

      // Title
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '900 44px sans-serif';
      ctx.fillText('HIRING EVENT SALES PARTNERS', 540, 200);

      ctx.fillStyle = '#38BDF8';
      ctx.font = '900 50px sans-serif';
      ctx.fillText(selectedRole.title.toUpperCase(), 540, 265);

      // Sub-badge: NO FIXED SALARY
      ctx.fillStyle = 'rgba(245, 158, 11, 0.25)';
      ctx.strokeStyle = '#F59E0B';
      ctx.lineWidth = 3;
      ctx.fillRect(160, 310, 760, 58);
      ctx.strokeRect(160, 310, 760, 58);
      ctx.fillStyle = '#FCD34D';
      ctx.font = '900 24px sans-serif';
      ctx.fillText('NO FIXED SALARY • 100% COMMISSION BASIS', 540, 348);

      // Feature Card 1: 10% Flat Commission
      ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
      ctx.strokeStyle = '#10B981';
      ctx.lineWidth = 3;
      ctx.fillRect(120, 410, 840, 110);
      ctx.strokeRect(120, 410, 840, 110);
      ctx.fillStyle = '#34D399';
      ctx.font = '900 32px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('💰 10% FLAT COMMISSION PER DEAL', 160, 475);

      // Feature Card 2: Instant Payout on Monetization
      ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
      ctx.strokeStyle = '#F59E0B';
      ctx.lineWidth = 3;
      ctx.fillRect(120, 540, 840, 110);
      ctx.strokeRect(120, 540, 840, 110);
      ctx.fillStyle = '#FBBF24';
      ctx.font = '900 32px sans-serif';
      ctx.fillText('⚡ INSTANT PAYOUT UPON MONETIZATION', 160, 605);

      // Feature Card 3: Work From Anywhere
      ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
      ctx.strokeStyle = '#38BDF8';
      ctx.lineWidth = 3;
      ctx.fillRect(120, 670, 840, 110);
      ctx.strokeRect(120, 670, 840, 110);
      ctx.fillStyle = '#38BDF8';
      ctx.font = '900 32px sans-serif';
      ctx.fillText('📍 WORK FROM ANYWHERE IN INDIA', 160, 735);

      // Benefits Text
      ctx.fillStyle = '#E2E8F0';
      ctx.font = 'bold 24px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('🎁 Unlimited Earning Potential + Instant UPI / Bank Transfer!', 540, 825);

      // Bottom CTA Bar
      ctx.fillStyle = '#10B981';
      ctx.fillRect(80, 875, 920, 120);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '900 34px sans-serif';
      ctx.fillText('📲 WhatsApp Name & City to +91 9866161775', 540, 930);
      ctx.font = 'bold 22px sans-serif';
      ctx.fillText('www.mymementoapp.com', 540, 968);

      // Copy Image Blob to Clipboard
      canvas.toBlob((blob) => {
        if (blob && navigator.clipboard && window.ClipboardItem) {
          navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]).then(() => {
            setImageCopiedSuccess(true);
            setTimeout(() => setImageCopiedSuccess(false), 4000);
          }).catch((err) => {
            console.error('Clipboard write error:', err);
          });
        }
      }, 'image/png');
    };

    img.onload = () => {
      ctx.drawImage(img, 0, 0, 1080, 1080);
      drawPosterContent();
    };

    img.onerror = () => {
      // Render gradient background if image cross-origin fails
      const grad = ctx.createLinearGradient(0, 0, 1080, 1080);
      grad.addColorStop(0, '#07090E');
      grad.addColorStop(0.5, '#0F172A');
      grad.addColorStop(1, '#082F49');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 1080, 1080);
      drawPosterContent();
    };
  };

  const handleLaunchWhatsApp = () => {
    const postText = getFormattedJobCopy();
    const encodedText = encodeURIComponent(postText);
    window.open(`https://api.whatsapp.com/send?text=${encodedText}`, '_blank', 'noopener,noreferrer');
  };

  const currentBackdropUrl = DAILY_IMAGE_BACKDROPS[dailyHookIndex % DAILY_IMAGE_BACKDROPS.length];

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 font-sans py-8 px-4 sm:px-6 lg:px-12 selection:bg-cyan-500/30">
      {/* Container */}
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Bar */}
        <div className="bg-slate-900/80 border border-slate-800/80 backdrop-blur-xl rounded-2xl p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
            <Radio size={140} className="text-cyan-400" />
          </div>

          <div className="space-y-2 relative z-10">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-600 text-white shadow-lg shadow-cyan-500/20">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-2xl font-black tracking-tight text-white">Social & Hiring Studio</h1>
                  <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 text-[11px] font-black uppercase tracking-wider">
                    DAILY AD CREATOR & COPIER
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Daily rotating ad graphics & copy blueprints for <span className="text-emerald-400 font-bold">10% Commission (No Fixed Salary)</span> & <span className="text-amber-400 font-bold">Instant Lead Payout</span>.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 relative z-10">
            <div className="px-3.5 py-2 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Meta Graph API Connected</span>
            </div>
            <a
              href="/admin/meta-setup"
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-xl border border-slate-700 transition-colors flex items-center gap-1.5"
            >
              <Sliders className="w-3.5 h-3.5" /> Key Manager
            </a>
          </div>
        </div>

        {/* Highlight Cards: Whole India, 10% Commission & Instant Monetization Payout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 to-cyan-950/40 border border-cyan-500/30 flex items-center gap-4 shadow-xl">
            <div className="p-3 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 shrink-0">
              <Globe size={22} />
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-cyan-400">Target Territory</div>
              <div className="text-sm font-black text-white mt-0.5">Whole India (Pan-India)</div>
              <div className="text-[11px] text-slate-400">Nationwide reach & remote promoters</div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 to-emerald-950/40 border border-emerald-500/30 flex items-center gap-4 shadow-xl">
            <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shrink-0">
              <TrendingUp size={22} />
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-emerald-400">Commission Rate</div>
              <div className="text-sm font-black text-white mt-0.5">10% Flat Commission / Deal</div>
              <div className="text-[11px] text-slate-400">Strictly No Fixed Salary Basis</div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 to-amber-950/40 border border-amber-500/30 flex items-center gap-4 shadow-xl">
            <div className="p-3 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 shrink-0">
              <Zap size={22} />
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-amber-400">Payout Terms</div>
              <div className="text-sm font-black text-white mt-0.5">Instant Payout on Monetization</div>
              <div className="text-[11px] text-slate-400">Paid immediately as lead converts</div>
            </div>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
          <button
            onClick={() => setActiveTab('job_launcher')}
            className={`px-5 py-3 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'job_launcher'
                ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-500/20 border border-cyan-400/30'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>💼 Daily Ad Image & Copy Creator (10% Commission - Whole India)</span>
          </button>

          <button
            onClick={() => setActiveTab('campaign')}
            className={`px-5 py-3 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'campaign'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20 border border-purple-400/30'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>📢 Social Marketing Campaigns (Meta API)</span>
          </button>
        </div>

        {/* TAB 1: HIRING AD IMAGE & COPY STUDIO */}
        {activeTab === 'job_launcher' && (
          <div className="space-y-8">
            
            {/* Notification Toasts */}
            {copiedSuccess && (
              <div className="p-4 rounded-2xl bg-cyan-500/15 border border-cyan-400/40 text-cyan-300 flex items-center justify-between shadow-2xl animate-fade-in">
                <div className="flex items-center gap-3">
                  <CheckCircle2 size={20} className="text-cyan-400 shrink-0" />
                  <div>
                    <span className="text-sm font-bold block">Ad Text Copy Copied to Clipboard!</span>
                    <span className="text-xs text-slate-300">Ready to paste into Facebook, Instagram, LinkedIn, WhatsApp or job search groups!</span>
                  </div>
                </div>
              </div>
            )}

            {imageCopiedSuccess && (
              <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-400/40 text-emerald-300 flex items-center justify-between shadow-2xl animate-fade-in">
                <div className="flex items-center gap-3">
                  <CheckCircle2 size={20} className="text-emerald-400 shrink-0" />
                  <div>
                    <span className="text-sm font-bold block">Ad Image Poster Copied directly to Clipboard!</span>
                    <span className="text-xs text-slate-300">Just press Ctrl+V to paste the image into Facebook, Instagram, WhatsApp, or LinkedIn!</span>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Left Column: Offer Copy Builder & Configurator (5 Cols) */}
              <div className="lg:col-span-5 bg-slate-900/70 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl">
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <Briefcase className="w-5 h-5 text-cyan-400" /> Ad Configurator & Rotator
                    </h3>
                    <button
                      onClick={handleRotateDailyCopy}
                      className="px-3.5 py-1.5 bg-gradient-to-r from-cyan-500 to-blue-600 border border-cyan-400/40 text-white text-xs font-bold rounded-xl shadow-lg hover:from-cyan-400 hover:to-blue-500 transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <RefreshCw size={13} /> Rotate Daily Ad Blueprint #{dailyHookIndex + 1}
                    </button>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">Rotates daily ad graphics & text copy highlighting 10% Commission (No Fixed Salary) & Instant Lead Payout.</p>
                </div>

                {/* Role Selector */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-300 block">Target Job Role:</label>
                  <div className="grid grid-cols-1 gap-2">
                    {JOB_ROLES.map(role => {
                      const isSel = selectedRole.id === role.id;
                      return (
                        <button
                          key={role.id}
                          onClick={() => {
                            setSelectedRole(role);
                            setJobPay(role.defaultPay);
                          }}
                          className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                            isSel
                              ? 'bg-cyan-500/15 border-cyan-400/50 text-white shadow-md shadow-cyan-500/10'
                              : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-white">{role.title}</span>
                            <span className="text-[10px] font-mono text-emerald-400 font-bold">{role.defaultPay}</span>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5">{role.desc}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Target Territory & Commission */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5 text-cyan-400" /> Target Territory
                    </label>
                    <div className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-cyan-300 font-bold flex items-center justify-between">
                      <span>🇮🇳 Whole India (Pan-India)</span>
                      <ShieldCheck size={14} className="text-emerald-400" />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                      💰 Commission Rate
                    </label>
                    <input
                      type="text"
                      value={jobPay}
                      onChange={(e) => setJobPay(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-emerald-400 font-mono font-bold focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                </div>

                {/* Work Hours & Contact WhatsApp */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-cyan-400" /> Work Hours / Location
                    </label>
                    <input
                      type="text"
                      value={jobDate}
                      onChange={(e) => setJobDate(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-400"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-cyan-400" /> WhatsApp Contact
                    </label>
                    <input
                      type="text"
                      value={jobContact}
                      onChange={(e) => setJobContact(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                </div>

                {/* Payout Terms / Extra Notes */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <Zap size={14} className="text-amber-400" /> Payout Terms (Instant Monetization)
                  </label>
                  <input
                    type="text"
                    value={jobExtraNote}
                    onChange={(e) => setJobExtraNote(e.target.value)}
                    placeholder="e.g. NO FIXED SALARY. Instant payout upon lead monetization"
                    className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-amber-300 font-medium focus:outline-none focus:border-cyan-400"
                  />
                </div>

              </div>

              {/* Right Column: Visual Ad Poster Banner & Text Studio (7 Cols) */}
              <div className="lg:col-span-7 bg-slate-900/70 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl">
                
                {/* 1. VISUAL AD POSTER BANNER GRAPHIC */}
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4 mb-4">
                    <div>
                      <h3 className="text-base font-bold text-white flex items-center gap-2">
                        <ImageIcon className="w-5 h-5 text-cyan-400" /> Daily Rotating Visual Ad Poster
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">High-converting social media graphic with daily backdrop rotation.</p>
                    </div>

                    <button
                      onClick={handleCopyAdImageToClipboard}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 cursor-pointer"
                    >
                      <Copy size={15} />
                      <span>Copy Image to Clipboard</span>
                    </button>
                  </div>

                  {/* Rendered Visual Poster Mockup */}
                  <div className="p-6 md:p-8 rounded-3xl border-2 border-cyan-500/40 shadow-2xl relative overflow-hidden flex flex-col gap-6 group">
                    {/* Dynamic Image Backdrop */}
                    <div 
                      className="absolute inset-0 bg-cover bg-center transition-all duration-700 group-hover:scale-105"
                      style={{ backgroundImage: `url(${currentBackdropUrl})` }}
                    />
                    
                    {/* Dark Glassmorphic Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-b from-slate-950/90 via-slate-950/95 to-slate-950 pointer-events-none" />

                    {/* Glowing Orbs */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/20 blur-3xl rounded-full pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/20 blur-3xl rounded-full pointer-events-none" />

                    {/* Top Badge */}
                    <div className="flex items-center justify-between relative z-10">
                      <span className="px-3.5 py-1 rounded-full bg-cyan-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg">
                        🇮🇳 PAN-INDIA HIRING • ALL STATES
                      </span>
                      <span className="text-xs font-mono font-bold text-cyan-400 bg-slate-950/80 px-2.5 py-1 rounded-lg border border-white/10">
                        memento app
                      </span>
                    </div>

                    {/* Main Headline */}
                    <div className="space-y-1 relative z-10">
                      <div className="text-xs font-black tracking-widest text-slate-400 uppercase">Hiring Now Across India</div>
                      <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight uppercase drop-shadow-md">
                        {selectedRole.title}
                      </h2>
                    </div>

                    {/* Sub-badge: No Fixed Salary */}
                    <div className="px-4 py-2.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 font-black text-xs tracking-wider uppercase flex items-center justify-center gap-2 relative z-10 backdrop-blur-md">
                      <AlertCircle size={14} className="shrink-0 text-amber-400" />
                      <span>NO FIXED SALARY • 100% COMMISSION BASIS</span>
                    </div>

                    {/* 3 High Impact Feature Cards */}
                    <div className="grid grid-cols-1 gap-3 relative z-10">
                      <div className="p-3.5 rounded-xl bg-slate-950/90 border border-emerald-500/40 text-emerald-400 font-black text-sm flex items-center justify-between backdrop-blur-md">
                        <span>💰 10% FLAT COMMISSION PER DEAL</span>
                        <CheckCircle2 size={16} />
                      </div>
                      <div className="p-3.5 rounded-xl bg-slate-950/90 border border-amber-500/40 text-amber-300 font-black text-sm flex items-center justify-between backdrop-blur-md">
                        <span>⚡ INSTANT PAYOUT UPON MONETIZATION</span>
                        <Zap size={16} />
                      </div>
                      <div className="p-3.5 rounded-xl bg-slate-950/90 border border-cyan-500/40 text-cyan-300 font-black text-sm flex items-center justify-between backdrop-blur-md">
                        <span>📍 WORK FROM ANYWHERE IN INDIA</span>
                        <Globe size={16} />
                      </div>
                    </div>

                    {/* Benefits text */}
                    <div className="text-xs font-bold text-slate-200 text-center relative z-10 drop-shadow">
                      🎁 Benefits: Unlimited Earning Potential + Instant UPI / Bank Transfer!
                    </div>

                    {/* Bottom CTA Bar */}
                    <div className="p-3.5 rounded-xl bg-emerald-600 text-white font-black text-xs text-center uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl relative z-10">
                      <MessageSquare size={16} />
                      <span>WhatsApp Name & City to +91 9866161775 | www.mymementoapp.com</span>
                    </div>
                  </div>
                </div>

                {/* 2. LIVE AD TEXT COPY BLUEPRINT */}
                <div className="pt-4 border-t border-slate-800">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                    <label className="text-xs font-bold text-slate-300 block">Formated Ad Text Caption:</label>
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleCopyJobText}
                        className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-lg shadow-cyan-500/20 cursor-pointer"
                      >
                        <Copy size={13} />
                        <span>Copy Text</span>
                      </button>

                      <button
                        onClick={handleLaunchWhatsApp}
                        className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 cursor-pointer"
                      >
                        <MessageSquare size={13} />
                        <span>WhatsApp</span>
                      </button>
                    </div>
                  </div>

                  <textarea
                    rows={10}
                    readOnly
                    value={getFormattedJobCopy()}
                    className="w-full p-4 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-slate-200 focus:outline-none leading-relaxed shadow-inner"
                  />
                </div>

              </div>

            </div>
          </div>
        )}

        {/* TAB 2: SOCIAL CAMPAIGNS (META API) */}
        {activeTab === 'campaign' && (
          <>
            {/* Status Banner */}
            {result && (
              <div className="space-y-4">
                {/* If Meta Token is Missing */}
                {result.results?.hasToken === false && (
                  <div className="p-5 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-amber-300 text-sm flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-amber-200">Meta Access Token Missing on Vercel</p>
                      <p className="text-xs mt-1 text-amber-300/80">Please add META_PAGE_ACCESS_TOKEN into your Vercel Environment Variables.</p>
                    </div>
                  </div>
                )}

                {/* Check for Meta API Errors */}
                {(result.results?.facebook?.error || result.results?.instagram?.error) ? (
                  <div className="p-6 bg-red-950/40 border border-red-500/40 rounded-2xl space-y-4 shadow-2xl backdrop-blur-md">
                    <div className="flex items-center gap-3 text-red-400 font-bold">
                      <AlertCircle className="w-5 h-5" /> Meta API Execution Warning
                    </div>
                    <p className="text-xs text-red-300">
                      {result.results?.facebook?.error || result.results?.instagram?.error}
                    </p>
                  </div>
                ) : (
                  <div className="p-6 bg-emerald-950/40 border border-emerald-500/40 rounded-2xl flex items-center gap-3 text-emerald-400 font-bold shadow-2xl">
                    <CheckCircle className="w-5 h-5" /> Campaign Published Successfully to Meta!
                  </div>
                )}
              </div>
            )}

            {/* Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Left Panel: Presets (5 Cols) */}
              <div className="lg:col-span-5 space-y-6 bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 shadow-xl">
                <div>
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <Layers className="w-5 h-5 text-purple-400" /> Select Marketing Angle
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">Choose a preset blueprint tailored to your audience across India.</p>
                </div>

                <div className="space-y-3">
                  {PRESETS.map((preset) => {
                    const isSelected = selectedPreset.id === preset.id;
                    return (
                      <button
                        key={preset.id}
                        onClick={() => handleSelectPreset(preset)}
                        className={`w-full text-left p-4 rounded-xl transition-all border cursor-pointer ${
                          isSelected
                            ? 'bg-purple-600/15 border-purple-500/50 shadow-md shadow-purple-500/10'
                            : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/80'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-purple-400">{preset.badge}</span>
                          {isSelected && <Check className="w-4 h-4 text-purple-400" />}
                        </div>
                        <h3 className="text-sm font-bold text-white mt-1">{preset.title}</h3>
                        <p className="text-xs text-slate-400 mt-1 line-clamp-2">{preset.desc}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Right Panel: Content Customizer & Live Social Mockup (7 Cols) */}
              <div className="lg:col-span-7 bg-slate-900/70 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-blue-400" /> Content Editor & Live Social Mockup
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">Customize your text & image before broadcasting nationwide.</p>
                  </div>
                  <button
                    onClick={handleGenerateAIVariation}
                    className="px-3.5 py-1.5 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 text-xs font-semibold rounded-xl border border-purple-500/40 transition-all flex items-center gap-1.5 shadow-sm hover:scale-[1.02]"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-purple-400" /> Generate AI Variation
                  </button>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-300 flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-purple-400" /> Campaign Marketing Image URL
                  </label>
                  <input
                    type="text"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-purple-500 transition-colors shadow-inner"
                  />
                </div>

                {imageUrl && (
                  <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-slate-950 aspect-[16/9] shadow-lg group">
                    <img src={imageUrl} alt="Campaign Visual" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-300 block">Caption & Hashtag Blueprint:</label>
                  <textarea
                    rows={8}
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    className="w-full p-4 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-slate-200 focus:outline-none leading-relaxed shadow-inner"
                  />
                </div>

                <div className="pt-2 border-t border-slate-800 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <button
                      onClick={handlePublish}
                      disabled={loading}
                      className="sm:col-span-3 py-4 px-6 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-pink-600 hover:from-blue-500 hover:to-pink-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-xl shadow-blue-500/20 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 cursor-pointer"
                    >
                      {loading ? (
                        <>
                          <RefreshCw className="w-5 h-5 animate-spin" />
                          <span>BROADCASTING TO META...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-5 h-5" />
                          <span>PUBLISH CAMPAIGN NOW</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={handleTriggerAutoPilot}
                      disabled={loading}
                      className="py-4 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold flex items-center justify-center gap-2 transition-all hover:border-slate-600 disabled:opacity-50 cursor-pointer"
                    >
                      <Flame className="w-4 h-4 text-amber-400" />
                      <span>Test Auto-Pilot</span>
                    </button>
                  </div>
                </div>

              </div>

            </div>
          </>
        )}

      </div>
    </div>
  );
}
