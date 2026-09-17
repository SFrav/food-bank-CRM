import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useDivisions } from './useDivisions';
import { useToast } from '@/hooks/useToast';

export interface DivisionSettings {
  allotment_weeks?: string;
  exclusion_weeks?: string;
  frequency?: string;
}

export const useDivisionSettings = () => {
  const {divisions} = useDivisions();
  const { toast } = useToast();
  const [settingsMap, setSettingsMap] = useState<Record<string, DivisionSettings>>({});
  const [loading, setLoading] = useState(false);

  const fetchSettings = useCallback(async (divisionId: string) => {
    if (!divisionId) return;

    setLoading(true);
    try {
      const { data, error:rpcErr } = await supabase.rpc('get_division_settings', {p_division_id: divisionId});

      if (rpcErr) throw rpcErr;

      const local: Record<string, string> = {};
      data?.forEach(s => {
        local[s.setting_key] = s.setting_value;
      });

      setSettingsMap(prev => ({ ...prev, [divisionId]: local }));
      return local;
    } catch (err: unknown) {
      const error = err as { message?: string }; 
      console.error('Error fetching settings:', err);
      toast({
        title: 'Error',
        description: 'Could not load division settings.',
        variant: 'destructive',
      });
      return undefined;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateSetting = useCallback(async (
    divisionId: string, 
    key: string, 
    value: string
  ) => {
    if (!divisions) return;
    try {
      const { data, error } = await supabase.rpc('upsert_division_setting', {
        p_division_id: divisionId,
        p_setting_key: key,
        p_setting_value: value,
      });

      if (error) throw error;
      await fetchSettings(divisionId);
      return { success: true };
    } catch (err: unknown) {
      const error = err as { message?: string }; 
      console.error('Error updating setting:', err);
      toast({
        title: 'Error',
        description: 'Could not save settings.',
        variant: 'destructive',
      });
      return { success: false, error: error.message };
    }
  }, [fetchSettings]);

  // useEffect(() => {
  //   fetchSettings();
  // }, [fetchSettings]);

  return { 
    settingsMap, 
    loading, 
    fetchSettings, 
    updateSetting };
};