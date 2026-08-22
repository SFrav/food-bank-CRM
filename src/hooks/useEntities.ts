import { useState, useEffect } from 'react';
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useProfile } from './useProfile';
import { useAuth } from '@/hooks/useAuth';

export interface Entity {
  id: string;
  name: string;
  code: string | null;
  is_active: boolean;
  is_referrer: boolean | false;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export const useEntities = () => {
  const { profile } = useProfile();
  const { user } = useAuth();  
  const [entities, setEntities] = useState<Entity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined | null>(undefined);

  const fetchEntities = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase.rpc('get_entities');

      if (error) throw error;
      setEntities(data || []);
    } catch (err: unknown) {
      const error = err as { message?: string }; 
      console.error('Error fetching entities:', err);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const createEntity = async (name: string, code?: string, is_referrer?: boolean) => {
    if (!profile?.role || profile.role !== 'admin') {
      throw new Error('Only admins can create entities');
    }

    try {
      const { data: entityId, error: rpcError } = await supabase.rpc('admin_create_entity', {
        p_name: name,
        p_code: code || null,
        p_referrer: is_referrer || false
      });

      if (rpcError) {
        console.error('Error creating entity via RPC:', rpcError);
        throw rpcError;
      }
      
      await fetchEntities();
      return { entityId, error: null };
    } catch (err: unknown) {
      const error = err as { message?: string }; 
      console.error('Error creating entity:', error);
      return { data: null, error: error.message };
    }
  };

  const updateEntity = async (id: string, updates: { name?: string; code?: string; is_active?: boolean, is_referrer?: boolean }) => {
    if (!profile?.role || profile.role !== 'admin') {
      throw new Error('Only admins can update entities');
    }

    try {
      const { data, error: rpcError } = await supabase.rpc('admin_update_entity', {
        p_entity_id: id,
        p_name: updates.name || null,
        p_code: updates.code || null,
        p_is_active: updates.is_active ?? null,
      });

      if (rpcError) {
        console.error('Error updating entity via RPC:', rpcError);
        throw rpcError;
      }

      // if (!success) {
      //   throw new Error('Entity not found or update failed');
      // }

      await fetchEntities();
      return { success: true, error: null };
      // return { data, error: null };
    } catch (err: unknown) {
      const error = err as { message?: string }; 
      console.error('Error updating entity:', error);
      return { success: false, error: error.message };
    }
  };

  const deleteEntity = async (id: string) => {
    if (!profile?.role || profile.role !== 'admin') {
      throw new Error('Only admins can delete entities');
    }

    try {
      const { data, error: rpcError } = await supabase.rpc('admin_delete_entity', {
        p_entity_id: id
      });

      if (rpcError) {
        console.error('Error deleting entity via RPC:', rpcError);
        throw rpcError;
      }

      // if (!success) {
      //   throw new Error('Entity not found or delete failed');
      // }

      await fetchEntities();
      return { success: true };
    } catch (err: unknown) {
      const error = err as { message?: string }; 
      console.error('Error deleting entity:', err);
      return { success: false, error: error.message };
    }
  };

  useEffect(() => {
    if (!profile) return;
      (async () => {
        await fetchEntities();
      })();
    }, [profile]);

  return {
    entities,
    loading,
    error,
    createEntity,
    updateEntity,
    deleteEntity,
    refetch: fetchEntities,
  };
};