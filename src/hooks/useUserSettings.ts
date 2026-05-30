import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from '@/hooks/use-toast';

export interface UserSettings {
  dark_mode?: string;
  notification_email?: string;
  notification_tasks?: string;
  notification_calendar?: string;
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
      const { data, error } = await supabase
        .from('user_settings')
        .select('setting_key, setting_value')
        .eq('user_id', user.id)
        .in('setting_key', [
          'dark_mode',
          'notification_email',
          'notification_tasks',
          'notification_calendar'
        ]);

      if (error) throw error;

      const settingsMap: Record<string, string> = {};
      if (data) {
        data.forEach((setting: any) => {
          settingsMap[setting.setting_key] = setting.setting_value;
        });
      }
      setSettings(settingsMap);
    } catch (err: any) {
      console.error('Error fetching settings:', err);
      toast({
        title: 'Error',
        description: 'Failed to load your settings.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  const updateSetting = useCallback(async (key: string, value: string) => {
    if (!user) return;

    try {
      if (key.startsWith('notification_') && value === 'false') {
        let p_type: string | undefined;
        let p_org_role: string | undefined;

        if (key === 'notification_tasks') p_type = 'task';
        if (key === 'notification_calendar') p_type = 'calendar';
        if (key === 'notification_email') p_type = 'dm'; 

        if (p_type) {
          const { error: rpcError } = await supabase.rpc('mark_notifications_read_by_type', {
            p_type,
            p_org_role: null,
          });

          if (rpcError) {
            console.error('RPC Error:', rpcError);
          }
        }
      }

      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          setting_key: key,
          setting_value: value
        },
        { onConflict: 'user_id, setting_key' }
      )
        .eq('user_id', user.id)
        .eq('setting_key', key);

      if (error) throw error;

      setSettings(prev => ({ ...prev, [key]: value }));

    } catch (err) {
      console.error('Error updating setting:', err);
      toast({
        title: 'Error',
        description: 'Could not save your settings.',
        variant: 'destructive',
      });
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