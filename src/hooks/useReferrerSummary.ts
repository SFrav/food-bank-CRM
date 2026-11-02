import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useProfile } from '@/hooks/useProfile';

export interface ReferrerSummary {
  id: string;
  name: string;
  pending_beneficiaries: number;
  beneficiaries: number;
  workforce: number;
}

export function useReferrerSummary(
  entityId?: string | null
) {
  const { profile } = useProfile();
  const [referrerSummary, setReferrers] = useState<ReferrerSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>();

  const fetchReferrers = useCallback(async () => {
    if (!profile || profile.role !== 'referrer') {
        setLoading(false);
        return;
      }
    try {
      setLoading(true);
      setError(undefined);

      const { data, error: rpcErr } = await supabase.rpc('get_referrals_by_caller_summary');

      if (rpcErr) throw rpcErr;
      setReferrers(data ?? []);
    } catch (err: unknown) {
      const error = err as { message?: string };
      console.error('useReferrerSummary error:', err);
      setError(error.message);
      setReferrers([]);
    } finally {
      setLoading(false);
    }
  }, [profile, entityId]);

  useEffect(() => {
    fetchReferrers();
  }, [fetchReferrers]);

  return {
    referrerSummary,
    loading,
    error,
    refetch: fetchReferrers
  };
}