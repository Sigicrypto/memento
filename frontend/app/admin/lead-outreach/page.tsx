'use client';

import React, { useState } from 'react';
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
  AlertCircle
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

const DEFAULT_TEMPLATE = `Hi {{business_name}} team! 👋

We noticed your amazing event work in {{location}}. 

Memento turns any venue display screen or TV into a live QR photo wall where guests stream their candid photos in real-time — zero app download required! 📱✨

Here is a 1-minute demo wall you can view right on your phone:
👉 www.mymementoapp.com/demo

Would you be open to a 5-minute virtual showcase for your upcoming events? 🚀`;

export default function LeadOutreachStudio() {
  const [location, setLocation] = useState('Mumbai');
  const [selectedCategory, setSelectedCategory] = useState(CATEGORIES[0].id);
  const [leads, setLeads] = useState<B2BLead[]>([]);
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  const [template, setTemplate] = useState(DEFAULT_TEMPLATE);

  const [searching, setSearching] = useState(false);
  const [sending, setSending] = useState(false);
  const [searchMeta, setSearchMeta] = useState<{ source?: string; message?: string } | null>(null);
  const [outreachLogs, setOutreachLogs] = useState<{ leadName: string; phone: string; status: string; url?: string }[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleSearchLeads = async () => {
    setSearching(true);
    setSearchMeta(null);
    try {
      const res = await fetch('/api/admin/leads/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category: selectedCategory, location }),
      });
      const data = await res.json();
      if (data.leads) {
        setLeads(data.leads);
        setSelectedLeads(data.leads.map((l: B2BLead) => l.id));
        setSearchMeta({ source: data.source, message: data.message });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSearching(false);
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
        // Open direct WhatsApp chat link in new window
        window.open(data.whatsappWebUrl, '_blank');
        setOutreachLogs((prev) => [
          {
            leadName: lead.name,
            phone: lead.phone,
            status: 'Chat Launched',
            url: data.whatsappWebUrl,
          },
          ...prev,
        ]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleBulkOutreach = async () => {
    setSending(true);
    const targetList = leads.filter((l) => selectedLeads.includes(l.id));

    for (const lead of targetList) {
      await handleSendWhatsAppOutreach(lead);
      await new Promise((r) => setTimeout(r, 600));
    }

    setSending(false);
  };

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
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
                    Targeted B2B Growth
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Automate discovering wedding planners, event directors, and venues on Google and sending customized WhatsApp demos.
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
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Search className="w-5 h-5 text-emerald-400" /> Step 1: Discover Target Audience Leads (Google Places)
            </h2>
            <span className="text-xs text-slate-400 font-mono">B2B Leads Engine</span>
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
                onClick={handleSearchLeads}
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

          {searchMeta?.message && (
            <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-slate-400 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{searchMeta.message}</span>
            </div>
          )}
        </div>

        {/* Step 2 & 3 Grid: Lead Table & Message Customizer */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Left Panel: Leads Table (7 Columns) */}
          <div className="lg:col-span-7 bg-slate-900/70 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-teal-400" /> Discovered Leads ({leads.length})
                </h3>
                <p className="text-[11px] text-slate-400">Select leads to send customized WhatsApp messages.</p>
              </div>

              {leads.length > 0 && (
                <button
                  onClick={toggleSelectAll}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold rounded-lg border border-slate-700 transition-colors"
                >
                  {selectedLeads.length === leads.length ? 'Deselect All' : 'Select All'}
                </button>
              )}
            </div>

            {leads.length === 0 ? (
              <div className="py-16 text-center text-slate-500 space-y-3">
                <Search className="w-10 h-10 mx-auto text-slate-700" />
                <p className="text-xs">Click <strong className="text-slate-300">"Find Target Leads"</strong> above to search and discover business contacts.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
                {leads.map((lead, idx) => {
                  const isChecked = selectedLeads.includes(lead.id);
                  return (
                    <div
                      key={lead.id}
                      className={`p-4 rounded-xl border transition-all ${
                        isChecked
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
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-white">{lead.name}</span>
                              <span className="text-[10px] font-semibold px-2 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full flex items-center gap-1">
                                <Star className="w-2.5 h-2.5 fill-amber-300" /> {lead.rating}
                              </span>
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
          </div>

          {/* Right Panel: Template Customizer & Dispatch (5 Columns) */}
          <div className="lg:col-span-5 bg-slate-900/70 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-2xl">
            <div className="border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-emerald-400" /> Step 2: WhatsApp Outreach Blueprint
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Customize template variables for peak B2B conversion.</p>
            </div>

            {/* Template Editor */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 block">Outreach Message Template:</label>
              <textarea
                rows={9}
                value={template}
                onChange={(e) => setTemplate(e.target.value)}
                className="w-full p-4 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-slate-200 focus:outline-none focus:border-emerald-500 transition-colors leading-relaxed shadow-inner"
              />
              <p className="text-[11px] text-slate-500">Available variables: <code className="text-emerald-400">{"{{business_name}}"}</code>, <code className="text-emerald-400">{"{{location}}"}</code></p>
            </div>

            {/* Live Message Sample Preview */}
            {leads.length > 0 && (
              <div className="p-4 bg-emerald-950/20 border border-emerald-500/30 rounded-xl space-y-2">
                <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wide">Live Preview for {leads[0].name}:</span>
                <p className="text-xs font-mono text-slate-300 whitespace-pre-wrap leading-relaxed">
                  {getCustomizedMessage(leads[0])}
                </p>
              </div>
            )}

            {/* Bulk Action Dispatcher */}
            <div className="pt-2 border-t border-slate-800 space-y-3">
              <button
                onClick={handleBulkOutreach}
                disabled={sending || selectedLeads.length === 0}
                className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/20 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
              >
                {sending ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Launching WhatsApp Chats...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Launch WhatsApp Outreach ({selectedLeads.length} Selected Leads)</span>
                  </>
                )}
              </button>
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
