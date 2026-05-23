import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useAdminUsers(query: string, roleFilter: string) {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const roleMap: Record<string, string | null> = {
    all: null,
    admin: 'admin',
    head: 'head',
    manager: 'manager',
    account_manager: 'account_manager',
    staff: 'staff',
    pending: 'pending',
  };

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    const p_query = query?.trim() ? query.trim() : null;
    const p_role = roleMap[roleFilter] ?? null;
    const cacheKey = `adminUsers_${p_query ?? ''}_${p_role ?? ''}`;

    // Try session‑storage cache first
    const cached = sessionStorage.getItem(cacheKey);
    if (cached) {
      setUsers(JSON.parse(cached));
      setLoading(false);
      return;
    }

    const { data, error } = await supabase.rpc('get_users_with_profiles', {
      p_query,
      p_role,
    });

    if (error) {
      console.error('get_users_with_profiles error', error);
      setUsers([]);
    } else {
      const mapped = (data ?? []).map((u: any) => ({
        ...u,
        role: u.role ?? 'pending',
      }));
      setUsers(mapped);
      sessionStorage.setItem(cacheKey, JSON.stringify(mapped));
    }
    setLoading(false);
  }, [query, roleFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const refetch = useCallback(() => {
    sessionStorage.clear();
    fetchUsers();
  }, [fetchUsers]);

  const updateUserProfile = async (
    userId: string,
    role: string,
    entityId?: string | null,
    teamId?: string | null,
    managerId?: string | null,
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
      sessionStorage.clear();
      refetch();

      return { success: true };
    } catch (e: any) {
      console.error('Unexpected error in updateUserProfile:', e);
      return { success: false, error: e.message };
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

      sessionStorage.clear();
      refetch();
      return { success: true, message: data?.message };
    } catch (err: any) {
      console.error('Unexpected error:', err);
      return { success: false, error: err.message };
    }
  };

  return { users, loading, refetch, updateUserProfile, deleteUser };
}