import { useCallback } from 'react';
import { queryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ViolationMessages } from '@/integrations/supabase/violations';
import { useToast } from '@/hooks/useToast';
import { queryKeys } from './queryKeys';

export interface ContactAllotment {
  allotment_id: string;
  division_id: string;
  contact_id: string;
  referrer_id: string;
  referrer_org: string;
  referrer_code: string;
  referrer_name: string;
  approver_org: string;
  approver_name: string;
  date: string;
  visit_num: number | null;
  attended: boolean | null;
  serving: boolean | null;
  served: boolean | null;
  visit_type: "referral" | "drop_in";
  updated_at: string;
}

export const allotmentQueryOptions = (contactId: string | undefined) =>
  queryOptions({
    queryKey: queryKeys.allotment(contactId),
    enabled: !!contactId,
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_allotment', { p_contact_id: contactId });
      if (error) throw error;
      return (data ?? []) as ContactAllotment[];
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

export const useContactAllotment = (contactId: string | undefined) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const query = useQuery(allotmentQueryOptions(contactId));
  const allotmentKey = queryKeys.allotment(contactId);

  const allotment = query.data ?? []; 

  const attendance = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.rpc('mark_allotment_attendance', { p_id: id });
      if (error) throw error;
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: allotmentKey });
      const previous = queryClient.getQueryData<ContactAllotment[]>(allotmentKey);
      queryClient.setQueryData<ContactAllotment[]>(allotmentKey, (old) =>
        old?.map((n) => (n.allotment_id === id ? { ...n, attended: true } : n))
      );
      return { previous };
    },
    onError: (err, _vars, context) => {
      // console.log(err);
      if (context?.previous) queryClient.setQueryData(allotmentKey, context.previous);
      let finalMessage = 'Could not mark attendance';
      try { ViolationMessages(err, finalMessage); } catch (e: any) { finalMessage = e.message; }
      toast({ title: 'Error', description: finalMessage, variant: 'destructive' });
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: allotmentKey }),
  });

  const serving = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.rpc('mark_allotment_serving', { p_id: id });
      if (error) throw error;
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: allotmentKey });
      const previous = queryClient.getQueryData<ContactAllotment[]>(allotmentKey);
      queryClient.setQueryData<ContactAllotment[]>(allotmentKey, (old) =>
        old?.map((n) => n.allotment_id === id ? { ...n, serving: !n.serving } : n)
      );
      return { previous };
    },
    onError: (err, _vars, context) => {
      // console.log(err);
      if (context?.previous) queryClient.setQueryData(allotmentKey, context.previous);
      let finalMessage = 'Could not update serving status';
      try { ViolationMessages(err, finalMessage); } catch (e: any) { finalMessage = e.message; }
      toast({ title: 'Error', description: finalMessage, variant: 'destructive' });
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: allotmentKey }),
  });

  const served = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.rpc('mark_allotment_served', { p_id: id });
      if (error) throw error;
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: allotmentKey });
      const previous = queryClient.getQueryData<ContactAllotment[]>(allotmentKey);
      queryClient.setQueryData<ContactAllotment[]>(allotmentKey, (old) =>
        old?.map((n) => n.allotment_id === id ? { ...n, served: true } : n)
      );
      return { previous };
    },
    onError: (err, _vars, context) => {
      // console.log(err);
      if (context?.previous) queryClient.setQueryData(allotmentKey, context.previous);
      let finalMessage = 'Could not mark as served';
      try { ViolationMessages(err, finalMessage); } catch (e: any) { finalMessage = e.message; }
      toast({ title: 'Error', description: finalMessage, variant: 'destructive' });
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: allotmentKey }),
  });

  const discretionary = useMutation({
    mutationFn: async (vars: { type: "referral" | "drop_in" | "", note: string, userId: string }) => {
      if (!contactId) throw new Error('Invalid selection');
      const { error } = await supabase.rpc('insert_allotment_discretionary', {
        p_contact_id: contactId,
        p_user_id: vars.userId,
        p_type: vars.type || "drop_in",
        p_date: new Date().toISOString(),
        p_note: vars.note,
      });
      if (error) throw error;
    },
    onError: (err) => {
      // console.log(err);
      let finalMessage = 'Failed to insert discretionary allotment';
      try { ViolationMessages(err, finalMessage); } catch (e: any) { finalMessage = e.message; }
      toast({ title: 'Error', description: finalMessage, variant: 'destructive' });
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: allotmentKey }),
  });

  const markAttendance = useCallback(async (id: string) => toResult(attendance.mutateAsync(id)), [attendance]);
  const markAllotmentServing = useCallback(async (id: string) => toResult(serving.mutateAsync(id)), [serving]);
  const markServed = useCallback(async (id: string) => toResult(served.mutateAsync(id)), [served]);
  const insertDiscretionary = useCallback(async (vars: { type: "referral" | "drop_in" | "", note: string, userId: string }) => toResult(discretionary.mutateAsync(vars)), [discretionary]);

  return {
    allotment,
    loading: query.isLoading || attendance.isPending || serving.isPending ||
      served.isPending || discretionary.isPending,
    error: query.error,
    markAttendance: markAttendance,
    markAllotmentServing: markAllotmentServing,
    markServed: markServed,
    insertDiscretionary: insertDiscretionary,
    // refetch: () => query.refetch(),
  };
};