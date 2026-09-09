import React from "react";
import { Smile, HeartHandshake, Clapperboard, PartyPopper, Aperture, UsersRound } from "lucide-react";

export default function EmotionalValueSection() {
  const valuePoints = [
    {
      icon: <Smile className="w-6 h-6 text-accent" />,
      badgeBg: "bg-accent/10 border-accent/20",
      title: "Friends Laughing",
      benefit: "Table-Level Candids",
      description: "Candid guest laughter and inside jokes from every table that formal portrait shoots miss — with zero extra crew hours.",
    },
    {
      icon: <HeartHandshake className="w-6 h-6 text-primary" />,
      badgeBg: "bg-primary/10 border-primary/20",
      title: "Family Reactions",
      benefit: "Outer-Row Coverage",
      description: "Tears of joy and proud hugs in the outer rows while your primary team stays locked on the stage rituals and sacred vows.",
    },
    {
      icon: <Clapperboard className="w-6 h-6 text-accent" />,
      badgeBg: "bg-accent/10 border-accent/20",
      title: "Behind the Scenes",
      benefit: "Pre-Arrival Moments",
      description: "Getting-ready chaos and baraat car rides captured by guests before your team's scheduled call time.",
    },
    {
      icon: <PartyPopper className="w-6 h-6 text-primary" />,
      badgeBg: "bg-primary/10 border-primary/20",
      title: "Dance-Floor Magic",
      benefit: "After-Hours Energy",
      description: "The wild moves, sing-alongs, and late-night energy that keep flowing long after your contracted coverage hours wrap up.",
    },
    {
      icon: <Aperture className="w-6 h-6 text-accent" />,
      badgeBg: "bg-accent/10 border-accent/20",
      title: "Unexpected Moments",
      benefit: "Multi-Zone Reach",
      description: "Simultaneous spontaneous moments across massive multi-acre banquet lawns and halls that no single camera crew can reach.",
    },
    {
      icon: <UsersRound className="w-6 h-6 text-primary" />,
      badgeBg: "bg-primary/10 border-primary/20",
      title: "Every Perspective",
      benefit: "10x Larger Gallery",
      description: "Turn 200 guest phones into your studio's auxiliary cameras, delivering a 10x richer gallery to your clients under your brand.",
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full mt-12 text-center">
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
