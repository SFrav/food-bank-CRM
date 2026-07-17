import { useCallback, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
// import type { Task } from '@/integrations/supabase/types';  

export interface Task {
  id: string;
  entry_type: "referrer_request" | "beneficiary_request" | "staff_todo" | "volunteer_todo" | "event";
  beneficiary_id: string;
  beneficiary_name?: string;
  pic_id?: string;
  pic_name?: string;
  scheduled_at: string;
  status: "scheduled" | "done" | "cancelled";
  notes?: string;
  created_by: string;
  created_at: string;
}

export type TaskStatus = 'scheduled' | 'done' | 'cancelled';

export function useTasks() { 
  const { toast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('get_tasks');
      if (error) throw error;
      setTasks(data as any);
    } catch (err: any) {
      console.error(err);
      toast({ title: 'Error', description: err.message ?? 'Failed to load tasks', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const updateStatus = useCallback(async (id: string, status: TaskStatus) => {
    try {
      const { error } = await supabase.rpc("update_calendar_status", {
        p_id: id,
        p_status: status,
      });

      if (error) throw error;
      toast({ title: 'Success', description: `Marked ${status}` });

    } catch (err: any) {
      console.error(err);
      toast({ title: 'Error', description: err.message ?? 'Failed to update status', variant: 'destructive' });
    }
  }, [toast]); 

  const deleteTask = useCallback(async (id: string) => {
    try {
      const { error } = await supabase.rpc('delete_calendar', { p_id: id });
      if (error) throw error;
      toast({ title: 'Deleted', description: 'Calendar entry removed' });

    } catch (err: any) {
      console.error(err);
      toast({ title: 'Error', description: err.message ?? 'Failed to delete', variant: 'destructive' });
    }
  }, [toast]); 

  return { 
    tasks, 
    loading, 
    fetch, 
    updateStatus, 
    deleteTask };
}