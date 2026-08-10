import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';

export interface Division {
  id: string;
  name: string;
  entity_id: string | null;
  head_id: string | null;
  manager_id: string | null;
  created_at: string;
  region_id: string | null;
}

export function useDivisions(
  entityId?: string | null
) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined | null>(undefined);

  const fetchDivisions = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      setError(undefined);

      const { data, error: rpcErr } = entityId && entityId !== 'none'
        ? await supabase.rpc('get_divisions_by_entity', { p_entity_id: entityId })
        : await supabase.rpc('get_divisions_by_entity', { p_entity_id: null });

      if (rpcErr) throw rpcErr;
      setDivisions(data ?? []);
    } catch (err: unknown) {
      const error = err as { message?: string }; 
      console.error('Error fetching divisions:', err);
      setError(error.message);
      setDivisions([]);
    } finally {
      setLoading(false);
    }
  }, [user, entityId]);

  useEffect(() => {
    fetchDivisions();
  }, [fetchDivisions]);

  const createDivision = async (name: string, entityId: string, headId?: string | null) => {
    try{
      const { data, error: rpcErr } = await supabase.rpc('create_division', {
        p_name: name,
        p_entity_id: entityId,
        p_head_id: headId,
      });
      if (rpcErr) throw rpcErr;
      await fetchDivisions();
      return data as string; // returns new division id
    } catch (err: unknown) {
      const error = err as { message?: string }; 
      console.error(error);
      return { data: null, error: error.message };
    }
  };

  const updateDivision = async (
    id: string,
    name: string,
    entityId: string,
    headId?: string | null
  ) => {
    try{
      const { error: rpcErr } = await supabase.rpc('update_division', {
        p_id: id,
        p_name: name,
        p_entity_id: entityId,
        p_head_id: headId,
      });
      if (rpcErr) throw rpcErr;
      await fetchDivisions();
    } catch (err: unknown) {
      const error = err as { message?: string }; 
      console.error(err);
      return { data: null, error: error.message };
    }
  };

  const deleteDivision = useCallback(
    async (id: string) => {
    try{
      const { error: rpcErr } = await supabase.rpc('delete_division', {
        p_id: id,
      });
      if (rpcErr) throw rpcErr;
      await fetchDivisions();
      return { success: true };
    } catch (err: unknown) {
      const error = err as { message?: string }; 
      toast({ title: 'Error', description: error.message || 'Failed to delete', variant: 'destructive' });
      return { success: false, error: error.message };
    }
  },
  [fetchDivisions, toast]
);

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