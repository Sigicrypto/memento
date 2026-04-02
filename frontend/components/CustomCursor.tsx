"use client";

import React, { useEffect, useRef, useState } from 'react';

export default function CustomCursor() {
  const cursorDotRef = useRef<HTMLDivElement>(null);
  const cursorOuterRef = useRef<HTMLDivElement>(null);
  const cursorGlowRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check for mobile/tablet
    if (typeof window !== 'undefined' && window.matchMedia('(max-width: 1024px)').matches) {
      return;
    }

    let mx = 0, my = 0;
    let outerX = 0, outerY = 0;
    let glowX = 0, glowY = 0;
    let particles: Array<{ x: number; y: number; vx: number; vy: number; life: number; element: HTMLDivElement }> = [];
    let lastParticleTime = 0;
    let colorHue = 0;

    // Hide default cursor on desktop
    const isDesktop = typeof window !== 'undefined' && window.matchMedia('(min-width: 1025px)').matches;
    if (isDesktop) {
      document.documentElement.style.cursor = 'none';
    }

    const onMove = (e: MouseEvent) => {
      mx = e.clientX;
      my = e.clientY;

      if (!isVisible) {
        setIsVisible(true);
      }

      // Update card spotlight effect
      const target = e.target as HTMLElement;
      const card = target.closest('.nm-card, .card, .gcard') as HTMLElement;
      if (card) {
        const r = card.getBoundingClientRect();
        card.style.setProperty('--mx', `${e.clientX - r.left}px`);
        card.style.setProperty('--my', `${e.clientY - r.top}px`);
      }

      // Create particle trail
      const now = Date.now();
      if (now - lastParticleTime > 30) {
        createParticle(mx, my);
        lastParticleTime = now;
      }

      // Check for interactive elements
      const interactive = target.closest('a, button, .nm-btn, .nm-circle, input, textarea, select');
      if (cursorDotRef.current && cursorOuterRef.current) {
        if (interactive) {
          cursorDotRef.current.classList.add('cursor-hover');
          cursorOuterRef.current.classList.add('cursor-hover');
        } else {
          cursorDotRef.current.classList.remove('cursor-hover');
          cursorOuterRef.current.classList.remove('cursor-hover');
        }
      }
    };

    const createParticle = (x: number, y: number) => {
      const particle = document.createElement('div');
      particle.className = 'cursor-particle';
      
      const angle = Math.random() * Math.PI * 2;
      const velocity = 0.5 + Math.random() * 1;
      const size = 2 + Math.random() * 4;
      
      particle.style.cssText = `
        left: ${x}px;
        top: ${y}px;
        width: ${size}px;
        height: ${size}px;
      `;
      
      document.body.appendChild(particle);
      
      particles.push({
        x,
        y,
        vx: Math.cos(angle) * velocity,
        vy: Math.sin(angle) * velocity,
        life: 1,
        element: particle
      });

      // Limit particle count
      if (particles.length > 30) {
        const old = particles.shift();
        if (old) old.element.remove();
      }
    };

    const updateParticles = () => {
      particles.forEach((p, index) => {
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.02;
        
        if (p.life <= 0) {
          p.element.remove();
          particles.splice(index, 1);
        } else {
          p.element.style.left = `${p.x}px`;
          p.element.style.top = `${p.y}px`;
          p.element.style.opacity = `${p.life}`;
          p.element.style.transform = `translate(-50%, -50%) scale(${p.life})`;
        }
      });
    };

    window.addEventListener('mousemove', onMove);

    let raf: number;
    const loop = () => {
      // Smooth follow for outer ring (slower)
      outerX += (mx - outerX) * 0.12;
      outerY += (my - outerY) * 0.12;

      // Even slower for glow (creates depth)
      glowX += (mx - glowX) * 0.08;
      glowY += (my - glowY) * 0.08;

      // Color rotation
      colorHue = (colorHue + 0.5) % 360;

      if (cursorDotRef.current) {
        cursorDotRef.current.style.left = `${mx}px`;
        cursorDotRef.current.style.top = `${my}px`;
      }

      if (cursorOuterRef.current) {
        cursorOuterRef.current.style.left = `${outerX}px`;
        cursorOuterRef.current.style.top = `${outerY}px`;
      }

      if (cursorGlowRef.current) {
        cursorGlowRef.current.style.left = `${glowX}px`;
        cursorGlowRef.current.style.top = `${glowY}px`;
        cursorGlowRef.current.style.filter = `hue-rotate(${colorHue}deg) blur(20px)`;
      }

      updateParticles();
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      if (isDesktop) {
        document.documentElement.style.cursor = '';
      }
      window.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(raf);
      particles.forEach(p => p.element.remove());
    };
  }, [isVisible]);

  return (
    <>
      <div 
        className={`cursor-glow ${isVisible ? 'visible' : ''}`} 
        ref={cursorGlowRef} 
      />
      <div 
        className={`cursor-outer ${isVisible ? 'visible' : ''}`} 
        ref={cursorOuterRef} 
      >
        <div className="cursor-outer-ring" />
      </div>
      <div 
        className={`cursor-dot ${isVisible ? 'visible' : ''}`} 
        ref={cursorDotRef} 
      >
        <div className="cursor-dot-inner" />
      </div>
    </>
  );
}
