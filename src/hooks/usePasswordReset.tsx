import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/useToast';

export const usePasswordReset = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [resetEmail, setResetEmail] = useState<string>('');

  const validateResetEmail = useMemo(() => {
    if (!resetEmail) return 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(resetEmail)) return 'Invalid email format';
    return null;
  }, [resetEmail]);

  const executeReset = useCallback(async () => {
    if (validateResetEmail) return;
    setLoading(true);
    setStatus('idle');
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail);
      if (error) throw error;
      setStatus('success');
      toast({ title: 'Reset Email Sent', description: 'Check your inbox for password recovery instructions.', variant: 'default' });
    } catch (err: unknown) {
      const e = err as { message?: string };
      setStatus('error');
      toast({ title: 'Reset Failed', description: e.message || 'Unable to send reset email.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [resetEmail, validateResetEmail, toast]);

  const clearStatus = useCallback(() => {
    setStatus('idle');
    setResetEmail('');
  }, []);

  return { 
    status, 
    resetEmail, 
    executeReset,
    setResetEmail, 
    validateResetEmail, 
    loading, 
    clearStatus };
};
