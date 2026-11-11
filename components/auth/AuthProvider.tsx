'use client';
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';

interface AuthState {
  isLoggedIn: boolean;
  isLoading: boolean;
  email: string | null;
  userId: string | null;
  teamName: string;
  avatarUrl: string | null;
  signOut: () => Promise<void>;
  updateProfile: (updates: { teamName?: string; avatarUrl?: string | null }) => void;
}

const AuthContext = createContext<AuthState>({
  isLoggedIn: false,
  isLoading: true,
  email: null,
  userId: null,
  teamName: 'My Kenya Cup XV',
  avatarUrl: null,
  signOut: async () => {},
  updateProfile: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const isMockMode = !isSupabaseConfigured || !supabase;
  const [isLoggedIn, setIsLoggedIn] = useState(isMockMode);
  const [isLoading, setIsLoading]   = useState(!isMockMode);
  const [email, setEmail]           = useState<string | null>(isMockMode ? 'prototype@mock.local' : null);
  const [userId, setUserId]         = useState<string | null>(isMockMode ? 'mock-user' : null);
  const [teamName, setTeamName]     = useState<string>('My Kenya Cup XV');
  const [avatarUrl, setAvatarUrl]   = useState<string | null>(null);

  // Restore stored avatar and teamName from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedAvatar = localStorage.getItem('kc_user_avatar');
      const storedTeam = localStorage.getItem('kc_user_team');
      if (storedAvatar || storedTeam) {
        queueMicrotask(() => {
          if (storedAvatar) setAvatarUrl(storedAvatar);
          if (storedTeam) setTeamName(storedTeam);
        });
      }
    }
  }, []);

  useEffect(() => {
    if (isMockMode || !supabase) {
      return;
    }

    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      const user = session?.user;
      setIsLoggedIn(!!user);
      setEmail(user?.email ?? null);
      setUserId(user?.id ?? null);
      if (user?.user_metadata?.team_name) setTeamName(user.user_metadata.team_name);
      if (user?.user_metadata?.avatar_url) setAvatarUrl(user.user_metadata.avatar_url);
      setIsLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const user = session?.user;
      setIsLoggedIn(!!user);
      setEmail(user?.email ?? null);
      setUserId(user?.id ?? null);
      if (user?.user_metadata?.team_name) setTeamName(user.user_metadata.team_name);
      if (user?.user_metadata?.avatar_url) setAvatarUrl(user.user_metadata.avatar_url);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [isMockMode]);

  const updateProfile = (updates: { teamName?: string; avatarUrl?: string | null }) => {
    if (updates.teamName) {
      setTeamName(updates.teamName);
      if (typeof window !== 'undefined') localStorage.setItem('kc_user_team', updates.teamName);
    }
    if (updates.avatarUrl !== undefined) {
      setAvatarUrl(updates.avatarUrl);
      if (typeof window !== 'undefined') {
        if (updates.avatarUrl) localStorage.setItem('kc_user_avatar', updates.avatarUrl);
        else localStorage.removeItem('kc_user_avatar');
      }
    }
  };

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
    <AuthContext.Provider value={{ isLoggedIn, isLoading, email, userId, teamName, avatarUrl, signOut, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
