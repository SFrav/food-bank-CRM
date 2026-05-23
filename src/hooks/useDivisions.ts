import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface Division {
  id: string;
  name: string;
  entity_id: string | null;
  head_id: string | null;
  created_at: string;
}

export function useDivisions(
  entityId?: string | null
) {
  const { user } = useAuth();
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDivisions = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      setError(null);

      const { data, error: rpcErr } = entityId && entityId !== 'none'
        ? await supabase.rpc('get_divisions_by_entity', { p_entity_id: entityId })
        : await supabase.rpc('get_divisions_by_entity', { p_entity_id: null });

      if (rpcErr) throw rpcErr;
      setDivisions(data ?? []);
    } catch (err: any) {
      console.error('Error fetching divisions:', err);
      setError(err.message);
      setDivisions([]);
    } finally {
      setLoading(false);
    }
  }, [user, entityId]);

  useEffect(() => {
    fetchDivisions();
  }, [fetchDivisions]);

  const createDivision = async (name: string, entityId: string, headId?: string | null) => {
    const { data, error: rpcErr } = await supabase.rpc('create_division', {
      p_name: name,
      p_entity_id: entityId,
      p_head_id: headId,
    });
    if (rpcErr) throw rpcErr;
    await fetchDivisions();
    return data as string; // returns new division id
  };

  const updateDivision = async (
    id: string,
    name: string,
    entityId: string,
    headId?: string | null
  ) => {
    const { error: rpcErr } = await supabase.rpc('update_division', {
      p_id: id,
      p_name: name,
      p_entity_id: entityId,
      p_head_id: headId,
    });
    if (rpcErr) throw rpcErr;
    await fetchDivisions();
  };

  const deleteDivision = async (id: string) => {
    const { error: rpcErr } = await supabase.rpc('delete_division', {
      p_id: id,
    });
    if (rpcErr) throw rpcErr;
    await fetchDivisions();
  };

  return {
    divisions,
    loading,
    error,
    createDivision,
    updateDivision,
    deleteDivision,
    refetch: fetchDivisions,
  };
}