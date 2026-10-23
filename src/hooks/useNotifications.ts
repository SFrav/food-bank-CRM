import { useCallback, useMemo } from 'react';
import { queryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from '@/hooks/useToast';
import { queryKeys } from './queryKeys';

export interface Notification {
  id: string;
  org_role: string;
  type: 'alert' | 'dm' | 'task' | 'calendar' | 'referral' | 'ref_decision' | 'system';
  title: string;
  message: string;
  link?: string;
  meta?: Record<string, unknown>;
  is_read: boolean;
  created_at: string;
}

type OrgRole = 'referrer' | 'branch_manager' | 'specialist' | 'associate';

interface CreateNotificationArgs {
  title: string;
  message: string;
  link: string;
  type: 'alert' | 'dm';
  targetUser: string | null;
  orgRole: OrgRole | null;
  calendarId: string | null;
}

type Result = { success: true } | { success: false; error?: string };

/* -------------------------------------------------------------------------- */
/* Query definition: one place describes how to fetch and where it is cached. */
/* -------------------------------------------------------------------------- */

export const notificationsQueryOptions = (userId: string | undefined) =>
  queryOptions({
    queryKey: queryKeys.notifications(userId),
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_user_notifications', { p_include_read: true });
      if (error) throw error;
      return (data ?? []) as Notification[];
    },
  });

const EMPTY: Notification[] = []; // stable reference so memoised values don't churn

/** Turns a mutation promise into the { success, error } shape your components already expect. */
const toResult = async (promise: Promise<unknown>): Promise<Result> => {
  try {
    await promise;
    return { success: true };
  } catch (err) {
    return { success: false, error: (err as { message?: string }).message };
  }
};

/* -------------------------------------------------------------------------- */
/* Reusable mutation helper: optimistic patch -> rollback on error -> resync. */
/* Copy this pattern for the other tables.                                    */
/* -------------------------------------------------------------------------- */

function useNotificationMutation<TVars>({
  mutationFn,
  patch,
  errorMessage,
}: {
  mutationFn: (vars: TVars) => Promise<void>;
  /** Optional optimistic change applied to the cached list before the server answers. */
  patch?: (old: Notification[], vars: TVars) => Notification[];
  errorMessage: string;
}) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const queryKey = queryKeys.notifications(user?.id);

  return useMutation({
    mutationFn,
    onMutate: async (vars: TVars) => {
      if (!patch) return { previous: undefined as Notification[] | undefined };
      // Stop an in-flight fetch from overwriting the optimistic value when it lands.
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<Notification[]>(queryKey);
      queryClient.setQueryData<Notification[]>(queryKey, (old) => (old ? patch(old, vars) : old));
      return { previous };
    },
    onError: (err, _vars, context) => {
      // console.log(err);
      if (context?.previous) queryClient.setQueryData(queryKey, context.previous); // roll back
      console.error(err);
      toast({ title: 'Error', description: errorMessage, variant: 'destructive' });
    },
    // Success or failure, finish by syncing with the database as the source of truth.
    onSettled: () => queryClient.invalidateQueries({ queryKey }),
  });
}

/* -------------------------------------------------------------------------- */
/* Public hooks                                                               */
/* -------------------------------------------------------------------------- */

/**
 * Drop-in replacement for the old context hook. No provider required:
 * every component that calls this reads the same cache entry.
 */
export const useNotifications = () => {
  const { user } = useAuth();
  const query = useQuery(notificationsQueryOptions(user?.id));

  const notifications = query.data ?? EMPTY;
  const bellNotifications = useMemo(() => notifications.filter((n) => !n.is_read), [notifications]);
  const unreadBellCount = bellNotifications.length;

  const markRead = useNotificationMutation<string>({
    mutationFn: async (id) => {
      const { error } = await supabase.rpc('mark_notification_read', { p_id: id });
      if (error) throw error;
    },
    patch: (old, id) => old.map((n) => (n.id === id ? { ...n, is_read: true } : n)),
    errorMessage: 'Could not mark notification as read.',
  });

  const markAllRead = useNotificationMutation<void>({
    mutationFn: async () => {
      const { error } = await supabase.rpc('mark_all_notifications_read');
      if (error) throw error;
    },
    patch: (old) => old.map((n) => ({ ...n, is_read: true })),
    errorMessage: 'Could not mark all as read.',
  });

  const create = useNotificationMutation<CreateNotificationArgs>({
    mutationFn: async (a) => {
      const { error } = await supabase.rpc('create_notification', {
        p_title: a.title,
        p_message: a.message,
        p_link: a.link,
        p_type: a.type,
        p_target_user: a.targetUser,
        p_org_role: a.orgRole,
        p_calendar_id: a.calendarId,
      });
      if (error) throw error;
    },
    // No optimistic patch: the new row may belong to someone else, and the
    // server decides its id and fields. Realtime/invalidate brings it in.
    errorMessage: 'Failed to post notification.',
  });

  // mutateAsync is referentially stable, so these callbacks are too.
  const { mutateAsync: markReadAsync } = markRead;
  const { mutateAsync: markAllReadAsync } = markAllRead;
  const { mutateAsync: createAsync } = create;
  const { refetch: refetchQuery } = query;

  const markAsRead = useCallback((id: string) => toResult(markReadAsync(id)), [markReadAsync]);
  const markAllAsRead = useCallback(() => toResult(markAllReadAsync()), [markAllReadAsync]);

  // Same positional signature as before so existing call sites keep working.
  const createNotification = useCallback(
    (
      p_title: string,
      p_message: string,
      p_link: string,
      p_type: 'alert' | 'dm',
      p_target_user: string | null = null,
      p_org_role: OrgRole | null = null,
      p_calendar_id: string | null = null,
    ) =>
      toResult(
        createAsync({
          title: p_title,
          message: p_message,
          link: p_link,
          type: p_type,
          targetUser: p_target_user,
          orgRole: p_org_role,
          calendarId: p_calendar_id,
        }),
      ),
    [createAsync],
  );

  const refetch = useCallback(async () => {
    await refetchQuery();
  }, [refetchQuery]);

  return {
    notifications,
    bellNotifications,
    unreadBellCount,
    unreadCount: unreadBellCount, // duplicate of unreadBellCount; kept for compatibility, remove when call sites are updated
    loading: query.isLoading,
    error: query.error,
    createNotification,
    markAsRead,
    markAllAsRead,
    refetch,
  };
};

/**
 * Lightweight variant for something like the bell badge: it subscribes to the
 * same cache entry but only re-renders when the COUNT changes (via `select`),
 * not whenever any notification field changes.
 */
export const useUnreadNotificationCount = () => {
  const { user } = useAuth();
  const { data } = useQuery({
    ...notificationsQueryOptions(user?.id),
    select: (list) => list.filter((n) => !n.is_read).length,
  });
  return data ?? 0;
};
