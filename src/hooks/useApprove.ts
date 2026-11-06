import { useState, useCallback, useEffect } from 'react';
import { FunctionsHttpError } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
// import { crypto } from 'crypto';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { useProfile } from '@/hooks/useProfile';

const generateSecureTempPassword = (): string => {
  const bytes = new Uint8Array(10);
  crypto.getRandomValues(bytes);  
  const base64 = btoa(String.fromCharCode(...bytes));
  return base64.replace(/[^a-zA-Z0-9]/g, '').slice(0, 16);
};


export interface HoldingUser {
  id: string;
  email: string;
  full_name: string;
  role: string;
  country_id: string;
  region_id: string;
  entity_id: string | null;
  created_at: string;
}

export interface HoldingEntity {
  id: string;
  country_id: string; 
  country_name: string;
  region_id: string; 
  region_name: string;
  name: string;
  code: string;
  head_id: string;
  is_referrer: boolean;
  created_at: string;
}



export interface HoldingCombined {
  id: string; //This is the HoldingUser ID
  email: string;
  full_name: string; 
  role: string;
  country_id: string;
  region_id: string;
  entity_id: string | null;
  entity_name: string | null; 
  entity_code: string | null; 
  entity_is_referrer: boolean| null;
  created_at: string;
}

export const useApprove = () => {
  const { user } = useAuth();
  const { profile } = useProfile();
  const { toast } = useToast();

  const [holdingUsers, setHoldingUsers] = useState<HoldingUser[]>([]);
  const [holdingEntities, setHoldingEntities] = useState<HoldingEntity[]>([]);
  const [holdingCombined, setHoldingCombined] = useState<HoldingCombined[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHoldingUsers = useCallback(async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase.rpc('get_holding_users');
      if (error) throw error;
      setHoldingUsers(data || []);
    } catch (err: unknown) {
      const e = err as { message?: string };
      setError(e.message || 'Failed to fetch user applications');
    }
  }, [user]);

  // Fetch Holding Entities
  const fetchHoldingEntities = useCallback(async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase.rpc('get_holding_entities');
      if (error) throw error;
      setHoldingEntities(data || []);
    } catch (err: unknown) {
      const e = err as { message?: string };
      setError(e.message || 'Failed to fetch entity applications');
    }
  }, [user]);

  const fetchHoldingCombined = useCallback(async (p_id?: string) => {
    if (!user) return;
    try {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase.rpc('get_holding_combined', { p_id: p_id || null });
      if (error) throw error;
      setHoldingCombined(data || []);
    } catch (err: unknown) {
      const e = err as { message?: string };
      console.log(err);
      setError(e.message || 'Failed to fetch applications');
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Approve User Logic
  const approveUser = useCallback(async (holdingUserId: string) => {
    if (!profile || !['admin', 'head'].includes(profile.role)) return;
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchErr } = await supabase.rpc('get_holding_users');
      if (fetchErr) throw fetchErr;
      
      const allUsers = data as HoldingUser[]

      const holdingUser = allUsers.find((u: HoldingUser) => u.id === holdingUserId);

      if (!holdingUser) {
        throw new Error('User application not found');
      }

      const tempPassword = generateSecureTempPassword();
  
      // const { data: authData, error: authError } = await signUp(
      //   holdingUser.email,
      //   tempPassword,
      //   holdingUser.full_name,
      //   // '/dashboard'
      // );

      // if (authError) throw authError;

      // const newAuthId = authData?.user?.id; //authData?.session?.user?.id;
      
      const { data: authData, error: authError } = await supabase.functions.invoke('edgeAuth', {
        body: { 
          email: holdingUser.email, 
          password: tempPassword, 
          full_name: holdingUser.full_name 
        },
        headers: { 
          'Content-Type': 'application/json' 
        }
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

        toast({ title: 'Approval Failed', description: errorMessage, variant: 'destructive' });
        throw new Error(errorMessage);
      }

      const newAuthId = authData?.id;
      if (!newAuthId) {
        toast({ title: 'Internal error:', description: 'No user ID returned', variant: 'destructive' });
      }

      const { data: approvalData, error: rpcError } = await supabase.rpc('approve_new_user', {
        p_holding_user_id: holdingUserId,
        p_auth_id: newAuthId,
        p_full_name: null
      });

      if (rpcError) throw rpcError;

      if (!approvalData[0].success) {
        throw new Error(approvalData[0].error_msg || 'Approval failed');
      }

      await Promise.all([fetchHoldingUsers(), fetchHoldingEntities(), fetchHoldingCombined()]);
      window.dispatchEvent(new CustomEvent('holding-updated'));

      toast({ title: 'Approved', description: 'User successfully approved', variant: 'default' });
      return true;
    } catch (err: unknown) {
      const e = err as { message?: string };
      setError(e.message || 'Approval failed');
      toast({ title: 'Approval Failed', description: e.message, variant: 'destructive' });
      return false;
    } finally {
      setLoading(false);
    }
  }, [user, profile, fetchHoldingUsers, fetchHoldingEntities, toast]);

  const deleteHolding = useCallback(async (holdingUserId: string) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.rpc('delete_holding', { p_user_id: holdingUserId });
      if (error) throw error;

      // Refresh lists after successful deletion
      await Promise.all([fetchHoldingUsers(), fetchHoldingEntities(), fetchHoldingCombined()]);
      window.dispatchEvent(new CustomEvent('holding-updated'));
      if(data) {
      toast({ title: 'Deleted', description: 'Application successfully removed', variant: 'default' });
      }

      return true;
    } catch (err: unknown) {
      const e = err as { message?: string };
      setError(e.message || 'Deletion failed');
      toast({ title: 'Deletion Failed', description: e.message, variant: 'destructive' });
      return false;
    } finally {
      setLoading(false);
    }
  }, [user, fetchHoldingUsers, fetchHoldingEntities, fetchHoldingCombined, toast]);

  useEffect(() => {
    if (!profile) return;
    // Only fetch if user is admin or head (based on policies)
    if (['admin', 'head', 'manager', 'branch_manager'].includes(profile.role)) {
      fetchHoldingUsers();
      fetchHoldingEntities();
      fetchHoldingCombined();
    }
  }, [profile]);

  return {
    holdingUsers,
    holdingEntities,
    holdingCombined,
    loading,
    error,
    approveUser,
    deleteHolding,
    refetch: () => {
      fetchHoldingUsers();
      fetchHoldingEntities();
      fetchHoldingCombined();
    }
  };
};