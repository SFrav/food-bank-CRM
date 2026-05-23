import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';

export interface DivisionSummary {
  id: string;
  name: string;
  pending_beneficiaries: number;
  beneficiaries: number;
  referrers: number;
  workforce: number;
}

export function useDivisions(
  entityId?: string | null,
  role?: string | null
) {
  const { user } = useAuth();
  const [divisions, setDivisions] = useState<DivisionSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDivisions = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      setError(null);

      let params: any = { p_entity_id: entityId ?? null };
      const { data, error: rpcErr } = await supabase.rpc('get_division_summary', params);

      if (rpcErr) throw rpcErr;
      setDivisions(data ?? []);
    } catch (err: any) {
      console.error('useDivisions error:', err);
      setError(err.message);
      setDivisions([]);
    } finally {
      setLoading(false);
    }
  }, [user, entityId, role]);

  useEffect(() => {
    fetchDivisions();
  }, [fetchDivisions]);

  return { 
    divisions, 
    loading, 
    error, 
    refetch: fetchDivisions 
  };
}