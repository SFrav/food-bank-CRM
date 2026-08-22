import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from '@/hooks/useToast';

export interface UserSettings {
  dark_mode?: string;
  notification_email?: string;
  notification_tasks?: string;
  notification_calendar?: string;
  two_FA?: string;
}

export const useUserSettings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [settings, setSettings] = useState<UserSettings>({});
  const [loading, setLoading] = useState(true);

  const fetchSettings = useCallback(async () => {
    if (!user) {
      setSettings({});
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const { data, error } = await supabase.rpc('get_user_settings', {
        p_user_id: user.id
      });

      if (error) throw error;

      const settingsMap: Record<string, string> = {};
      if (data) {
        data.forEach((setting) => {
          settingsMap[setting.setting_key] = setting.setting_value;
        });
      }
      setSettings(settingsMap as UserSettings);
      return { success: true };
    } catch (err: unknown) {
      const error = err as { message?: string }; 
      console.error('Error fetching settings:', err);
      // toast({
      //   title: 'Error',
      //   description: 'Failed to load your settings.',
      //   variant: 'destructive',
      // });
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  }, [user]); //, toast

  const updateSetting = useCallback(async (key: string, value: string) => {
    if (!user) return;

    try {
      if (key.startsWith('notification_') && value === 'false') {
        let p_type: "alert" | "calendar" | "referral" | "dm" | "task" | "ref_decision" | "system"; // string | undefined;
        let p_org_role: string | undefined;

        if (key === 'notification_tasks') p_type = 'task';
        if (key === 'notification_calendar') p_type = 'calendar';
        if (key === 'notification_email') p_type = 'dm'; 

        if (p_type) {
          const { data, error: rpcError } = await supabase.rpc('mark_notifications_read_by_type', {
            p_type,
            p_org_role: null,
          });

          if (rpcError) {
            console.error('RPC Error:', rpcError);
          }
        }
      }
      const { data, error } = await supabase.rpc('upsert_user_setting', {
        p_user_id: user.id,
        p_setting_key: key,
        p_setting_value: value,
      });

      if (error) throw error;
      fetchSettings()
      setSettings(prev => ({ ...prev, [key]: value }));
      return { success: true };
    } catch (err: unknown) {
      const error = err as { message?: string }; 
      console.error('Error updating setting:', err);
      toast({
        title: 'Error',
        description: 'Could not save your settings.',
        variant: 'destructive',
      });
      return { success: false, error: error.message };
    }
  }, [user, toast]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  return { 
    settings, 
    loading, 
    fetchSettings, 
    updateSetting };
};