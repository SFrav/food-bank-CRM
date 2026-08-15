import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useProfile } from './useProfile';

export interface Region {
  id: string;
  name: string;
  code: string;
  is_active: boolean;
  created_at: string;
  created_by: string | null;
  updated_at: string;
}

export const useRegions = () => {
  const { isAdmin } = useProfile();
  const [regions, setRegions] = useState<Region[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined | null>(undefined);

  const fetchRegions = async () => {
      try {
        setLoading(true);
        setError(undefined);

        const { data, error: rpcErr } = await supabase.rpc('get_regions');

        if (rpcErr) throw rpcErr;
        setRegions(data as Region[] ?? []);
      } catch (err: unknown) {
        const error = err as { message?: string }; 
        console.error('Error fetching regions:', err);
        setError(error.message);
        setRegions([]);
      } finally {
        setLoading(false);
      }  
  };

  const createRegion = async (name: string, code: string) => {
    if (!isAdmin()) {
      throw new Error('Only admins can create regions');
    }
    try {
      const { data, error } = await supabase.rpc('create_region', {
        p_name: name,
        p_code: code
      }).single();

      if (error) throw error;
      await fetchRegions(); 
      return { data, error: null };
    } catch (err: unknown) {
      const error = err as { message?: string }; 
      console.error(error);
      return { data: null, error: error.message };
    }
  };

  const updateRegion = async (
    id: string,  
    name?: string | null, 
    code?: string | null, 
    is_active?: boolean 
  ) => {
    if (!isAdmin()) {
      throw new Error('Only admins can update regions');
    }
    try {
      const { data, error } = await supabase.rpc('update_region', {
        p_id: id,
        p_name: name,
        p_code: code,
        p_is_active: is_active
      });

      if (error) throw error;
      await fetchRegions(); 
      return { data, error: undefined };
    } catch (err: unknown) {
      const error = err as { message?: string };
      console.error(err)
      return { data: null, error: error.message };
    }
  };

  const deleteRegion = async (id: string) => {
    if (!isAdmin()) {
      throw new Error('Only admins can delete regions');
    }
    try {
      const { error } = await supabase.rpc('delete_region', {
        p_id: id
      });
      if (error) throw error;
      await fetchRegions(); 
      return { error: null };
    } catch (err: unknown) {
      const error = err as { message?: string }; 
      console.error('Delete error', err);
      return { error: error.message };
    }
  };

  useEffect(() => {
    fetchRegions();
  }, []); 

  return {
    regions,
    loading,
    error,
    createRegion,
    updateRegion,
    deleteRegion,
    refetch: fetchRegions,
  };
};