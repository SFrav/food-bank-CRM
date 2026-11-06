import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useProfile } from '@/hooks/useProfile';
import { useToast } from '@/hooks/useToast';

export const usePasswordReset = () => {
  const { profile } = useProfile();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [resetEmail, setResetEmail] = useState<string>('');

  const validateResetEmail = useMemo(() => {
    if (!resetEmail) return 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(resetEmail)) return 'Invalid email format';
    return null;
  }, [resetEmail]);

  const executeResetByEmail = useCallback(async () => {
    if (validateResetEmail) return;
    setLoading(true);
    setStatus('idle');
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {redirectTo: 'https://localhost:8081/auth/recover'});
      if (error) throw error;
      setStatus('success');
      toast({ title: 'Reset Email Sent', description: 'Check your inbox for password recovery instructions', variant: 'default' });
    } catch (err: unknown) {
      const e = err as { message?: string };
      setStatus('error');
      toast({ title: 'Reset Failed', description: e.message || 'Unable to send reset email', variant: 'destructive' });
    } finally {
      setStatus('idle');
      setResetEmail('');
      setLoading(false);
    }
  }, [resetEmail, validateResetEmail]);

  const executeChangeByPassword = useCallback(async (oldPassword: string, newPassword: string) => {
    if (!profile) return;
    setLoading(true);
    try {
      const { error } = await supabase.rpc('update_user_password', {p_old_password: oldPassword, p_new_password: newPassword});
      if (error) throw error;
      toast({ title: 'Success', description: 'Password reset', variant: 'default' });
    } catch (err: unknown) {
      const e = err as { message?: string };
      toast({ title: 'Reset Failed', description: e.message || 'Unable to reset password', variant: 'destructive' });
    } finally {
      setResetEmail('');
      setLoading(false);
    }
  }, [profile, resetEmail, validateResetEmail]);

  const setSession = useCallback(async (accessToken: string, refreshToken: string) => {
    try {
      const { error } = await supabase.auth.setSession({access_token: accessToken, refresh_token: refreshToken});
      if (error) throw error;
    } catch (err: unknown) {
      const e = err as { message?: string };
    } 
  }, []);

  const executeChangeByLink = useCallback(async (newPassword: string) => {
    if (!profile) return;
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      toast({ title: 'Success', description: 'Password reset', variant: 'default' });
    } catch (err: unknown) {
      const e = err as { message?: string };
      toast({ title: 'Reset Failed', description: e.message || 'Unable to reset password', variant: 'destructive' });
    } finally {
      setResetEmail('');
      setLoading(false);
    }
  }, [profile, resetEmail, validateResetEmail]);

  return { 
    status, 
    resetEmail, 
    executeResetByEmail,
    executeChangeByPassword,
    setSession,
    executeChangeByLink,
    setResetEmail, 
    validateResetEmail, 
    loading, 
    };
};
