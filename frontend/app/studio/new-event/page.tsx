"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Users,
  Calendar,
  MapPin,
  Mail,
  Phone,
  User,
  Type,
  Camera,
  Palette,
  CreditCard,
  MessageSquare,
  Sparkles,
  ShieldCheck,
  KeyRound,
} from 'lucide-react';
import { GUEST_TIERS, type GuestTier } from '@/lib/plans';
import { formatPrice, calculateTierPrice } from '@/lib/studio';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';

type WizardStep = 'client' | 'event' | 'tier' | 'branding' | 'checkout';

const STEPS: { key: WizardStep; label: string; icon: any }[] = [
  { key: 'client', label: 'Client Info', icon: User },
  { key: 'event', label: 'Event Details', icon: Calendar },
  { key: 'tier', label: 'Select Tier', icon: Users },
  { key: 'branding', label: 'Branding', icon: Palette },
  { key: 'checkout', label: 'Checkout', icon: CreditCard },
];

export default function NewEventWizard() {
  const router = useRouter();
  const { user } = useAuth();
  const [step, setStep] = useState<WizardStep>('client');
  const [currency, setCurrency] = useState<'INR' | 'USD'>('INR');
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [eventName, setEventName] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [venue, setVenue] = useState('');
  const [customSlug, setCustomSlug] = useState('');
  const [selectedTier, setSelectedTier] = useState<GuestTier>(GUEST_TIERS[1]); // default Medium
  const [applyWhiteLabel, setApplyWhiteLabel] = useState(true);
  const [moderationEnabled, setModerationEnabled] = useState(true); // Default ON (Safety-First)
  const [coHostPin] = useState(() => Math.floor(1000 + Math.random() * 9000).toString());

  // Auto-detect currency
  useEffect(() => {
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (tz && !tz.includes('Asia/Calcutta') && !tz.includes('Asia/Kolkata')) {
        setCurrency('USD');
      }
    } catch {
      // default INR
    }
  }, []);

  // Auto-generate slug from event name
  useEffect(() => {
    if (eventName && !customSlug) {
      const slug = eventName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
        .slice(0, 40);
      setCustomSlug(slug);
    }
  }, [eventName]);

  const currentStepIndex = STEPS.findIndex((s) => s.key === step);

  const goNext = () => {
    const nextIdx = currentStepIndex + 1;
    if (nextIdx < STEPS.length) setStep(STEPS[nextIdx].key);
  };

  const goPrev = () => {
    const prevIdx = currentStepIndex - 1;
    if (prevIdx >= 0) setStep(STEPS[prevIdx].key);
  };

  const tierPrice = calculateTierPrice(selectedTier, currency);

  const handleCheckout = async () => {
    setSubmitting(true);
    const finalSlug = customSlug.trim() || (eventName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '-' + Math.random().toString(36).substring(2, 6));

    try {
      if (user) {
        await supabase.from('events').insert({
          name: eventName,
          event_name: eventName,
          slug: finalSlug,
          owner_id: user.id,
          owner_user_id: user.id,
          owner_email: user.email,
          client_name: clientName || null,
          client_email: clientEmail || null,
          client_phone: clientPhone || null,
          event_date: eventDate || null,
          venue: venue || null,
          guest_tier: selectedTier.id,
          guest_limit: selectedTier.guestLimit,
          current_guest_count: 0,
          status: 'ACTIVE',
          is_white_labeled: applyWhiteLabel,
          co_host_pin: coHostPin,
          plan_type: selectedTier.id === 'LARGE' ? 'PREMIUM' : selectedTier.id === 'MEDIUM' ? 'STANDARD' : 'STARTER',
          created_at: new Date().toISOString(),
        });
      }
    } catch (err) {
      console.warn('Auto-save note:', err);
    }

    const message = encodeURIComponent(
      `Hi! I'd like to create and activate a Memento event:\n\n` +
      `📋 Client: ${clientName}\n` +
      `🎉 Event: ${eventName}\n` +
      `📅 Date: ${eventDate || 'TBD'}\n` +
      `📍 Venue: ${venue || 'TBD'}\n` +
      `👥 Tier: ${selectedTier.name} (${selectedTier.guestRange})\n` +
      `💰 Price: ${formatPrice(tierPrice.unitPrice, currency)}\n` +
      `🎨 White-label: ${applyWhiteLabel ? 'Yes' : 'No'}\n` +
      `🛡️ Moderation: ${moderationEnabled ? 'Default ON (Safety-First)' : 'Auto-Approve'}\n` +
      `🔑 Co-Host PIN: ${coHostPin}\n` +
      `🔗 Slug: ${finalSlug}\n\n` +
      `Please help me confirm activation and payment.`
    );
    window.open(`https://api.whatsapp.com/send?phone=919866161775&text=${message}`, '_blank');
    setSubmitting(false);
    router.push('/studio');
  };

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col items-center">
      {/* Top Breadcrumb Bar */}
      <div className="w-full flex items-center justify-between mb-6">
        <Link
          href="/studio"
          className="inline-flex items-center gap-2 text-xs font-semibold text-text-secondary hover:text-text-primary transition-colors"
        >
          <ArrowLeft size={14} />
          Back to Dashboard
        </Link>
        <span className="text-xs font-mono font-semibold text-text-muted">
          Step {currentStepIndex + 1} of {STEPS.length}
        </span>
      </div>

      {/* Centered Title */}
      <div className="text-center mb-8 w-full">
        <h1 className="text-2xl sm:text-3xl font-black text-text-primary tracking-tight font-display">
          Create New Event
        </h1>
        <p className="text-text-secondary text-sm mt-1.5 max-w-md mx-auto">
          Set up your client&apos;s event in just a few steps.
        </p>
      </div>

      {/* Step Indicator */}
      <div className="w-full max-w-2xl mx-auto flex items-center justify-between mb-10 px-2">
        {STEPS.map((s, i) => {
          const Icon = s.icon;
          const isActive = i === currentStepIndex;
          const isCompleted = i < currentStepIndex;

          return (
            <div key={s.key} className="flex items-center flex-1 last:flex-none">
              <button
                onClick={() => i <= currentStepIndex && setStep(s.key)}
                className={`flex flex-col items-center gap-1.5 cursor-pointer transition-all ${
                  isActive
                    ? 'opacity-100'
                    : isCompleted
                    ? 'opacity-70'
                    : 'opacity-30'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all ${
                    isActive
                      ? 'bg-accent text-white border-accent shadow-sm'
                      : isCompleted
                      ? 'bg-green-50 text-green-600 border-green-200'
                      : 'bg-bg-subtle text-text-muted border-border'
                  }`}
                >
                  {isCompleted ? <Check size={18} /> : <Icon size={18} />}
                </div>
                <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider hidden sm:block">
                  {s.label}
                </span>
              </button>
              {i < STEPS.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-2 rounded-full transition-all ${
                    i < currentStepIndex ? 'bg-green-300' : 'bg-border'
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Step Content */}
      <div className="w-full rounded-2xl border border-border bg-surface p-6 sm:p-8 shadow-card">
        {/* Step 1: Client Info */}
        {step === 'client' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-text-primary mb-1 font-display">Client Information</h2>
              <p className="text-text-secondary text-sm">Enter your client&apos;s contact details for this event.</p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">
                  Client / Couple Name *
                </label>
                <div className="relative">
                  <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                  <input
                    type="text"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="e.g. Priya & Arjun Sharma"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-bg text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all placeholder:text-text-muted"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                    <input
                      type="email"
                      value={clientEmail}
                      onChange={(e) => setClientEmail(e.target.value)}
                      placeholder="priya@email.com"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-bg text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all placeholder:text-text-muted"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">
                    WhatsApp Phone
                  </label>
                  <div className="relative">
                    <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                    <input
                      type="tel"
                      value={clientPhone}
                      onChange={(e) => setClientPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-bg text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all placeholder:text-text-muted"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Event Details */}
        {step === 'event' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-text-primary mb-1 font-display">Event Details</h2>
              <p className="text-text-secondary text-sm">Tell us about the event you&apos;re shooting.</p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">
                  Event Name *
                </label>
                <div className="relative">
                  <Type size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                  <input
                    type="text"
                    value={eventName}
                    onChange={(e) => setEventName(e.target.value)}
                    placeholder="e.g. Annual Gala or Wedding Celebration"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-bg text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all placeholder:text-text-muted"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">
                    Event Date *
                  </label>
                  <div className="relative">
                    <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                    <input
                      type="date"
                      value={eventDate}
                      onChange={(e) => setEventDate(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-bg text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">
                    Venue
                  </label>
                  <div className="relative">
                    <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                    <input
                      type="text"
                      value={venue}
                      onChange={(e) => setVenue(e.target.value)}
                      placeholder="e.g. Taj Palace, New Delhi"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-bg text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all placeholder:text-text-muted"
                    />
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">
                  Custom Event URL Slug
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-text-muted text-xs">mymementoapp.com/mobile/</span>
                  <input
                    type="text"
                    value={customSlug}
                    onChange={(e) => setCustomSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                    placeholder="sharma-wedding"
                    className="flex-1 px-4 py-3 rounded-xl border border-border bg-bg text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all placeholder:text-text-muted"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Tier Selection */}
        {step === 'tier' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold text-text-primary mb-1 font-display">Select Guest Tier</h2>
                <p className="text-text-secondary text-sm">Choose based on your expected guest count. All features included.</p>
              </div>
              <div className="bg-bg-subtle p-1 rounded-full border border-border flex items-center">
                <button
                  onClick={() => setCurrency('INR')}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    currency === 'INR' ? 'bg-accent text-white shadow-sm' : 'text-text-secondary'
                  }`}
                >
                  ₹ INR
                </button>
                <button
                  onClick={() => setCurrency('USD')}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    currency === 'USD' ? 'bg-accent text-white shadow-sm' : 'text-text-secondary'
                  }`}
                >
                  $ USD
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 pt-3">
              {GUEST_TIERS.map((tier) => {
                const isSelected = selectedTier.id === tier.id;
                const price = calculateTierPrice(tier, currency);

                return (
                  <button
                    key={tier.id}
                    onClick={() => setSelectedTier(tier)}
                    className={`relative text-left rounded-2xl border-2 pt-7 pb-5 px-5 flex flex-col justify-between transition-all duration-200 cursor-pointer h-full ${
                      isSelected
                        ? 'border-accent bg-accent/5 ring-2 ring-accent/15 shadow-md'
                        : 'border-border hover:border-accent/30 bg-surface'
                    }`}
                  >
                    {tier.badge && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10 whitespace-nowrap">
                        <span className="px-3 py-0.5 rounded-full bg-accent text-white text-[10px] font-bold uppercase tracking-wider shadow-sm">
                          {tier.badge}
                        </span>
                      </div>
                    )}
                    {isSelected && (
                      <div className="absolute top-3.5 right-3.5 w-6 h-6 rounded-full bg-accent flex items-center justify-center z-10 shadow-sm">
                        <Check size={14} className="text-white" />
                      </div>
                    )}
                    <div>
                      <h3 className="text-base font-bold text-text-primary pr-6">{tier.name}</h3>
                      <p className="text-text-secondary text-xs mt-0.5 font-medium">{tier.guestRange}</p>
                      <div className="mt-3">
                        <span className="text-2xl font-black text-text-primary tracking-tight font-display">
                          {formatPrice(price.unitPrice, currency)}
                        </span>
                        <span className="text-text-muted text-xs ml-1">/event</span>
                      </div>
                    </div>
                    <p className="text-text-secondary text-xs mt-3 pt-3 border-t border-border/70 leading-relaxed">
                      {tier.tagline}
                    </p>
                  </button>
                );
              })}
            </div>

            {/* All features included note */}
            <div className="flex items-start gap-3 p-4 rounded-xl bg-green-50 border border-green-200">
              <Sparkles size={18} className="text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-green-800">All features included at every tier</p>
                <p className="text-xs text-green-700 mt-0.5">
                  Unlimited photos, Live Wall, host moderation, custom branding, ZIP download, printable QR kit.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Branding */}
        {step === 'branding' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-text-primary mb-1 font-display">Studio Branding</h2>
              <p className="text-text-secondary text-sm">Apply your studio&apos;s branding to this event.</p>
            </div>

            <div className="flex items-center justify-between p-5 rounded-xl border border-border bg-bg-subtle">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center">
                  <Camera size={18} className="text-accent" />
                </div>
                <div>
                  <p className="text-sm font-bold text-text-primary">Apply Studio White-Label</p>
                  <p className="text-xs text-text-secondary">
                    Your logo and brand colors on the QR cards, Live Wall footer, and gallery.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setApplyWhiteLabel(!applyWhiteLabel)}
                className={`relative w-12 h-7 rounded-full transition-all duration-200 cursor-pointer ${
                  applyWhiteLabel ? 'bg-accent' : 'bg-border'
                }`}
              >
                <div
                  className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-sm transition-all duration-200 ${
                    applyWhiteLabel ? 'left-[22px]' : 'left-0.5'
                  }`}
                />
              </button>
            </div>

            {applyWhiteLabel && (
              <div className="p-5 rounded-xl border border-accent/20 bg-accent/5">
                <p className="text-sm text-accent font-semibold mb-2">
                  ✨ Studio branding will be applied
                </p>
                <p className="text-xs text-text-secondary">
                  Configure your studio logo and colors in{' '}
                  <Link href="/studio/settings" className="text-accent underline">
                    Studio Settings
                  </Link>
                  . The branding from your studio profile will be applied to this event automatically.
                </p>
              </div>
            )}

            {/* Moderation Mode (Default ON: Safety-First) */}
            <div className="flex items-center justify-between p-5 rounded-xl border border-border bg-bg-subtle">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-green-50 border border-green-200 flex items-center justify-center text-green-700">
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-text-primary">Safety-First Moderation</p>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-green-100 text-green-700 uppercase">Default ON</span>
                  </div>
                  <p className="text-xs text-text-secondary mt-0.5">
                    Requires host or assistant review before photos hit the venue screen. Can be toggled live anytime.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setModerationEnabled(!moderationEnabled)}
                className={`relative w-12 h-7 rounded-full transition-all duration-200 cursor-pointer ${
                  moderationEnabled ? 'bg-primary' : 'bg-border'
                }`}
              >
                <div
                  className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-sm transition-all duration-200 ${
                    moderationEnabled ? 'left-[22px]' : 'left-0.5'
                  }`}
                />
              </button>
            </div>

            {/* Team Access: 4-digit Event PIN */}
            <div className="p-5 rounded-xl border border-primary/20 bg-primary/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center text-primary">
                  <KeyRound size={18} />
                </div>
                <div>
                  <p className="text-sm font-bold text-text-primary">Team Co-Host PIN</p>
                  <p className="text-xs text-text-secondary mt-0.5">
                    Share with your 2nd shooter or assistant so they can moderate on reception day without extra paid accounts.
                  </p>
                </div>
              </div>
              <span className="text-base font-mono font-black text-primary px-3 py-1.5 rounded-lg bg-surface border border-primary/30 tracking-wider">
                {coHostPin}
              </span>
            </div>

            {/* Event Summary Preview */}
            <div className="p-5 rounded-xl border border-border bg-surface">
              <h3 className="text-sm font-bold text-text-primary mb-3">Event Summary</h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1.5 border-b border-border">
                  <span className="text-text-secondary">Client</span>
                  <span className="font-semibold text-text-primary">{clientName || '—'}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-border">
                  <span className="text-text-secondary">Event</span>
                  <span className="font-semibold text-text-primary">{eventName || '—'}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-border">
                  <span className="text-text-secondary">Date</span>
                  <span className="font-semibold text-text-primary">
                    {eventDate
                      ? new Date(eventDate).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })
                      : '—'}
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-border">
                  <span className="text-text-secondary">Tier</span>
                  <span className="font-semibold text-accent">
                    {selectedTier.name} ({selectedTier.guestRange})
                  </span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-text-secondary">Price</span>
                  <span className="font-black text-text-primary text-base">
                    {formatPrice(tierPrice.unitPrice, currency)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 5: Checkout */}
        {step === 'checkout' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-text-primary mb-1 font-display">Complete Your Order</h2>
              <p className="text-text-secondary text-sm">Review your event and proceed to payment.</p>
            </div>

            {/* Order Summary */}
            <div className="p-6 rounded-xl border border-border bg-bg-subtle">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-text-primary">Order Summary</h3>
                <span className="px-3 py-1 rounded-full bg-accent/10 text-accent text-[10px] font-bold uppercase tracking-wider border border-accent/20">
                  {selectedTier.name}
                </span>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-text-secondary">Event</span>
                  <span className="font-semibold text-text-primary">{eventName || 'Untitled Event'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Guest Capacity</span>
                  <span className="font-semibold text-text-primary">{selectedTier.guestRange}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Features</span>
                  <span className="font-semibold text-green-600">All Included</span>
                </div>
                <div className="w-full h-px bg-border my-2" />
                <div className="flex justify-between items-baseline">
                  <span className="text-text-primary font-bold">Total</span>
                  <span className="text-2xl font-black text-text-primary tracking-tight font-display">
                    {formatPrice(tierPrice.unitPrice, currency)}
                  </span>
                </div>
              </div>
            </div>

            {/* Payment buttons */}
            <div className="space-y-3">
              <button
                onClick={handleCheckout}
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold text-sm py-4 px-6 rounded-full shadow-sm transition-all duration-200 cursor-pointer disabled:opacity-60"
              >
                {submitting ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <MessageSquare size={18} />
                    <span>Save & Complete via WhatsApp</span>
                  </>
                )}
              </button>
              <p className="text-center text-text-muted text-xs">
                You&apos;ll be redirected to WhatsApp to confirm your order and receive payment instructions.
              </p>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
          <button
            onClick={goPrev}
            disabled={currentStepIndex === 0}
            className={`flex items-center gap-2 text-sm font-bold px-5 py-2.5 rounded-full transition-all cursor-pointer ${
              currentStepIndex === 0
                ? 'opacity-30 cursor-not-allowed text-text-muted'
                : 'text-text-secondary hover:text-text-primary hover:bg-bg-subtle'
            }`}
          >
            <ArrowLeft size={16} />
            Back
          </button>

          {currentStepIndex < STEPS.length - 1 ? (
            <button
              onClick={goNext}
              className="flex items-center gap-2 bg-accent hover:bg-[#B8882F] text-white font-bold text-sm px-6 py-2.5 rounded-full shadow-sm transition-all duration-200 cursor-pointer"
            >
              Next
              <ArrowRight size={16} />
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
