import { useCallback } from 'react';
import { queryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/useToast';
import { queryKeys } from './queryKeys';
import { ViolationMessages } from '@/integrations/supabase/violations';

export interface ContactDays {
  contact_id: string;
  day_of_week: number;
  is_available: boolean | null;
}

export const contactDaysQueryOptions = (contactId: string | undefined) =>
  queryOptions({
    queryKey: queryKeys.contactsDays(contactId),
    enabled: !!contactId,
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_contact_days', { p_contact_id: contactId });
      if (error) throw error;
      return (data ?? []) as ContactDays[];
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

function useContactDaysMutation<TVars>({
  mutationFn,
  patch,
  errorMessage,
  queryKey,
}: {
  mutationFn: (vars: TVars) => Promise<void>;
  patch?: (old: ContactDays[], vars: TVars) => ContactDays[];
  errorMessage: string;
  queryKey: ReturnType<typeof queryKeys.contactsDays>;
}) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  // const queryKey = queryKeys.contactsDays(undefined as string);

  return useMutation({
    mutationFn,
    onMutate: async (vars: TVars) => {
      if (!patch) return { previous: undefined as ContactDays[] | undefined };
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<ContactDays[]>(queryKey);
      queryClient.setQueryData<ContactDays[]>(queryKey, (old) => (old ? patch(old, vars) : old));
      return { previous };
    },
    onError: (err, _vars, context) => {
      // console.log(err);
      if (context?.previous) queryClient.setQueryData(queryKey, context.previous);
      try {
        ViolationMessages(err, errorMessage);
      } catch (e: any) {
        toast({ title: 'Error', description: e.message, variant: 'destructive' });
      }
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey }),
  });
}

export function useContactDays(contactId: string | undefined) {
  const { toast } = useToast();
  // const queryClient = useQueryClient();
  const query = useQuery(contactDaysQueryOptions(contactId));
  const contactDays = query.data ?? [];

  // const create = useContactDaysMutation< { day_of_week: number; is_available: boolean }[] >({
  //   mutationFn: async (days) => {
  //     const { error } = await supabase.rpc('create_contact_days', {
  //       p_contact_id: contactId,
  //       p_days: days,
  //     });
  //     if (error) throw error;
  //   },
  //   patch: (old, days) => [...old, ...days.map(d => ({ ...d, contact_id: contactId }))],
  //   errorMessage: 'Failed to create day availability.',
  //   queryKey: queryKeys.contactsDays(contactId),
  // });

  const upsert = useContactDaysMutation<{ daySelected: number; isAvailable: boolean | null }>({
    mutationFn: async (vars) => {
      const { error } = await supabase.rpc('upsert_contact_days', {
        p_contact_id: contactId,
        p_day_of_week: vars.daySelected,
        p_available: vars.isAvailable,
      });
      if (error) throw error;
    },
    patch: (old, vars) => old.map((d) =>
      d.day_of_week === vars.daySelected ? { ...d, is_available: vars.isAvailable } : d
    ),
    errorMessage: 'Failed to update day availability.',
    queryKey: queryKeys.contactsDays(contactId),
  });

  const remove = useContactDaysMutation<{ d }>({
    mutationFn: async () => {
      const { error } = await supabase.rpc('delete_contact_days', {
        p_contact_id: contactId, // Following original implementation's param mapping
      });
      if (error) throw error;
    },
    // patch: (old, vars) => old.filter(d => d.day_of_week !== vars.daySelected),
    errorMessage: 'Failed to delete day availability.',
    queryKey: queryKeys.contactsDays(contactId),
  });

  // const { mutateAsync: createAsync } = create;
  const { mutateAsync: upsertAsync } = upsert;
  const { mutateAsync: removeAsync } = remove;

  // const createContactDays = useCallback((days: { day_of_week: number; is_available: boolean }[]) =>
  //   toResult(createAsync(days)), [createAsync]);

  const upsertContactDays = useCallback((daySelected: number, isAvailable?: boolean | null) =>
    toResult(upsertAsync({ daySelected, isAvailable })), [upsertAsync]);

  const deleteContactDays = useCallback(() =>
    toResult(removeAsync()), [removeAsync]);

  return {
    contactDays,
    // loading: query.isLoading,
    // error: query.error,
    // createContactDays,
    upsertContactDays,
    deleteContactDays,
    refetch: () => query.refetch(),
  };
}