import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useProfile } from '@/hooks/useProfile';
import { useToast } from '@/hooks/useToast';

export interface ReferrerRatingAverage {
  referrer_id: string;
  entity_name: string;
  referrer_name: string;
  rate_screening: number;
  rate_support: number;
  rate_inform: number;
  rate_enumeration: number;
  last_rating: string;
}

export interface ReferrerRating {
  id: string;
  referrer_id: string;
  contact_id: string;
  rater_id: string;
  rate_screening: number;
  rate_support: number;
  rate_inform: number;
  rate_enumeration: number;
  note: string | null;
  created_at: string;
}

export function useReferrerRating(referrerId?: string) {
  const { profile } = useProfile();
  const { toast } = useToast();
  const [averageRatings, setAverageRatings] = useState<ReferrerRatingAverage[]>([]);
  const [ratings, setRatings] = useState<ReferrerRating[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined | null>(undefined);

  const fetchAverageRatings = useCallback(async (regionId?: string) => {
    if (!profile) return;
    try {
      setLoading(true);
      setError(undefined);
      const { data, error: rpcErr } = await supabase.rpc('get_referrer_rating_ave', { p_caller_region_id: regionId ?? profile.region_id });
      if (rpcErr) throw rpcErr;
      setAverageRatings(data as ReferrerRatingAverage[] ?? []);
    } catch (err: unknown) {
      const error = err as { message?: string };
      console.error('Error fetching average rating:', err);
      setError(error.message);
      setAverageRatings([]);
    } finally {
      setLoading(false);
    }
  }, [profile]); 

  const fetchRatings = useCallback(async (referrerId: string) => {
    if (!profile || !referrerId) return;
    try {
      setLoading(true);
      setError(undefined);
      const { data, error: rpcErr } = await supabase.rpc('get_referrer_ratings', { p_referrer_id: referrerId });
      if (rpcErr) throw rpcErr;
      setRatings(data as ReferrerRating[] ?? []);
    } catch (err: unknown) {
      const error = err as { message?: string };
      console.error('Error fetching ratings:', err);
      setError(error.message);
      setRatings([]);
    } finally {
      setLoading(false);
    }
  }, [profile]);

  useEffect(() => {
    if (profile?.region_id) {
      fetchAverageRatings(profile.region_id);
    }
    if (referrerId) {
      fetchRatings(referrerId);
    }
  }, [profile?.region_id, referrerId]);

  const createRating = useCallback(async (ratingData: {
    referrer: string;
    contact: string | null;
    rating_screen: number | null;
    rating_support: number | null;
    rating_inform: number | null;
    rating_enumeration: number | null;
    notes: string | null;
    created_by: string;
  }) => {
    if (!ratingData.referrer) {
      toast({ title: 'Error', description: 'Referrer ID is missing', variant: 'destructive' });
      return { success: false, error: 'referrer_id missing' };
    }
    try {
      const { data, error } = await supabase.rpc('create_referrer_rating', {
        p_referrer_id: ratingData.referrer,
        p_contact_id: ratingData.contact,
        p_rate_screening: ratingData.rating_screen,
        p_rate_support: ratingData.rating_support,
        p_rate_inform: ratingData.rating_inform,
        p_rate_enumeration: ratingData.rating_enumeration,
        p_note: ratingData.notes,
        p_created_by: ratingData.created_by
      });
      if (error) throw error;
      // toast({ title: 'Success', description: 'Rating added successfully' });
      return { success: true, error: null };
    } catch (err: unknown) {
      const error = err as { message?: string };
      console.error('Error creating rating:', err);
      toast({ title: 'Error', description: error.message || 'Failed to create rating', variant: 'destructive' });
      return { success: false, error: error.message };
    }
  }, [profile]);

  const deleteRating = useCallback(async (id: string) => {
    try {
      const { data, error } = await supabase.rpc('delete_referrer_rating', { p_id: id });
      if (error) throw error;
      toast({ title: 'Deleted', description: 'Rating removed' });
      return { success: true };
    } catch (err: unknown) {
      const error = err as { message?: string };
      console.error('Error deleting rating:', err);
      toast({ title: 'Error', description: error.message || 'Failed to delete', variant: 'destructive' });
      return { success: false, error: error.message };
    }
  }, []);

  return {
    averageRatings,
    ratings,
    loading,
    error,
    createRating,
    deleteRating,
    fetchAverageRatings,
    fetchRatings,
    // refetch: () => { fetchAverageRating(); fetchRatings(); }
  };
}