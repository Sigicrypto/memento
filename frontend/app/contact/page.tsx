"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import { 
  Send, 
  MessageSquare, 
  Calendar, 
  Users, 
  MapPin, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight,
  Phone,
  Mail,
  ShieldCheck,
  Tv
} from "lucide-react";

const ThemedNav = dynamic(() => import("@/components/ThemedNav"), { ssr: false });
const Footer = dynamic(() => import("@/components/sections/Footer"), { ssr: false });

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    eventType: "Wedding",
    eventDate: "",
    guestCount: "100-300",
    location: "",
    features: [] as string[],
    message: "",
  });

  const [submitted, setSubmitted] = useState(false);

  const featureOptions = [
    "Live Photo Wall on Projector / TV",
    "Host Moderation (Approve before live)",
    "Custom Couple / Event Branding",
    "WhatsApp Guest Onboarding",
    "High-Res ZIP Album Download",
    "Photographer / DSLR Camera Sync",
    "Agency / White-Label Platform",
  ];

  const toggleFeature = (feat: string) => {
    setFormData((prev) => ({
      ...prev,
      features: prev.features.includes(feat)
        ? prev.features.filter((f) => f !== feat)
        : [...prev.features, feat],
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Construct WhatsApp pre-filled message
    const lines = [
      `🎉 *New Memento Event Inquiry*`,
      ``,
      `👤 *Name:* ${formData.name || "N/A"}`,
      `📱 *Phone / Contact:* ${formData.phone || "N/A"}`,
      formData.email ? `📧 *Email:* ${formData.email}` : null,
      `🎈 *Event Type:* ${formData.eventType}`,
      formData.eventDate ? `📅 *Date:* ${formData.eventDate}` : null,
      `👥 *Expected Guests:* ${formData.guestCount}`,
      formData.location ? `📍 *Location/City:* ${formData.location}` : null,
      formData.features.length > 0
        ? `✨ *Interested In:*\n${formData.features.map((f) => `  • ${f}`).join("\n")}`
        : null,
      formData.message ? `💬 *Notes:*\n${formData.message}` : null,
    ].filter(Boolean);

    const fullMessage = lines.join("\n");
    const waUrl = `https://wa.me/919866161775?text=${encodeURIComponent(fullMessage)}`;

    setSubmitted(true);

    // Open WhatsApp in new tab
    window.open(waUrl, "_blank");
  };

  return (
    <>
      <ThemedNav />
      <div className="min-h-screen bg-bg text-text-primary pt-28 pb-20 px-4 md:px-8 flex flex-col items-center">
        <div className="max-w-4xl w-full mx-auto">
          {/* Header */}
          <div className="text-center mb-12 animate-fade-in">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-mono font-bold uppercase tracking-wider mb-4">
              <MessageSquare size={14} />
              Instant Event Consultation
            </span>
            <h1 className="text-3xl md:text-5xl font-black tracking-tight font-display text-text-primary">
              Let's Plan Your Live Memory Experience
            </h1>
            <p className="text-text-secondary text-base md:text-lg max-w-xl mx-auto mt-4 leading-relaxed">
              Tell us about your upcoming wedding, party, or corporate gathering. 
              We'll tailor the perfect setup and reply directly on WhatsApp.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Left Col: Contact Form (Spans 2 cols) */}
            <div className="lg:col-span-2 bg-surface border border-border rounded-2xl p-6 sm:p-8 shadow-card">
              {submitted ? (
                <div className="text-center py-12 flex flex-col items-center animate-fade-in">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-600 mb-4">
                    <CheckCircle2 size={36} />
                  </div>
                  <h3 className="text-2xl font-bold text-text-primary mb-2">Message Opened on WhatsApp!</h3>
                  <p className="text-text-secondary text-sm max-w-md mb-6 leading-relaxed">
                    If WhatsApp didn't launch automatically, tap the button below to send your pre-filled inquiry.
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="px-6 py-2.5 rounded-full border border-border hover:border-accent text-text-primary text-sm font-semibold transition-all"
                  >
                    Edit / Send Another Inquiry
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Name & Phone */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-2">
                        Your Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g. Ananya & Siddharth"
                        className="w-full px-4 py-3 rounded-xl bg-bg-subtle border border-border focus:border-accent focus:outline-none text-text-primary text-sm transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-2">
                        WhatsApp Number *
                      </label>
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="e.g. +91 98765 43210"
                        className="w-full px-4 py-3 rounded-xl bg-bg-subtle border border-border focus:border-accent focus:outline-none text-text-primary text-sm transition-colors"
                      />
                    </div>
                  </div>

                  {/* Event Type & Expected Date */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-2">
                        Event Type
                      </label>
                      <select
                        value={formData.eventType}
                        onChange={(e) => setFormData({ ...formData, eventType: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-bg-subtle border border-border focus:border-accent focus:outline-none text-text-primary text-sm transition-colors"
                      >
                        <option value="Wedding">Wedding / Sangeet / Reception</option>
                        <option value="Birthday / Anniversary">Birthday / Anniversary Party</option>
                        <option value="Corporate Event">Corporate Gala / Conference / Launch</option>
                        <option value="College / School Fest">College / School Fest</option>
                        <option value="Agency / Photography Partnership">Agency / Photography Partnership</option>
                        <option value="Other">Other Celebration</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-2">
                        Estimated Date
                      </label>
                      <input
                        type="date"
                        value={formData.eventDate}
                        onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-bg-subtle border border-border focus:border-accent focus:outline-none text-text-primary text-sm transition-colors"
                      />
                    </div>
                  </div>

                  {/* Guest Count & Location */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-2">
                        Expected Guests
                      </label>
                      <select
                        value={formData.guestCount}
                        onChange={(e) => setFormData({ ...formData, guestCount: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-bg-subtle border border-border focus:border-accent focus:outline-none text-text-primary text-sm transition-colors"
                      >
                        <option value="Under 50">Under 50 guests (Intimate)</option>
                        <option value="50-150">50 - 150 guests</option>
                        <option value="150-400">150 - 400 guests (Standard)</option>
                        <option value="400-1000">400 - 1,000 guests (Grand)</option>
                        <option value="1000+">1,000+ guests (Mega Event)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-2">
                        City / Venue Location
                      </label>
                      <input
                        type="text"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        placeholder="e.g. Hyderabad / Mumbai / Bangalore"
                        className="w-full px-4 py-3 rounded-xl bg-bg-subtle border border-border focus:border-accent focus:outline-none text-text-primary text-sm transition-colors"
                      />
                    </div>
                  </div>

                  {/* Feature Checkboxes */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-3">
                      Features You'd Like (Optional)
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {featureOptions.map((feat) => {
                        const isChecked = formData.features.includes(feat);
                        return (
                          <button
                            type="button"
                            key={feat}
                            onClick={() => toggleFeature(feat)}
                            className={`px-3 py-2 rounded-xl text-left text-xs font-medium border transition-all flex items-center gap-2 ${
                              isChecked
                                ? "bg-accent/10 border-accent text-accent font-semibold"
                                : "bg-bg-subtle border-border text-text-secondary hover:border-border-hover"
                            }`}
                          >
                            <span className={`w-3.5 h-3.5 rounded-sm border flex items-center justify-center ${
                              isChecked ? "bg-accent border-accent text-white" : "border-border"
                            }`}>
                              {isChecked && "✓"}
                            </span>
                            <span className="truncate">{feat}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Notes / Special Requests */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-2">
                      Questions or Special Requirements
                    </label>
                    <textarea
                      rows={3}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Tell us any specific details about the venue, AV equipment, or couple branding..."
                      className="w-full px-4 py-3 rounded-xl bg-bg-subtle border border-border focus:border-accent focus:outline-none text-text-primary text-sm transition-colors"
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="w-full py-4 rounded-full bg-accent hover:bg-[#B8882F] text-white font-bold text-base shadow-[0_4px_16px_rgba(200,150,62,0.3)] hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2.5 cursor-pointer"
                  >
                    <Send size={18} />
                    <span>Submit & Open on WhatsApp</span>
                    <ArrowRight size={18} />
                  </button>
                </form>
              )}
            </div>

            {/* Right Col: Quick Contact & Trust Details */}
            <div className="space-y-6">
              {/* WhatsApp Direct Card */}
              <div className="bg-surface border border-border rounded-2xl p-6 shadow-card">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 flex items-center justify-center font-bold">
                    <Phone size={20} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-text-primary">Instant WhatsApp Helpline</h3>
                    <p className="text-xs text-text-muted">Live response within minutes</p>
                  </div>
                </div>
                <p className="text-xs text-text-secondary leading-relaxed mb-4">
                  Prefer chatting immediately without filling the form? Reach our founder directly.
                </p>
                <a
                  href="https://wa.me/919866161775?text=Hi%2C%20I%20have%20a%20question%20about%20Memento%20for%20an%20event"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all"
                >
                  <span>Chat on WhatsApp (+91 9866161775)</span>
                </a>
              </div>

              {/* Guarantees */}
              <div className="bg-bg-subtle border border-border rounded-2xl p-6 space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-text-secondary">
                  The Memento Promise
                </h4>

                <div className="flex items-start gap-3 text-xs text-text-secondary">
                  <ShieldCheck size={18} className="text-accent shrink-0 mt-0.5" />
                  <span><strong>100% Private:</strong> We never share or sell guest media. Access is locked to your QR code.</span>
                </div>

                <div className="flex items-start gap-3 text-xs text-text-secondary">
                  <Tv size={18} className="text-accent shrink-0 mt-0.5" />
                  <span><strong>Venue Ready:</strong> Works on any smart TV, projector, or HDMI laptop with zero software installation.</span>
                </div>

                <div className="flex items-start gap-3 text-xs text-text-secondary">
                  <Sparkles size={18} className="text-accent shrink-0 mt-0.5" />
                  <span><strong>Zero Friction:</strong> No app downloads or password signups for your guests.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
