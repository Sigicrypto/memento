import React from "react";
import { Smile, HeartHandshake, Clapperboard } from "lucide-react";

export default function EmotionalValueSection() {
  const valuePoints = [
    {
      icon: <Smile className="w-6 h-6 text-accent" />,
      badgeBg: "bg-accent/10 border-accent/20",
      title: "Candid Moments",
      benefit: "Spontaneous Candids",
      description: "Unscripted table laughter and unexpected moments crews miss.",
    },
    {
      icon: <HeartHandshake className="w-6 h-6 text-primary" />,
      badgeBg: "bg-primary/10 border-primary/20",
      title: "Family & Guests",
      benefit: "360° Perspective",
      description: "Tears, hugs, and genuine reactions across every table.",
    },
    {
      icon: <Clapperboard className="w-6 h-6 text-accent" />,
      badgeBg: "bg-accent/10 border-accent/20",
      title: "Behind the Scenes",
      benefit: "All-Day Energy",
      description: "Pre-event prep chaos and late-night dance floor magic.",
    },
  ];

  return (
    <section className="w-full py-20 md:py-28 px-4 md:px-8 bg-bg-subtle border-b border-border flex flex-col items-center justify-center">
      <div className="max-w-6xl w-full mx-auto flex flex-col items-center text-center">
        
        <span className="inline-block px-3.5 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-bold tracking-wider uppercase mb-4">
          THE STUDIO ADVANTAGE
        </span>

        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-text-primary tracking-tight max-w-3xl leading-tight font-display">
          You Capture the Masterpieces.<br />
          <span className="text-accent">Your Guests Capture Every Other Angle.</span>
        </h2>

        <p className="text-text-secondary text-base md:text-lg max-w-3xl mt-4 leading-relaxed">
          Give your couples 360° wedding coverage no single photography crew can achieve alone — without hiring second shooters or renting extra gear.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl mt-12 text-center">
          {valuePoints.map((point) => (
            <div
              key={point.title}
              className="bg-surface border border-border rounded-2xl p-6 hover:shadow-card-hover hover:-translate-y-0.5 transition-all flex flex-col items-center text-center h-full justify-start shadow-card"
            >
              <div className={`w-12 h-12 rounded-xl border flex items-center justify-center mb-4 mx-auto ${point.badgeBg}`}>
                {point.icon}
              </div>
              <span className="text-[11px] font-bold text-accent uppercase tracking-wider mb-1">
                {point.benefit}
              </span>
              <h3 className="text-text-primary font-bold text-lg text-center mb-2">
                {point.title}
              </h3>
              <p className="text-text-secondary text-sm text-center leading-relaxed">
                {point.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
