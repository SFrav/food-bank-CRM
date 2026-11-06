import { useCallback, useMemo } from 'react';
import { queryOptions, useMutation, useQuery, useQueryClient, type QueryKey } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/useToast';
import { queryKeys } from './queryKeys';
import { ViolationMessages } from '@/integrations/supabase/violations';

export interface ContactNote {
  id: string;
  note: string;
  sensitive: boolean;
  pinned: boolean;
  created_by: string | null;
  creator_name: string | null;
  created_at: string;
}

export const contactNotesQueryOptions = (contactId: string | null) =>
  queryOptions({
    queryKey: queryKeys.contactsNotes(contactId ?? ''),
    enabled: !!contactId,
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_contact_notes', { p_contact_id: contactId });
      if (error) throw error;
      return (data ?? []) as ContactNote[];
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

type Snapshot = [QueryKey, ContactNote[] | undefined][];

function useContactNoteMutation<TVars>({
  mutationFn,
  patch,
  invalidate = [queryKeys.contactsNotes()],
  errorMessage,
}: {
  mutationFn: (vars: TVars) => Promise<void>;
  patch?: (old: ContactNote[], vars: TVars) => ContactNote[];
  errorMessage: string;
  invalidate?: QueryKey[];
  // queryKey: any[];
}) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const notesKey = queryKeys.contactsNotes();

  return useMutation({
    mutationFn,
    onMutate: async (vars: TVars): Promise<{ snapshots: Snapshot }> => {
      if (!patch) return { snapshots: [] };
      await queryClient.cancelQueries({ queryKey: notesKey });
      const snapshots = queryClient.getQueriesData<ContactNote[]>({ queryKey: notesKey });
      queryClient.setQueriesData<ContactNote[]>({ queryKey: notesKey }, (old) => (old ? patch(old, vars) : old));
      return { snapshots };
      
    },
    onError: (err, _vars, context) => {
      // console.log(err);
      context?.snapshots.forEach(([key, data]) => queryClient.setQueryData(key, data));
      let finalMessage = errorMessage;
      try {
        ViolationMessages(err, errorMessage);
      } catch (customError: any) {
        finalMessage = customError.message;
      }
      toast({ title: 'Error', description: finalMessage, variant: 'destructive' });
    },
    // onSettled: () => queryClient.invalidateQueries({ queryKey }),
    onSettled: async () => {
      await Promise.all(invalidate.map((queryKey) => queryClient.invalidateQueries({ queryKey })));
    },
  });
}

export const useContactNotes = (contactId: string | null) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const query = useQuery(contactNotesQueryOptions(contactId));
  const notesKey = queryKeys.contactsNotes();

  const notes = query.data ?? [];

  const mark_note_sensitive = useMutation({
    mutationFn: async ({ noteId, v }: { noteId: string; v: boolean }) => {
      const { error } = await supabase.rpc('mark_note_sensitive', {
        p_id: noteId,
        p_v: v
      });
      if (error) throw error;
    },
    onMutate: async (vars) => {
      await queryClient.cancelQueries({ queryKey: notesKey });
      const snapshots = queryClient.getQueriesData<ContactNote[]>({ queryKey: notesKey });
      queryClient.setQueriesData<ContactNote[]>({ queryKey: notesKey }, (old) =>
        old?.map((n) => (n.id === vars.noteId ? { ...n, sensitive: vars.v } : n)) ?? []
      );
      return { snapshots };
    },
    onError: (err) => {
      toast({ title: 'Error', description: 'Failed to mark note as sensitive', variant: 'destructive' });
    },
    onSettled: async () => {
      await Promise.all(notesKey.map((qk) => queryClient.invalidateQueries({ queryKey: qk })));
    },
  });

  const mark_note_pinned = useMutation({
    mutationFn: async ({ noteId, v }: { noteId: string; v: boolean }) => {
      const { error } = await supabase.rpc('mark_note_pinned', {
        p_id: noteId,
        p_v: v
      });
      if (error) throw error;
    },
    onMutate: async (vars) => {
      await queryClient.cancelQueries({ queryKey: notesKey });
      const snapshots = queryClient.getQueriesData<ContactNote[]>({ queryKey: notesKey });
      queryClient.setQueriesData<ContactNote[]>({ queryKey: notesKey }, (old) =>
        old?.map((n) => (n.id === vars.noteId ? { ...n, pinned: vars.v } : n)) ?? []
      );
      return { snapshots };
    },
    onError: (err) => {
      toast({ title: 'Error', description: 'Failed to pin note', variant: 'destructive' });
    },
    onSettled: async () => {
      await Promise.all(notesKey.map((qk) => queryClient.invalidateQueries({ queryKey: qk })));
    },
  });

  const delete_note = useContactNoteMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.rpc('delete_contact_note', {
        p_note_id: id,
      });
      if (error) throw error;
    },
    patch: (old, id) => old.filter((n) => n.id !== id),
    invalidate: [queryKeys.contacts()],
    errorMessage: 'Failed to delete the note',
  });

  const { mutateAsync: sensitiveNoteAsync } = mark_note_sensitive;
  const { mutateAsync: pinnedNoteAsync } = mark_note_pinned;
  const { mutateAsync: deleteNoteAsync } = delete_note;

  const markSensitive = useCallback(
    async (noteId: string, v: boolean) => toResult(sensitiveNoteAsync({noteId, v})),
    [sensitiveNoteAsync]
  );

  const markPinned = useCallback(
    async (noteId: string, v: boolean) => toResult(pinnedNoteAsync({noteId, v})),
    [pinnedNoteAsync]
  );

  const deleteNote = useCallback(
    async (noteId: string) => toResult(deleteNoteAsync(noteId)),
    [deleteNoteAsync]
  );

  const refetch = useCallback(async () => {
    await query.refetch();
  }, [query.refetch]);

  return {
    notes,
    markSensitive,
    markPinned,
    deleteNote,
    refetch,
    loading: query.isLoading,
    error: query.error,
  };
};