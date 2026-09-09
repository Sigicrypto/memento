"use client";

import { useTheme } from 'next-themes';
import { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';

interface ThemeToggleProps {
  className?: string;
}

export default function ThemeToggle({ className = "" }: ThemeToggleProps) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div 
        className={`h-8 w-14 rounded-full bg-border/40 animate-pulse shrink-0 ${className}`}
        aria-hidden="true" 
      />
    );
  }

  const isDark = (resolvedTheme || theme) === 'dark';

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className={`relative inline-flex h-8 w-14 items-center rounded-full bg-bg-subtle border border-border hover:border-border-hover transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent shrink-0 cursor-pointer shadow-inner ${className}`}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      title={isDark ? "Switch to light theme" : "Switch to dark theme"}
      role="switch"
      aria-checked={isDark}
    >
      <span className="sr-only">Toggle theme</span>
      
      {/* Track Background Icons */}
      <span className="absolute left-2 flex items-center justify-center pointer-events-none text-accent/60">
        <Sun className="w-3 h-3" />
      </span>
      <span className="absolute right-2 flex items-center justify-center pointer-events-none text-text-muted">
        <Moon className="w-3 h-3" />
      </span>
      
      {/* Sliding Thumb */}
      <span
        className={`inline-flex items-center justify-center h-6 w-6 transform rounded-full bg-surface shadow-md border border-border/80 transition-all duration-300 ease-out z-10 ${
          isDark ? 'translate-x-7 text-accent' : 'translate-x-1 text-accent'
        }`}
      >
        {isDark ? (
          <Moon className="h-3.5 w-3.5 fill-accent/20" />
        ) : (
          <Sun className="h-3.5 w-3.5 fill-accent/20" />
        )}
      </span>
    </button>
  );
}
