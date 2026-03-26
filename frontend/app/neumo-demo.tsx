"use client";

import { useState } from 'react';
import Link from 'next/link';
import './styles/neumorphic.css';

export default function NeumorphicDemo() {
  const [toggle1, setToggle1] = useState(false);
  const [toggle2, setToggle2] = useState(true);
  const [progress, setProgress] = useState(65);

  return (
    <div className="neumo-dark min-h-screen px-6 py-12">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-200 mb-4">
            Neumorphic
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
              {" "}Design System
            </span>
          </h1>
          <p className="text-xl text-gray-400">Interactive components with soft, tactile aesthetics</p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <div className="neumo-card neumo-card-dark p-6">
            <h3 className="text-xl font-semibold text-gray-200 mb-3">Basic Card</h3>
            <p className="text-gray-400">A soft, raised element with subtle shadows.</p>
          </div>
          
          <div className="neumo-card neumo-card-dark p-6 hover:scale-105 transition-transform">
            <h3 className="text-xl font-semibold text-gray-200 mb-3">Hover Card</h3>
            <p className="text-gray-400">This card scales up when you hover over it.</p>
          </div>
          
          <div className="neumo-card neumo-card-dark p-6 neumo-card-pressed-dark">
            <h3 className="text-xl font-semibold text-gray-200 mb-3">Pressed Card</h3>
            <p className="text-gray-400">An inset appearance with reversed shadows.</p>
          </div>
        </div>

        {/* Buttons Section */}
        <div className="neumo-container neumo-container-dark mb-16">
          <h2 className="text-2xl font-bold text-gray-200 mb-8 text-center">Buttons</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <button className="neumo-btn neumo-btn-dark">Default</button>
            <button className="neumo-btn neumo-btn-dark bg-gradient-to-r from-blue-500 to-purple-500 text-white">Gradient</button>
            <button className="neumo-btn neumo-btn-dark neumo-btn-pressed-dark">Pressed</button>
            <button className="neumo-btn neumo-btn-dark neumo-glow-dark">Glowing</button>
          </div>
        </div>

        {/* Form Elements */}
        <div className="neumo-container neumo-container-dark mb-16">
          <h2 className="text-2xl font-bold text-gray-200 mb-8 text-center">Form Elements</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Text Input</label>
              <input 
                type="text" 
                placeholder="Type something..."
                className="neumo-input neumo-input-dark mb-4"
              />
              
              <label className="block text-sm font-medium text-gray-400 mb-2">Email Input</label>
              <input 
                type="email" 
                placeholder="email@example.com"
                className="neumo-input neumo-input-dark"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Password</label>
              <input 
                type="password" 
                placeholder="••••••••"
                className="neumo-input neumo-input-dark mb-4"
              />
              
              <label className="block text-sm font-medium text-gray-400 mb-2">Message</label>
              <textarea 
                placeholder="Your message..."
                rows={3}
                className="neumo-input neumo-input-dark resize-none"
              />
            </div>
          </div>
        </div>

        {/* Interactive Elements */}
        <div className="neumo-container neumo-container-dark mb-16">
          <h2 className="text-2xl font-bold text-gray-200 mb-8 text-center">Interactive Elements</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-200 mb-4">Toggles</h3>
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <div 
                    className={`neumo-toggle ${toggle1 ? 'active' : ''}`}
                    onClick={() => setToggle1(!toggle1)}
                  />
                  <span className="text-gray-400">Toggle 1</span>
                </div>
                <div className="flex items-center gap-3">
                  <div 
                    className={`neumo-toggle ${toggle2 ? 'active' : ''}`}
                    onClick={() => setToggle2(!toggle2)}
                  />
                  <span className="text-gray-400">Toggle 2</span>
                </div>
              </div>
            </div>
            
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-200 mb-4">Icons</h3>
              <div className="flex justify-center gap-4">
                <div className="neumo-icon neumo-icon-dark w-12 h-12">📷</div>
                <div className="neumo-icon neumo-icon-dark w-12 h-12">🎉</div>
                <div className="neumo-icon neumo-icon-dark w-12 h-12">✨</div>
              </div>
            </div>
            
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-200 mb-4">Progress</h3>
              <div className="neumo-progress mb-4">
                <div 
                  className="neumo-progress-bar" 
                  style={{ width: `${progress}%` }}
                />
              </div>
              <button 
                onClick={() => setProgress(Math.min(100, progress + 10))}
                className="neumo-btn neumo-btn-dark text-sm"
              >
                Increase
              </button>
            </div>
          </div>
        </div>

        {/* Floating Elements */}
        <div className="neumo-container neumo-container-dark mb-16">
          <h2 className="text-2xl font-bold text-gray-200 mb-8 text-center">Floating Elements</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="neumo-icon neumo-icon-dark w-20 h-20 mx-auto mb-4 neumo-float">
                🎈
              </div>
              <p className="text-gray-400">Floating Icon</p>
            </div>
            <div className="text-center">
              <div className="neumo-card neumo-card-dark p-6 neumo-float">
                <div className="neumo-icon neumo-icon-dark w-12 h-12 mx-auto mb-2">
                  🚀
                </div>
                <p className="text-gray-400 text-sm">Floating Card</p>
              </div>
            </div>
            <div className="text-center">
              <div className="neumo-container neumo-container-dark neumo-float">
                <div className="neumo-icon neumo-icon-dark w-12 h-12 mx-auto mb-2">
                  💎
                </div>
                <p className="text-gray-400 text-sm">Floating Container</p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Example */}
        <div className="neumo-container neumo-container-dark mb-16">
          <h2 className="text-2xl font-bold text-gray-200 mb-8 text-center">Navigation Example</h2>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="neumo-icon neumo-icon-dark w-10 h-10">
                📷
              </div>
              <span className="text-xl font-bold text-gray-200">Memento</span>
            </div>
            <div className="hidden md:flex items-center gap-6">
              <button className="text-gray-400 hover:text-gray-200 transition-colors">Features</button>
              <button className="text-gray-400 hover:text-gray-200 transition-colors">Pricing</button>
              <button className="text-gray-400 hover:text-gray-200 transition-colors">Demo</button>
            </div>
            <div className="flex gap-3">
              <button className="neumo-btn neumo-btn-dark">Sign In</button>
              <button className="neumo-btn neumo-btn-dark bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                Get Started
              </button>
            </div>
          </div>
        </div>

        {/* Color Variations */}
        <div className="neumo-container neumo-container-dark mb-16">
          <h2 className="text-2xl font-bold text-gray-200 mb-8 text-center">Color Accents</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <button className="neumo-btn neumo-btn-dark bg-blue-500/20 text-blue-400 border-blue-500/30">
              Blue Theme
            </button>
            <button className="neumo-btn neumo-btn-dark bg-purple-500/20 text-purple-400 border-purple-500/30">
              Purple Theme
            </button>
            <button className="neumo-btn neumo-btn-dark bg-green-500/20 text-green-400 border-green-500/30">
              Green Theme
            </button>
            <button className="neumo-btn neumo-btn-dark bg-red-500/20 text-red-400 border-red-500/30">
              Red Theme
            </button>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-200 mb-4">
            Love the Neumorphic Design?
          </h2>
          <p className="text-gray-400 mb-8">
            Try the neumorphic versions of our pages
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/page-neumo" className="neumo-btn neumo-btn-dark px-8 py-4 font-semibold">
              📱 Neumorphic Landing
            </Link>
            <Link href="/auth-neumo" className="neumo-btn neumo-btn-dark px-8 py-4 font-semibold">
              🔐 Neumorphic Auth
            </Link>
            <Link href="/dashboard-neumo" className="neumo-btn neumo-btn-dark px-8 py-4 font-semibold">
              📊 Neumorphic Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
