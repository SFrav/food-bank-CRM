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
  {
    table: 'notifications_user',
    filter: byUser,
    invalidates: (u) => [queryKeys.notifications(u)],
  },
  {
    table: 'user_settings',
    filter: byUser,
    invalidates: (u) => [queryKeys.settings(u), queryKeys.notifications(u)],
  },
];

const DEBOUNCE_MS = 150;

export const useRealtimeSync = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const userId = user?.id;

  useEffect(() => {
    if (!userId) {
      queryClient.clear();
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

    const channel = supabase.channel(`sync:${userId}`);

    for (const { table, filter, invalidates } of SYNCED_TABLES) {
      channel.on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table,
          ...(filter ? { filter: filter(userId) } : {}),
        },
        () => invalidateSoon(invalidates(userId)),
      );
    }

    channel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        queryClient.invalidateQueries();
      }
      if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
        console.error(`Realtime sync problem: ${status}`);
      }
    });

    return () => {
      timers.forEach(clearTimeout);
      supabase.removeChannel(channel);
    };
  }, [userId, queryClient]);
};
