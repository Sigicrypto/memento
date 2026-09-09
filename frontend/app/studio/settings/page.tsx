"use client";

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Save, Upload, Palette, Check, Sparkles } from 'lucide-react';
import StudioBrandingPreview from '@/components/studio/StudioBrandingPreview';

export default function StudioSettingsPage() {
  const [studioName, setStudioName] = useState('DreamCraft Visuals');
  const [logoUrl, setLogoUrl] = useState('');
  const [primaryColor, setPrimaryColor] = useState('#C8963E');
  const [secondaryColor, setSecondaryColor] = useState('#0891A8');
  const [defaultCurrency, setDefaultCurrency] = useState<'INR' | 'USD'>('INR');
  const [autoWhiteLabel, setAutoWhiteLabel] = useState(true);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Top Breadcrumb */}
      <div>
        <Link
          href="/studio"
          className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors mb-4"
        >
          <ArrowLeft size={16} />
          Back to Studio Dashboard
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-text-primary tracking-tight font-display">
              Studio White-Label Settings
            </h1>
            <p className="text-text-secondary text-sm mt-1">
              Customize your studio brand assets applied to all your client events.
            </p>
          </div>
          <button
            onClick={handleSave}
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-accent hover:bg-[#B8882F] text-white font-bold text-xs shadow-md transition-all cursor-pointer"
          >
            {saved ? <Check size={16} /> : <Save size={16} />}
            <span>{saved ? 'Changes Saved!' : 'Save Settings'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Form (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="rounded-2xl border border-border bg-surface p-6 shadow-card space-y-5">
            <h2 className="text-base font-bold text-text-primary font-display">Brand Identity</h2>

            {/* Studio Name */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-2">
                Studio / Agency Name
              </label>
              <input
                type="text"
                value={studioName}
                onChange={(e) => setStudioName(e.target.value)}
                placeholder="e.g. Royal Moments Studio"
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-bg text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
              />
            </div>

            {/* Logo URL */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-2">
                Studio Logo Image URL
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  placeholder="https://yourstudio.com/logo.png"
                  className="flex-1 px-4 py-2.5 rounded-xl border border-border bg-bg text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
                />
              </div>
              <p className="text-[11px] text-text-muted mt-1.5">
                Recommended: Transparent PNG, minimum 400x120px.
              </p>
            </div>

            {/* Brand Colors */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-2">
                  Primary Accent
                </label>
                <div className="flex items-center gap-2 p-1.5 rounded-xl border border-border bg-bg">
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-8 h-8 rounded-lg cursor-pointer border-0 bg-transparent"
                  />
                  <span className="text-xs font-mono font-medium text-text-primary uppercase">
                    {primaryColor}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-2">
                  Secondary Accent
                </label>
                <div className="flex items-center gap-2 p-1.5 rounded-xl border border-border bg-bg">
                  <input
                    type="color"
                    value={secondaryColor}
                    onChange={(e) => setSecondaryColor(e.target.value)}
                    className="w-8 h-8 rounded-lg cursor-pointer border-0 bg-transparent"
                  />
                  <span className="text-xs font-mono font-medium text-text-primary uppercase">
                    {secondaryColor}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Preferences */}
          <div className="rounded-2xl border border-border bg-surface p-6 shadow-card space-y-5">
            <h2 className="text-base font-bold text-text-primary font-display">Defaults & Preferences</h2>

            {/* Default Currency */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-2">
                Default Currency
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setDefaultCurrency('INR')}
                  className={`px-4 py-2 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                    defaultCurrency === 'INR'
                      ? 'border-accent bg-accent/10 text-accent shadow-sm'
                      : 'border-border text-text-secondary hover:text-text-primary'
                  }`}
                >
                  ₹ INR (Indian Rupee)
                </button>
                <button
                  type="button"
                  onClick={() => setDefaultCurrency('USD')}
                  className={`px-4 py-2 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                    defaultCurrency === 'USD'
                      ? 'border-accent bg-accent/10 text-accent shadow-sm'
                      : 'border-border text-text-secondary hover:text-text-primary'
                  }`}
                >
                  $ USD (US Dollar)
                </button>
              </div>
            </div>

            {/* Auto White-Label Toggle */}
            <div className="flex items-center justify-between pt-2">
              <div>
                <p className="text-xs font-bold text-text-primary">Auto-White-Label New Events</p>
                <p className="text-[11px] text-text-secondary">
                  Automatically apply studio logo and custom colors to every new event
                </p>
              </div>
              <button
                type="button"
                onClick={() => setAutoWhiteLabel(!autoWhiteLabel)}
                className={`relative w-12 h-6 rounded-full transition-colors cursor-pointer ${
                  autoWhiteLabel ? 'bg-accent' : 'bg-border'
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                    autoWhiteLabel ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Right Simulator (5 cols) */}
        <div className="lg:col-span-5">
          <div className="rounded-2xl border border-border bg-surface p-6 shadow-card sticky top-24">
            <StudioBrandingPreview
              studioName={studioName}
              logoUrl={logoUrl}
              primaryColor={primaryColor}
              secondaryColor={secondaryColor}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
