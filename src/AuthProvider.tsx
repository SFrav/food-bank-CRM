import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { profileQueryOptions } from '@/hooks/useProfile';

type AuthContextType = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ data: Session | null; error: Error | null }>;
  signUp: (email: string, password: string, fullName?: string, redirectTo?: string) => Promise<{ data: Session | null; error: Error | null }>;
  signOut: () => Promise<{ error: Error | null }>;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const queryClient = useQueryClient();

  const updateAuth = useCallback((session: Session | null) => {
    setSession(session);
    setUser(session?.user ?? null);
  }, []);

  useEffect(() => {
    // Listen for auth state changes (login, logout, refresh)
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      updateAuth(session);
    });

    // Fetch initial session on app load
    const initSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;
        setSession(data?.session ?? null);
        setUser(data?.session?.user ?? null);
      } catch (e) {
        console.error("Failed to get initial session:", e);
        setSession(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    initSession();
    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, [updateAuth]);

  useEffect(() => {
    if (user && !loading) {
      queryClient.query(profileQueryOptions(user.id));
    }
  }, [user, loading]);

  const signIn = useCallback(async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    return { data: data?.session ?? null, error };
  }, []);

  const signUp = useCallback(async (email: string, password: string, fullName?: string, redirectTo: string = '/') => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}${redirectTo}`,
        data: { full_name: fullName ?? email },
      },
    });
    return { data: data?.session ?? null, error };
  }, []);

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    setSession(null);
    setUser(null);
    queryClient.clear();
    return { error };
  }, []);

  return (
    <AuthContext.Provider value={{ 
      session, 
      user, 
      loading, 
      signIn, 
      signUp, 
      signOut 
    }}>
      {children}
    </AuthContext.Provider>
  );
};


