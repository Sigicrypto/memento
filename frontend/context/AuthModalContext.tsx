"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';

type PlanType = 'starter' | 'standard' | 'premium' | 'whitelabel' | null;
type AuthTab = 'login' | 'signup';

interface AuthModalContextType {
  isOpen: boolean;
  tab: AuthTab;
  plan: PlanType;
  openAuth: (tab: AuthTab, plan?: PlanType) => void;
  closeAuth: () => void;
}

const AuthModalContext = createContext<AuthModalContextType | undefined>(undefined);

export function AuthModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [tab, setTab] = useState<AuthTab>('signup');
  const [plan, setPlan] = useState<PlanType>(null);

  const openAuth = (newTab: AuthTab, newPlan: PlanType = null) => {
    setTab(newTab);
    setPlan(newPlan);
    setIsOpen(true);
  };

  const closeAuth = () => {
    setIsOpen(false);
  };

  return (
    <AuthModalContext.Provider value={{ isOpen, tab, plan, openAuth, closeAuth }}>
      {children}
    </AuthModalContext.Provider>
  );
}

export function useAuthModal() {
  const context = useContext(AuthModalContext);
  if (context === undefined) {
    throw new Error('useAuthModal must be used within an AuthModalProvider');
  }
  return context;
}
