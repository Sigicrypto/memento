'use me';
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
  HelpCircle
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
    caption: `💍 Stop waiting 4 weeks for wedding photos! With Memento, guests scan a QR code at their table, snap photos on their phones, and watch them appear live on the venue screen!\n\n✨ Custom wedding branding\n✨ Zero app downloads required\n✨ Instant guest photo sharing\n\nBook your live QR wall today at www.mymementoapp.com 🥂❤️\n\n#WeddingInspiration #LivePhotoWall #WeddingTech #Memento #EventPlanner #WeddingPlanning #InteractiveWeddings`,
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
];

import { generateRandomCampaign } from '@/lib/metaSocial';

export default function SocialCampaignStudio() {
  const [selectedPreset, setSelectedPreset] = useState(PRESETS[0]);
  const [caption, setCaption] = useState(PRESETS[0].caption);
  const [imageUrl, setImageUrl] = useState(PRESETS[0].imageUrl);
  const [target, setTarget] = useState<'both' | 'facebook' | 'instagram'>('both');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);

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

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 font-sans py-8 px-4 sm:px-6 lg:px-12 selection:bg-purple-500/30">
      {/* Container - Extended to max-w-7xl with spacious grid */}
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Bar */}
        <div className="bg-slate-900/80 border border-slate-800/80 backdrop-blur-xl rounded-2xl p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-2xl">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-gradient-to-tr from-pink-500 via-purple-600 to-blue-600 text-white shadow-xl shadow-purple-500/20">
                <Sparkles className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
                  Social Media Studio <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 font-medium">1-Click Auto-Post</span>
                </h1>
                <p className="text-slate-400 text-xs sm:text-sm mt-0.5">
                  Create and auto-publish targeted marketing campaigns for <span className="text-blue-400 font-semibold underline decoration-blue-400/40">www.mymementoapp.com</span> across Facebook & Instagram simultaneously.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 self-start md:self-center shrink-0">
            <div className="px-4 py-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-semibold rounded-xl flex items-center gap-2 shadow-inner">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
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
                <div className="flex items-center gap-3 text-red-400">
                  <AlertCircle className="w-7 h-7 shrink-0" />
                  <div>
                    <h2 className="text-lg font-bold text-white">Meta API Broadcast Error</h2>
                    <p className="text-xs text-red-300/80">Meta Graph API rejected the request. Details below:</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  {result.results?.facebook?.error && (
                    <div className="p-4 bg-slate-950/80 border border-red-500/30 rounded-xl space-y-2">
                      <div className="flex items-center gap-2 text-red-400 text-sm font-semibold">
                        <FacebookIcon className="w-4 h-4" /> Facebook Error
                      </div>
                      <p className="text-xs text-red-300 font-mono">{result.results.facebook.error.message}</p>
                      {result.results.facebook.error.code === 190 && (
                        <p className="text-[11px] text-amber-300 pt-1">👉 Token expired! Please re-connect on <a href="/admin/meta-setup" className="underline font-bold">Meta Setup Helper</a>.</p>
                      )}
                    </div>
                  )}

                  {result.results?.instagram?.error && (
                    <div className="p-4 bg-slate-950/80 border border-red-500/30 rounded-xl space-y-2">
                      <div className="flex items-center gap-2 text-pink-400 text-sm font-semibold">
                        <InstagramIcon className="w-4 h-4" /> Instagram Error
                      </div>
                      <p className="text-xs text-red-300 font-mono">{result.results.instagram.error.message}</p>
                      {result.results.instagram.error.code === 190 && (
                        <p className="text-[11px] text-amber-300 pt-1">👉 Token expired! Please re-connect on <a href="/admin/meta-setup" className="underline font-bold">Meta Setup Helper</a>.</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* Genuine Success Banner */
              (result.results?.facebook?.id || result.results?.instagram?.id) && (
                <div className="p-6 bg-emerald-950/40 border border-emerald-500/40 rounded-2xl space-y-4 shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-top-4 duration-300">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-emerald-400">
                      <CheckCircle2 className="w-7 h-7 shrink-0" />
                      <div>
                        <h2 className="text-lg font-bold text-white">Campaign Published Live All Over! 🎉</h2>
                        <p className="text-xs text-emerald-300/80">Your content has been broadcasted via Meta Business Graph API.</p>
                      </div>
                    </div>
                    <span className="text-xs px-3 py-1 bg-emerald-500/20 text-emerald-300 font-mono rounded-full border border-emerald-500/30">
                      200 OK Status
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    {result.results?.facebook?.id && (
                      <div className="p-4 bg-slate-950/80 border border-blue-500/30 rounded-xl space-y-2 hover:border-blue-500/60 transition-colors">
                        <div className="flex items-center justify-between text-blue-400 text-sm font-semibold">
                          <span className="flex items-center gap-2">
                            <FacebookIcon className="w-4 h-4 text-blue-400" /> Facebook Page Post
                          </span>
                          <ExternalLink className="w-4 h-4" />
                        </div>
                        <p className="text-xs text-emerald-400 font-mono">Post ID: {result.results.facebook.id}</p>
                        <a
                          href="https://facebook.com/1270689629459999"
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 font-medium pt-1 transition-colors"
                        >
                          View Post on Memento Facebook Page ➔
                        </a>
                      </div>
                    )}

                    {result.results?.instagram?.id && (
                      <div className="p-4 bg-slate-950/80 border border-pink-500/30 rounded-xl space-y-2 hover:border-pink-500/60 transition-colors">
                        <div className="flex items-center justify-between text-pink-400 text-sm font-semibold">
                          <span className="flex items-center gap-2">
                            <InstagramIcon className="w-4 h-4 text-pink-400" /> Instagram Business Post
                          </span>
                          <ExternalLink className="w-4 h-4" />
                        </div>
                        <p className="text-xs text-emerald-400 font-mono">Media ID: {result.results.instagram.id}</p>
                        <a
                          href="https://instagram.com/my_memento_app"
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-pink-400 hover:text-pink-300 font-medium pt-1 transition-colors"
                        >
                          View Post on @my_memento_app Instagram ➔
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )
            )}
          </div>
        )}

        {/* Local Error Banner */}
        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-300 text-sm flex items-start gap-3">
            <span className="font-semibold text-red-200">Publishing Failure:</span> {error}
          </div>
        )}

        {/* Main Grid Section: 2 Balanced Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Left Panel: Presets & Channel Selection (5 Columns) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Step 1 Card */}
            <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2 tracking-wide uppercase">
                  <Layers className="w-4 h-4 text-purple-400" /> Step 1: Select Target Preset
                </h3>
                <span className="text-[11px] text-slate-400 font-mono">4 Presets</span>
              </div>

              <div className="space-y-3">
                {PRESETS.map((p) => {
                  const isSelected = selectedPreset.id === p.id;
                  return (
                    <button
                      key={p.id}
                      onClick={() => handleSelectPreset(p)}
                      className={`w-full p-4 rounded-xl text-left border transition-all duration-200 group relative ${
                        isSelected
                          ? 'bg-gradient-to-r from-slate-900 to-purple-950/40 border-purple-500 shadow-lg shadow-purple-500/10 ring-1 ring-purple-500/30'
                          : 'bg-slate-950/80 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/60'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-slate-800 text-purple-300 border border-slate-700">
                          {p.badge}
                        </span>
                        {isSelected && (
                          <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
                        )}
                      </div>
                      <p className={`text-sm font-bold transition-colors ${isSelected ? 'text-white' : 'text-slate-200 group-hover:text-white'}`}>
                        {p.title}
                      </p>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                        {p.desc}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 2 Card: Channel Target */}
            <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
              <div className="border-b border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2 tracking-wide uppercase">
                  <Share2 className="w-4 h-4 text-blue-400" /> Step 2: Target Channels
                </h3>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => setTarget('both')}
                  className={`py-3 px-3 rounded-xl text-xs font-bold border transition-all flex flex-col items-center gap-1.5 ${
                    target === 'both'
                      ? 'bg-gradient-to-tr from-blue-600 to-pink-600 text-white border-blue-400 shadow-lg shadow-blue-500/20'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <span className="flex items-center gap-1">
                    <FacebookIcon className="w-3.5 h-3.5" /> + <InstagramIcon className="w-3.5 h-3.5" />
                  </span>
                  <span>Both (FB + IG)</span>
                </button>

                <button
                  onClick={() => setTarget('facebook')}
                  className={`py-3 px-3 rounded-xl text-xs font-bold border transition-all flex flex-col items-center gap-1.5 ${
                    target === 'facebook'
                      ? 'bg-blue-600 text-white border-blue-400 shadow-lg shadow-blue-500/20'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <FacebookIcon className="w-4 h-4" />
                  <span>FB Page Only</span>
                </button>

                <button
                  onClick={() => setTarget('instagram')}
                  className={`py-3 px-3 rounded-xl text-xs font-bold border transition-all flex flex-col items-center gap-1.5 ${
                    target === 'instagram'
                      ? 'bg-pink-600 text-white border-pink-400 shadow-lg shadow-pink-500/20'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <InstagramIcon className="w-4 h-4" />
                  <span>Instagram Only</span>
                </button>
              </div>
            </div>

          </div>

          {/* Right Panel: Content Customizer & Live Social Preview (7 Columns) */}
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

            {/* Campaign Visual URL */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-purple-400" /> Campaign Marketing Image URL
                </label>
                <span className="text-[11px] text-slate-500">Supports JPG / PNG (Min 1080x1080)</span>
              </div>
              <input
                type="text"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-purple-500 transition-colors shadow-inner"
              />
            </div>

            {/* Live Visual Card */}
            {imageUrl && (
              <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-slate-950 aspect-[16/9] shadow-lg group">
                <img src={imageUrl} alt="Campaign Visual" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                <div className="absolute top-3 right-3 px-3 py-1 bg-slate-950/80 backdrop-blur-md rounded-full border border-slate-800 text-[11px] text-slate-300 font-semibold flex items-center gap-1.5 shadow-lg">
                  <Globe className="w-3.5 h-3.5 text-blue-400" /> www.mymementoapp.com
                </div>
              </div>
            )}

            {/* Caption & Hashtags Editor */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 block">Caption & Hashtag Blueprint:</label>
              <textarea
                rows={8}
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                className="w-full p-4 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm font-sans text-slate-200 focus:outline-none focus:border-purple-500 leading-relaxed shadow-inner"
              />
            </div>

            {/* Big Action Buttons */}
            <div className="pt-4 border-t border-slate-800 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <button
                  onClick={handlePublish}
                  disabled={loading}
                  className="sm:col-span-3 py-4 px-6 rounded-xl bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-500 hover:to-pink-500 text-white font-extrabold text-sm sm:text-base flex items-center justify-center gap-3 shadow-xl shadow-purple-600/25 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      <span>Broadcasting via Meta Graph API...</span>
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
                  className="py-4 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold flex items-center justify-center gap-2 transition-all hover:border-slate-600 disabled:opacity-50"
                  title="Test the hands-free cron scheduler right now"
                >
                  <Flame className="w-4 h-4 text-amber-400" />
                  <span>Test Auto-Pilot</span>
                </button>
              </div>
              
              <p className="text-center text-[11px] text-slate-500 flex items-center justify-center gap-2">
                <span>Posts directly to Facebook Page <strong className="text-slate-400">Memento - Live QR Photo Wall</strong> & Instagram <strong className="text-slate-400">@my_memento_app</strong></span>
                <span className="text-slate-600">•</span>
                <span className="text-purple-400 font-mono">Hands-Free Cron: Daily at 10:00 AM</span>
              </p>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
