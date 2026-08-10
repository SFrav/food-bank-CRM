import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
//import { useProfile } from '@/hooks/useProfile';

export interface DivisionSummary {
  id: string;
  name: string;
  pending_beneficiaries: number;
  beneficiaries: number;
  referrers: number;
  workforce: number;
}

export function useDivisionSummary(
  entityId?: string | null
) {
  const { user } = useAuth();
  const [divisionSummary, setDivisions] = useState<DivisionSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>();

  const fetchDivisions = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      setError(undefined);

      const { data, error: rpcErr } = await supabase.rpc('get_division_summary', { p_entity_id: entityId ?? null });

      if (rpcErr) throw rpcErr;
      setDivisions(data ?? []);
    } catch (err: unknown) {
      const error = err as { message?: string }; 
      console.error('useDivisions error:', err);
      setError(error.message);
      setDivisions([]);
    } finally {
      setLoading(false);
    }
  }, [user, entityId]);

  useEffect(() => {
    fetchDivisions();
  }, [fetchDivisions]);

  return { 
    divisionSummary, 
    loading, 
    // error, 
    refetch: fetchDivisions 
  };
}