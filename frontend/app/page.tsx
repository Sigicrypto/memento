"use client";

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import AnimatedLogo from '@/components/AnimatedLogo';
import './landing.css';

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [currency, setCurrency] = useState({ showINR: false });
  const [showingINR, setShowingINR] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });

    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
    }, { threshold: 0.1 });
    document.querySelectorAll('.reveal').forEach(el => obs.observe(el));

    const cards = document.querySelectorAll('.gcard');
    cards.forEach(card => {
      const el = card as HTMLElement;
      el.addEventListener('mousemove', (e) => {
        const r = el.getBoundingClientRect();
        const x = e.clientX - r.left, y = e.clientY - r.top;
        el.style.setProperty('--mx', `${x}px`);
        el.style.setProperty('--my', `${y}px`);
      });
    });

    (async () => {
      let isIndia = false;
      try {
        const res = await fetch('https://ipapi.co/json/', { signal: AbortSignal.timeout(4000) });
        isIndia = (await res.json()).country_code === 'IN';
      } catch { isIndia = (Intl.DateTimeFormat().resolvedOptions().timeZone || '').includes('Kolkata'); }
      setCurrency({ showINR: isIndia });
      if (isIndia) setShowingINR(true);
    })();

    return () => { window.removeEventListener('scroll', onScroll); obs.disconnect(); };
  }, []);

  const Free = "0";
  const Starter = showingINR ? "2,500" : "30";
  const Pro = showingINR ? "5,000" : "60";
  const Premium = showingINR ? "7,500" : "90";
  const WhiteLabel = showingINR ? "10,000" : "120";
  const Sym = showingINR ? "₹" : "$";

  return (
      <div className="lp pt-[calc(140px+env(safe-area-inset-top))]">

      <div className="orbs">
        <div className="orb orb1" />
        <div className="orb orb2" />
        <div className="orb orb3" />
      </div>

      <div className="grain" />

      {/* NAV */}
      <nav className={`lp-nav ${scrolled ? 'scrolled' : ''}`}>
        <Link href="/">
          <AnimatedLogo width={220} height={80} />
        </Link>
        <div className="nav-mid">
          <Link href="#features">Features</Link>
          <Link href="#how">How it works</Link>
          <Link href="#pricing">Pricing</Link>
        </div>
        <Link href="/pricing" className="nav-btn">
          Get Started
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </Link>
      </nav>

      {/* HERO */}
      <section className="hero pt-16 md:pt-20">

        <h1 className="hero-h1 reveal leading-tight md:leading-[1.1]">
          Your Event.
          <br />
          <span className="gradient-text">Every Memory. Live.</span>
        </h1>
        <p className="hero-p reveal">
          Guests scan a QR code, snap photos, and watch them appear live on a stunning wall. No app needed.
        </p>
        <div className="hero-btns reveal">
          <Link href="/pricing" className="btn-glow">
            <span>Create Your Wall</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </Link>
          <Link href="/demo" className="btn-outline">
            <span>🎬 Demo Wall</span>
          </Link>
        </div>
        <div className="hero-visual reveal">
          {/* Left phone — Upload view */}
          <div className="phone-mockup">
            <div className="phone-notch" />
            <div className="phone-screen">
              <div className="phone-header">
                <span className="phone-title">Upload</span>
                <span className="phone-live"><span className="pulse-dot" /> Live</span>
              </div>
              <div className="phone-grid">
                {[
                  { src: '/landing-hero/photo1.jpg', alt: 'Guest photo 1' },
                  { src: '/landing-hero/photo2.jpg', alt: 'Guest photo 2' },
                  { src: '/landing-hero/photo3.jpg', alt: 'Guest photo 3' },
                  { src: '/landing-hero/photo4.jpg', alt: 'Guest photo 4' }
                ].map((img, i) => (
                  <div key={i} className="phone-photo" style={{ background: `linear-gradient(135deg, rgba(245,158,11,${0.15 + i*0.05}), rgba(244,114,182,${0.1 + i*0.05}))`, animationDelay: `${0.8 + i * 0.2}s` }}>
                    <img src={img.src} alt={img.alt} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }} />
                  </div>
                ))}
              </div>
              <div className="phone-upload-bar">
                ⬆ Uploading...
                <div className="upload-progress"><div className="upload-progress-bar" /></div>
              </div>
            </div>
          </div>

          {/* Center phone — Live Wall */}
          <div className="phone-mockup phone-c">
            <div className="phone-notch" />
            <div className="phone-screen">
              <div className="phone-header">
                <span className="phone-title">Sarah&apos;s Wedding</span>
                <span className="phone-live"><span className="pulse-dot" /> 24 Live</span>
              </div>
              <div className="phone-grid">
                {[
                  { src: '/landing-hero/photo5.jpg', alt: 'Wedding photo 1' },
                  { src: '/landing-hero/photo6.jpg', alt: 'Wedding photo 2' },
                  { src: '/landing-hero/photo7.jpg', alt: 'Wedding photo 3' },
                  { src: '/landing-hero/photo8.jpg', alt: 'Wedding photo 4' },
                  { src: '/landing-hero/photo9.jpg', alt: 'Wedding photo 5' },
                  { src: '/landing-hero/photo10.jpg', alt: 'Wedding photo 6' }
                ].map((img, i) => (
                  <div key={i} className="phone-photo" style={{ background: `linear-gradient(135deg, rgba(${200+i*10},${100+i*15},${50+i*20},0.3), rgba(244,114,182,0.15))`, animationDelay: `${0.5 + i * 0.15}s` }}>
                    <img src={img.src} alt={img.alt} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }} />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right phone — QR Scan */}
          <div className="phone-mockup phone-r">
            <div className="phone-notch" />
            <div className="phone-screen">
              <div className="phone-header">
                <span className="phone-title">Join Wall</span>
              </div>
              <div className="phone-qr">QR</div>
              <p className="phone-scan-text">Scan to join the live wall</p>
              <div className="phone-grid" style={{ marginTop: '0.75rem' }}>
                {[
                  { src: '/landing-hero/photo11.jpg', alt: 'Guest photo 1' },
                  { src: '/landing-hero/photo12.jpg', alt: 'Guest photo 2' }
                ].map((img, i) => (
                  <div key={i} className="phone-photo" style={{ background: `linear-gradient(135deg, rgba(252,211,77,0.2), rgba(245,158,11,0.15))`, animationDelay: `${1.2 + i * 0.2}s` }}>
                    <img src={img.src} alt={img.alt} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="stats reveal">
        {[
          { val: '∞', label: 'Photos per wall' },
          { val: '0s', label: 'App install time' },
          { val: '<3s', label: 'Upload speed' },
          { val: '0', label: 'Hidden fees' },
        ].map((s, i) => (
          <div key={i} className="stat">
            <span className="stat-val">{s.val}</span>
            <span className="stat-lbl">{s.label}</span>
          </div>
        ))}
      </section>

      {/* FEATURES */}
      <section id="features" className="sec">
        <span className="kicker reveal">Features</span>
        <h2 className="sec-h2 reveal">Everything you need. <span className="gradient-text">Built in.</span></h2>

        <div className="feat-grid">
          {[
            { icon: '📺', title: 'Live Slideshow', desc: 'Auto-plays on any screen. Cast to TV or projector for a stunning real-time display.', big: true },
            { icon: '📷', title: 'Polaroid Gallery', desc: 'Beautiful framed photos with captions and gentle float animations.' },
            { icon: '🔒', title: 'Private Walls', desc: 'Password-protect your wall. Approve photos before they go live.' },
            { icon: '📱', title: 'Mobile First', desc: 'Optimized for phones. Each guest gets their own personal photo page.' },
            { icon: '⚡', title: 'Real-time Sync', desc: 'Zero delay. Photos appear the instant they\'re uploaded.' },
            { icon: '🛡️', title: 'Moderation', desc: 'Full control. Approve or remove any photo with one tap.' },
          ].map((f, i) => (
            <div key={i} className={`gcard feat-card ${f.big ? 'feat-big' : ''} reveal`} style={{ animationDelay: `${i * 0.08}s` }}>
              <div className="gcard-border" />
              <div className="gcard-inner">
                <span className="feat-icon">{f.icon}</span>
                <h3 className="feat-title">{f.title}</h3>
                <p className="feat-desc">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="sec">
        <span className="kicker reveal">How it works</span>
        <h2 className="sec-h2 reveal">Three steps. <span className="gradient-text">That&apos;s it.</span></h2>
        <p className="sec-sub reveal">No downloads. No accounts. No friction.</p>

        <div className="steps">
          {[
            { num: '01', icon: '🎉', title: 'Create Your Event', desc: 'Name it and get a shareable QR code in under a minute.' },
            { num: '02', icon: '📲', title: 'Guests Scan & Share', desc: 'No app. No login. Just scan the QR and upload photos instantly.' },
            { num: '03', icon: '✨', title: 'Watch It Come Alive', desc: 'Every photo streams live into a beautiful gallery for everyone.' },
          ].map((s, i) => (
            <div key={i} className="gcard step-card reveal" style={{ animationDelay: `${i * 0.12}s` }}>
              <div className="gcard-border" />
              <div className="gcard-inner">
                <span className="step-num">{s.num}</span>
                <span className="step-icon">{s.icon}</span>
                <h3 className="step-title">{s.title}</h3>
                <p className="step-desc">{s.desc}</p>
              </div>
            </div>
          ))}
          <div className="steps-line" />
        </div>
      </section>

      {/* IMAGE GALLERY */}
      <section className="sec">
        <span className="kicker reveal">Gallery</span>
        <h2 className="sec-h2 reveal">Real <span className="gradient-text">Event Walls</span></h2>
        <p className="sec-sub reveal">See how people are using Memento to capture their special moments</p>

        <div className="gallery-grid reveal">
          {[
            { title: 'Sarah & John Wedding', src: 'https://picsum.photos/400/300?random=1', count: '156 photos' },
            { title: 'Tech Conference 2024', src: 'https://picsum.photos/400/300?random=2', count: '289 photos' },
            { title: 'Birthday Celebration', src: 'https://picsum.photos/400/300?random=3', count: '87 photos' },
            { title: 'Corporate Gala', src: 'https://picsum.photos/400/300?random=4', count: '234 photos' },
            { title: 'Graduation Party', src: 'https://picsum.photos/400/300?random=5', count: '145 photos' },
            { title: 'Festival Weekend', src: 'https://picsum.photos/400/300?random=6', count: '512 photos' }
          ].map((item, i) => (
            <div key={i} className="gallery-item" style={{ animationDelay: `${i * 0.1}s` }}>
              <div className="gallery-img-wrapper">
                <img src={item.src} alt={item.title} className="gallery-img" />
                <div className="gallery-overlay">
                  <h3 className="gallery-title">{item.title}</h3>
                  <p className="gallery-count">{item.count}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="sec">
        <span className="kicker reveal">Testimonials</span>
        <h2 className="sec-h2 reveal">Loved by <span className="gradient-text">Event Organizers</span></h2>
        <p className="sec-sub reveal">See what people are saying about Memento</p>

        <div className="testimonial-grid reveal">
          {[
            {
              quote: "Memento made our wedding day even more special. Guests loved scanning the QR and seeing photos appear live!",
              author: "Sarah Chen",
              role: "Bride",
              event: "Wedding • 156 photos",
              rating: 5
            },
            {
              quote: "Perfect for our corporate conference. No app downloads, just instant photo sharing. Everyone was impressed!",
              author: "Michael Rodriguez",
              role: "Event Manager",
              event: "Tech Conference • 289 photos",
              rating: 5
            },
            {
              quote: "The polaroid gallery view is stunning! We printed the photos afterward and made a beautiful album.",
              author: "Emma Thompson",
              role: "Birthday Mom",
              event: "Sweet 16 • 87 photos",
              rating: 5
            },
            {
              quote: "So easy to set up and use. Our guests kept uploading photos all night long. The live wall was the hit of the party!",
              author: "David Park",
              role: "Gala Organizer",
              event: "Charity Gala • 234 photos",
              rating: 5
            },
            {
              quote: "As a photographer, I love this! Clients can see photos instantly while I keep shooting. No more waiting.",
              author: "Lisa Kumar",
              role: "Professional Photographer",
              event: "Multiple Events",
              rating: 5
            },
            {
              quote: "We used it for our graduation party. Now every family member has all the photos in one place. Amazing!",
              author: "James Wilson",
              role: "Graduate",
              event: "Graduation Party • 145 photos",
              rating: 5
            }
          ].map((item, i) => (
            <div key={i} className="gcard testimonial-card" style={{ animationDelay: `${i * 0.1}s` }}>
              <div className="gcard-border" />
              <div className="gcard-inner">
                <div className="flex gap-1 mb-3">
                  {[...Array(item.rating)].map((_, j) => (
                    <span key={j} className="text-amber-400">⭐</span>
                  ))}
                </div>
                <p className="text-white mb-4 text-sm leading-relaxed">"{item.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-rose-400 flex items-center justify-center text-white font-semibold">
                    {item.author.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">{item.author}</p>
                    <p className="text-white/60 text-xs">{item.role}</p>
                  </div>
                </div>
                <p className="text-amber-400 text-xs mt-3 font-medium">{item.event}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Social Proof Bar */}
        <div className="social-proof-bar reveal">
          <div className="social-proof-item">
            <span className="text-2xl font-bold gradient-text">10,000+</span>
            <span className="text-white/70 text-sm">Events Created</span>
          </div>
          <div className="social-proof-item">
            <span className="text-2xl font-bold gradient-text">500K+</span>
            <span className="text-white/70 text-sm">Photos Shared</span>
          </div>
          <div className="social-proof-item">
            <span className="text-2xl font-bold gradient-text">50+</span>
            <span className="text-white/70 text-sm">Countries</span>
          </div>
          <div className="social-proof-item">
            <span className="text-2xl font-bold gradient-text">4.9★</span>
            <span className="text-white/70 text-sm">User Rating</span>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="sec">
        <span className="kicker reveal">4 Tiers • One-time Payment</span>
        <h2 className="sec-h2 reveal">Pricing That <span className="gradient-text">Grows With You</span></h2>
        <p className="sec-sub reveal">Choose your perfect plan. No subscriptions, no hidden fees.</p>

        {currency.showINR && (
          <button className="currency-toggle reveal" onClick={() => setShowingINR(!showingINR)}>
            Switch to {showingINR ? '$ USD' : '₹ INR'}
          </button>
        )}

        <div className="price-grid">
          {[
            { 
              name: 'Starter', 
              price: Starter, 
              emoji: '🟢',
              description: 'Perfect for small, simple events',
              features: [
                'Unlimited high-resolution photos',
                'Ultra-fast uploads worldwide',
                'Live Slideshow Wall',
                'Download all photos as ZIP',
                'Guests can download photos',
                'QR Code Access for uploads',
                'Password-protected gallery',
                '1 Month Storage',
                'Up to 150 guests'
              ], 
              tagline: 'Simple, fast, and reliable photo sharing for your event.',
              popular: false 
            },
            { 
              name: 'Plus', 
              price: Pro, 
              emoji: '🔵',
              description: 'For interactive and lively events',
              features: [
                'Everything in Starter +',
                '🎥 Video uploads',
                '🖼️ Polaroid-style Wall layout',
                '❤️ Live reactions on photos',
                '📺 Slideshow TV Mode',
                '🎨 Custom styling (match your theme)',
                '🔔 Notifications on uploads',
                '🛡️ Automatic safety filter',
                '🕒 Expiring gallery option',
                '📘 Photo Book (PDF – Beta)',
                '3 Months Storage',
                'Up to 300 guests'
              ], 
              tagline: 'Bring your event to life with interactive features your guests will love.',
              popular: true 
            },
            { 
              name: 'Premium', 
              price: Premium, 
              emoji: '🟣',
              description: 'For weddings, luxury events & full experience',
              features: [
                'Everything in Plus +',
                '🤖 AI Auto Album (best shots selection)',
                '🔒 Smart Privacy Downloads (guests only download photos they\'re in)',
                '💧 Watermark control',
                '📊 Download analytics',
                '👤 Face grouping (Beta)',
                '☁️ Google Drive sync',
                '🎯 Advanced moderation controls',
                '📁 Multiple event walls',
                '🚀 Priority processing',
                '6 Months Storage',
                'Up to 500 guests (or unlimited)'
              ], 
              tagline: 'A premium, intelligent photo experience with privacy and control.',
              popular: false 
            },
            { 
              name: 'White Label', 
              price: WhiteLabel, 
              emoji: '🟡',
              description: 'For agencies, photographers & businesses',
              features: [
                'Everything in Premium +',
                '🔥 White Label Features:',
                'Full branding removal (your platform, your identity)',
                'Custom domain (e.g. photos.yourbrand.com)',
                'Upload your own logo & brand colors',
                'Multi-event dashboard',
                'Client access panels',
                'Resell rights 💰',
                'API / Zapier integrations',
                'Advanced analytics dashboard',
                'Priority support'
              ], 
              tagline: 'Launch your own branded photo-sharing platform and serve unlimited clients.',
              popular: false 
            }
          ].map((p, i) => (
            <div key={i} className={`gcard price-card ${p.popular ? 'popular' : ''} reveal`} style={{ animationDelay: `${i * 0.08}s` }}>
              <div className="gcard-border" />
              <div className="gcard-inner">
                {p.popular && <span className="popular-tag">⭐ Most Popular</span>}
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">{p.emoji}</span>
                  <p className="price-name">{p.name}</p>
                </div>
                <p className="text-white/70 text-sm mb-3">{p.description}</p>
                <div className="price-amount">
                  <span className="price-sym">{Sym}</span>
                  <span className="price-val">{p.price}</span>
                </div>
                <span className="price-period">one-time payment</span>
                <Link href="/pricing" className={`price-btn ${p.popular ? 'filled' : ''}`}>
                  {p.name === 'White Label' ? 'Contact Sales' : `Get ${p.name}`}
                </Link>
                <div className="price-divider" />
                <div className="space-y-2">
                  {p.features.map((f, j) => (
                    <div key={j} className={`price-feat ${f.startsWith('Everything in') ? 'font-semibold text-amber-400' : ''}`}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5"/></svg>
                      {f}
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-3 border-t border-white/10">
                  <p className="text-xs text-white/60 italic">💬 {p.tagline}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="cta-sec reveal">
        <div className="cta-glow" />
        <h2 className="cta-h2">Ready to capture<br /><span className="gradient-text">every moment?</span></h2>
        <p className="cta-p">Start with just ₹2,500. Your wall is live in under a minute.</p>
        <Link href="/pricing" className="btn-glow btn-lg">
          <span>Create Your Wall — Start at ₹2,500</span>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </Link>
      </section>

      {/* FOOTER */}
      <footer className="lp-footer">
        <div className="footer-top">
          <Link href="/">
            <AnimatedLogo width={180} height={60} />
          </Link>
          <div className="footer-cols">
            <div className="footer-col">
              <h4>Product</h4>
              <Link href="#features">Features</Link>
              <Link href="#pricing">Pricing</Link>
              <Link href="#how">How it works</Link>
            </div>
            <div className="footer-col">
              <h4>Company</h4>
              <Link href="#">About</Link>
              <Link href="#">Blog</Link>
              <Link href="#">Contact</Link>
            </div>
            <div className="footer-col">
              <h4>Legal</h4>
              <Link href="#">Privacy</Link>
              <Link href="#">Terms</Link>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2025 Memento. Made with ♥ for every celebration.</p>
        </div>
      </footer>
    </div>
  );
}