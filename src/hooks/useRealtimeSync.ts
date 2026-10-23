import { useEffect } from 'react';
import { useQueryClient, type QueryKey } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { queryKeys } from './queryKeys';

interface SyncedTable {
  table: string;
  filter?: (userId: string) => string;
  invalidates: (userId: string) => QueryKey[];
}

const byUser = (userId: string) => `user_id=eq.${userId}`;

export const SYNCED_TABLES: SyncedTable[] = [
  // { table: 'user_profile', filter: byUser, invalidates: (u) => [queryKeys.profile(u)] },
  { table: 'notifications_user', filter: byUser, invalidates: (u) => [queryKeys.notifications(u)] },
  { table: 'user_settings', filter: byUser, invalidates: (u) => [queryKeys.userSettings(u), queryKeys.notifications(u)]},

  { table: 'contacts', invalidates: () => [queryKeys.contacts()] },

  // also add queryKeys.contactsLists()?
  { table: 'contact_days',  invalidates: () => [queryKeys.contactsDays()] },
  { table: 'contact_notes', invalidates: () => [queryKeys.contactsNotes()] },
  { table: 'contacts_allotment',    invalidates: () => [queryKeys.allotment()] },
  { table: 'referrer_rating',    invalidates: () => [queryKeys.referrerRating()] },
];

const DEBOUNCE_MS = 150;

export const useRealtimeSync = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const userId = user?.id;

  useEffect(() => {
    if (!userId) {
      queryClient.clear(); // signed out: don't leak one user's cache to the next
      return;
    }

    const timers = new Map<string, ReturnType<typeof setTimeout>>();

    const invalidateSoon = (keys: QueryKey[]) => {
      for (const queryKey of keys) {
        const id = JSON.stringify(queryKey);
        clearTimeout(timers.get(id));
        timers.set(
          id,
          setTimeout(() => {
            timers.delete(id);
            queryClient.invalidateQueries({ queryKey });
          }, DEBOUNCE_MS),
        );
      }
    };

    const channels = SYNCED_TABLES.map(({ table, filter, invalidates }) =>
      supabase
        .channel(`sync:${table}:${userId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table,
            ...(filter ? { filter: filter(userId) } : {}),
          },
          (payload) => {
            // if (import.meta.env.DEV) console.log(`[realtime] ${table}`, payload.eventType);
            invalidateSoon(invalidates(userId));
          },
        )
        .subscribe((status, err) => {
          if (status === 'SUBSCRIBED') {
            invalidateSoon(invalidates(userId));
          } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
            console.error(`[realtime] ${table}: ${status}`, err?.message ?? '');
          }
        }),
    );

    return () => {
      timers.forEach(clearTimeout);
      channels.forEach((channel) => supabase.removeChannel(channel));
    };
  }, [userId, queryClient]);
};
