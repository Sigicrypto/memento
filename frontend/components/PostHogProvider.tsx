"use client";

import posthog from 'posthog-js';
import { PostHogProvider as Provider } from 'posthog-js/react';
import { useEffect } from 'react';

// Initialize PostHog globally if key is present
const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const host = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com';

if (typeof window !== 'undefined' && key) {
  posthog.init(key, {
    api_host: host,
    disable_surveys: true,
    // Enable debug mode in development
    loaded: (posthog: any) => {
      if (process.env.NODE_ENV === 'development') posthog.debug();
    },
    // Optional: Only trigger tracking when explicitly configured
    capture_pageview: false 
  });
}

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  // Capture pageviews manually for App Router
  useEffect(() => {
    if (key) {
      posthog.capture('$pageview');
    }
  }, []);

  if (!key) return <>{children}</>;

  return <Provider client={posthog}>{children}</Provider>;
}
