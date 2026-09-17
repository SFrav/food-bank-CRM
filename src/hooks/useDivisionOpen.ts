import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/useToast';

export interface DivisionOpen {
  id: string;
  day_of_week: number;
  is_open: boolean;
  open_time: string | null;
  close_time: string | null;
}

export const useDivisionOpen = () => {
  const { toast } = useToast();
  const [openMap, setOpenMap] = useState<Record<string, Record<number, DivisionOpen>>>({});
  const [loading, setLoading] = useState(false);
  // const openMapRef = useRef(openMap);
  // openMapRef.current = openMap;

  const fetchOpen = useCallback(async (division_id: string) => {
    if (!division_id) return;

    setLoading(true);
    try {
      const { data, error: rpcErr } = await supabase.rpc('get_division_open', { p_division_id: division_id });

      if (rpcErr) throw rpcErr;

      const rawData = data as DivisionOpen[];
      const local: Record<number, DivisionOpen> = {};
      rawData?.forEach(d => {
        local[d.day_of_week] = { id: d.id, day_of_week: d.day_of_week, is_open: d.is_open, open_time: d.open_time, close_time: d.close_time };
      });

      setOpenMap(prev => ({ ...prev, [division_id]: local }));
      return local;
    } catch (err: unknown) {
      const error = err as { message?: string };
      console.error('Error fetching division opening hours:', err);
      toast({
        title: 'Error',
        description: 'Could not load division opening hours',
        variant: 'destructive',
      });
      return undefined;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateOpen = useCallback(async (
    division_id: string,
    day_of_week: number,
    is_open: boolean,
    open_time: string | null,
    close_time: string | null
  ) => {
    try {
      const { error } = await supabase.rpc('upsert_division_open', {
        p_division_id: division_id,
        p_day_of_week: Math.floor(day_of_week),
        p_is_open: is_open,
        p_open_time: open_time,
        p_close_time: close_time,
      });

      if (error) throw error;
      if (!error) await fetchOpen(division_id);
      return { success: true };
    } catch (err: unknown) {
      const error = err as { message?: string };
      console.error('Error updating division opening hours:', err);
      toast({
        title: 'Error',
        description: 'Could not save opening hours',
        variant: 'destructive',
      });
      return { success: false, error: error.message };
    }
  }, [fetchOpen]);

  return { 
    openMap, 
    loading, 
    fetchOpen, 
    updateOpen };
};