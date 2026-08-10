import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useProfile } from '@/hooks/useProfile';

export interface Service {
  id: string;
  name: string;
  org_type: 'government' | 'ngo' | 'faith_based';
  service: string | null;
  address: JSON;
  website: string | null;
  phone: string | null;
  email: string | null;
  approval_status: string | null;
  is_active: boolean;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  region_id: string | null;
}

export function useServices(
) {
  const { profile } = useProfile();
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
      setServices(data ?? []);
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

  const createService = async (s: Service) => {
    const { data, error: rpcErr } = await supabase.rpc('create_organisation', {
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
    if (rpcErr) throw rpcErr;
    await fetchServices();
    return data as string;
  };

  return {
    services,
    loading,
    error,
    createService,
    refetch: fetchServices,
  };
}