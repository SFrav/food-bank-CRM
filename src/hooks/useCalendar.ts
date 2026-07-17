import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import type { CalendarEvent } from '@/components/CalendarView';
import { startOfMonth, endOfMonth } from 'date-fns';

export function useCalendar() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchEvents = useCallback(async (date = new Date()) => {
    if (!user) return;
    setLoading(true);
    try {
      const start = startOfMonth(date).toISOString();
      const end = endOfMonth(date).toISOString();
      const { data, error } = await supabase.rpc('get_calendar', { start_date: start, end_date: end });
      if (error) throw error;
      setEvents((data || []).map((a: any) => ({
        id: a.id,
        subject: a.subject || (a.entry_type ? a.entry_type.replace('_', ' ') : 'Task'),
        starts_at: a.scheduled_at,
        ends_at: null,
        location: a.location ?? null,
        notes: a.notes ?? null,
        type: a.entry_type ?? null,
        status: a.status ?? 'scheduled',
        created_at: a.created_at ?? new Date().toISOString(),
      })));
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to load events.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  const deleteEvent = useCallback(async (id: string) => {
    if (!user) return;
    try {
      setEvents((prev) => prev.filter((ev) => ev.id !== id));

      const { error } = await supabase.rpc('delete_calendar', { p_id: id });
      if (error) throw error;
      toast({ title: 'Deleted', description: 'Calendar entry removed.' });

      await fetchEvents();
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to delete calendar entry.', variant: 'destructive' });
    }
  }, [user, toast, fetchEvents]);

  return { events, 
    loading, 
    fetchEvents, 
    deleteEvent };
}