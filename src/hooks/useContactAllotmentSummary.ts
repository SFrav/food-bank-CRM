import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/useToast';


export interface WeeklySummary {
  week_start: string; 
  cases: number;
  dropins: number;
  referrals: number;
  absent: number;
}

export const useContactAllotmentSummary = (
) => {
  const [data, setData] = useState<WeeklySummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<boolean | undefined>();
  const { toast } = useToast();

  const fetch = useCallback(async (
    divisionId: string | null,
    startDate: Date | null,   
    endDate: Date | null  
  ) => {
    if (!divisionId || !startDate || !endDate) {
      setData([]);
      return;
    }

    setLoading(true);
    setError(undefined);
    try {

      const { data: rpcData, error: rpcErr } = await supabase.rpc(
        'get_allotment_summary',
        {
          p_division_id: divisionId,
          p_start_ts: startDate.toISOString(),
          p_end_ts: endDate.toISOString(),
        }
      );

      if (rpcErr) throw rpcErr;
      setData(rpcData as WeeklySummary[]);
    } catch (err: unknown) {
      const message = (err as any).message || 'Failed to load summary';
      console.error(err);
      setError(true);
      toast({ title: 'Error', description: message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // useEffect(() => {
  //   fetch();
  // }, [fetch]);

  return { data, fetch, loading, error };
};