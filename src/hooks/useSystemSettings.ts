import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useProfile } from './useProfile';

export interface SystemSetting {
  id: string;
  setting_key: string;
  setting_value: string;
  updated_by: string | null;
  updated_at: string;
}

export interface EntityModeSettings {
  mode: 'single' | 'multi';
}

export interface DashboardDisplaySettings {
  showTitleAndRegion: boolean;
}

export const useSystemSettings = () => {
  const { profile } = useProfile();
  const [settings, setSettings] = useState<SystemSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined | null>(undefined);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError(undefined);

      const { data, error:rpcErr } = await supabase.rpc('get_system_settings');

      if (rpcErr) throw rpcErr;
      setSettings(data || []);
    } catch (err: unknown) {
      const error = err as { message?: string }; 
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = async (key: string, value: string) => {
    if (!profile?.role || profile.role !== 'admin') {
      throw new Error('Only admins can update system settings');
    }

    try {
      const { data, error } = await supabase.rpc('upsert_system_setting', {
        p_setting_key: key,
        p_setting_value: value,
      });

      if (error) throw error;
      
      await fetchSettings();
      return { data: data || null, error: null };
    } catch (err: unknown) {
      const error = err as { message?: string }; 
      return { data: null, error: error.message };
    }
  };

  const getSetting = (key: string) => {
    const setting = settings.find(s => s.setting_key === key);
    return setting?.setting_value || null;
  };

  // const getEntityMode = (): EntityModeSettings => {
  //   return getSetting('entity_mode') || { mode: 'single' };
  // };


  // const getDashboardDisplay = (): DashboardDisplaySettings => {
  //   return getSetting('dashboard_display') || { showTitleAndRegion: false };
  // };

  // const setEntityMode = async (mode: 'single' | 'multi') => {
  //   return updateSetting('entity_mode', { mode });
  // };


  // const setDashboardDisplay = async (showTitleAndRegion: boolean) => {
  //   const value: DashboardDisplaySettings = { showTitleAndRegion };
  //   return updateSetting('dashboard_display', value);
  // };

  useEffect(() => {
    fetchSettings();
  }, []);

  return {
    settings,
    loading,
    error,
    getSetting,
    // getEntityMode,
    // getDashboardDisplay,
    // setEntityMode,
    // setDashboardDisplay,
    updateSetting,
    refetch: fetchSettings,
  };
};