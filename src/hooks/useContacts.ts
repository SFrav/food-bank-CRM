import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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
  }) => Promise<Contact[]>;
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
  // const [isLoading, setIsLoading] = useState(false); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>();
  const { toast } = useToast();

  const fetch = useCallback(async (filterQueue: boolean = false) => {
    setLoading(true);
    setError(undefined);
    try {
      const fn = filterQueue ? 'get_contacts_queue' : 'get_contacts';
      const { data, error: err } = await supabase
        .rpc(fn, { p_order_desc: orderDesc });
        // .select();
      if (err) throw err;
      setContacts(data ?? []);

    } catch (err: any) {
      console.error('Contacts fetch error', err);
      setError(err.message || 'Failed to load contacts');
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [toast, orderDesc]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const refetch = useCallback(async (filterQueue: boolean = false) => {
    await fetch(filterQueue);
  }, [fetch]);

  const checkDuplicates = async (params: {
    email?: string | null;
    phone?: string | null;
    name?: string | null;
    street_address?: string | null;
    postcode?: string | null;
  }): Promise<Contact[]> => {
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
  // const checkDuplicates = async (params: {
  //   email?: string | null;
  //   phone?: string | null;
  //   name?: string | null;
  //   street_address?: string | null;
  //   postcode?: string | null;
  // }): Promise<Contact[]> => {
  //   const { email, phone, name, street_address, postcode } = params;

  //   const orConditions: string[] = [];
  //   if (email) orConditions.push(`and(email.eq.${email})`);
  //   if (phone) orConditions.push(`and(phone.eq.${phone})`);
  //   if (name && postcode) {
  //     orConditions.push(
  //       `and(name.eq.${name},postcode.eq.${postcode})`
  //     );
  //   }
  //   if (name && street_address && postcode) {
  //     orConditions.push(
  //       `and(name.eq.${name},street_address.eq.${street_address},postcode.eq.${postcode})`
  //     );
  //   }

  //   if (orConditions.length > 0) {
  //     const { data: matches, error } = await supabase
  //       .from('contacts')
  //       .select('*')
  //       .or(orConditions.join(','))
  //       .neq('status', 'merged');
  //     if (error) throw error;
  //     if (matches && matches.length > 0) {
  //       return matches.slice(0, 4); 
  //     }
  //   }

  //   if (street_address && postcode) {
  //     const { data: matches, error } = await supabase
  //       .from('contacts')
  //       .select('*')
  //       .eq('street_address', street_address)
  //       .eq('postcode', postcode)
  //       .neq('status', "merged");
  //     if (error) throw error;
  //     return matches?.slice(0, 4) ?? [];
  //   }

  //   return [];
  // };

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

  // const updatePreferences = useCallback(
  //   async (c: Contact) => {
  //     const errs = validateContact(c);
  //     if (Object.keys(errs).length) {
  //       toast({ title: 'Validation Error', description: Object.values(errs).join('. '), variant: 'destructive' });
  //       return { success: false, error: 'Validation failed' };
  //     }

  //     setIsLoading(true);
  //     const { data, error: rpcError } = await supabase.rpc('update_contact', {
  //       p_id: c.id,
  //       p_name: null,
  //       p_email: null,
  //       p_phone: null,
  //       p_address: null,
  //       p_postcode: null,
  //       p_adults: null,
  //       p_children_gt16: null,
  //       p_children_lt16: null,
  //       p_infant: c.infant,         
  //       p_allergies: c.allergies,    
  //       p_vegetarian: c.vegetarian,  
  //       p_hallal: c.hallal,         
  //       p_region_id: null,
  //       p_status: null,
  //       p_user_id: null,
  //       p_owner_id: null,
  //       p_notes: null,
  //     }).single();

  //     setIsLoading(false);

  //     if (rpcError) {
  //       toast({ title: 'Error', description: rpcError.message, variant: 'destructive' });
  //       return { success: false, error: rpcError.message };
  //     }
  //     toast({ title: 'Success', description: 'Contact updated successfully' });
  //     return { success: true };
  //   },
  //   [toast]
  // );

  const mergeContacts = async (primaryId: string, secondaryId: string) => {
    setLoading(true);
    setError(null);
    const { error: rpcError } = await supabase.rpc('merge_contacts', {
      p_primary: primaryId,
      p_secondary: secondaryId,
    });

    setLoading(false);
    if (rpcError) {
      setError(rpcError.message);
      return { success: false, error: rpcError.message };
    }
    return { success: true };
  };

  const deleteContact = useCallback(
    async (id: string) => {
      const { data, error: rpcError } = await supabase.rpc('delete_contact', { p_id: id });

      if (rpcError) {
        console.error('Delete RPC error', rpcError);
        toast({ title: 'Error', description: rpcError.message, variant: 'destructive' });
        return { success: false, error: rpcError.message };
      }

      // if (!data?.success) {
      //   toast({ title: 'Error', description: 'Failed to delete contact', variant: 'destructive' });
      //   return { success: false, error: 'RPC returned failure' };
      // }

      toast({ title: 'Success', description: 'Contact deleted successfully' });
      return { success: true };
    },
    [toast]
  );

  return {
    contacts,
    isExactMatch,
    loading,
    // isLoading,
    // setIsLoading,
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