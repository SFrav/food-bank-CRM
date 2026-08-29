import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useEntities } from './useEntities';
import { useToast } from '@/hooks/useToast';

export interface EntitySettings {
  referrer_request?: string;
  contact_notify?: string;
  contact_approve?: string;
  contact_ban?: string;
}

export const useEntitySettings = () => {
  const {entities} = useEntities();
  const { toast } = useToast();
  const [settingsMap, setSettingsMap] = useState<Record<string, EntitySettings>>({});
  const [loading, setLoading] = useState(false);

  const fetchSettings = useCallback(async (entity_id: string) => {
    if (!entity_id) return;
 
    setLoading(true);
    try {
      const { data, error:rpcErr } = await supabase.rpc('get_entity_settings', {p_entity_id: entity_id});

      if (rpcErr) throw rpcErr;

      // const { data, error } = await supabase
      //   .from('entity_settings')
      //   .select('setting_key, setting_value')
      //   .eq('entity_id', entity_id)
      //   .in('setting_key', ['referrer_request', 'contact_notify', 'contact_approve', 'contact_ban']);

      // if (error) throw error;      
      const local: Record<string, string> = {};
      data?.forEach(s => {
        local[s.setting_key] = s.setting_value;
      });

      setSettingsMap(prev => ({ ...prev, [entity_id]: local as EntitySettings }));
    } catch (err: unknown) {
      const error = err as { message?: string }; 
      console.error('Error fetching settings:', err);
      toast({
        title: 'Error',
        description: 'Could not load entity settings.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const updateSetting = useCallback(async (
    entity_id: string, 
    key: string, 
    value: string
  ) => {
    if (!entities) return;
    try {
      const { data, error } = await supabase.rpc('upsert_entity_setting', {
        p_entity_id: entity_id,
        p_setting_key: key,
        p_setting_value: value,
      });

      if (error) throw error;
      await fetchSettings(entity_id);
      return { success: true };
    } catch (err: unknown) {
      console.error('Error updating setting:', err);
      toast({
        title: 'Error',
        description: 'Could not save settings.',
        variant: 'destructive',
      });
      return { success: false, error: err };
    }
  }, [fetchSettings]);

  return { 
    settingsMap, 
    loading, 
    fetchSettings, 
    updateSetting };
};