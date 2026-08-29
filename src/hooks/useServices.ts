import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useProfile } from '@/hooks/useProfile';
import { useToast } from '@/hooks/useToast';

// export interface Service {
//   id: string;
//   name: string;
//   org_type: 'government' | 'ngo' | 'faith_based';
//   service: string | null;
//   address: any;
//   website: string | null;
//   phone: string | null;
//   email: string | null;
//   approval_status: string | null;
//   is_active: boolean;
//   notes: string | null;
//   created_by: string | null;
//   created_at: string;
//   region_id: string | null;
// }

export interface Service {
  id: string;
  name: string;
  org_type: 'government' | 'ngo' | 'faith_based';
  website: string ;
  phone: string | null;
  email: string | null;
  service: string| null;
  notes: string | null;
  address: {
    street: string | null;
    city: string | null;
    state: string | null;
    postcode: string | null;
    country: string | null;
  };
  approval_status: string | null;
  is_active: boolean;
  created_by: string | null;
  created_at: string;
  region_id: string;
}

export function useServices(
) {
  const { profile } = useProfile();
  const {toast } = useToast();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined | null>(undefined);

  const fetchServices = useCallback(async () => {
    if (!profile) return;
    try {
      setLoading(true);
      setError(undefined);

      const { data, error: rpcErr } = await supabase.rpc('get_organisations', { p_region_id: profile.region_id });

      if (rpcErr) throw rpcErr;
      setServices(data as Service[] ?? []);
    } catch (err: unknown) {
      const error = err as { message?: string }; 
      console.error('Error fetching services:', err);
      setError(error.message);
      setServices([]);
    } finally {
      setLoading(false);
    }
  }, [profile]);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const createService = useCallback(async (s: Service) => {
    if(!s.region_id) {
      toast({ title: 'Error', description: 'Region must be selected', variant: 'destructive' });
       return { success: false, error: 'region not selected' };
    }
    try{
      const { data, error } = await supabase.rpc('create_organisation', {
        p_name: s.name,
        p_org_type: s.org_type,
        p_service: s.service,
        p_address: s.address,
        p_website: s.website,
        p_phone: s.phone,
        p_email: s.email,
        p_approval_status: 'approved',
        p_is_active: true,
        p_notes: s.notes,
        p_created_by: profile.user_id,
        p_region_id: s.region_id
      });
      if (error) throw error;
      // await fetchServices();
      return { success: true, error: null };
  } catch (err: unknown) {
      const error = err as { message?: string }; 
      console.error('Error creating service:', err);
      toast({ title: 'Error', description: error.message || 'Failed to create service', variant: 'destructive' });
      return { success: false, error: error.message };
  }
    // return data as string;
  }, []);

  const deleteService = useCallback(async (id: string) => {
    try {
      const { data, error } = await supabase.rpc('delete_organisation', {
        p_id: id
      });
      if (error) throw error;
      toast({ title: 'Deleted', description: 'Service removed' });

      await fetchServices();
      return { success: true };
    } catch (err: unknown) {
      const error = err as { message?: string }; 
      console.error('Error deleting service:', err);
      toast({ title: 'Error', description: error.message || 'Failed to delete', variant: 'destructive' });
      return { success: false, error: error.message };
    }
  }, [fetchServices]);

  return {
    services,
    loading,
    error,
    createService,
    deleteService,
    refetch: fetchServices,
  };
}