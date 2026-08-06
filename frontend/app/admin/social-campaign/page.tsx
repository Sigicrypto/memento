'use me';
'use client';

import React, { useState } from 'react';
import { Send, CheckCircle, RefreshCw, Sparkles, Layers, Image as ImageIcon, ExternalLink, Globe } from 'lucide-react';

const PRESETS = [
  {
    id: 'wedding',
    title: '💍 Wedding Memory Wall',
    desc: 'Target wedding couples & planners with instant guest photo sharing.',
    imageUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1200&auto=format&fit=crop',
    caption: `💍 Stop waiting 4 weeks for wedding photos! With Memento, guests scan a QR code at their table, snap photos on their phones, and watch them appear live on the big screen!\n\n✨ Custom branding\n✨ Zero app downloads required\n✨ Instant guest photo sharing\n\nBook your live QR wall today at www.mymementoapp.com 🥂❤️\n\n#WeddingInspiration #LivePhotoWall #WeddingTech #Memento #EventPlanner #WeddingPlanning #InteractiveWeddings`,
  },
  {
    id: 'corporate',
    title: '🚀 Corporate Gala & Brand Activation',
    desc: 'Target HR teams, event directors, and luxury brand managers.',
    imageUrl: 'https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=1200&auto=format&fit=crop',
    caption: `🚀 Transform corporate event engagement in 1 scan! Memento turns every attendee's smartphone into a live camera feed for your main stage screen.\n\n📈 3x higher guest participation\n🎨 Custom corporate branding & logo overlay\n🛡️ Real-time photo moderation\n\nElevate your brand experience at www.mymementoapp.com 🌟\n\n#CorporateEvents #EventMarketing #BrandActivation #EventPlanner #Memento #EventTech #LiveEngagement`,
  },
  {
    id: 'birthday',
    title: '🎉 Birthday & Private Celebrations',
    desc: 'Target birthday hosts, anniversaries, and VIP parties.',
    imageUrl: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=1200&auto=format&fit=crop',
    caption: `🎉 Make your party unforgettable! Capture every angle of your celebration with Memento's live QR photo wall.\n\n📱 Guests just scan & upload\n✨ Live wall slideshow with animations\n💖 Download the full photo album after the party!\n\nSetup your wall in 2 minutes at www.mymementoapp.com 🥳\n\n#PartyIdeas #BirthdayCelebration #PhotoWall #MementoApp #LivePartyFeed #EventTech`,
  },
  {
    id: 'product',
    title: '⚡ Product Spotlight (Zero App Download)',
    desc: 'Focus on frictionless guest experience and tech simplicity.',
    imageUrl: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?q=80&w=1200&auto=format&fit=crop',
    caption: `⚡ Why event hosts love Memento: No app downloads, no complicated setup, and instant live photo sharing for any venue screen or TV.\n\nCreate your memory wall for your next event at www.mymementoapp.com!\n\n#EventTech #DigitalPhotoWall #Memento #LiveEvents #EventOrganizers`,
  },
];

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
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-12 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="border-b border-slate-800 pb-6 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-tr from-pink-500 via-purple-600 to-blue-600 text-white shadow-lg">
                <Sparkles className="w-6 h-6 inline-block" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-white">1-Click Social Media Studio</h1>
            </div>
            <p className="text-slate-400 text-sm mt-1">
              Create and auto-publish social media campaigns for <span className="text-blue-400 font-semibold">www.mymementoapp.com</span> across Facebook & Instagram instantly!
            </p>
          </div>
          <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-mono rounded-full flex items-center gap-1.5">
            <CheckCircle className="w-3.5 h-3.5" /> Meta API Connected
          </span>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-300 text-sm flex items-start gap-3">
            <span className="font-semibold text-red-200">Publishing Failed:</span> {error}
          </div>
        )}

        {/* Success Result */}
        {result && (
          <div className="p-6 bg-slate-900 border border-emerald-500/40 rounded-2xl space-y-4 shadow-xl">
            <div className="flex items-center gap-3 text-emerald-400">
              <CheckCircle className="w-6 h-6 shrink-0" />
              <h2 className="text-lg font-bold text-white">Campaign Published Successfully All Over! 🎉</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {result.results?.facebook && (
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                  <div className="flex items-center justify-between text-blue-400 text-sm font-semibold">
                    <span>Facebook Page Post</span>
                    <ExternalLink className="w-4 h-4" />
                  </div>
                  <p className="text-xs text-slate-400 font-mono">Post ID: {result.results.facebook.id || result.results.facebook.post_id || 'Published'}</p>
                  <a
                    href="https://facebook.com"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-block text-xs text-blue-400 hover:underline pt-1"
                  >
                    View on Facebook Page ➔
                  </a>
                </div>
              )}

              {result.results?.instagram && (
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                  <div className="flex items-center justify-between text-pink-400 text-sm font-semibold">
                    <span>Instagram Business Post</span>
                    <ExternalLink className="w-4 h-4" />
                  </div>
                  <p className="text-xs text-slate-400 font-mono">Media ID: {result.results.instagram.id || 'Published'}</p>
                  <a
                    href="https://instagram.com"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-block text-xs text-pink-400 hover:underline pt-1"
                  >
                    View on Instagram Profile ➔
                  </a>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* Left Column: Presets */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-400" /> 1. Select Campaign Preset
            </h3>
            <div className="space-y-2.5">
              {PRESETS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => handleSelectPreset(p)}
                  className={`w-full p-4 rounded-xl text-left border transition-all ${
                    selectedPreset.id === p.id
                      ? 'bg-slate-900 border-blue-500 shadow-lg shadow-blue-500/10'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/40'
                  }`}
                >
                  <p className="text-sm font-semibold text-white">{p.title}</p>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">{p.desc}</p>
                </button>
              ))}
            </div>

            {/* Target Selector */}
            <div className="pt-4 border-t border-slate-800 space-y-2">
              <label className="text-xs font-semibold text-slate-300 block">Publish Channels:</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setTarget('both')}
                  className={`py-2 px-3 rounded-lg text-xs font-medium border transition-colors ${
                    target === 'both' ? 'bg-blue-600 text-white border-blue-500' : 'bg-slate-950 text-slate-400 border-slate-800'
                  }`}
                >
                  Both
                </button>
                <button
                  onClick={() => setTarget('facebook')}
                  className={`py-2 px-3 rounded-lg text-xs font-medium border transition-colors ${
                    target === 'facebook' ? 'bg-blue-600 text-white border-blue-500' : 'bg-slate-950 text-slate-400 border-slate-800'
                  }`}
                >
                  FB Only
                </button>
                <button
                  onClick={() => setTarget('instagram')}
                  className={`py-2 px-3 rounded-lg text-xs font-medium border transition-colors ${
                    target === 'instagram' ? 'bg-pink-600 text-white border-pink-500' : 'bg-slate-950 text-slate-400 border-slate-800'
                  }`}
                >
                  IG Only
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Customization & Preview */}
          <div className="md:col-span-2 space-y-6 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-400" /> 2. Review & Customise Content
            </h3>

            {/* Image Preview */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-300 flex items-center gap-2">
                <ImageIcon className="w-3.5 h-3.5 text-blue-400" /> Campaign Visual URL:
              </label>
              <input
                type="text"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-blue-500"
              />
              {imageUrl && (
                <div className="relative h-44 w-full rounded-xl overflow-hidden border border-slate-800 mt-2">
                  <img src={imageUrl} alt="Campaign Visual" className="object-cover w-full h-full" />
                </div>
              )}
            </div>

            {/* Caption Textarea */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-300 block">Caption & Hashtags:</label>
              <textarea
                rows={7}
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                className="w-full p-3.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-sans text-slate-200 focus:outline-none focus:border-blue-500 leading-relaxed"
              />
            </div>

            {/* Publish Button */}
            <button
              onClick={handlePublish}
              disabled={loading}
              className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-500 hover:to-pink-500 text-white font-bold text-sm flex items-center justify-center gap-2.5 shadow-xl shadow-purple-500/20 transition-all hover:scale-[1.01] disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span>Publishing to Facebook & Instagram...</span>
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  <span>PUBLISH CAMPAIGN ALL OVER NOW</span>
                </>
              )}
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
