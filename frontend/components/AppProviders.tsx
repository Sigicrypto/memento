"use client";

import React from 'react';
import { PostHogProvider } from "./PostHogProvider";
import { AuthModalProvider } from "@/context/AuthModalContext";
import AuthModalWrapper from "./AuthModalWrapper";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <PostHogProvider>
      <AuthModalProvider>
        {children}
        <AuthModalWrapper />
      </AuthModalProvider>
    </PostHogProvider>
  );
}
