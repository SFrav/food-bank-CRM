import { useCallback } from 'react';
import { queryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ViolationMessages } from '@/integrations/supabase/violations';
import { useProfile } from '@/hooks/useProfile';
import { useToast } from '@/hooks/useToast';
import { queryKeys } from './queryKeys';

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
  is_referrer: boolean;
  contact_id: string;
  rater_id: string;
  rate_screening: number;
  rate_support: number;
  rate_inform: number;
  rate_enumeration: number;
  note: string | null;
  created_at: string;
  updated_at: string;
}

export const referrerRatingsAverageQueryOptions = (regionId?: string | undefined) =>
  queryOptions({
    queryKey: queryKeys.referrerRatingsAverage(regionId),
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_referrer_rating_ave', { p_caller_region_id: regionId });
      if (error) throw error;
      return (data ?? []) as ReferrerRatingAverage[];
    },
  });

export const referrerRatingsQueryOptions = (referrerId?: string | undefined) =>
  queryOptions({
    queryKey: queryKeys.referrerRating(referrerId),
    enabled: !!referrerId,
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_referrer_ratings', { p_referrer_id: referrerId });
      if (error) throw error;
      return (data ?? []) as ReferrerRating[];
    },
  });

type Result = { success: true } | { success: false; error?: string };

const toResult = async (promise: Promise<unknown>): Promise<Result> => {
  try {
    await promise;
    return { success: true };
  } catch (err) {
    return { success: false, error: (err as { message?: string }).message };
  }
};

export function useReferrerRating(referrerId: string | undefined) {
  const { profile } = useProfile();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const averageQuery = useQuery(referrerRatingsAverageQueryOptions(profile?.region_id));
  const ratingsQuery = useQuery(referrerRatingsQueryOptions(referrerId));

  const create = useMutation({
    mutationFn: async (ratingData: {
      referrer: string;
      contact: string | null;
      rating_screen: number | null;
      rating_support: number | null;
      rating_inform: number | null;
      rating_enumeration: number | null;
      notes: string | null;
      created_by: string;
    }) => {
      const { error } = await supabase.rpc('create_referrer_rating', {
        p_referrer_id: ratingData.referrer,
        p_contact_id: ratingData.contact,
        p_rate_screening: ratingData.rating_screen,
        p_rate_support: ratingData.rating_support,
        p_rate_inform: ratingData.rating_inform,
        p_rate_enumeration: ratingData.rating_enumeration,
        p_note: ratingData.notes,
        p_created_by: ratingData.created_by
      });
      // if (error) {console.log(error); throw error;}
      if (error) throw error;
    },
    onError: (err) => {
      let finalMessage = 'Failed to create rating';
      try { ViolationMessages(err, finalMessage); } catch (e: any) { finalMessage = e.message; }
      toast({ title: 'Error', description: finalMessage, variant: 'destructive' });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.referrerRating(referrerId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.referrerRatingsAverage(profile?.region_id) });
    },
  });

  const update = useMutation({
    mutationFn: async (ratingData: {
      id: string;
      referrer: string;
      contact: string | null;
      rating_screen: number | null;
      rating_support: number | null;
      rating_inform: number | null;
      rating_enumeration: number | null;
      notes: string | null;
      updated_by: string;
    }) => {
      const { data, error } = await supabase.rpc('update_referrer_rating', {
        p_id: ratingData.id,
        p_referrer_id: ratingData.referrer,
        p_contact_id: ratingData.contact,
        p_rate_screening: ratingData.rating_screen,
        p_rate_support: ratingData.rating_support,
        p_rate_inform: ratingData.rating_inform,
        p_rate_enumeration: ratingData.rating_enumeration,
        p_note: ratingData.notes,
        p_updated_by: ratingData.updated_by
      });
      // if (error) {console.log(error); throw error;}
      if (error) throw error;
      // if (!data) throw new Error('Update failed: rating not found or unauthorized');
    },
    onError: (err) => {
      let finalMessage = 'Failed to update rating';
      try { ViolationMessages(err, finalMessage); } catch (e: any) { finalMessage = e.message; }
      toast({ title: 'Error', description: finalMessage, variant: 'destructive' });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.referrerRating(referrerId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.referrerRatingsAverage(profile?.region_id) });
    },
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.rpc('delete_referrer_rating', { p_id: id });
      if (error) {console.log(error); throw error; }
    },
    onError: (err) => {
      let finalMessage = 'Failed to delete rating';
      try { ViolationMessages(err, finalMessage); } catch (e: any) { finalMessage = e.message; }
      toast({ title: 'Error', description: finalMessage, variant: 'destructive' });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.referrerRating(referrerId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.referrerRatingsAverage(profile?.region_id) });
    },
  });

  const createRating = useCallback(async (data: Parameters<typeof create.mutate>[0]) =>
    toResult(create.mutateAsync(data)), [create]);

  const updateRating = useCallback(async (data: Parameters<typeof update.mutate>[0]) =>
    toResult(update.mutateAsync(data)), [update]);

  const deleteRating = useCallback(async (id: string) =>
    toResult(remove.mutateAsync(id)), [remove]);

  return {
    averageRatings: averageQuery.data ?? [],
    ratings: ratingsQuery.data ?? [],
    loading: averageQuery.isLoading || ratingsQuery.isLoading || create.isPending || update.isPending || remove.isPending,
    error: averageQuery.error || ratingsQuery.error,
    createRating,
    updateRating,
    deleteRating,
    refetchAverage: averageQuery.refetch,
    refetchRatings: ratingsQuery.refetch,
  };
}