"use client";

import React from 'react';
import { PostHogProvider } from "./PostHogProvider";
import { ThemeProvider } from "next-themes";
import { AuthModalProvider } from "@/context/AuthModalContext";
import AuthModalWrapper from "./AuthModalWrapper";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <PostHogProvider>
        <AuthModalProvider>
          {children}
          <AuthModalWrapper />
        </AuthModalProvider>
      </PostHogProvider>
    </ThemeProvider>
  );
}
