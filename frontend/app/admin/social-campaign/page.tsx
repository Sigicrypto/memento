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
  HelpCircle,
  Briefcase,
  Users,
  Copy,
  MapPin,
  Calendar,
  Phone,
  MessageSquare
} from 'lucide-react';

const FacebookIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

const InstagramIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
  </svg>
);

const PRESETS = [
  {
    id: 'wedding',
    badge: '💍 Luxury Weddings',
    title: 'Wedding Memory Wall',
    desc: 'Target engaged couples & luxury wedding planners with instant live guest photo sharing.',
    imageUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1200&auto=format&fit=crop',
    caption: `💍 Stop waiting 4 weeks for wedding photos! With Memento, guests scan a QR code at their table, snap photos on their phones, and watch them appear live on the big screen! \n\n✨ Custom branding\n✨ Zero app downloads required\n✨ Instant guest photo sharing\n\nBook your live QR wall today at www.mymementoapp.com 🥂❤️\n\n#WeddingInspiration #LivePhotoWall #WeddingTech #Memento #EventPlanner #WeddingPlanning #InteractiveWeddings`,
  },
  {
    id: 'corporate',
    badge: '🚀 B2B & Galas',
    title: 'Corporate Gala & Brand Activation',
    desc: 'Target HR teams, event directors, and enterprise brand managers.',
    imageUrl: 'https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=1200&auto=format&fit=crop',
    caption: `🚀 Transform corporate event engagement in 1 scan! Memento turns every attendee's smartphone into a live camera feed for your main stage screen.\n\n📈 3x higher guest participation\n🎨 Custom corporate branding & logo overlay\n🛡️ Real-time photo moderation\n\nElevate your brand experience at www.mymementoapp.com 🌟\n\n#CorporateEvents #EventMarketing #BrandActivation #EventPlanner #Memento #EventTech #LiveEngagement`,
  },
  {
    id: 'birthday',
    badge: '🎉 Parties & VIP',
    title: 'Birthday & Private Celebrations',
    desc: 'Target birthday hosts, milestone anniversaries, and VIP parties.',
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
    badge: '💼 Commission Hiring',
    title: 'Commission Sales & Partner Posting',
    desc: 'Target freelancers, promoters, and event planners to earn 20-30% commission per booking.',
    imageUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=1200&auto=format&fit=crop',
    caption: `💼 JOIN AS AN EVENT SALES PARTNER (100% Commission Basis!)\n\nEarn ₹2,000 - ₹5,000 per booking by introducing Memento's Live QR Photo Wall to wedding planners, venues & event hosts!\n\n💰 High 20-30% Commission per Deal\n🕒 Flexible Part-Time / Freelance Hours\n⚡ Instant Payout upon Booking\n\nApply via WhatsApp: +91 9866161775 | Learn more at www.mymementoapp.com 🚀\n\n#CommissionJobs #EventJobs #PartTimeEarnings #EventPromoter #MementoPartner`,
  },
];

const FB_GROUPS = [
  { id: '1', name: 'Event Job Seekers (Pan-India)', url: 'https://www.facebook.com/groups/248386401938561/', region: 'Pan-India', members: '120k' },
  { id: '2', name: 'Events Manpower & Hostesses India', url: 'https://www.facebook.com/groups/1381368145455919/', region: 'Pan-India', members: '85k' },
  { id: '3', name: 'Delhi Events Manpower & Freelancers', url: 'https://www.facebook.com/groups/1004386706399990/', region: 'Delhi NCR', members: '45k' },
  { id: '4', name: 'Events Part Time Jobs for Students', url: 'https://www.facebook.com/groups/1429990143973634/', region: 'Delhi NCR', members: '60k' },
  { id: '5', name: 'Mumbai Event Jobs & Promoters', url: 'https://www.facebook.com/groups/1329243007137536/', region: 'Mumbai', members: '50k' },
  { id: '6', name: 'Events & Promotional Jobs Mumbai', url: 'https://www.facebook.com/groups/1574304679469502/', region: 'Mumbai', members: '35k' },
  { id: '7', name: 'Part Time Event Jobs Bangalore', url: 'https://www.facebook.com/groups/1659728477610636/', region: 'Bangalore', members: '40k' },
  { id: '8', name: 'Pune Event Manpower & Crew', url: 'https://www.facebook.com/groups/1651813478440049/', region: 'Pune', members: '30k' },
];

const JOB_ROLES = [
  { id: 'partner', title: 'Event Sales Partner / Affiliate', defaultPay: '20% - 30% Commission / Deal', desc: 'Promote live QR photo walls to wedding planners, venues & event hosts' },
  { id: 'promoter', title: 'Commission Event Promoter', defaultPay: 'Earn ₹2,000 - ₹5,000 / deal', desc: 'Pitch Memento to client leads and earn instant commission per closed event' },
  { id: 'ambassador', title: 'Venue & College Brand Ambassador', defaultPay: '30% High Commission Basis', desc: 'Activate venue partnerships, clubs & private party bookings' },
  { id: 'freelancer', title: 'Event Agency Referral Partner', defaultPay: '₹1,500 - ₹3,000 / Event Sold', desc: 'Refer wedding & corporate clients to Memento and get paid per booking' },
];

import { generateRandomCampaign } from '@/lib/metaSocial';

export default function SocialCampaignStudio() {
  const [activeTab, setActiveTab] = useState<'campaign' | 'job_launcher'>('campaign');

  // Campaign State
  const [selectedPreset, setSelectedPreset] = useState(PRESETS[0]);
  const [caption, setCaption] = useState(PRESETS[0].caption);
  const [imageUrl, setImageUrl] = useState(PRESETS[0].imageUrl);
  const [target, setTarget] = useState<'both' | 'facebook' | 'instagram'>('both');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);

  // Job Launcher State
  const [selectedRole, setSelectedRole] = useState(JOB_ROLES[0]);
  const [jobCity, setJobCity] = useState('Delhi NCR');
  const [jobPay, setJobPay] = useState('20% - 30% Commission (Earn ₹2,000 - ₹5,000 / deal)');
  const [jobDate, setJobDate] = useState('Flexible / Freelance Hours');
  const [jobContact, setJobContact] = useState('+91 9866161775');
  const [jobExtraNote, setJobExtraNote] = useState('Zero Fixed Salary. 100% High Commission & Instant Payout per Booking!');
  const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>(['1', '2', '3', '4']);
  const [copiedSuccess, setCopiedSuccess] = useState(false);

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

  // Job Launcher Helpers
  const getFormattedJobCopy = () => {
    return `💼 HIRING: ${selectedRole.title.toUpperCase()} (100% COMMISSION BASIS)

📍 Target Location: ${jobCity}
💰 Earnings Potential: ${jobPay} (No Fixed Salary)
📅 Work Flexibility: ${jobDate}
📞 WhatsApp Direct: ${jobContact}

📋 Role & Opportunity:
• ${selectedRole.desc}
• Introduce Memento's Live QR Photo Wall to event planners, wedding hosts & venues.
• Earn high recurring commission on every successful event booking!

✨ Ideal Candidate:
✔️ Passionate about events, sales, networking & social media
✔️ Good connections with event hosts, wedding planners, or venues
${jobExtraNote ? `✔️ ${jobExtraNote}\n` : ''}
🎁 Benefits: Unlimited earning potential + Instant UPI/Bank transfer upon deal closure + Flexible hours!

👇 HOW TO APPLY:
Send your Name, City & Experience via WhatsApp to ${jobContact} or DM us!
Learn more about Memento: www.mymementoapp.com

#CommissionJobs #EventPromoter #FreelanceJobs #${jobCity.replace(/\s+/g, '')} #EventSales #AffiliatePartner #JobHiringIndia`;
  };

  const toggleGroupSelection = (id: string) => {
    setSelectedGroupIds(prev => 
      prev.includes(id) ? prev.filter(g => g !== id) : [...prev, id]
    );
  };

  const handleCopyAndLaunchFBGroups = () => {
    const postText = getFormattedJobCopy();
    navigator.clipboard.writeText(postText);
    setCopiedSuccess(true);
    setTimeout(() => setCopiedSuccess(false), 4000);

    // Open selected Facebook groups in new tabs
    const targetGroups = FB_GROUPS.filter(g => selectedGroupIds.includes(g.id));
    targetGroups.forEach(group => {
      window.open(group.url, '_blank');
    });
  };

  const handleLaunchWhatsApp = () => {
    const postText = getFormattedJobCopy();
    const encodedText = encodeURIComponent(postText);
    window.open(`https://api.whatsapp.com/send?text=${encodedText}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 font-sans py-8 px-4 sm:px-6 lg:px-12 selection:bg-purple-500/30">
      {/* Container */}
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Bar */}
        <div className="bg-slate-900/80 border border-slate-800/80 backdrop-blur-xl rounded-2xl p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-2xl">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-pink-500 text-white shadow-lg shadow-purple-500/20">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-black tracking-tight text-white">Social & Hiring Studio</h1>
                  <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-300 text-[11px] font-semibold">
                    AUTO-POST & GROUP LAUNCHER
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Broadcasting campaigns to <span className="text-purple-400 font-medium">Facebook/Instagram</span> & launching 1-click job postings across FB hiring groups.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
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

        {/* Tab Selector */}
        <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
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

          <button
            onClick={() => setActiveTab('job_launcher')}
            className={`px-5 py-3 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'job_launcher'
                ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-500/20 border border-cyan-400/30'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>💼 1-Click Job Hiring Launcher & Groups</span>
          </button>
        </div>

        {/* TAB 1: SOCIAL CAMPAIGNS */}
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
                  <p className="text-xs text-slate-400 mt-1">Choose a preset blueprint tailored to your audience.</p>
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
                    <p className="text-xs text-slate-400 mt-0.5">Customize your text & image before broadcasting.</p>
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
                    className="w-full p-4 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-slate-200 focus:outline-none focus:border-blue-500 transition-colors leading-relaxed shadow-inner"
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

        {/* TAB 2: 1-CLICK JOB LAUNCHER */}
        {activeTab === 'job_launcher' && (
          <div className="space-y-8">
            
            {/* Notification Toast */}
            {copiedSuccess && (
              <div className="p-4 rounded-2xl bg-cyan-500/15 border border-cyan-400/40 text-cyan-300 flex items-center justify-between shadow-2xl animate-fade-in">
                <div className="flex items-center gap-3">
                  <CheckCircle2 size={20} className="text-cyan-400 shrink-0" />
                  <div>
                    <span className="text-sm font-bold block">1-Click Group Launch Triggered!</span>
                    <span className="text-xs text-slate-300">Job post copy has been copied to your clipboard. {selectedGroupIds.length} Facebook Group tabs opened! Just press Ctrl+V to post.</span>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Left Column: Job Builder Form (5 Cols) */}
              <div className="lg:col-span-5 bg-slate-900/70 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-cyan-400" /> Job Offer Details
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">Configure role, daily pay, city, and date to generate copy.</p>
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
                              ? 'bg-cyan-500/15 border-cyan-400/50 text-white'
                              : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-white">{role.title}</span>
                            <span className="text-[10px] font-mono text-cyan-400">{role.defaultPay}</span>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5">{role.desc}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* City & Pay Inputs */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-cyan-400" /> Target City
                    </label>
                    <select
                      value={jobCity}
                      onChange={(e) => setJobCity(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-400 font-medium"
                    >
                      <option value="Delhi NCR">Delhi NCR</option>
                      <option value="Mumbai">Mumbai</option>
                      <option value="Bangalore">Bangalore</option>
                      <option value="Pune">Pune</option>
                      <option value="Hyderabad">Hyderabad</option>
                      <option value="Pan-India">Pan-India</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                      💰 Commission Structure
                    </label>
                    <input
                      type="text"
                      value={jobPay}
                      onChange={(e) => setJobPay(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                </div>

                {/* Shift Date & Contact WhatsApp */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-cyan-400" /> Shift / Date
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

                {/* Extra Perks / Notes */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 block">Extra Perks / Notes:</label>
                  <input
                    type="text"
                    value={jobExtraNote}
                    onChange={(e) => setJobExtraNote(e.target.value)}
                    placeholder="e.g. Food provided on-site. Instant pay."
                    className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>

              </div>

              {/* Right Column: Groups Launcher & Post Preview (7 Cols) */}
              <div className="lg:col-span-7 bg-slate-900/70 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl">
                
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Users className="w-5 h-5 text-cyan-400" /> Select Facebook Event Groups ({selectedGroupIds.length} Selected)
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">Check the groups you want to launch. Clicking the button below will copy your job offer and open these groups in tabs!</p>
                </div>

                {/* Groups Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-56 overflow-y-auto p-1 pr-2">
                  {FB_GROUPS.map(group => {
                    const isChecked = selectedGroupIds.includes(group.id);
                    return (
                      <div
                        key={group.id}
                        onClick={() => toggleGroupSelection(group.id)}
                        className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                          isChecked
                            ? 'bg-cyan-500/15 border-cyan-400/40 text-white'
                            : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2 overflow-hidden">
                          <div className={`w-4 h-4 rounded flex items-center justify-center shrink-0 border ${
                            isChecked ? 'bg-cyan-500 border-cyan-400 text-slate-950' : 'border-slate-700'
                          }`}>
                            {isChecked && <Check size={12} className="stroke-[3]" />}
                          </div>
                          <div className="truncate">
                            <p className="text-xs font-bold text-white truncate">{group.name}</p>
                            <p className="text-[10px] text-slate-400">{group.region} • {group.members} members</p>
                          </div>
                        </div>
                        <a
                          href={group.url}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                        >
                          <ExternalLink size={12} />
                        </a>
                      </div>
                    );
                  })}
                </div>

                {/* Post Preview Box */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-300 block">Generated Job Offer Text:</label>
                    <span className="text-[10px] text-cyan-400 font-mono">Ready to Copy & Paste</span>
                  </div>
                  <textarea
                    rows={8}
                    readOnly
                    value={getFormattedJobCopy()}
                    className="w-full p-4 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-slate-200 focus:outline-none leading-relaxed shadow-inner"
                  />
                </div>

                {/* Main 1-Click Launch Action Buttons */}
                <div className="pt-2 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button
                    onClick={handleCopyAndLaunchFBGroups}
                    disabled={selectedGroupIds.length === 0}
                    className="py-4 px-6 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-extrabold text-xs tracking-wider uppercase flex items-center justify-center gap-2 shadow-xl shadow-cyan-500/20 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 cursor-pointer"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>Copy Text & Launch {selectedGroupIds.length} FB Groups</span>
                  </button>

                  <button
                    onClick={handleLaunchWhatsApp}
                    className="py-4 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs tracking-wider uppercase flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/20 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Broadcast via WhatsApp</span>
                  </button>
                </div>

              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
