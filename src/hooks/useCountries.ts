import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useProfile } from './useProfile';
import { useToast } from '@/hooks/useToast';

export interface Country {
  id: string;
  name: string;
  code: string;
  is_active: boolean;
  created_at: string;
  created_by: string | null;
  updated_at: string;
}

export const useCountries = () => {
  const { isAdmin } = useProfile();
  const { toast } = useToast();
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined | null>(undefined);

  const fetchCountries = async () => {
      try {
        setLoading(true);
        setError(undefined);

        const { data, error: rpcErr } = await supabase.rpc('get_countries');

        if (rpcErr) throw rpcErr;
        setCountries(data as Country[] ?? []);
      } catch (err: unknown) {
        const error = err as { message?: string }; 
        console.error('Error fetching countries:', err);
        setError(error.message);
        setCountries([]);
      } finally {
        setLoading(false);
      }  
  };

  const createCountry = async (name: string, code: string) => {
    if (!isAdmin()) {
      throw new Error('Only admins can create countries');
    }
    try {
      const { data, error } = await supabase.rpc('create_country', {
        p_name: name,
        p_code: code
      }).single();

      if (error) throw error;
      await fetchCountries(); 
      return { data, error: null };
    } catch (err: unknown) {
      const error = err as { message?: string }; 
      console.error(error);
      toast({ title: 'Error', description: 'Failed to create country', variant: 'destructive' });
      return { data: null, error: error.message };
    }
  };

  const updateCountry = async (
    id: string,  
    name?: string | null, 
    code?: string | null, 
    is_active?: boolean 
  ) => {
    if (!isAdmin()) {
      throw new Error('Only admins can update countries');
    }
    try {
      const { data, error } = await supabase.rpc('update_country', {
        p_id: id,
        p_name: name,
        p_code: code,
        p_is_active: is_active
      });

      if (error) throw error;
      await fetchCountries(); 
      return { data, error: undefined };
    } catch (err: unknown) {
      const error = err as { message?: string };
      console.error(err)
      toast({ title: 'Error', description: 'Failed to update country', variant: 'destructive' });
      return { data: null, error: error.message };
    }
  };

  useEffect(() => {
    fetchCountries();
  }, []); 

  return {
    countries,
    loading,
    error,
    createCountry,
    updateCountry,
    refetch: fetchCountries,
  };
};