"use client";

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import './landing.css';

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [currency, setCurrency] = useState({ showINR: false });
  const [showingINR, setShowingINR] = useState(false);
  const cursorRef = useRef<HTMLDivElement>(null);
  const cursorRingRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let mx = 0, my = 0, rx = 0, ry = 0;
    let trailTimer = 0;
    let lastTrailTime = 0;
    const onMove = (e: MouseEvent) => {
      mx = e.clientX; my = e.clientY;
      const now = Date.now();
      if (now - lastTrailTime > 50) { // Throttle trail creation
        trailTimer++;
        if (trailTimer % 5 === 0) { // Reduce frequency further
          const t = document.createElement('div');
          t.className = 'cursor-trail';
          const size = 4 + Math.random() * 4; // Smaller trails
          t.style.cssText = `left:${mx}px;top:${my}px;width:${size}px;height:${size}px;`;
          document.body.appendChild(t);
          setTimeout(() => t.remove(), 400); // Shorter lifetime
        }
        lastTrailTime = now;
      }
    };
    window.addEventListener('mousemove', onMove);
    let raf: number;
    const loop = () => {
      rx += (mx - rx) * 0.15; // Slightly faster following
      ry += (my - ry) * 0.15;
      if (cursorRef.current) { cursorRef.current.style.left = `${mx}px`; cursorRef.current.style.top = `${my}px`; }
      if (cursorRingRef.current) { cursorRingRef.current.style.left = `${rx}px`; cursorRingRef.current.style.top = `${ry}px`; }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

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

    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('scroll', onScroll); cancelAnimationFrame(raf); obs.disconnect(); };
  }, []);

  const Plus = showingINR ? "1,249" : "14.95";
  const Premium = showingINR ? "2,499" : "29.95";
  const Signature = showingINR ? "4,169" : "49.95";
  const Sym = showingINR ? "₹" : "$";

  return (
    <div className="lp">
      <div className="cursor-dot" ref={cursorRef} />
      <div className="cursor-ring" ref={cursorRingRef} />

      <div className="orbs">
        <div className="orb orb1" />
        <div className="orb orb2" />
        <div className="orb orb3" />
      </div>

      <div className="grain" />

      {/* NAV */}
      <nav className={`lp-nav ${scrolled ? 'scrolled' : ''}`}>
        <Link href="/" className="nav-logo">
          <span className="nav-logo-icon">📷</span>
          <span className="nav-logo-text">Memento</span>
        </Link>
        <div className="nav-mid">
          <Link href="#features">Features</Link>
          <Link href="#how">How it works</Link>
          <Link href="#pricing">Pricing</Link>
        </div>
        <Link href="/create" className="nav-btn">
          Get Started
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </Link>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="hero-badge reveal">
          <span className="pulse-dot" />
          Free for your first event
        </div>
        <h1 className="hero-h1 reveal">
          Your Event.
          <br />
          <span className="gradient-text">Every Memory. Live.</span>
        </h1>
        <p className="hero-p reveal">
          Guests scan a QR code, snap photos, and watch them appear live on a stunning wall. No app needed.
        </p>
        <div className="hero-btns reveal">
          <Link href="/create" className="btn-glow">
            <span>Create Your Wall</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </Link>
          <Link href="/demo" className="btn-outline">
            <span>🎬 Try Live Demo</span>
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
                  { src: '/api/placeholder/150/150?text=Photo+1', alt: 'Guest photo' },
                  { src: '/api/placeholder/150/150?text=Photo+2', alt: 'Guest photo' },
                  { src: '/api/placeholder/150/150?text=Photo+3', alt: 'Guest photo' },
                  { src: '/api/placeholder/150/150?text=Photo+4', alt: 'Guest photo' }
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
                  { src: '/api/placeholder/150/150?text=Wedding+1', alt: 'Wedding photo' },
                  { src: '/api/placeholder/150/150?text=Wedding+2', alt: 'Wedding photo' },
                  { src: '/api/placeholder/150/150?text=Wedding+3', alt: 'Wedding photo' },
                  { src: '/api/placeholder/150/150?text=Wedding+4', alt: 'Wedding photo' },
                  { src: '/api/placeholder/150/150?text=Wedding+5', alt: 'Wedding photo' },
                  { src: '/api/placeholder/150/150?text=Wedding+6', alt: 'Wedding photo' }
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
                  { src: '/api/placeholder/150/150?text=Guest+1', alt: 'Guest photo' },
                  { src: '/api/placeholder/150/150?text=Guest+2', alt: 'Guest photo' }
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
          { val: '100%', label: 'Free to start' },
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
        <span className="kicker reveal">Pricing</span>
        <h2 className="sec-h2 reveal">Simple, <span className="gradient-text">honest</span> pricing.</h2>
        <p className="sec-sub reveal">One-time payment per event. No subscriptions.</p>

        {currency.showINR && (
          <button className="currency-toggle reveal" onClick={() => setShowingINR(!showingINR)}>
            Switch to {showingINR ? '$ USD' : '₹ INR'}
          </button>
        )}

        <div className="price-grid">
          {[
            { name: 'Plus', price: Plus, features: ['Unlimited photos', 'Ultra-fast uploads', 'Live Slideshow', 'Download as ZIP', 'E2E Encryption'], popular: false },
            { name: 'Premium', price: Premium, features: ['Video uploads', 'Google Drive Sync', 'Safety Filter', 'All Plus features'], popular: true },
            { name: 'Signature', price: Signature, features: ['1 Year access', 'Unlimited walls', 'Zapier & FTP', 'All Premium features'], popular: false },
          ].map((p, i) => (
            <div key={i} className={`gcard price-card ${p.popular ? 'popular' : ''} reveal`} style={{ animationDelay: `${i * 0.1}s` }}>
              <div className="gcard-border" />
              <div className="gcard-inner">
                {p.popular && <span className="popular-tag">Most Popular</span>}
                <p className="price-name">{p.name}</p>
                <div className="price-amount">
                  <span className="price-sym">{Sym}</span>
                  <span className="price-val">{p.price}</span>
                </div>
                <span className="price-period">one-time payment</span>
                <Link href="/pricing" className={`price-btn ${p.popular ? 'filled' : ''}`}>
                  Get {p.name}
                </Link>
                <div className="price-divider" />
                {p.features.map((f, j) => (
                  <div key={j} className="price-feat">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5"/></svg>
                    {f}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="cta-sec reveal">
        <div className="cta-glow" />
        <h2 className="cta-h2">Ready to capture<br /><span className="gradient-text">every moment?</span></h2>
        <p className="cta-p">Start for free. No credit card required. Your wall is live in under a minute.</p>
        <Link href="/create" className="btn-glow btn-lg">
          <span>Create Your Wall — It&apos;s Free</span>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </Link>
      </section>

      {/* WHATSAPP */}
      <a
        href="https://wa.me/96896095692?text=Hi%20Memento!%20I%27d%20like%20to%20know%20more."
        target="_blank"
        rel="noopener noreferrer"
        className="wa-fab"
      >
        <span className="wa-ping" />
        <svg viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
      </a>

      {/* FOOTER */}
      <footer className="lp-footer">
        <div className="footer-top">
          <div className="footer-brand">
            <span className="nav-logo-icon">📷</span>
            <span className="nav-logo-text">Memento</span>
          </div>
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