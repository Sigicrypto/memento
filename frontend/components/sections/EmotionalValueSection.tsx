import React from "react";
import { Smile, HeartHandshake, Clapperboard, PartyPopper, Aperture, UsersRound } from "lucide-react";

export default function EmotionalValueSection() {
  const valuePoints = [
    {
      icon: <Smile className="w-6 h-6 text-accent" />,
      badgeBg: "bg-accent/10 border-accent/20",
      title: "Friends Laughing",
      description: "Candid reactions and inside jokes from every table that formal shoots miss.",
    },
    {
      icon: <HeartHandshake className="w-6 h-6 text-primary" />,
      badgeBg: "bg-primary/10 border-primary/20",
      title: "Family Reactions",
      description: "Tears of joy, proud hugs, and intimate moments across the banquet hall.",
    },
    {
      icon: <Clapperboard className="w-6 h-6 text-accent" />,
      badgeBg: "bg-accent/10 border-accent/20",
      title: "Behind the Scenes",
      description: "Getting-ready chaos, bridal suite giggles, and pre-ceremony excitement.",
    },
    {
      icon: <PartyPopper className="w-6 h-6 text-primary" />,
      badgeBg: "bg-primary/10 border-primary/20",
      title: "Dance-Floor Magic",
      description: "The electric moves, wild sing-alongs, and energy after midnight.",
    },
    {
      icon: <Aperture className="w-6 h-6 text-accent" />,
      badgeBg: "bg-accent/10 border-accent/20",
      title: "Unexpected Moments",
      description: "Serendipitous guest magic that no single photographer could catch.",
    },
    {
      icon: <UsersRound className="w-6 h-6 text-primary" />,
      badgeBg: "bg-primary/10 border-primary/20",
      title: "Every Perspective",
      description: "Your once-in-a-lifetime celebration seen through the eyes of everyone who loves you.",
    },
  ];

  return (
    <section className="w-full py-20 px-4 md:px-8 bg-bg-subtle flex flex-col items-center justify-center">
      <div className="max-w-6xl w-full mx-auto flex flex-col items-center text-center">
        
        <span className="inline-block px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-semibold tracking-wider uppercase mb-4">
          WHY GUESTS' PHOTOS MATTER
        </span>

        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-text-primary tracking-tight max-w-3xl leading-tight">
          Your Photographer Captures the Big Moments.<br />
          <span className="text-accent">Your Guests Capture Everything Else.</span>
        </h2>

        <p className="text-text-secondary text-base md:text-lg max-w-3xl mt-4">
          Professional photographers focus on planned milestones. Memento brings together the hundreds of unscripted, genuine moments happening all across the room.
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
