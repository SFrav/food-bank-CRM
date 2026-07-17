import { useState, useEffect, useCallback } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export const useAuth = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const updateAuth = useCallback((session: Session | null) => {
    setSession(session);
    setUser(session?.user ?? null);
  }, []);

  useEffect(() => {
    // Set up auth state listener
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
        updateAuth(session);
    });

    // Get initial session 
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

    return () => data?.subscription?.unsubscribe?.(); 
  }, []);

  const signIn = useCallback(
    async (email: string, password: string) => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      return { data, error };
    },
    []
  );


  const signUp = useCallback(
    async (email: string, password: string, fullName?: string, redirectTo: string = "/") => {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}${redirectTo}`,
          data: { full_name: fullName ?? email },
        },
      });
      return { data, error };
    },
    []
  );

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    setSession(null);
    setUser(null);
    return { error };
  }, []);

  return {
    session,
    user,
    loading,
    signIn,
    signUp,
    signOut
  };
};
