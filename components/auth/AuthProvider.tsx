'use client';
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';

interface AuthState {
  isLoggedIn: boolean;
  isLoading: boolean;
  email: string | null;
  userId: string | null;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthState>({
  isLoggedIn: false,
  isLoading: true,
  email: null,
  userId: null,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const isMockMode = !isSupabaseConfigured || !supabase;
  const [isLoggedIn, setIsLoggedIn] = useState(isMockMode);
  const [isLoading, setIsLoading]   = useState(!isMockMode);
  const [email, setEmail]           = useState<string | null>(isMockMode ? 'prototype@mock.local' : null);
  const [userId, setUserId]         = useState<string | null>(isMockMode ? 'mock-user' : null);

  useEffect(() => {
    if (isMockMode || !supabase) {
      return;
    }

    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsLoggedIn(!!session?.user);
      setEmail(session?.user?.email ?? null);
      setUserId(session?.user?.id ?? null);
      setIsLoading(false);
    });

    // Listen for auth changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session?.user);
      setEmail(session?.user?.email ?? null);
      setUserId(session?.user?.id ?? null);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [isMockMode]);

  const signOut = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    setIsLoggedIn(false);
    setEmail(null);
    setUserId(null);
    router.push('/');
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, isLoading, email, userId, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
