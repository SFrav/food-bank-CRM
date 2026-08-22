import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface UserProfile {
  id: string;
  user_id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  role: 'pending' | 'referrer' | 'volunteer' |  'staff' | 'branch_manager' | 'manager' | 'head' | 'admin';
  entity_id: string | null;
  entity?: string | null;
  division_id: string | null;
  division?: string | null; 
  region_id: string | null;
  region: string | null;
  manager_id?: string | null;
  user_status: 'active' | 'inactive' | 'resigned' | 'terminated' | 'leave';
  is_active: boolean;
  created_at: string;
  updated_at: string | null;
}

export const useProfile = () => {
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data: profileData, error: fetchError } = await supabase.rpc('user_get_profile');

      if (fetchError) throw fetchError;

      setProfile((profileData as UserProfile[])[0] ?? null);

    } catch (err: unknown) {
      const error = err as { message?: string }; 
      console.error('useProfile fetch error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!authLoading) fetchProfile();
  }, [authLoading, fetchProfile]);

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user || !profile) return { error: 'No user or profile found' };
    try {
      const { data, error } = await supabase.rpc('user_update_profile', {
        p_user_id: user.id,
        p_full_name: updates.full_name,
        p_phone: updates.phone,
      });
      if (error) throw error;

      await fetchProfile(); 

      return { data: null, error: null };
    } catch (err: unknown) {
      const error = err as { message?: string }; 
      return { data: null, error: error.message };
    }
  };

  // Role helpers
  const isAdmin = () => profile?.role === 'admin';
  const isHead = () => profile?.role === 'head';
  const isManager = () => profile?.role === 'manager';
  const isAccountManager = () => profile?.role === 'branch_manager';
  const isStaff = () => profile?.role === 'staff';
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
      staff: 'Staff',
      pending: 'Pending Approval',
    };
    return names[profile?.role ?? ''] ?? profile?.role ?? '';
  };

  return {
    profile,
    loading: loading || authLoading,
    error,
    updateProfile,
    refetch: fetchProfile,
    hasRole,
    canAccessDivisionData,
    canManageRoles,
    isAdmin,
    isHead,
    isManager,
    isAccountManager,
    isStaff,
    isPending,
    getRoleDisplayName,
    getDisplayName: () => profile?.full_name ?? ''
  };
};
