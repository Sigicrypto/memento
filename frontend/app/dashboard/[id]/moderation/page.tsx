"use client";

import React, { use } from 'react';
import Link from 'next/link';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import dynamic from 'next/dynamic';

const ModerationQueue = dynamic(() => import('@/components/ModerationQueue'), { ssr: false });

export default function ModerationPage({ params }: { params: Promise<{ id: string }> }) {
  // Use React.use to unwrap the Promise
  const resolvedParams = use(params);
  const eventId = resolvedParams.id;
  
  return (
    <div className="min-h-screen bg-slate-950 p-4 md:p-8 flex flex-col">
      <div className="max-w-7xl mx-auto w-full flex-1 flex flex-col h-full">
        {/* Top Nav */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/5">
          <Link 
            href="/dashboard"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={16} /> Back to Dashboard
          </Link>
          
          <div className="flex items-center gap-4">
            <Link 
              href={`/wall/${eventId}`} 
              target="_blank"
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-sm font-bold rounded-lg transition-colors"
            >
              Open Live Wall <ExternalLink size={14} />
            </Link>
          </div>
        </div>

        {/* Moderation Component */}
        <div className="flex-1 h-[calc(100vh-180px)] min-h-[600px]">
          <ModerationQueue eventId={eventId} />
        </div>
      </div>
    </div>
  );
}
