import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/useToast';

export interface Contact {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  street_address: string | null;
  postcode: string | null;
  region_id: string | null;
  adults: number | null;
  children_gt16: number | null;
  children_lt16: number | null;
  infant?: boolean;
  allergies?: boolean;
  vegetarian?: boolean;
  hallal?: boolean;
  status: "pending" | "active" | "inactive" | "banned";
  notes: string | null;
  created_at?: string;
  owner_id?: string;
  user_id: string;
}

export interface ContactDuplicate {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  street_address: string | null;
  postcode: string | null;
  region_id: string | null;
  status: string;
  notes: string | null;
  created_at?: string;
  owner_id?: string;
  user_id: string;
}

export interface UseContactsReturn {
  contacts: Contact[];
  isExactMatch: boolean;
  loading: boolean;
  // isLoading: boolean;
  error?: string;
  refetch: (filterQueue: boolean) => Promise<void>;
  checkDuplicates: (params: { email?: string | null; 
    phone?: string | null; 
    name?: string | null; 
    street_address?: string | null; 
    postcode?: string | null; 
  }) => Promise<ContactDuplicate[]>;
  updateContact: (c: Contact) => Promise<{ success: boolean; error?: string }>;
  // updatePreferences: (c: Contact) => Promise<{ success: boolean; error?: string }>;
  mergeContacts: (primaryId: string, secondaryId: string) => Promise<{ success: boolean; error?: string }>;
  deleteContact: (id: string) => Promise<{ success: boolean; error?: string }>;
  createContact: (data: {
    name: string;
    email: string | null;
    phone: string | null;
    street_address: string | null;
    postcode: string | null;
    region_id: string | null;
    adults: number | null;
    children_gt16: number | null;
    children_lt16: number | null;
    notes: string | null;
    status: string; //@"pending" | "active" | "inactive" | "banned";
    user_id: string;
    owner_id?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  // setFilterQueue: (b: boolean) => void;
}

const validateContact = (c: Contact) => {
  const errs: Record<string, string> = {};
  if (!c.name.trim()) errs.name = 'Name is required';
  if (c.email && !/^[^@]+@[^@]+\.[^@]+$/.test(c.email))
    errs.email = 'Invalid email';
  return errs;
};

export const useContacts = (
  orderDesc: boolean = false,
  // filterQueue: boolean = false,
  toastUpdateEnabled: boolean = false
): UseContactsReturn => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isExactMatch, setIsExact] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined | null>(undefined);
  // const [tick, setTick] = useState(0);
  const { toast } = useToast();

  const fetch = useCallback(async (filterQueue: boolean = false) => {
    setLoading(true);
    setError(undefined);
    try {
      const fn = filterQueue ? 'get_contacts_queue' : 'get_contacts';
      const { data, error: err } = await supabase
        .rpc(fn, { p_order_desc: orderDesc });
      if (err) throw err;
      setContacts(data as Contact[] ?? []);

    } catch (err: unknown) {
      const error = err as { message?: string }; 
      console.error('Contacts fetch error', err);
      setError(error.message || 'Failed to load contacts');
      toast({ title: 'Error', description: error.message || 'Failed to load contacts', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [toast, orderDesc]);

  useEffect(() => {
    fetch(false);
  }, [fetch]); //, tick

  const refetch = useCallback(async (filterQueue: boolean = false) => {
    // setTick(prev => prev + 1);
    await fetch(filterQueue);
  }, [fetch]);

  const checkDuplicates = async (params: {
    email?: string | null;
    phone?: string | null;
    name?: string | null;
    street_address?: string | null;
    postcode?: string | null;
  }): Promise<ContactDuplicate[]> => {
    const {
      email = null,
      phone = null,
      name = null,
      street_address = null,
      postcode = null,
    } = params;

    const { data: exact, error: exactErr } = await supabase
      .rpc('get_contact_duplicates', {
        p_exact: true,
        p_email: email,
        p_phone: phone,
        p_name: name,
        p_street_address: street_address,
        p_postcode: postcode,
      });

    if (exactErr) throw exactErr;

    if (exact && exact.length > 0) {
      setIsExact(true);
      return exact.slice(0, 4);
    }

    const { data: fuzzy, error: fuzzyErr } = await supabase
      .rpc('get_contact_duplicates', {
        p_exact: false,
        p_email: email,
        p_phone: phone,
        p_name: name,
        p_street_address: street_address,
        p_postcode: postcode,
      });

    if (fuzzyErr) throw fuzzyErr;

    setIsExact(false);
    return fuzzy?.slice(0, 4) ?? [];
  };

  const createContact = useCallback(
    async (c: Contact) => {
      const errs = validateContact(c);
      if (Object.keys(errs).length) {
        toast({ title: 'Validation Error', description: Object.values(errs).join('. '), variant: 'destructive' });
        return { success: false, error: 'Validation failed' };
      }

      setLoading(true);
      const { data, error: rpcError } = await supabase.rpc('create_contact', {
        p_name: c.name,
        p_email: c.email,
        p_phone: c.phone,
        p_address: c.street_address,
        p_postcode: c.postcode,
        p_region_id: c.region_id,
        p_adults: c.adults,
        p_children_gt16: c.children_gt16,
        p_children_lt16: c.children_lt16,
        p_notes: c.notes,
        p_status: c.status,
        p_user_id: c.user_id,
        p_owner_id: c.owner_id,
      }).single();

      setLoading(false);
      if (rpcError) throw rpcError;
      if (rpcError) {
        toast({ title: 'Error', description: rpcError.message, variant: 'destructive' });
        console.error('Contacts insert', rpcError);
        return { success: false, error: rpcError.message };
      }
      toast({ title: 'Success', description: 'Contact created successfully' });
      return { success: true };
    },
    [toast]
  );

  const updateContact = useCallback(
    async (c: Contact) => {
      const errs = validateContact(c);
      if (Object.keys(errs).length) {
        toast({ title: 'Validation Error', description: Object.values(errs).join('. '), variant: 'destructive' });
        return { success: false, error: 'Validation failed' };
      }

      setLoading(true);
      const { data, error: rpcError } = await supabase.rpc('update_contact', {
        p_id: c.id,
        p_name: c.name,
        p_email: c.email,
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
        p_user_id: c.user_id,
        p_owner_id: c.owner_id,
        p_notes: c.notes,
      }).single();
    
      setLoading(false);
      if (rpcError) throw rpcError;

      if (rpcError) {
        if (toastUpdateEnabled) toast({ title: 'Error', description: rpcError.message, variant: 'destructive' });
        return { success: false, error: rpcError.message };
      }
      if (toastUpdateEnabled) toast({ title: 'Success', description: 'Contact updated successfully' });
      fetch();
      return { success: true };
      
    },
    [toast, fetch]
  );

  const mergeContacts = async (primaryId: string, secondaryId: string) => {
    setLoading(true);
    setError(undefined);
    try{
      const { error: rpcErr } = await supabase.rpc('merge_contacts', {
        p_primary: primaryId,
        p_secondary: secondaryId,
      });
      if (rpcErr) throw rpcErr;
      await fetch();
      return { success: true };
    } catch (err: unknown) {
      const error = err as { message?: string };
      console.error('Merge error', err);
      setError(error.message); 
      return { success: false, error: error.message };
    } finally {
    setLoading(false);
    }      
  };

  const deleteContact = useCallback(
    async (id: string) => {
      try {
        const { error: rpcErr } = await supabase.rpc('delete_contact', { p_id: id });
        if (rpcErr) throw rpcErr;

        await fetch();
        // toast({ title: 'Success', description: 'Contact deleted successfully' });

        return { success: true };
      } catch (err: unknown) {
        const error = err as { message?: string };
        console.error('Delete error', err);
        toast({ title: 'Error', description: error.message || 'Failed to delete', variant: 'destructive' });

        return { success: false, error: error.message };
      }
    },
    [fetch, toast]
  );

  return {
    contacts,
    isExactMatch,
    loading,
    error,
    refetch,
    createContact,
    updateContact,
    // updatePreferences,
    checkDuplicates, 
    mergeContacts,
    deleteContact,
  };
};