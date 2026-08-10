import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/useToast';

export interface ContactAllotment {
  allotment_id: string;
  contact_id: string;
  date: string;
  visit_num: number | null;
  attended: boolean | null;
  serving: boolean | null;
  served: boolean | null;
  visit_type: "referral" | "drop_in";
  updated_at: string;
}

export const useContactAllotment = (contactId: string | null) => {
  const [allotment, setAllotment] = useState<ContactAllotment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const { toast } = useToast();

  const fetch = useCallback(async () => {
    if (!contactId) return;
    setLoading(true);
    setError(undefined);
    try{
      const { data, error: err } = await supabase
        .rpc('get_allotment', { p_contact_id: contactId });
      if (err) throw err;
      setAllotment(data as ContactAllotment[] ?? []);
        } catch (err: unknown) {
          const error = err as { message?: string }; 
          console.error(err);
          setError(error.message || 'Failed to load allotment');
          toast({ title: 'Error', description: error.message || 'Failed to load allotment', variant: 'destructive' });
        } finally {
        setLoading(false);
      }
    }, [toast, contactId]);

  const markAttendance = useCallback(
    async (id: string) => {
      setLoading(true);
      try {
        await supabase.rpc('mark_allotment_attendance', { p_id: id});
        setAllotment(prev => prev.map(n => (n.allotment_id === id ? { ...n, attended: true } : n)));
        setLoading(false);
        fetch();
        return { success: true };
      } catch (err: unknown) { 
        const error = err as { message?: string };
        console.error(err);
        return { success: false, error: error.message };
      } finally {
        setLoading(false);
      }
    }, [fetch]);

  const toggleAllotmentServing = useCallback(
    async (id: string) => {
      setLoading(true);
      try {
        await supabase.rpc('toggle_allotment_serving', { p_id: id});
        setAllotment(prev => prev.map(n => n.allotment_id === id ? { ...n, serving: !n.serving } : n));
        fetch();
        return { success: true };
      } catch (err: unknown) {
        const error = err as { message?: string }; 
        console.error(err);
        return { success: false, error: error.message };
      } finally {
        setLoading(false);
      }
    }, [fetch]);

  const markServed = useCallback(
    async (id: string) => {
      setLoading(true)
      try {
        await supabase.rpc('mark_allotment_served', { p_id: id});
        setAllotment(prev => prev.map(n => n.allotment_id === id ? { ...n, served: true } : n));
        fetch();
        return { success: true };
      } catch (err: unknown) { 
        const error = err as { message?: string };
        console.error(err);
        return { success: false, error: error.message };
      } finally {
        setLoading(false);
      }
    }, [fetch]);

  const insertDiscretionary = useCallback(
    async (
      type: "referral" | "drop_in" | "",
      note: string,
      userId: string
    ) => {
      if (!contactId) return { success: false, error: 'No contact' };
      setLoading(true);
      const { data, error: rpcError } = await supabase.rpc(
        'insert_allotment_discretionary', {
          p_contact_id: contactId,
          p_user_id: userId,
          p_type: type || "drop_in",
          p_date: new Date().toISOString(),
          p_note: note,
        }
      ).single();
      setLoading(false);
      if (rpcError) {
        console.error('Error inserting allotment:', rpcError);
        // toast({ title: 'Error', description: rpcError.message, variant: 'destructive' });
        return { success: false, error: rpcError.message };
      }
      fetch();
      // toast({ title: 'Success', description: 'Visit approved' });
      return { success: true };
    },
    [fetch]
  );

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { 
    allotment, 
    fetch, 
    loading,
    error,
    markAttendance,
    toggleAllotmentServing,
    markServed,
    insertDiscretionary
  };
};