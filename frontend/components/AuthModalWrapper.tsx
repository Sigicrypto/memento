"use client";

import React from 'react';
import { useAuthModal } from '@/context/AuthModalContext';
import AuthDialog from './AuthDialog';

export default function AuthModalWrapper() {
  const { isOpen, tab, plan, closeAuth } = useAuthModal();

  return (
    <AuthDialog
      isOpen={isOpen}
      onClose={closeAuth}
      initialTab={tab}
      selectedPlan={plan}
      onAuthSuccess={() => {
        // Handle post-auth logic if needed, 
        // though AuthDialog already handles redirects.
        closeAuth();
      }}
    />
  );
}
