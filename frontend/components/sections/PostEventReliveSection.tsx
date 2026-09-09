import React from "react";
import { FolderArchive, Calendar, Share2, Film } from "lucide-react";

export default function PostEventReliveSection() {
  const highlights = [
    {
      icon: <FolderArchive className="w-5 h-5 text-accent" />,
      bg: "bg-accent/10 border border-accent/20",
      title: "One-Click Download",
      description: "Download every photo in full resolution as a single ZIP file",
      badge: null,
    },
    {
      icon: <Calendar className="w-5 h-5 text-primary" />,
      bg: "bg-primary/10 border border-primary/20",
      title: "Timeline View",
      description: "Browse memories chronologically, from first arrival to last dance",
      badge: null,
    },
    {
      icon: <Share2 className="w-5 h-5 text-primary" />,
      bg: "bg-primary/10 border border-primary/20",
      title: "Private Sharing Link",
      description: "Share your gallery — viewers don't need an account",
      badge: null,
    },
    {
      icon: <Film className="w-5 h-5 text-accent" />,
      bg: "bg-accent/10 border border-accent/20",
      title: "Curated Highlight Reels",
      description: "Auto-surface the best crowd shots and create recap slideshows",
      badge: "Coming Soon",
    },
  ];

  return (
    <section className="w-full py-20 md:py-28 px-4 md:px-8 bg-bg-subtle border-b border-border flex flex-col items-center justify-center">
      <div className="max-w-6xl w-full mx-auto flex flex-col items-center text-center">
        
        <span className="inline-block px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-semibold tracking-wider uppercase mb-4">
          AFTER THE EVENT
        </span>

        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-text-primary tracking-tight max-w-3xl">
          One Event. Every Perspective. One Beautiful Archive.
        </h2>

        <p className="text-text-secondary text-base md:text-lg max-w-3xl mt-4">
          Your memories, beautifully organized and ready to relive whenever you want.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full mt-12 text-center">
          {highlights.map((item) => (
            <div
              key={item.title}
              className="bg-surface border border-border rounded-2xl p-6 flex flex-col items-center text-center shadow-card hover:shadow-card-hover transition-all h-full justify-start"
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 mx-auto ${item.bg}`}>
                {item.icon}
              </div>
              <div className="flex items-center justify-center gap-2 mb-2 flex-wrap">
                <h3 className="text-text-primary font-bold text-base text-center">{item.title}</h3>
                {item.badge && (
                  <span className="px-2 py-0.5 rounded-full bg-accent/15 border border-accent/25 text-accent text-[10px] font-bold uppercase tracking-wider">
                    {item.badge}
                  </span>
                )}
              </div>
              <p className="text-text-secondary text-sm leading-relaxed text-center">{item.description}</p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
