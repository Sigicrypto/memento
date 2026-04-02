"use client";

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import AnimatedLogo from '@/components/AnimatedLogo';

const BackgroundDecoration = () => (
  <div style={{ position: 'fixed', inset: 0, zIndex: 0, overflow: 'hidden', pointerEvents: 'none' }}>
    <div style={{ 
      position: 'absolute', top: '-15%', left: '-10%', width: '70%', height: '70%', 
      background: 'radial-gradient(circle, rgba(245,158,11,0.08) 0%, transparent 70%)', 
      filter: 'blur(100px)' 
    }} />
    <div style={{ 
      position: 'absolute', bottom: '-20%', right: '-15%', width: '80%', height: '80%', 
      background: 'radial-gradient(circle, rgba(244,114,182,0.08) 0%, transparent 70%)', 
      filter: 'blur(120px)' 
    }} />
  </div>
);

export default function PendingApproval() {
  const { user, profile, isApproved, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user && isApproved) {
      router.push('/dashboard');
    }
  }, [isLoading, user, isApproved, router]);

  if (isLoading) return null;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#fafcfe] relative overflow-hidden">
      <BackgroundDecoration />
      
      <div className="z-10 flex flex-col items-center max-w-lg text-center">
        <Link href="/" className="mb-12">
          <AnimatedLogo width={220} height={80} />
        </Link>

        <div className="glass-card p-10 md:p-14 mb-8 text-center" style={{ 
          background: 'rgba(255, 255, 255, 0.7)',
          backdropFilter: 'blur(20px)',
          borderRadius: 40,
          border: '1px solid rgba(255, 255, 255, 0.8)',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.05)'
        }}>
          <div className="mb-8" style={{ fontSize: 60 }}>⌛</div>
          
          <h1 style={{ fontSize: 32, fontWeight: 900, color: 'var(--text1)', marginBottom: 20, letterSpacing: '-0.02em' }}>
            Your Account is Under Review
          </h1>
          
          <p style={{ color: 'var(--text2)', fontSize: 16, lineHeight: 1.6, marginBottom: 32 }}>
            Welcome to the Memento community! 🥂 <br/><br/>
            To maintain our high standards of privacy and service, all new accounts require manual approval. 
            Once our team verifies your details or payment, your access will be activated immediately.
          </p>

          <div className="flex flex-col gap-4">
            <Link href="/" className="btn-glow w-full py-4 rounded-2xl font-bold">
              RETURN HOME
            </Link>
            <p style={{ fontSize: 11, color: 'var(--text2)', opacity: 0.6, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              We'll notify you via {user?.email} as soon as we're ready!
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6 opacity-40">
           <span style={{ fontSize: 12, fontWeight: 800 }}>MEMENTO PLATFORM V1.0</span>
        </div>
      </div>
    </div>
  );
}
