import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast'; 


export const useCreateNotifications = () => {
  const { toast } = useToast();

  const createNotification = async (
    p_title: string,
    p_message: string,
    p_link: string,
    p_type: 'alert' | 'dm',
    p_target_user: string | null = null,
    p_org_role: 'referrer' | 'branch_manager' | 'staff' | 'volunteer' | null = null,
    p_calendar_id: string | null = null
  ) => {
    try {
      const { error } = await supabase.rpc('create_notification', {
        p_title,
        p_message,
        p_link,
        p_type,
        p_target_user,
        p_org_role,
        p_calendar_id,
      });
      if (error) throw error;
      return { success: true };
    } catch (err) {
      console.error('create_notification error', err);
      toast({
        title: 'Error',
        description: 'Failed to post notification.',
        variant: 'destructive',
      });
      return { success: false, error: err };
    }
  };


  return {
    createNotification,
  };
};