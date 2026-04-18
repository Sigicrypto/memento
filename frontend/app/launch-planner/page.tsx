"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import AnimatedLogo from "@/components/AnimatedLogo";

type ChecklistItem = {
  id: string;
  label: string;
  done: boolean;
  notes?: string;
};

type ChecklistCategory = {
  id: string;
  title: string;
  description: string;
  items: ChecklistItem[];
};

const defaultChecklist: ChecklistCategory[] = [
  {
    id: "core",
    title: "Core Platform",
    description: "Essential features for the Memento event experience",
    items: [
      { id: "c1", label: "Finalize Photo Upload constraints (Max MB, Format)", done: false },
      { id: "c2", label: "Implement 'Auto Album' creation logic (Standard+)", done: false },
      { id: "c3", label: "Music integration for live slideshow mode", done: false },
      { id: "c4", label: "Provide 'Download All ZIP' feature post-event", done: false },
    ],
  },
  {
    id: "security",
    title: "Security & Data Storage",
    description: "Supabase policies, edge functions, and lifecycle rules",
    items: [
      { id: "s1", label: "Verify Row Level Security (RLS) on Event/Photos table", done: false },
      { id: "s2", label: "Set up storage auto-deletion cron job based on tier (1 mo, 3 mo, 6 mo)", done: false },
      { id: "s3", label: "Content moderation queue UI (Approve/Reject)", done: false },
    ],
  },
  {
    id: "monetization",
    title: "Payments & Checkouts",
    description: "Razorpay/Stripe webhooks and booster addons",
    items: [
      { id: "m1", label: "Complete Razorpay webhook listener for 'Order Paid' status", done: false },
      { id: "m2", label: "Implement Booster Addons in checkout summary (Extra storage, Social Live Feed)", done: false },
      { id: "m3", label: "Add loading states & error handling on checkout failure", done: false },
    ],
  },
  {
    id: "marketing",
    title: "Marketing & SEO",
    description: "Growth loops and analytics",
    items: [
      { id: "mk1", label: "Dynamic OpenGraph generation for public Walls", done: false },
      { id: "mk2", label: "Integrate Posthog or Google Analytics", done: false },
      { id: "mk3", label: "Welcome email automation (SendGrid/Resend)", done: false },
    ],
  },
  {
    id: "legal",
    title: "Legal & Compliance",
    description: "Terms, privacy, and notices",
    items: [
      { id: "l1", label: "Final review of Privacy Policy for photo handling compliance", done: false },
      { id: "l2", label: "Final review of Terms of Service", done: false },
      { id: "l3", label: "Cookie consent banner functionality", done: false },
    ],
  },
];

export default function LaunchPlanner() {
  const [data, setData] = useState<ChecklistCategory[] | null>(null);

  useEffect(() => {
    // Load from local storage
    const saved = localStorage.getItem("memento_launch_checklist");
    if (saved) {
      try {
        setData(JSON.parse(saved));
      } catch (e) {
        setData(defaultChecklist);
      }
    } else {
      setData(defaultChecklist);
    }
  }, []);

  // Save to local storage whenever data changes
  useEffect(() => {
    if (data) {
      localStorage.setItem("memento_launch_checklist", JSON.stringify(data));
    }
  }, [data]);

  const toggleItem = (categoryId: string, itemId: string) => {
    setData((prev) => {
      if (!prev) return null;
      return prev.map((cat) => {
        if (cat.id === categoryId) {
          return {
            ...cat,
            items: cat.items.map((it) =>
              it.id === itemId ? { ...it, done: !it.done } : it
            ),
          };
        }
        return cat;
      });
    });
  };

  const calculateProgress = () => {
    if (!data) return { total: 0, completed: 0, percent: 0 };
    let total = 0;
    let completed = 0;
    data.forEach((cat) => {
      cat.items.forEach((it) => {
        total++;
        if (it.done) completed++;
      });
    });
    return {
      total,
      completed,
      percent: total > 0 ? Math.round((completed / total) * 100) : 0,
    };
  };

  const { total, completed, percent } = calculateProgress();

  if (!data) {
    return (
      <div className="lp flex items-center justify-center min-h-screen">
        <div className="pulse-dot w-6 h-6"></div>
      </div>
    );
  }

  return (
    <div className="lp min-h-screen pt-24 pb-20 px-4 md:px-8">
      {/* Background aesthetics */}
      <div className="orbs">
        <div className="orb orb1" />
        <div className="orb orb2" />
        <div className="orb orb3" />
      </div>
      <div className="floating-shapes">
        <div className="shape s-cross s-1">✦</div>
        <div className="shape s-circle s-2" />
        <div className="shape s-star s-3">★</div>
      </div>
      <div className="grain" />

      {/* Navigation Override */}
      <nav className="lp-nav scrolled flex items-center justify-between px-6 py-4 rounded-2xl mx-auto max-w-5xl mt-4 z-50 relative bg-white/50 border border-white/60 shadow-lg backdrop-blur-xl">
        <Link href="/" className="nav-logo">
          <AnimatedLogo width={160} height={50} />
        </Link>
        <Link href="/" className="btn-outline hidden md:inline-flex py-2 px-4 text-sm bg-white/50">
          ← Back to Site
        </Link>
      </nav>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto mt-12 relative z-10">
        <div className="text-center mb-12 reveal visible">
          <span className="kicker">Road to go-live</span>
          <h1 className="hero-h1 text-5xl md:text-6xl mb-4">
            Market Release <span className="gradient-text">Planner</span>
          </h1>
          <p className="sec-sub">
            Your interactive checklist. Everything needed before launching Memento to the world. <br/>
            <span className="text-amber-500 font-medium text-sm">Progress is saved locally to your browser.</span>
          </p>
        </div>

        {/* Global Progress Bar */}
        <div className="mb-12 reveal visible" style={{ animationDelay: '0.1s' }}>
          <div className="gcard overflow-hidden !rounded-2xl">
            <div className="gcard-border" />
            <div className="gcard-inner p-6 md:p-8 flex flex-col md:flex-row items-center gap-6">
              <div className="w-24 h-24 shrink-0 rounded-full flex items-center justify-center border-4 border-amber-200/40 relative shadow-inner">
                 <svg className="w-24 h-24 absolute -rotate-90">
                    <circle cx="48" cy="48" r="44" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-slate-100/50" />
                    <circle cx="48" cy="48" r="44" stroke="currentColor" strokeWidth="4" fill="transparent" strokeDasharray="276.4" strokeDashoffset={276.4 - (276.4 * percent) / 100} className="text-amber-500 transition-all duration-1000 ease-in-out" />
                 </svg>
                 <span className="text-xl font-bold gradient-text">{percent}%</span>
              </div>
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-2xl font-bold text-slate-800">Launch Readiness</h2>
                <p className="text-slate-600 mt-1">You have completed {completed} out of {total} essential tasks.</p>
              </div>
              <button onClick={() => { if(confirm("Are you sure you want to reset all tasks?")) { setData(defaultChecklist); } }} className="text-sm px-4 py-2 text-rose-500 bg-rose-50 rounded-xl hover:bg-rose-100 transition-colors font-semibold">
                Reset All
              </button>
            </div>
          </div>
        </div>

        {/* Categories Grid */}
        <div className="space-y-8">
          {data.map((category, catIdx) => {
             const catTotal = category.items.length;
             const catDone = category.items.filter(i => i.done).length;
             const catPercent = catTotal > 0 ? Math.round((catDone / catTotal) * 100) : 0;
             const isComplete = catPercent === 100;

             return (
              <div key={category.id} className="reveal visible" style={{ animationDelay: `${0.15 + (catIdx * 0.1)}s` }}>
                <div className={`gcard overflow-hidden transition-all duration-500 ${isComplete ? 'opacity-80' : ''}`}>
                  <div className="gcard-border" />
                  <div className="gcard-inner !p-0">
                    <div className="p-6 md:p-8 border-b border-white/40 bg-white/20">
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <h3 className={`text-2xl font-bold mb-1 flex items-center gap-3 ${isComplete ? 'text-amber-600' : 'text-slate-800'}`}>
                            {category.title}
                            {isComplete && <span className="text-xl">🙌</span>}
                          </h3>
                          <p className="text-slate-600 text-sm md:text-base">{category.description}</p>
                        </div>
                        <span className="text-sm font-bold px-3 py-1 bg-white/50 rounded-full border border-white text-slate-700 shadow-sm shrink-0">
                          {catDone} / {catTotal}
                        </span>
                      </div>
                      
                      {/* Mini Category Progress */}
                      <div className="w-full bg-white/40 h-1.5 rounded-full mt-5 overflow-hidden shadow-inner">
                         <div className="h-full bg-gradient-to-r from-amber-400 to-rose-400 transition-all duration-500" style={{ width: `${catPercent}%` }}></div>
                      </div>
                    </div>

                    <div className="p-4 md:p-6 bg-white/10">
                      <div className="flex flex-col gap-3">
                        {category.items.map((item) => (
                          <label key={item.id} className={`flex items-start gap-4 p-4 rounded-xl cursor-pointer border transition-all duration-300
                             ${item.done 
                                ? 'bg-white/40 border-green-200/50 hover:bg-white/60' 
                                : 'bg-white/60 border-white/60 shadow-sm hover:shadow-md hover:-translate-y-0.5'}`}
                          >
                            <div className="relative flex items-center justify-center shrink-0 mt-0.5">
                              <input 
                                type="checkbox" 
                                className="peer appearance-none w-6 h-6 border-2 border-amber-300 rounded-lg checked:bg-amber-400 checked:border-amber-400 cursor-pointer transition-colors shadow-inner"
                                checked={item.done}
                                onChange={() => toggleItem(category.id, item.id)}
                              />
                              <svg className="absolute w-4 h-4 text-white opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12"></polyline>
                              </svg>
                            </div>
                            <span className={`text-base font-medium flex-1 ${item.done ? 'text-slate-500 line-through decoration-slate-300' : 'text-slate-800'}`}>
                              {item.label}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Polish */}
        <div className="mt-16 text-center text-slate-500 text-sm reveal visible" style={{animationDelay: '0.8s'}}>
          Remember – Quality over speed. Market release is a one-way door. <br/>
          <span className="text-rose-400">♥</span> Internal Memento Tool
        </div>
      </main>
    </div>
  );
}
