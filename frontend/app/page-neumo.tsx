"use client";

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
// import './styles/neumorphic.css';

export default function NeumorphicLandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [showingINR, setShowingINR] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="neumo-dark min-h-screen">
      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'py-4' : 'py-6'
      }`}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="neumo-icon neumo-icon-dark w-12 h-12 text-2xl">
                📷
              </div>
              <span className="text-xl font-bold text-gray-300">Memento</span>
            </div>
            
            <div className="hidden md:flex items-center gap-8">
              <Link href="#features" className="text-gray-400 hover:text-gray-200 transition-colors">Features</Link>
              <Link href="#pricing" className="text-gray-400 hover:text-gray-200 transition-colors">Pricing</Link>
              <Link href="/demo" className="text-gray-400 hover:text-gray-200 transition-colors">Demo</Link>
            </div>
            
            <div className="flex items-center gap-4">
              <Link href="/auth" className="neumo-btn neumo-btn-dark">
                Sign In
              </Link>
              <Link href="/create" className="neumo-btn neumo-btn-dark bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                Create Wall
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center px-6 pt-20">
        <div className="max-w-6xl mx-auto text-center">
          <div className="neumo-icon neumo-icon-dark w-24 h-24 text-5xl mx-auto mb-8 neumo-float">
            🎉
          </div>
          
          <h1 className="text-6xl md:text-7xl font-bold text-gray-200 mb-6">
            Capture
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
              Every Memory
            </span>
          </h1>
          
          <p className="text-xl text-gray-400 mb-12 max-w-3xl mx-auto">
            Create beautiful live photo walls for your events. Guests scan a QR code, 
            upload photos instantly, and watch memories appear in real-time.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link href="/create" className="neumo-btn neumo-btn-dark px-8 py-4 text-lg font-semibold">
              <span className="flex items-center gap-2">
                ✨ Create Your Wall
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </span>
            </Link>
            <Link href="/demo" className="neumo-btn neumo-btn-dark px-8 py-4 text-lg font-semibold">
              🎬 Try Live Demo
            </Link>
          </div>

          {/* Phone Mockups */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {['Upload', 'Gallery', 'Live'].map((title, i) => (
              <div key={i} className="neumo-card neumo-card-dark p-6 neumo-float" style={{ animationDelay: `${i * 0.2}s` }}>
                <div className="neumo-icon neumo-icon-dark w-16 h-16 mx-auto mb-4">
                  {title === 'Upload' ? '📱' : title === 'Gallery' ? '🖼️' : '🔴'}
                </div>
                <h3 className="text-lg font-semibold text-gray-200 mb-2">{title}</h3>
                <p className="text-gray-400 text-sm">
                  {title === 'Upload' ? 'Guests upload photos instantly' : 
                   title === 'Gallery' ? 'Beautiful photo galleries' : 
                   'Real-time photo streaming'}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-200 mb-4">
              Amazing
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                {" "}Features
              </span>
            </h2>
            <p className="text-xl text-gray-400">Everything you need for perfect event photography</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: '⚡', title: 'Instant Upload', desc: 'Photos appear in real-time as guests upload them' },
              { icon: '🎨', title: 'Beautiful Galleries', desc: 'Stunning photo walls with multiple view modes' },
              { icon: '🔒', title: 'Private & Secure', desc: 'Password-protected walls for your privacy' },
              { icon: '📱', title: 'Mobile First', desc: 'Works perfectly on all devices and browsers' },
              { icon: '💾', desc: 'Download all photos in high quality' },
              { icon: '🎯', desc: 'Easy moderation and management tools' }
            ].map((feature, i) => (
              <div key={i} className="neumo-card neumo-card-dark p-8 hover:scale-105 transition-transform">
                <div className="neumo-icon neumo-icon-dark w-16 h-16 text-3xl mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-200 mb-3">{feature.title}</h3>
                <p className="text-gray-400">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-200 mb-4">
              How It
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                {" "}Works
              </span>
            </h2>
            <p className="text-xl text-gray-400">Three simple steps to capture memories</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Create Wall', desc: 'Set up your event in seconds' },
              { step: '02', title: 'Share QR Code', desc: 'Guests scan to upload photos' },
              { step: '03', title: 'Enjoy Memories', desc: 'Watch photos appear live' }
            ].map((item, i) => (
              <div key={i} className="text-center">
                <div className="neumo-icon neumo-icon-dark w-20 h-20 mx-auto mb-6">
                  <span className="text-2xl font-bold text-gray-400">{item.step}</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-200 mb-3">{item.title}</h3>
                <p className="text-gray-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="neumo-container neumo-container-dark">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-200 mb-6">
              Ready to Capture
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                {" "}Your Moments?
              </span>
            </h2>
            <p className="text-xl text-gray-400 mb-8">
              Join thousands of events using Memento to create lasting memories
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/create" className="neumo-btn neumo-btn-dark px-8 py-4 text-lg font-semibold">
                Start Free
              </Link>
              <Link href="/demo" className="neumo-btn neumo-btn-dark px-8 py-4 text-lg font-semibold">
                View Demo
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-gray-700">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="neumo-icon neumo-icon-dark w-8 h-8">
                  📷
                </div>
                <span className="text-lg font-bold text-gray-200">Memento</span>
              </div>
              <p className="text-gray-400 text-sm">Capture every memory, live.</p>
            </div>
            
            <div>
              <h4 className="text-gray-200 font-semibold mb-4">Product</h4>
              <ul className="space-y-2">
                <li><Link href="/create" className="text-gray-400 hover:text-gray-200 text-sm">Create Wall</Link></li>
                <li><Link href="/#pricing" className="text-gray-400 hover:text-gray-200 text-sm">Pricing</Link></li>
                <li><Link href="/demo" className="text-gray-400 hover:text-gray-200 text-sm">Demo</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-gray-200 font-semibold mb-4">Support</h4>
              <ul className="space-y-2">
                <li><Link href="/privacy" className="text-gray-400 hover:text-gray-200 text-sm">Privacy</Link></li>
                <li><Link href="/terms" className="text-gray-400 hover:text-gray-200 text-sm">Terms</Link></li>
                <li><Link href="/auth" className="text-gray-400 hover:text-gray-200 text-sm">Sign In</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-gray-200 font-semibold mb-4">Connect</h4>
              <div className="flex gap-4">
                <div className="neumo-icon neumo-icon-dark w-10 h-10">
                  📧
                </div>
                <div className="neumo-icon neumo-icon-dark w-10 h-10">
                  💬
                </div>
              </div>
            </div>
          </div>
          
          <div className="text-center text-gray-400 text-sm">
            © 2024 Memento. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
