import { useCallback, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ViolationMessages } from '@/integrations/supabase/violations';
import { useToast } from '@/hooks/useToast';

export interface ReferrerWeeklySummary {
  week_start: string;
  cases: number;
  referrals: number;
  absent: number;
  workforce?: number;
}

export const useReferrerAllotmentSummary = (
  mode: 'caller' | 'entity'
) => {
  const [data, setData] = useState<ReferrerWeeklySummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<boolean | undefined>();
  const { toast } = useToast();

  const fetchSummary = useCallback(async (
    startDate: Date | null,
    endDate: Date | null
  ) => {
    if (!startDate || !endDate) {
      setData([]);
      return;
    }

    setLoading(true);
    setError(undefined);
    try {

      const { data: rpcData, error: rpcErr } = await supabase.rpc(mode === 'caller' ? 
        'get_allotment_by_caller_summary' : 'get_allotment_by_entity_summary', {
        p_start_ts: startDate.toISOString(),
        p_end_ts: endDate.toISOString(),
      });
      if (rpcErr) throw rpcErr;
      setData(rpcData as ReferrerWeeklySummary[] | undefined);

    } catch (err: unknown) {
      const error = err as { message?: string };
      console.error(err);
      setError(true);
      try {
        ViolationMessages(err, 'Failed to fetch contact.');
      } catch (customError) {
        toast({ title: 'Error', description: (customError as Error).message, variant: 'destructive' });
      }
      // toast({ title: 'Error', description: error.message || "Failed to load", variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [mode]);

  return { data, fetch: fetchSummary, loading, error };
};