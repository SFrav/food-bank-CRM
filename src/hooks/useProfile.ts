// import { useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { queryKeys } from './queryKeys';

export interface UserProfile {
  id: string;
  user_id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  role: 'pending' | 'referrer' | 'associate' | 'specialist' | 'branch_manager' | 'manager' | 'head' | 'admin';
  entity_id: string | null;
  entity?: string | null;
  division_id: string | null;
  division?: string | null;
  region_id: string | null;
  region: string | null;
  manager_id?: string | null;
  created_at: string;
  updated_at: string | null;
}

export const profileQueryOptions = (userId: string | undefined) => ({
  queryKey: queryKeys.profile(userId),
  enabled: !!userId,
  staleTime: Infinity, //@Profile is stable - invalidated when table is changed
  cacheTime: 1000 * 60 * 60 * 24, 
  queryFn: async (): Promise<UserProfile | null> => {
    const { data, error } = await supabase.rpc('user_get_profile');
    if (error) throw error;
    return (data as UserProfile[])[0] ?? null;
  },
});

export const useProfile = () => {
  const { user } = useAuth();
  const query = useQuery(profileQueryOptions(user?.id));

  const profile = query.data ?? null;

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user || !profile) return { data: null, error: 'No user or profile found' };
    try {
      const { error } = await supabase.rpc('user_update_profile', {
        p_user_id: user.id,
        p_full_name: updates.full_name,
        p_phone: updates.phone,
      });
      if (error) throw error;

      query.refetch();
      return { data: null, error: null };
    } catch (err: unknown) {
      // console.error(err);
      const error = err as { message?: string };
      return { data: null, error: error.message };
    }
  };

  // Role helpers
  const isAdmin = () => profile?.role === 'admin';
  const isHead = () => profile?.role === 'head';
  const isManager = () => profile?.role === 'manager';
  const isAccountManager = () => profile?.role === 'branch_manager';
  const isSpecialist = () => profile?.role === 'specialist';
  const isPending = () => profile?.role === 'pending';
  const hasRole = (r: UserProfile['role']) => profile?.role === r;

  const canAccessDivisionData = () =>
    ['head', 'manager', 'admin'].includes(profile?.role ?? '');
  const canManageRoles = () =>
    ['manager', 'admin'].includes(profile?.role ?? '');

  const getRoleDisplayName = () => {
    const names: Record<string, string> = {
      admin: 'System Administrator',
      head: 'Level Head',
      manager: 'Level Manager',
      branch_manager: 'Branch Manager',
      specialist: 'Specialist',
      pending: 'Pending Approval',
    };
    return names[profile?.role ?? ''] ?? profile?.role ?? '';
  };

  return {
    profile,
    loading: query.isLoading,
    error: query.error?.message ?? null,
    updateProfile,
    refetch: query.refetch,
    hasRole,
    canAccessDivisionData,
    canManageRoles,
    isAdmin,
    isHead,
    isManager,
    isAccountManager,
    isSpecialist,
    isPending,
    getRoleDisplayName,
    getDisplayName: () => profile?.full_name ?? ''
  };
};

