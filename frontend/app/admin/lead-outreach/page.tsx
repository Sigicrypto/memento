'use client';

import React, { useState, useEffect } from 'react';
import {
  Search,
  MessageSquare,
  Building2,
  MapPin,
  Star,
  Globe,
  Phone,
  Send,
  CheckCircle2,
  RefreshCw,
  Sparkles,
  Sliders,
  Filter,
  ExternalLink,
  Users,
  Copy,
  Check,
  AlertCircle,
  Download,
  Gift,
  Plus,
  Play,
  Pause,
  Square,
  ShieldCheck,
  Clock,
  AlertTriangle,
} from 'lucide-react';

interface B2BLead {
  id: string;
  name: string;
  category: string;
  phone: string;
  website: string;
  rating: number;
  address: string;
  status: 'new' | 'contacted' | 'interested';
}

const CATEGORIES = [
  { id: 'Wedding Planners', label: '💍 Wedding Planners', badge: 'High Conversion' },
  { id: 'Corporate Event Agencies', label: '🚀 Corporate Event Agencies', badge: 'High Volume' },
  { id: 'Luxury Banquet Halls', label: '🏰 Banquet Venues & Resorts', badge: 'High Value' },
  { id: 'Birthday Party Coordinators', label: '🎉 Birthday & VIP Party Hosts', badge: 'Quick Turnaround' },
];

const LOCATIONS = [
  'Mumbai',
  'Delhi NCR',
  'Bengaluru',
  'Hyderabad',
  'Chennai',
  'Jaipur',
  'Udaipur',
  'Goa',
  'Dubai',
];

const TEMPLATES: Record<string, string> = {
  wedding: `Hi {{business_name}} team! 👋

We loved your wedding work in {{location}}.

Memento turns any venue TV or LED display into a Live Photo Wall where guests stream candid photos in real-time — zero app download needed! 📱✨

Here is a 1-minute live demo wall you can view right on your phone:
👉 www.mymementoapp.com/demo

Let's connect so we can discuss to proceed further! 🚀`,

  corporate: `Hi {{business_name}} team! 👋

Looking for a high-engagement centerpiece for your upcoming corporate galas and tech conferences in {{location}}?

Memento lets attendees stream live photos/videos to venue screens, complete with:
🏢 Custom Brand Logo Overlays
🤖 AI Face Recognition ("Find My Photos")
🛡️ Real-time Content Moderation

Check out the live interactive demo:
👉 www.mymementoapp.com/demo

Let's connect so we can discuss to proceed further! 💼`,

  venue: `Hi {{business_name}} team! 👋

Upgrade your banquet hall TVs and LED walls into an interactive guest experience for every event hosted at your venue in {{location}}.

Zero hardware required — works directly on smart TVs or browser screens. Plus, earn 10% venue referral bonus on all hosted event upgrades! 🏰

See it live:
👉 www.mymementoapp.com/demo

Let's connect so we can discuss to proceed further! 🚀`,

  referral: `Hi {{business_name}} team! 👋

We're launching Memento's Partner & Referral Program in {{location}}.

Earn 10% referral bonus (₹750 – ₹2,000 per booking) for each user referred, credited within 24 hours! 🎁

Check out how it works:
👉 www.mymementoapp.com/demo

Let's connect so we can discuss to proceed further! 🚀`,
};

export default function LeadOutreachStudio() {
  const [location, setLocation] = useState('Mumbai');
  const [selectedCategory, setSelectedCategory] = useState(CATEGORIES[0].id);
  const [selectedTemplateKey, setSelectedTemplateKey] = useState<string>('wedding');
  const [leads, setLeads] = useState<B2BLead[]>([]);
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  const [template, setTemplate] = useState(TEMPLATES.wedding);

  const [searching, setSearching] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextPageToken, setNextPageToken] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [searchMeta, setSearchMeta] = useState<{ source?: string; message?: string } | null>(null);
  const [outreachLogs, setOutreachLogs] = useState<{ leadName: string; phone: string; status: string; url?: string }[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);

  // ── Anti-Ban Automated Dispatcher State ──
  const [isAutoDispatching, setIsAutoDispatching] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [dispatchDelay, setDispatchDelay] = useState<number>(30); // 30s delay between messages
  const [batchLimit, setBatchLimit] = useState<number>(15); // max 15 leads per run
  const [dailyQuotaLimit, setDailyQuotaLimit] = useState<number>(30); // max 30 per 24 hours
  const [dailySentCount, setDailySentCount] = useState<number>(0);
  const [currentQueueIndex, setCurrentQueueIndex] = useState<number>(0);
  const [timerSecondsLeft, setTimerSecondsLeft] = useState<number>(30);
  const [activeQueue, setActiveQueue] = useState<B2BLead[]>([]);
  const [leadStatuses, setLeadStatuses] = useState<Record<string, 'new' | 'queued' | 'sending' | 'sent' | 'skipped'>>({});

  // Custom Lead Modal State
  const [showAddLead, setShowAddLead] = useState(false);
  const [newLeadName, setNewLeadName] = useState('');
  const [newLeadPhone, setNewLeadPhone] = useState('');
  const [newLeadAddress, setNewLeadAddress] = useState('');

  // Load Daily Quota from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('memento_wa_daily_quota');
      if (stored) {
        const { count, date } = JSON.parse(stored);
        const today = new Date().toDateString();
        if (date === today) {
          setDailySentCount(count);
        } else {
          localStorage.setItem('memento_wa_daily_quota', JSON.stringify({ count: 0, date: today }));
          setDailySentCount(0);
        }
      }
    } catch {}
  }, []);

  // Automated Queue Timer Loop
  useEffect(() => {
    if (!isAutoDispatching || isPaused || activeQueue.length === 0) return;

    const timer = setInterval(() => {
      setTimerSecondsLeft((prev) => {
        if (prev <= 1) {
          // Dispatch current lead
          const currentLead = activeQueue[currentQueueIndex];
          if (currentLead) {
            handleSendWhatsAppOutreach(currentLead);
            setLeadStatuses((prevStatus) => ({ ...prevStatus, [currentLead.id]: 'sent' }));

            // Update daily count
            setDailySentCount((prevCount) => {
              const nextCount = prevCount + 1;
              try {
                localStorage.setItem(
                  'memento_wa_daily_quota',
                  JSON.stringify({ count: nextCount, date: new Date().toDateString() })
                );
              } catch {}
              return nextCount;
            });
          }

          // Move to next lead in queue
          const nextIdx = currentQueueIndex + 1;
          if (nextIdx < activeQueue.length) {
            setCurrentQueueIndex(nextIdx);
            const randomJitter = Math.floor(Math.random() * 5); // 0-4s random jitter
            return dispatchDelay + randomJitter;
          } else {
            // Queue complete
            setIsAutoDispatching(false);
            setCurrentQueueIndex(0);
            return 0;
          }
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isAutoDispatching, isPaused, currentQueueIndex, activeQueue, dispatchDelay]);

  const handleStartAutoDispatch = () => {
    const selectedList = leads.filter((l) => selectedLeads.includes(l.id));
    if (selectedList.length === 0) return;

    if (dailySentCount >= dailyQuotaLimit) {
      alert(`Daily safe marketing quota (${dailyQuotaLimit}/${dailyQuotaLimit}) reached for today to protect your account.`);
      return;
    }

    const batch = selectedList.slice(0, batchLimit);
    setActiveQueue(batch);
    setCurrentQueueIndex(0);
    setTimerSecondsLeft(3); // First dispatch in 3s
    setIsAutoDispatching(true);
    setIsPaused(false);

    const newStatuses: Record<string, 'queued'> = {};
    batch.forEach((l) => {
      newStatuses[l.id] = 'queued';
    });
    setLeadStatuses((prev) => ({ ...prev, ...newStatuses }));
  };

  const handlePauseAutoDispatch = () => setIsPaused(true);
  const handleResumeAutoDispatch = () => setIsPaused(false);
  const handleStopAutoDispatch = () => {
    setIsAutoDispatching(false);
    setIsPaused(false);
    setActiveQueue([]);
    setCurrentQueueIndex(0);
  };

  const handleAddCustomLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLeadName.trim() || !newLeadPhone.trim()) return;

    const customLead: B2BLead = {
      id: `custom-${Date.now()}`,
      name: newLeadName.trim(),
      category: selectedCategory,
      phone: newLeadPhone.trim(),
      website: 'N/A',
      rating: 5.0,
      address: newLeadAddress.trim() || location,
      status: 'new',
    };

    setLeads((prev) => [customLead, ...prev]);
    setSelectedLeads((prev) => [customLead.id, ...prev]);
    setNewLeadName('');
    setNewLeadPhone('');
    setNewLeadAddress('');
    setShowAddLead(false);
  };

  const handleSelectTemplateKey = (key: string) => {
    setSelectedTemplateKey(key);
    if (TEMPLATES[key]) {
      setTemplate(TEMPLATES[key]);
    }
  };

  const handleSearchLeads = async (isLoadMore = false) => {
    if (isLoadMore) {
      setLoadingMore(true);
    } else {
      setSearching(true);
      setSearchMeta(null);
      setNextPageToken(null);
    }

    try {
      const res = await fetch('/api/admin/leads/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: selectedCategory,
          location,
          pageToken: isLoadMore ? nextPageToken : undefined,
        }),
      });
      const data = await res.json();
      if (data.leads && Array.isArray(data.leads)) {
        if (isLoadMore) {
          setLeads((prev) => {
            const existingPhones = new Set(prev.map((l) => l.phone));
            const existingNames = new Set(prev.map((l) => l.name.toLowerCase()));
            const newUniqueLeads = data.leads.filter(
              (l: B2BLead) => !existingPhones.has(l.phone) && !existingNames.has(l.name.toLowerCase())
            );
            const updated = [...prev, ...newUniqueLeads];
            setSelectedLeads(updated.map((l) => l.id));
            return updated;
          });
        } else {
          setLeads(data.leads);
          setSelectedLeads(data.leads.map((l: B2BLead) => l.id));
        }

        setNextPageToken(data.nextPageToken || null);
        setSearchMeta({
          source: data.source,
          message: data.message || `Loaded leads for ${location}.`,
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSearching(false);
      setLoadingMore(false);
    }
  };

  const toggleSelectLead = (id: string) => {
    setSelectedLeads((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedLeads.length === leads.length) {
      setSelectedLeads([]);
    } else {
      setSelectedLeads(leads.map((l) => l.id));
    }
  };

  const getCustomizedMessage = (lead: B2BLead) => {
    return template
      .replace(/{{business_name}}/g, lead.name)
      .replace(/{{location}}/g, location);
  };

  const exportLeadsToCSV = () => {
    if (leads.length === 0) return;
    const headers = ['Business Name', 'Category', 'Location', 'Phone', 'Rating', 'Address', 'Website', 'WhatsApp Outreach Link'];
    const rows = leads.map((lead) => {
      const message = getCustomizedMessage(lead);
      const cleanPhone = lead.phone.replace(/[^0-9]/g, '');
      const waLink = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
      return [
        `"${lead.name.replace(/"/g, '""')}"`,
        `"${selectedCategory}"`,
        `"${location}"`,
        `"${lead.phone}"`,
        `"${lead.rating}"`,
        `"${lead.address.replace(/"/g, '""')}"`,
        `"${lead.website}"`,
        `"${waLink}"`,
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Memento_B2B_Leads_${selectedCategory.replace(/\s+/g, '_')}_${location}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const copyAllMessagesToClipboard = () => {
    const selectedList = leads.filter((l) => selectedLeads.includes(l.id));
    if (selectedList.length === 0) return;
    const formatted = selectedList.map((l) => `--- ${l.name} (${l.phone}) ---\n${getCustomizedMessage(l)}\n\n`).join('');
    navigator.clipboard.writeText(formatted);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2500);
  };

  const handleSendWhatsAppOutreach = async (lead: B2BLead) => {
    const messageText = getCustomizedMessage(lead);

    try {
      const res = await fetch('/api/admin/leads/whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: lead.phone,
          businessName: lead.name,
          templateMessage: messageText,
        }),
      });

      const data = await res.json();
      if (data.whatsappWebUrl) {
        window.open(data.whatsappWebUrl, '_blank');
        setOutreachLogs((prev) => [
          {
            leadName: lead.name,
            phone: lead.phone,
            status: data.mode === 'cloud_api' ? 'Official Meta API Sent' : 'Chat Launched',
            url: data.whatsappWebUrl,
          },
          ...prev,
        ]);
        setLeadStatuses((prev) => ({ ...prev, [lead.id]: 'sent' }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 font-sans py-8 px-4 sm:px-6 lg:px-12 selection:bg-emerald-500/30">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Bar */}
        <div className="bg-slate-900/80 border border-slate-800/80 backdrop-blur-xl rounded-2xl p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-2xl">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-cyan-500 text-white shadow-lg shadow-emerald-500/20">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-black tracking-tight text-white">B2B Lead Discovery & WhatsApp Studio</h1>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-[11px] font-semibold">
                    Anti-Ban Automated Drip
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Discover wedding planners, event agencies & venues on Google with automated WhatsApp outreach and human anti-ban pacing.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="/admin"
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-xl border border-slate-700 transition-colors"
            >
              ← Back to Admin
            </a>
          </div>
        </div>

        {/* Step 1: Lead Search Panel */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Search className="w-5 h-5 text-emerald-400" /> Step 1: Discover Target Audience Leads (Google Places)
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Query Google Places database for active B2B contacts across target market regions.
              </p>
            </div>

            <a
              href={`https://www.google.com/maps/search/${encodeURIComponent(`${selectedCategory} in ${location}`)}`}
              target="_blank"
              rel="noreferrer"
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl border border-slate-700 flex items-center gap-2 transition-all shrink-0"
              title="Open Google Maps search in new tab"
            >
              <ExternalLink className="w-3.5 h-3.5 text-emerald-400" />
              <span>Open Google Maps Search</span>
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
            {/* Category Selector */}
            <div className="md:col-span-5 space-y-2">
              <label className="text-xs font-bold text-slate-300 block">Target Business Category:</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500 transition-colors shadow-inner"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label} ({c.badge})
                  </option>
                ))}
              </select>
            </div>

            {/* Location Selector */}
            <div className="md:col-span-4 space-y-2">
              <label className="text-xs font-bold text-slate-300 block">Target City / Region:</label>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500 transition-colors shadow-inner"
              >
                {LOCATIONS.map((loc) => (
                  <option key={loc} value={loc}>
                    📍 {loc}
                  </option>
                ))}
              </select>
            </div>

            {/* Search Action Button */}
            <div className="md:col-span-3">
              <button
                onClick={() => handleSearchLeads(false)}
                disabled={searching}
                className="w-full py-3.5 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
              >
                {searching ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Searching Google...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    <span>Find Target Leads</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {searchMeta && (
            <div className="p-3 bg-emerald-950/30 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 flex items-center justify-between font-mono">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                {searchMeta.message}
              </span>
              <span className="text-[11px] bg-emerald-500/20 px-2 py-0.5 rounded text-emerald-200">
                Source: {searchMeta.source}
              </span>
            </div>
          )}
        </div>

        {/* Modal: + Add Manual Custom Lead */}
        {showAddLead && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full space-y-5 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Plus className="w-4 h-4 text-emerald-400" /> Add Custom B2B Lead
                </h3>
                <button
                  onClick={() => setShowAddLead(false)}
                  className="text-slate-400 hover:text-white text-xs font-bold px-2 py-1 bg-slate-800 rounded"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleAddCustomLead} className="space-y-4 text-xs">
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">Business / Planner Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Royal Crown Weddings"
                    value={newLeadName}
                    onChange={(e) => setNewLeadName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">WhatsApp Phone Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. +919866161775"
                    value={newLeadPhone}
                    onChange={(e) => setNewLeadPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">Address / Locality</label>
                  <input
                    type="text"
                    placeholder="e.g. Jubilee Hills, Hyderabad"
                    value={newLeadAddress}
                    onChange={(e) => setNewLeadAddress(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddLead(false)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold"
                  >
                    Save & Add Lead
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Grid: Discovered Leads vs Outreach Blueprint & Auto-Dispatcher */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Panel: Discovered Leads Table (7 Columns) */}
          <div className="lg:col-span-7 bg-slate-900/70 border border-slate-800 rounded-2xl p-6 space-y-5 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-emerald-400" /> Discovered Leads ({leads.length})
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">Select leads to target with customized WhatsApp pitches.</p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => setShowAddLead(true)}
                  className="px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 text-[11px] font-bold rounded-lg border border-emerald-500/30 transition-colors flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> + Add Lead
                </button>

                {leads.length > 0 && (
                  <>
                    <button
                      onClick={exportLeadsToCSV}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold rounded-lg border border-slate-700 transition-colors flex items-center gap-1.5"
                      title="Export all leads with WhatsApp links to CSV"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Export CSV</span>
                    </button>

                    <button
                      onClick={copyAllMessagesToClipboard}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold rounded-lg border border-slate-700 transition-colors flex items-center gap-1.5"
                      title="Copy all formatted messages to clipboard"
                    >
                      {copiedAll ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedAll ? 'Copied!' : 'Copy All'}</span>
                    </button>

                    <button
                      onClick={toggleSelectAll}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold rounded-lg border border-slate-700 transition-colors"
                    >
                      {selectedLeads.length === leads.length ? 'Deselect All' : 'Select All'}
                    </button>
                  </>
                )}
              </div>
            </div>

            {leads.length === 0 ? (
              <div className="py-16 text-center text-slate-500 space-y-3">
                <Search className="w-10 h-10 mx-auto text-slate-700" />
                <p className="text-xs">Click <strong className="text-slate-300">"Find Target Leads"</strong> above to search and discover business contacts.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
                {leads.map((lead) => {
                  const isChecked = selectedLeads.includes(lead.id);
                  const leadStatus = leadStatuses[lead.id] || 'new';
                  const isSendingNow = isAutoDispatching && activeQueue[currentQueueIndex]?.id === lead.id;

                  return (
                    <div
                      key={lead.id}
                      className={`p-4 rounded-xl border transition-all ${
                        isSendingNow
                          ? 'bg-amber-950/30 border-amber-500/60 shadow-lg shadow-amber-500/10'
                          : isChecked
                          ? 'bg-slate-900 border-emerald-500/50 shadow-md shadow-emerald-500/5'
                          : 'bg-slate-950/60 border-slate-800 opacity-70'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleSelectLead(lead.id)}
                            className="mt-1 w-4 h-4 rounded accent-emerald-500 cursor-pointer"
                          />
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm font-bold text-white">{lead.name}</span>
                              <span className="text-[10px] font-semibold px-2 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full flex items-center gap-1">
                                <Star className="w-2.5 h-2.5 fill-amber-300" /> {lead.rating}
                              </span>

                              {/* Live Auto-Dispatch Status Badge */}
                              {isSendingNow ? (
                                <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-500/30 text-amber-200 border border-amber-500/50 rounded-full animate-pulse flex items-center gap-1">
                                  <Clock className="w-3 h-3 text-amber-300" /> Sending in {timerSecondsLeft}s...
                                </span>
                              ) : leadStatus === 'sent' ? (
                                <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full flex items-center gap-1">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-400" /> WhatsApp Sent
                                </span>
                              ) : leadStatus === 'queued' ? (
                                <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-800 text-slate-400 border border-slate-700 rounded-full">
                                  📋 Queued
                                </span>
                              ) : null}
                            </div>

                            <p className="text-xs text-slate-400 flex items-center gap-1.5">
                              <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" /> {lead.address}
                            </p>

                            <div className="flex items-center gap-4 text-xs font-mono pt-1 text-slate-300">
                              <span className="flex items-center gap-1 text-emerald-400">
                                <Phone className="w-3.5 h-3.5" /> {lead.phone}
                              </span>
                              {lead.website !== 'N/A' && (
                                <a
                                  href={lead.website}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="flex items-center gap-1 text-blue-400 hover:text-blue-300 underline"
                                >
                                  <Globe className="w-3.5 h-3.5" /> Website
                                </a>
                              )}
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => handleSendWhatsAppOutreach(lead)}
                          className="px-3 py-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 text-xs font-semibold rounded-lg border border-emerald-500/30 transition-all flex items-center gap-1.5 shrink-0"
                          title="Open WhatsApp direct chat link for this lead"
                        >
                          <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                          <span>WhatsApp</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {leads.length > 0 && (
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-3 text-xs">
                <span className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{leads.length} Unique Leads (Auto-Deduplicated)</span>
                </span>

                <button
                  onClick={() => handleSearchLeads(true)}
                  disabled={loadingMore || searching}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-emerald-300 text-xs font-bold rounded-xl border border-slate-700 flex items-center gap-2 transition-all shadow-md"
                >
                  {loadingMore ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                      <span>Loading Next Batch...</span>
                    </>
                  ) : (
                    <>
                      <Search className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Load More Leads</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Right Panel: Template Customizer & Anti-Ban Automated Dispatcher (5 Columns) */}
          <div className="lg:col-span-5 bg-slate-900/70 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-2xl">
            
            {/* Step 2: Blueprint Header */}
            <div className="border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-emerald-400" /> Step 2: WhatsApp Outreach Blueprint
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Customize template variables for peak B2B conversion.</p>
            </div>

            {/* Template Preset Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 block">Select Preset Script Hook:</label>
              <select
                value={selectedTemplateKey}
                onChange={(e) => handleSelectTemplateKey(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-emerald-400 font-semibold focus:outline-none focus:border-emerald-500 transition-colors"
              >
                <option value="wedding">💍 Wedding Planners (Live Demo Hook)</option>
                <option value="corporate">🚀 Corporate Event Agencies (Engagement Pitch)</option>
                <option value="venue">🏰 Banquet Venues & Resorts (Venue Partner Pitch)</option>
                <option value="referral">🎁 10% Partner & Referral Program (Cashback Hook)</option>
              </select>
            </div>

            {/* Template Editor */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 block">Outreach Message Template:</label>
              <textarea
                rows={7}
                value={template}
                onChange={(e) => setTemplate(e.target.value)}
                className="w-full p-4 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-slate-200 focus:outline-none focus:border-emerald-500 transition-colors leading-relaxed shadow-inner"
              />
              <p className="text-[11px] text-slate-500">Available variables: <code className="text-emerald-400">{"{{business_name}}"}</code>, <code className="text-emerald-400">{"{{location}}"}</code></p>
            </div>

            {/* Step 3: Anti-Ban Automated Dispatcher Control Card */}
            <div className="p-5 bg-slate-950 border border-slate-800 rounded-xl space-y-4 shadow-inner">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  <div>
                    <h4 className="text-xs font-bold text-white">Step 3: Anti-Ban Automated Lead Drip</h4>
                    <p className="text-[11px] text-slate-400">Protects your WhatsApp Business number from spam flags</p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-mono border border-emerald-500/30">
                  Today: {dailySentCount}/{dailyQuotaLimit} Max
                </span>
              </div>

              {/* Pacing & Batch Controls */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">Human Pacing Delay:</label>
                  <select
                    value={dispatchDelay}
                    onChange={(e) => setDispatchDelay(Number(e.target.value))}
                    disabled={isAutoDispatching}
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-emerald-400 font-mono"
                  >
                    <option value={25}>⚡ 25s (Standard Delay)</option>
                    <option value={35}>🛡️ 35s (Recommended Safe)</option>
                    <option value={50}>🔒 50s (Ultra Safe)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">Batch Limit (Leads):</label>
                  <select
                    value={batchLimit}
                    onChange={(e) => setBatchLimit(Number(e.target.value))}
                    disabled={isAutoDispatching}
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white font-mono"
                  >
                    <option value={10}>10 Leads / Batch</option>
                    <option value={15}>15 Leads (Recommended)</option>
                    <option value={25}>25 Leads / Batch</option>
                  </select>
                </div>
              </div>

              {/* Active Automated Dispatch Progress */}
              {isAutoDispatching ? (
                <div className="p-4 bg-slate-900 border border-emerald-500/40 rounded-xl space-y-3 shadow-lg">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      Dispatching Lead {currentQueueIndex + 1} of {activeQueue.length}
                    </span>
                    <span className="text-amber-300 font-bold bg-amber-500/20 px-2 py-0.5 rounded border border-amber-500/30">
                      Next in: {String(timerSecondsLeft).padStart(2, '0')}s
                    </span>
                  </div>

                  {activeQueue[currentQueueIndex] && (
                    <p className="text-xs text-slate-300 font-medium truncate">
                      📍 Target: <strong className="text-white">{activeQueue[currentQueueIndex].name}</strong> ({activeQueue[currentQueueIndex].phone})
                    </p>
                  )}

                  {/* Progress Bar */}
                  <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 transition-all duration-500"
                      style={{ width: `${((currentQueueIndex + 1) / activeQueue.length) * 100}%` }}
                    />
                  </div>

                  {/* Controls */}
                  <div className="flex items-center gap-2 pt-1">
                    {isPaused ? (
                      <button
                        onClick={handleResumeAutoDispatch}
                        className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg flex items-center justify-center gap-1.5"
                      >
                        <Play className="w-3.5 h-3.5 fill-white" /> Resume Queue
                      </button>
                    ) : (
                      <button
                        onClick={handlePauseAutoDispatch}
                        className="flex-1 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-lg flex items-center justify-center gap-1.5"
                      >
                        <Pause className="w-3.5 h-3.5 fill-white" /> Pause Queue
                      </button>
                    )}
                    <button
                      onClick={handleStopAutoDispatch}
                      className="px-4 py-2 bg-rose-950/80 hover:bg-rose-900 border border-rose-500/40 text-rose-300 font-bold text-xs rounded-lg flex items-center justify-center gap-1.5"
                    >
                      <Square className="w-3.5 h-3.5 fill-rose-300" /> Stop
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={handleStartAutoDispatch}
                  disabled={selectedLeads.length === 0 || dailySentCount >= dailyQuotaLimit}
                  className="w-full py-3.5 px-5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>Start Automated Anti-Ban Drip ({Math.min(selectedLeads.length, batchLimit)} Selected Leads)</span>
                </button>
              )}
            </div>

            {/* Outreach Logs */}
            {outreachLogs.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <span className="text-xs font-bold text-slate-300 block">Outreach Dispatch Log:</span>
                <div className="space-y-1.5 max-h-36 overflow-y-auto">
                  {outreachLogs.map((log, i) => (
                    <div key={i} className="p-2 bg-slate-950 border border-slate-800 rounded-lg text-xs flex items-center justify-between font-mono">
                      <span className="text-slate-300 truncate max-w-[160px]">{log.leadName}</span>
                      <span className="text-emerald-400">{log.status}</span>
                      {log.url && (
                        <a href={log.url} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline flex items-center gap-1 text-[11px]">
                          Open <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}
