"use client";

import { useAuth } from '@/hooks/useAuth';

export default function AuthButtons() {
  const { user, signIn, signOut } = useAuth();

  const handleLogin = async () => {
    const email = prompt('Email');
    const password = prompt('Password');
    if (email && password) {
      await signIn(email, password);
    }
  };

  return (
    <div className="flex space-x-2 mb-4">
      {user ? (
        <button
          onClick={signOut}
          className="bg-red-500 text-white px-3 py-1 rounded"
        >
          Sign Out
        </button>
      ) : (
        <button
          onClick={handleLogin}
          className="bg-primary text-white px-3 py-1 rounded"
        >
          Sign In
        </button>
      )}
    </div>
  );
}
