import { useCallback } from 'react';
import { queryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from '@/hooks/useToast';
import { queryKeys } from './queryKeys';
import type { Notification } from './useNotifications';

export interface UserSettings {
  dark_mode?: string;
  notification_email?: string;
  notification_tasks?: string;
  notification_calendar?: string;
  two_FA?: string;
}

//@ change notification_email from 'dm' when email implemented
const NOTIFICATION_TYPE_BY_SETTING: Record<string, Notification['type']> = {
  notification_tasks: 'task',
  notification_calendar: 'calendar',
  notification_email: 'dm',
};

const EMPTY_SETTINGS: UserSettings = {}; // stable reference

export const settingsQueryOptions = (userId: string | undefined) =>
  queryOptions({
    queryKey: queryKeys.userSettings(userId),
    enabled: !!userId,
    queryFn: async (): Promise<UserSettings> => {
      const { data, error } = await supabase.rpc('get_user_settings', { p_user_id: userId as string });
      if (error) throw error;

      const map: Record<string, string> = {};
      for (const row of (data ?? []) as { setting_key: string; setting_value: string }[]) {
        map[row.setting_key] = row.setting_value;
      }
      return map as UserSettings;
    },
  });

export const useUserSettings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const userId = user?.id;
  const settingsKey = queryKeys.userSettings(userId);

  const query = useQuery(settingsQueryOptions(userId));

  const update = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: string }) => {
      if (!userId) throw new Error('Not signed in');

      const p_type = NOTIFICATION_TYPE_BY_SETTING[key];
      if (p_type && value === 'false') {
        const { error } = await supabase.rpc('mark_notifications_read_by_type', {
          p_type,
          p_org_role: null,
        });
        if (error) console.error('RPC Error:', error); 
      }

      const { error } = await supabase.rpc('upsert_user_setting', {
        p_user_id: userId,
        p_setting_key: key,
        p_setting_value: value,
      });
      if (error) throw error;
    },

    onMutate: async ({ key, value }) => {
      await queryClient.cancelQueries({ queryKey: settingsKey });
      const previous = queryClient.getQueryData<UserSettings>(settingsKey);
      queryClient.setQueryData<UserSettings>(settingsKey, (old) => ({ ...old, [key]: value }));
      return { previous };
    },

    onError: (err, _vars, context) => {
      // console.log(err);
      if (context?.previous) queryClient.setQueryData(settingsKey, context.previous); // roll back
      console.error('Error updating setting:', err);
      toast({
        title: 'Error',
        description: 'Could not save your settings.',
        variant: 'destructive',
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: settingsKey });
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications(userId) });
    },
  });

  const { mutateAsync: updateAsync } = update;
  const { refetch } = query;

  const updateSetting = useCallback(
    async (key: string, value: string) => {
      try {
        await updateAsync({ key, value });
        return { success: true as const };
      } catch (err) {
        return { success: false as const, error: (err as { message?: string }).message };
      }
    },
    [updateAsync],
  );

  const fetchSettings = useCallback(async () => {
    const result = await refetch();
    return result.isError
      ? { success: false as const, error: result.error.message }
      : { success: true as const };
  }, [refetch]);

  return {
    settings: query.data ?? EMPTY_SETTINGS,
    loading: query.isLoading,
    error: query.error,
    fetchSettings,
    updateSetting,
  };
};
