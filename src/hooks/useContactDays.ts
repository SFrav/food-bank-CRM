import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/useToast';

export interface ContactDays {
  contact_id: string;
  day_of_week: number;
  is_available: boolean | null;
}

export function useContactDays(
) {
  const { toast } = useToast();
  const [contactDays, setContactDays] = useState<ContactDays[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined | null>(undefined);

  const fetchContactDays = useCallback(async (contactId: string) => {
    // if (!user) return;
    try {
      setLoading(true);
      setError(undefined);

      const { data, error: rpcErr } = await supabase.rpc('get_contact_days', { p_contact_id: contactId })


      if (rpcErr) throw rpcErr;
      setContactDays(data ?? []);
    } catch (err: unknown) {
      const error = err as { message?: string }; 
      console.error('Error fetching day availability:', err);
      setError(error.message);
      setContactDays([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const createContactDays = async (contactId: string, days: { day_of_week: number; is_available: boolean }[]) => {
    try {
      const { error: rpcErr } = await supabase.rpc('create_contact_days', {
        p_contact_id: contactId,
        p_days: days,
      });
      if (rpcErr) throw rpcErr;
      return { success: true };
    } catch (err: unknown) {
      const error = err as { message?: string };
      console.error(error);
      toast({ title: 'Error', description: error.message || 'Failed to create entries', variant: 'destructive' });
      return { success: false, error: error.message };
    }
  };

  const upsertContactDays = async (
    contactId: string,
    daySelected: number,
    bool?: boolean | null
  ) => {
    try{
      const { data, error: rpcErr } = await supabase.rpc('upsert_contact_days', {
        p_contact_id: contactId,
        p_day_of_week: daySelected,
        p_available: bool,
      });
      if (rpcErr) throw rpcErr;
      return { success: true };
    } catch (err: unknown) {
      const error = err as { message?: string }; 
      console.error(err);
      toast({ title: 'Error', description: error.message || 'Failed to update', variant: 'destructive' });
      return { data: null, error: error.message };
    }
  };

  const deleteContactDays = useCallback(
    async (id: string) => {
    try{
      const { data, error: rpcErr } = await supabase.rpc('delete_contact_days', {
        p_contact_id: id,
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
    contactDays,
    loading,
    error,
    createContactDays,
    upsertContactDays,
    deleteContactDays,
    fetchContactDays,
  };
}