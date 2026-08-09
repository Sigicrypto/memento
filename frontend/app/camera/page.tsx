"use client";

import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { hasFeature } from '@/lib/permissions';
import ProCamera from '@/components/ProCamera';

export default function StandaloneCameraPage() {
  const router = useRouter();
  const { user, profile, isSuperAdmin } = useAuth();

  const userPlan = profile?.plan || 'starter';
  const userEmail = user?.email || profile?.email || null;
  const isProUser = isSuperAdmin || hasFeature(userPlan, 'PRO_CAMERA', userEmail);

  return (
    <ProCamera 
      eventName="Memento Pro Camera"
      isProUser={isProUser}
      onClose={() => router.push('/')}
    />
  );
}
