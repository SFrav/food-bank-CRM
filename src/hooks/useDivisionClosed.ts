import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/useToast';

export interface DivisionClosed {
  id: string
  division_id: string;
  date: string;
}

export const useDivisionClosed = () => {
  const { toast } = useToast();
  const [divisionClosed, setDivisionClosed] = useState<DivisionClosed[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchClosed = useCallback(async (divisionId: string) => {
    if (!divisionId) return;

    setLoading(true);
    try {
      const { data, error: rpcErr } = await supabase.rpc('get_division_closed', { p_division_id: divisionId });

      if (rpcErr) throw rpcErr;

      // setDivisionClosed(data ?? []);
      setDivisionClosed(prev => {
        // Remove any old entries for this division
        const withoutOld = prev.filter(c => c.division_id !== divisionId);
        // Add the freshly fetched rows
        return [...withoutOld, ...(data ?? [])];
      });
      // return divisionClosed;
    } catch (err: unknown) {
      const error = err as { message?: string };
      console.error('Error fetching division closed dates:', err);
      toast({
        title: 'Error',
        description: 'Could not load division closed dates',
        variant: 'destructive',
      });
      return undefined;
    } finally {
      setLoading(false);
    }
  }, []);

  const createClosed = useCallback(async (divisionId: string, date: string) => {
    try{
      const { data, error: rpcErr } = await supabase.rpc('create_division_closed', {
        p_division_id: divisionId,
        p_date: date
      });
      if (rpcErr) throw rpcErr;
      // if (!rpcErr) await fetchClosed(divisionId);
      return { success: true }
    } catch (err: unknown) {
      const error = err as { message?: string }; 
      console.error(error);
      toast({ title: 'Error', description: error.message || 'Failed to create', variant: 'destructive' });
      return { success: false, error: error.message };
    }
  }, []);

  const updateClosed = useCallback(async (
    id: string,
    date: string
  ) => {
    try {
      const { error: rpcErr } = await supabase.rpc('update_division_closed', {
        p_id: id,
        p_date: date
      });

      if (rpcErr) throw rpcErr;
      // if (!rpcErr) await fetchClosed(id);
      return { success: true };
    } catch (err: unknown) {
      const error = err as { message?: string };
      console.error('Error updating division closing date:', err);
      toast({
        title: 'Error',
        description: 'Could not save closed date',
        variant: 'destructive',
      });
      return { success: false, error: error.message };
    }
  }, []);

  const deleteClosed = useCallback(
    async (id: string) => {
    try{
      const { error: rpcErr } = await supabase.rpc('delete_division_closed', {
        p_id: id,
      });
      if (rpcErr) throw rpcErr;
      return { success: true };
    } catch (err: unknown) {
      const error = err as { message?: string }; 
      toast({ title: 'Error', description: error.message || 'Failed to delete', variant: 'destructive' });
      return { success: false, error: error.message };
    }
  },
  []
);

  return { 
    divisionClosed, 
    loading, 
    fetchClosed, 
    createClosed,
    updateClosed,
    deleteClosed 
  };
};