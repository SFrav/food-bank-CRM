import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Users {
  id: string;
  email: string;
  full_name: string | null;
  role: 'pending' | 'referrer' | 'volunteer' |  'staff' | 'branch_manager' | 'manager' | 'head' | 'admin';
  entity_id: string | null;
  division_id: string | null;
  manager_id: string | null;
  region_id: string | null;
  status: 'active' | 'inactive' | 'suspended';
}

export function useAdminUsers(query: string, roleFilter: string) {
  const [users, setUsers] = useState<Users[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>();

  const roleMap: Record<string, string | null> = {
    all: null,
    admin: 'admin',
    head: 'head',
    manager: 'manager',
    referrer: 'referrer',
    branch_manager: 'branch_manager',
    staff: 'staff',
    volunteer: 'volunteer',
    pending: 'pending',
  };

  const fetchUsers = useCallback(async () => {
    const p_query = query?.trim() ? query.trim() : null;
    const p_role = roleMap[roleFilter] ?? null;

    try{
      setLoading(true);
      const { data, error } = await supabase.rpc('get_users_with_profiles', {
        p_query,
        p_role,
      });

      if (error) throw error;
      setUsers(data ?? []);
    } catch (err: unknown) {
      const error = err as { message?: string }; 
      console.error('Error fetching divisions:', err);
      setError(error.message);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [query, roleFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const refetch = useCallback(() => {
    // sessionStorage.clear();
    fetchUsers();
  }, [fetchUsers]);

  const updateUserProfile = async (
    userId: string,
    role: 'admin' | 'head' | 'manager' | 'referrer' | 'branch_manager' | 'staff' | 'volunteer' |  'pending',
    entityId?: string | null,
    teamId?: string | null,
    managerId?: string | null,
    regionId?: string | null
  ) => {
    try {
      const { data: rpcResult, error: rpcError } = await supabase.rpc(
        'admin_update_user_profile',
        {
          p_profile_id: userId,
          p_role: role,
          p_entity_id: entityId ?? null,
          p_division_id: teamId ?? null,
          p_manager_id: managerId ?? null,
          p_region_id: regionId ?? null
        },
      );

      if (rpcError) {
        console.error('RPC Update Error:', rpcError);
        return { success: false, error: rpcError.message };
      }

      if (rpcResult === false || rpcResult === null) {
        return {
          success: false,
          error: 'Update failed: User profile not found or update failed.',
        };
      }

      // Update local state instantly
      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId
            ? {
                ...u,
                role,
                entity_id: entityId,
                division_id: teamId,
                manager_id: managerId,
              }
            : u,
        ),
      );

      // Re‑cache the list
      // sessionStorage.clear();
      refetch();

      return { success: true };
    } catch (err: unknown) {
      const error = err as { message?: string }; 
      console.error('Unexpected error in updateUserProfile:', err);
      return { success: false, error: error.message };
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      const { data, error } = await supabase.rpc('admin_delete_user', {
        p_id: userId,
      });

      if (error) {
        console.error('RPC error:', error);
        return { success: false, error: error.message };
      }

      if (data?.success === false) {
        console.error('Delete failed:', data.error);
        return { success: false, error: data.error };
      }

      // sessionStorage.clear();
      refetch();
      return { success: true, message: data?.message };
    } catch (err: unknown) {
      const error = err as { message?: string }; 
      console.error('Unexpected error:', err);
      return { success: false, error: error.message };
    }
  };

  return { 
    users, 
    loading, 
    error,
    refetch, 
    updateUserProfile, 
    deleteUser 
  };
}