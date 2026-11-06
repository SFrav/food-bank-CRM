import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';

export interface ApplicationResult {
  // userId: string | null;
  // entityId: string | null;
  error: string | null;
  success: boolean;
}

export const useApplication = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const application = useCallback(async (
    email: string,
    fullName: string,
    countryId: string,
    regionId: string | null,
    entityId: string | null,
    entityName: string | null,
    isReferrer: boolean,
    isHead: boolean
  ): Promise<ApplicationResult> => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: rpcError } = await supabase.rpc('validate_and_insert_holding', {
        p_email: email,
        p_full_name: fullName,
        p_phone: null,
        p_country_id: countryId,
        p_region_id: regionId,
        p_entity_id: entityId,
        p_entity_name: entityName,
        p_is_referrer: isReferrer,
        p_is_head: isHead
      });

      if (rpcError) throw rpcError;

      // if (!data) {
      //   throw new Error('An internal error has occured. Please try again later');
      // }

      return {
        success: true,
        error: null,
        // userId: data[0].holding_user_id,
        // entityId: data[0].holding_entity_id
      };
    } catch (err: unknown) {
      const error = err as { message?: string };
      const errorMessage = error.message || 'Application failed';
      setError(errorMessage);
      toast({ title: 'Application Error', description: errorMessage, variant: 'destructive' });
      return { error: errorMessage, success: false }; //userId: null, entityId: null, 
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
  }, []);

  return {
    loading,
    error,
    application,
    reset
  };
};
