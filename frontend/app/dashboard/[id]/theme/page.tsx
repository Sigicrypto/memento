"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Palette, ArrowLeft, Check, Layout, Sparkles } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const THEMES = [
  { id: 'dark', name: 'Midnight (Default)', bg: 'bg-black', text: 'text-white', accent: 'bg-indigo-500' },
  { id: 'light', name: 'Clean White', bg: 'bg-white', text: 'text-black', accent: 'bg-blue-500' },
  { id: 'wedding', name: 'Champagne', bg: 'bg-stone-100', text: 'text-stone-800', accent: 'bg-amber-600' },
  { id: 'party', name: 'Neon Nights', bg: 'bg-purple-900', text: 'text-white', accent: 'bg-pink-500' },
];

export default function ThemeCustomizationPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTheme, setActiveTheme] = useState('dark');
  const [customFont, setCustomFont] = useState('Inter');

  useEffect(() => {
    async function fetchEvent() {
      const { data } = await supabase.from('events').select('theme, custom_font').eq('id', id).single();
      if (data) {
        if (data.theme) setActiveTheme(data.theme);
        if (data.custom_font) setCustomFont(data.custom_font);
      }
      setLoading(false);
    }
    fetchEvent();
  }, [id]);

  const saveTheme = async () => {
    setSaving(true);
    await supabase.from('events').update({ theme: activeTheme, custom_font: customFont }).eq('id', id);
    setSaving(false);
    alert('Theme updated successfully!');
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="min-h-screen p-8">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-text-muted hover:text-black dark:hover:text-text-primary mb-8 transition-colors">
        <ArrowLeft size={16} /> Back to Dashboard
      </button>

      <div className="flex justify-between items-end mb-10">
        <div>
          <h1 className="text-4xl font-bold mb-2 flex items-center gap-3"><Palette className="text-primary" /> Theme Customization</h1>
          <p className="text-text-secondary">Personalize how your photo wall looks to guests.</p>
        </div>
        <button onClick={saveTheme} disabled={saving} className="btn-premium px-8 py-3">
           {saving ? 'Saving...' : 'Save Theme'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="space-y-8">
          <div className="glass-panel p-8">
             <h3 className="text-xl font-bold mb-6">Select a Theme</h3>
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               {THEMES.map(theme => (
                 <button 
                   key={theme.id}
                   onClick={() => setActiveTheme(theme.id)}
                   className={`p-4 rounded-2xl border-2 text-left transition-all relative overflow-hidden ${activeTheme === theme.id ? 'border-primary bg-primary/10' : 'border-black/10 dark:border-border hover:border-black/20 dark:border-black/10 dark:border-white/30 bg-bg-subtle'}`}
                 >
                   <div className="flex justify-between items-center mb-4">
                     <span className="font-bold">{theme.name}</span>
                     {activeTheme === theme.id && <Check size={18} className="text-primary" />}
                   </div>
                   <div className="flex gap-2 h-10 w-full rounded-lg overflow-hidden border border-black/20">
                     <div className={`flex-[3] ${theme.bg}`} />
                     <div className={`flex-[1] ${theme.accent}`} />
                   </div>
                 </button>
               ))}
             </div>
          </div>

          <div className="glass-panel p-8">
             <h3 className="text-xl font-bold mb-6">Typography</h3>
             <select 
               value={customFont}
               onChange={(e) => setCustomFont(e.target.value)}
               className="w-full bg-bg-subtle border border-border rounded-xl px-4 py-4 focus:outline-none focus:border-primary"
             >
               <option value="Inter">Inter (Modern, Clean)</option>
               <option value="Playfair Display">Playfair Display (Elegant, Wedding)</option>
               <option value="Outfit">Outfit (Geometric, Tech)</option>
               <option value="Comic Sans MS">Comic Sans (Why not?)</option>
             </select>
          </div>
        </div>

        {/* Live Preview */}
        <div className="sticky top-8">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2"><Layout size={20} className="text-text-muted" /> Live Preview</h3>
          <div className="aspect-[4/3] rounded-3xl overflow-hidden border border-border relative shadow-2xl">
            {/* Theming injection for preview */}
            <div className={`absolute inset-0 p-8 flex flex-col items-center justify-center text-center ${THEMES.find(t => t.id === activeTheme)?.bg} ${THEMES.find(t => t.id === activeTheme)?.text}`} style={{ fontFamily: customFont }}>
               <Sparkles className="mb-4 opacity-50" size={32} />
               <h2 className="text-4xl font-bold mb-4">Welcome to our Event</h2>
               <p className="opacity-80 max-w-sm mb-8">Scan the QR code to join the live memory wall and share your photos instantly.</p>
               <div className={`px-6 py-3 rounded-full font-bold text-text-primary shadow-lg ${THEMES.find(t => t.id === activeTheme)?.accent}`}>
                 Upload a Photo
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
