"use client";

import React from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<{children: React.ReactNode}, ErrorBoundaryState> {
  constructor(props: {children: React.ReactNode}) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-center text-black dark:text-white relative overflow-hidden">
          <div className="orbs">
            <div className="orb orb-primary opacity-30" />
            <div className="orb orb-secondary opacity-30" />
          </div>
          <div className="glass-panel p-10 max-w-md w-full relative z-10 flex flex-col items-center">
            <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 flex items-center justify-center mb-6">
              <AlertTriangle size={32} />
            </div>
            <h1 className="text-2xl font-bold mb-3 tracking-tight">Something went wrong</h1>
            <p className="text-text-secondary text-sm mb-8 leading-relaxed">
              We encountered an unexpected error. Please try refreshing the page.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="btn-premium w-full py-4 flex items-center justify-center gap-2"
            >
              <RefreshCcw size={18} /> Try Again
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
