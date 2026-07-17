import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from '@/hooks/use-toast';
// import { useUserSettings } from './useUserSettings';

export interface Notification {
  id: string;
  org_role: string;
  type: 'alert' | 'dm' | 'task' | 'calendar' | 'referral' | 'ref_decision' | 'system';
  title: string;
  message: string;
  link?: string;
  meta?: Record<string, any>;
  is_read: boolean;
  created_at: string;
}

interface NotificationsContextType {
  notifications: Notification[];
  unreadCount: number;
  bellNotifications: Notification[];
  unreadBellCount: number;
  loading: boolean;
  createNotification: (p_title: string, p_message: string, p_link: string, p_type: 'alert' | 'dm') => Promise<{ success: boolean; error?: any }>; 
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  refetch: () => Promise<void>;
}

const NotificationsContext = createContext<NotificationsContextType | null>(null);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  // const { settings } = useUserSettings();
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('get_user_notifications', { p_include_read: true });
      if (error) throw error;
      const n = (data || []) as Notification[];
      setNotifications(n);
    } catch (err) {
      console.error(err);
      // toast({ title: 'Error', description: 'Failed to load notifications.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [user]); //, toast

  const markAsRead = useCallback(async (id: string) => {
    try {
      await supabase.rpc('mark_notification_read', { p_id: id });
      // Optimistic UI update
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (e) {
      console.error(e);
      toast({ title: 'Error', description: 'Could not mark notification as read.', variant: 'destructive' });
      // Rollback optimistic update if needed, though DB sync will fix it eventually
    }
  }, [toast]);

  const markAllAsRead = useCallback(async () => {
    try {
      await supabase.rpc('mark_all_notifications_read');
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (e) {
      console.error(e);
      toast({ title: 'Error', description: 'Could not mark all as read.', variant: 'destructive' });
    }
  }, [toast]);

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

  useEffect(() => {
    if (!user) {
      setNotifications([]);
      setLoading(false);
      return;
    }

    fetchNotifications();

    let channel: any = null;
    channel = supabase
      .channel('notifications_user')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications_user',
          filter: `user_id=eq.${user.id}`,
        },
        async (payload) => {
          if (payload.eventType === 'INSERT') {
            const n = payload.new as any;
            const notif: Notification = {
              id: n.notification_id,
              org_role: n.org_role,
              type: n.type,
              title: n.title,
              message: n.message,
              link: n.link,
              meta: n.meta,
              is_read: n.is_read,
              created_at: n.created_at,
            };
            setNotifications(prev => [notif, ...prev.slice(0, 9)]);
          }
          await fetchNotifications();
        }
      )
      .subscribe();

    let settingsChannel: any = null;
    settingsChannel = supabase
      .channel('user_settings_notifications')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_settings',
          filter: `user_id=eq.${user.id}`,
        },
        async () => {
          await fetchNotifications();
        }
      )
      .subscribe();

    return () => {
      if (channel) supabase.removeChannel(channel);
      if (settingsChannel) supabase.removeChannel(settingsChannel);
    };
  }, [user, fetchNotifications]);

  const bellNotifications = useMemo(() => notifications.filter(n => !n.is_read), [notifications]);
  const unreadBellCount = useMemo(() => bellNotifications.length, [bellNotifications]);
  const unreadCount = useMemo(() => notifications.filter(n => !n.is_read).length, [notifications]);

  return (
    <NotificationsContext.Provider value={{
      notifications,
      unreadCount,
      bellNotifications,
      unreadBellCount,
      loading,
      createNotification,
      markAsRead,
      markAllAsRead,
      refetch: fetchNotifications,
    }}>
      {children}
    </NotificationsContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};