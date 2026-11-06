import { useCallback, useEffect, useState } from 'react';
import { queryOptions, useMutation, useQuery, useQueryClient, type QueryKey } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ViolationMessages } from '@/integrations/supabase/violations';
import { useToast } from '@/hooks/useToast';
import { queryKeys } from './queryKeys';

export interface Contact {
  id: string;
  name: string;
  email: string | null;
  gender: "male" | "female" | "undefined" | null;
  age_bracket:  "le24" | "25-34" | "35-44" | "45-54" | "55-64" | "ge65" | null;
  phone: string | null;
  street_address: string | null;
  postcode: string | null;
  region_id: string | null;
  adults?: number | null;
  children_gt16?: number | null;
  children_lt16?: number | null;
  infant?: boolean;
  allergies?: boolean;
  vegetarian?: boolean;
  hallal?: boolean;
  status: "pending" | "active" | "inactive" | "banned" | "merged";
  delayed_days: number;
  duration_request?: number;
  notes: string | null;
  created_at?: string;
  owner_id?: string;
  user_id: string;
  referrer_code?: string;
  attended_at?: string;
}

export interface ContactDuplicate {
  id: string;
  name: string;
  email: string | null;
  gender: "male" | "female" | "undefined" | null;
  age_bracket:  "le24" | "25-34" | "35-44" | "45-54" | "55-64" | "ge65" | null;
  phone: string | null;
  street_address: string | null;
  postcode: string | null;
  region_id: string | null;
  status: "pending" | "active" | "inactive" | "banned" | "merged";
  delayed_days: number;
  notes: string | null;
  created_at?: string;
  owner_id?: string;
  user_id: string;
}

export type NewContact = Omit<Contact, 'id'> & { id?: string };

type DuplicateParams = {
  email?: string | null;
  phone?: string | null;
  name?: string | null;
  street_address?: string | null;
  postcode?: string | null;
};

type Result<T = undefined> = { success: true; data: T } | { success: false; error?: string };

const errorText = (err: unknown, fallback: string): string => {
  try {ViolationMessages(err as Error, fallback);}
  catch (e) {if (e instanceof Error) return e.message;}
  return (err as {message?: string})?.message || fallback;
};

const toResult = async <T>(promise: Promise<T>, fallback = 'Request failed'): Promise<Result<T>> => {
  try {
    return { success: true, data: await promise };
  } catch (err) {
    return { success: false, error: errorText(err, fallback) };
  }
};

const validateContact = (c: NewContact): string[] => {
  const errs: string[] = [];
  if (!c.name) errs.push('Name is required');
  if (c.email && !/^[^@]+@[^@]+\.[^@]+$/.test(c.email)) errs.push('Invalid email');
  return errs;
};

const EMPTY_CONTACTS: Contact[] = [];

export const contactsQueryOptions = (orderDesc: boolean, filterQueue: boolean) =>
  queryOptions({
    queryKey: queryKeys.contactsList(orderDesc, filterQueue),
    queryFn: async () => {
      const fn = filterQueue ? 'get_contacts_queue' : 'get_contacts';
      const { data, error } = await supabase.rpc(fn, { p_order_desc: orderDesc });
      if (error) throw error;
      return (data ?? []) as Contact[];
    },
  });

const fetchDuplicates = async (exact: boolean, p: DuplicateParams) => {
  const { data, error } = await supabase.rpc('get_contact_duplicates', {
    p_exact: exact,
    p_email: p.email ?? null,
    p_phone: p.phone ?? null,
    p_name: p.name ?? null,
    p_street_address: p.street_address ?? null,
    p_postcode: p.postcode ?? null,
  });
  if (error) throw error;
  return (data ?? []) as ContactDuplicate[];
};

type Snapshot = [QueryKey, Contact[] | undefined][];

function useContactMutation<TVars>({
  mutationFn,
  patch,
  invalidate = [queryKeys.contactsLists()],
  errorMessage,
  toastOnError = true,
}: {
  mutationFn: (vars: TVars) => Promise<unknown>;
  patch?: (old: Contact[], vars: TVars) => Contact[];
  invalidate?: QueryKey[];
  toastOnError?: boolean;
  errorMessage: string;
}) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const contactsKey = queryKeys.contactsLists();

  return useMutation({
    mutationFn,

    onMutate: async (vars: TVars): Promise<{ snapshots: Snapshot }> => {
      if (!patch) return { snapshots: [] };
      await queryClient.cancelQueries({ queryKey: contactsKey });
      const snapshots = queryClient.getQueriesData<Contact[]>({ queryKey: contactsKey });
      queryClient.setQueriesData<Contact[]>({ queryKey: contactsKey }, (old) => (old ? patch(old, vars) : old));
      return { snapshots };
    },

    onError: (err, _vars, context) => {
      // console.log(err);
      context?.snapshots.forEach(([key, data]) => queryClient.setQueryData(key, data)); // roll back
      if(toastOnError) {
        toast({ title: 'Error', description: errorText(err, errorMessage), variant: 'destructive' });
      }
      // let message = errorMessage;
      // try {
      //   ViolationMessages(err as Error, errorMessage);
      // } catch (e) {
      //   if (e instanceof Error) message = e.message;
      // }
      // toast({ title: 'Error', description: message, variant: 'destructive' });
    },
    onSettled: async () => {
      await Promise.all(invalidate.map((queryKey) => queryClient.invalidateQueries({ queryKey })));
    },
  });
}

export const useContacts = (orderDesc: boolean = false, initialFilterQueue: boolean = false) => {
  const { toast } = useToast();
  // const queryClient = useQueryClient();
  const [filterQueue, setFilterQueue] = useState(initialFilterQueue);
  // useEffect(() => {
  //   setFilterQueue(initialFilterQueue);
  // }, [initialFilterQueue]);

  const [isExactMatch, setIsExactMatch] = useState(false);

  const query = useQuery(contactsQueryOptions(orderDesc, filterQueue));
  const contacts = query.data ?? EMPTY_CONTACTS;


  const refetch = useCallback(
    async (nextFilterQueue?: boolean) => {
      if (typeof nextFilterQueue === 'boolean' && nextFilterQueue !== filterQueue) {
        // await queryClient.fetchQuery({ ...contactsQueryOptions(orderDesc, nextFilterQueue), staleTime: 0 });
        setFilterQueue(nextFilterQueue);
        return;
      }
      await query.refetch();
    },
    [filterQueue, orderDesc, query.refetch],
  );

  const checkDuplicates = useCallback(async (params: DuplicateParams): Promise<ContactDuplicate[]> => {
    const exact = await fetchDuplicates(true, params);
    if (exact.length > 0) {
      setIsExactMatch(true);
      return exact.slice(0, 4);
    }
    setIsExactMatch(false);
    return (await fetchDuplicates(false, params)).slice(0, 4);
  }, []);

  const create = useContactMutation({
    mutationFn: async ({ contact: c, sensitive, days}: 
      { contact: NewContact; sensitive: boolean; days?: number[]; }) => {
      const { data, error } = await supabase
        .rpc('create_contact', {
          p_name: c.name,
          p_email: c.email,
          p_gender: c.gender,
          p_age_bracket: c.age_bracket,
          p_phone: c.phone,
          p_address: c.street_address,
          p_postcode: c.postcode,
          p_region_id: c.region_id,
          p_adults: c.adults,
          p_children_gt16: c.children_gt16,
          p_children_lt16: c.children_lt16,
          p_notes: c.notes,
          p_status: c.status,
          p_delayed_days: c.delayed_days,
          p_duration_request: c.duration_request ?? null,
          p_user_id: c.user_id,
          p_owner_id: c.owner_id,
          p_days: days ?? null,
          p_sensitive: sensitive,
          p_pinned: false
        })
        .single();
      if (error) throw error;
      return data as string;
    },
    toastOnError: false,
    errorMessage: 'Failed to create new entry',
  });

  const update = useContactMutation({
    mutationFn: async ({ c, sensitive, pinned }: 
      { c: Contact; sensitive: boolean; pinned: boolean }) => {
      const { data, error } = await supabase
        .rpc('update_contact', {
          p_id: c.id,
          p_name: c.name,
          p_email: c.email,
          p_gender: c.gender,
          p_age_bracket: c.age_bracket,
          p_phone: c.phone,
          p_address: c.street_address,
          p_postcode: c.postcode,
          p_region_id: c.region_id,
          p_adults: c.adults,
          p_children_gt16: c.children_gt16,
          p_children_lt16: c.children_lt16,
          p_infant: c.infant,
          p_allergies: c.allergies,
          p_vegetarian: c.vegetarian,
          p_hallal: c.hallal,
          p_status: c.status,
          p_delayed_days: c.delayed_days,
          p_duration_request: c.duration_request ?? null,
          p_user_id: c.user_id,
          p_owner_id: c.owner_id,
          p_notes: c.notes,
          p_sensitive: sensitive,
          p_pinned: pinned
        })
        .single();
      if (error) throw error;
      return data;
    },
    patch: (old, c) => old.map((row) => (row.id === c.c.id ? { ...row, ...c } : row)),
    toastOnError: false,
    errorMessage: 'Update failed',
  });

  const remove = useContactMutation({
    mutationFn: async ({ id }: { id: string }) => {
      const { error } = await supabase.rpc('delete_contact', { p_id: id });
      if (error) throw error;
    },
    patch: (old, { id }) => old.filter((row) => row.id !== id),
    invalidate: [queryKeys.contacts()], // days/notes/allotments of the contact change too
    toastOnError: false,
    errorMessage: 'Failed to delete',
  });

  const merge = useContactMutation({
    mutationFn: async ({ primaryId, secondaryId }: { primaryId: string; secondaryId: string }) => {
      const { error } = await supabase.rpc('merge_contacts', { p_primary: primaryId, p_secondary: secondaryId });
      
      if (error) throw error;
    },
    invalidate: [queryKeys.contacts()],
    toastOnError: true,
    errorMessage: 'Failed to merge entries',
  });

  const { mutateAsync: createAsync } = create;
  const { mutateAsync: updateAsync } = update;
  const { mutateAsync: deleteAsync } = remove;
  const { mutateAsync: mergeAsync } = merge;

  const createContact = useCallback(
    async (c: NewContact, sensitive: boolean, days?: number[]
    ): Promise<Result<string>> => {
      const errs = validateContact(c);
      if (errs.length) {
        toast({ title: 'Validation Error', description: errs.join('. '), variant: 'destructive' });
        return { success: false, error: 'Validation failed' };
      }
      toResult(createAsync({ contact: c, sensitive, days }));
    },
    [createAsync, toast],
  );

  const updateContact = useCallback((c: Contact, sensitive: boolean, pinned: boolean) => toResult(updateAsync({c, sensitive, pinned})), [updateAsync]);
  const deleteContact = useCallback((id: string) => toResult(deleteAsync({ id })), [deleteAsync]);
  const mergeContacts = useCallback(
    (primaryId: string, secondaryId: string) => toResult(mergeAsync({ primaryId, secondaryId }), 'Failed to merge'),
    [mergeAsync],
  );

  return {
    contacts,
    isExactMatch,
    loading: query.isLoading || create.isPending || update.isPending || remove.isPending || merge.isPending,
    error: query.error?.message,
    refetch,
    createContact,
    updateContact,
    checkDuplicates,
    mergeContacts,
    deleteContact,
  };
};
