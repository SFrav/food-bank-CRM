import { useEffect, useState, useCallback } from 'react';
import { FunctionsHttpError } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
// import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { useToast } from '@/hooks/useToast';

export interface ProfileReview {
  id: string;
  email: string;
  full_name: string | null;
  role: 'pending' | 'referrer' | 'associate' |  'specialist' | 'branch_manager' | 'manager' | 'head' | 'admin';
  is_active: boolean;
  entity_id: string | null;
  division_id: string | null;
  manager_id: string | null;
  region_id: string | null;
  status: 'active' | 'inactive' | 'suspended';
}

export function useAdminUsers(query: string, roleFilter: string) {
  const { toast } = useToast();
  const { profile } = useProfile();
  // const { user } = useAuth(); //is_super_admin is not available
  const [profileReview, setProfileReview] = useState<ProfileReview[]>([]); //@This is too similar to useAuth user export. Revise to profileReview and ensure that it's only used in the manage user section
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>();

  const roleMap: Record<string, string | null> = {
    all: null,
    admin: 'admin',
    head: 'head',
    manager: 'manager',
    referrer: 'referrer',
    branch_manager: 'branch_manager',
    specialist: 'specialist',
    Associate: 'associate',
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
      setProfileReview(data as ProfileReview[] ?? []);
    } catch (err: unknown) {
      const error = err as { message?: string }; 
      console.error('Error fetching divisions:', err);
      setError(error.message);
      setProfileReview([]);
    } finally {
      setLoading(false);
    }
  }, [query, roleFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const refetch = useCallback(() => {
    fetchUsers();
  }, [fetchUsers]);

  const updateUserProfile = async (
    userId: string, updates: {
    role?: 'admin' | 'head' | 'manager' | 'referrer' | 'branch_manager' | 'specialist' | 'associate' |  'pending',
    is_active?: boolean,
    entityId?: string | null,
    divisionId?: string | null,
    managerId?: string | null,
    regionId?: string | null
    }
  ) => {
    try {
      const { data: rpcResult, error: rpcError } = await supabase.rpc('admin_update_user_profile', {
          p_profile_id: userId,
          p_role: updates.role ?? null,
          p_is_active: updates.is_active ?? null,
          p_entity_id: updates.entityId || null,
          p_division_id: updates.divisionId || null,
          p_manager_id: updates.managerId || null,
          p_region_id: updates.regionId || null
        });

      if (rpcError) {
        console.error('RPC Update Error:', rpcError);
        return { success: false, error: rpcError.message };
      }

      if (rpcResult === false || rpcResult === null) {
        return {
          success: false,
          error: 'Failed to update user',
        };
      }

      // Update local state instantly
      setProfileReview((prev) =>
        prev.map((u) =>
          u.id === userId
            ? {
                ...u,
                role: updates.role,
                is_active: updates.is_active,
                entity_id: updates.entityId,
                division_id: updates.divisionId,
                manager_id: updates.managerId,
                region_id: updates.regionId,
              }
            : u,
        ),
      );

      refetch();

      return { success: true };
    } catch (err: unknown) {
      const error = err as { message?: string }; 
      console.error('Unexpected error in updateUserProfile:', err);
      return { success: false, error: error.message };
    }
  };

  const deleteUser = useCallback(async (userId: string) => {
    // if(profile?.role !== 'admin') return;
    // if (users?.role !== 'admin') return; //@role doesn't exist on ProfileReview?
    try {
      const { data, error } = await supabase.rpc('admin_delete_user', {
        p_id: userId,
      });

      if (data === false || error) {
        console.error('Delete failed:', error);
        return { success: false, error: error };
      }
      if (data) {
        const { error: authError } = await supabase.functions.invoke('edgeUserDelete', {
          body: { userId }
        });
        if (authError) {
          let errorMessage = authError.message;
          
          if (authError instanceof FunctionsHttpError) {
            try {
              const errorBody = await authError.context.json();
              errorMessage = errorBody.error || errorMessage;
            } catch (e) {
              // Fallback if parsing fails
            }
          }
          console.error('Edge function failed:', errorMessage);
          // toast({ title: 'Partial Delete', description: 'Profile deleted, but Auth removal failed', variant: 'destructive' });
          throw new Error(errorMessage);
        }
      }
      
      refetch();
      return { success: true };
    } catch (err: unknown) {
      const error = err as { message?: string }; 
      console.error('Unexpected error:', err);
      toast({ title: 'Error', description: error.message || 'Failed to delete', variant: 'destructive' });
      return { success: false, error: error.message };
    }
  }, [profile]);

  return { 
    profileReview, 
    loading, 
    error,
    refetch, 
    updateUserProfile, 
    deleteUser 
  };
}