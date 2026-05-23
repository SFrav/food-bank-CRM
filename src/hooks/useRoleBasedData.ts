import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface UserProfile {
  id: string;
  full_name: string;
  role: 'staff' | 'account_manager' | 'head' | 'manager' | 'admin';
  entity_id?: string;
  division_id?: string;  // This is "team_id"
  manager_id?: string;
}

export interface Task {
  id: string;
  task_time: string;
  task_type: 'Call' | 'Email' | 'Meeting';
  notes?: string;
  user_id: string;
  created_at: string;
}

export interface FilterOptions {
  selectedRep?: string;
  selectedManager?: string;
  dateRange?: string;
}

export const useRoleBasedData = () => {
  const { user } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [availableReps, setAvailableReps] = useState<{ id: string; name: string }[]>([]);
  const [availableHeads, setAvailableHeads] = useState<{ id: string; name: string }[]>([]);
  const [availableManagers, setAvailableManagers] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch user profile
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          throw error;
        }

        if (data) {
          setUserProfile(data as UserProfile);
        } else {
          // Create default profile if doesn't exist
          const { data: newProfile, error: createError } = await supabase
            .from('user_profiles')

            .insert({
              user_id: user.id,
              email: user.email,
              full_name: user.email || 'Unknown User',
              role: 'account_manager'
            } as any)
            .select()
            .single();

          if (createError) throw createError;
          setUserProfile(newProfile as UserProfile);
        }
        } catch (err) {
          // Error handling would be displayed in UI
        setError('Failed to load user profile');
      }
    };

    fetchUserProfile();
  }, [user]);


  // Fetch tasks based on user role
  const fetchTasks = async (filters?: FilterOptions) => {
    if (!userProfile || !user) return;

    try {
      // First attempt: query the new v2 table
      let query = supabase.from('calendar').select('*');

      // Role-based filtering (v2 uses created_by)
      if (userProfile.role === 'account_manager') {
        query = query.eq('created_by', user.id);
      } else if (userProfile.role === 'head' && userProfile.division_id && userProfile.entity_id) {
        // Head sees ONLY their TEAM tasks
        const { data: teamUsers } = await (supabase as any)
          .from('user_profiles')
          .select('user_id')
          .eq('division_id', userProfile.division_id)
          .eq('entity_id', userProfile.entity_id);

        const userIds = (teamUsers || []).flatMap((u: any) =>
          u.user_id ? [u.user_id] : []
        );
        if (userIds.length > 0) {
          query = query.in('created_by', userIds);
        }
      } else if (userProfile.role === 'manager' && userProfile.division_id && userProfile.entity_id) {
        const { data: teamUsers } = await (supabase as any)
          .from('user_profiles')
          .select('user_id')
          .eq('division_id', userProfile.division_id)
          .eq('entity_id', userProfile.entity_id);

        const userIds = (teamUsers || []).flatMap((u: any) =>
          u.user_id ? [u.user_id] : []
        );
        if (userIds.length > 0) {
          query = query.in('created_by', userIds);
        }
      }

      // Additional filters
      if (filters?.selectedRep && userProfile.role !== 'account_manager') {
        query = query.eq('created_by', filters.selectedRep);
      }

      if (filters?.selectedManager && filters.selectedManager !== 'all' && userProfile.role === 'manager') {
        const { data: managerUsers } = await (supabase as any)
          .from('user_profiles')
          .select('user_id')
          .eq('division_id', filters.selectedManager);

        const userIds = (managerUsers || []).flatMap((u: any) =>
          u.user_id ? [u.user_id] : []
        );
        if (userIds.length > 0) {
          query = query.in('created_by', userIds);
        }
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;

      const mappedTasks: Task[] = (data || []).map((task: any) => ({
        id: task.id,
        task_time: task.scheduled_at || task.created_at,
        task_type:
          task.task_type?.toLowerCase() === 'meeting'
            ? 'Meeting'
            : task.task_type?.toLowerCase() === 'email'
              ? 'Email'
              : 'Call',
        notes: task.notes || task.mom_text || undefined,
        user_id: task.created_by,
        created_at: task.created_at || task.scheduled_at,
      }));

      setTasks(mappedTasks);
    } catch (err) {
      console.error('Failed to load tasks:', err);
      setError('Failed to load tasks');
    }
  };

  // Fetch available sales reps with proper division-based filtering
  const fetchAvailableReps = async () => {
    if (!userProfile || userProfile.role === 'account_manager') return;

    try {
      let query: any = (supabase as any)
        .from('user_profiles')
        .select('user_id, full_name, email, role, entity_id, division_id, manager_id')
        .eq('role', 'account_manager')
        .eq('is_active', true)
        .not('email', 'ilike', 'demo_am_%@example.com');
      
      if (userProfile.role === 'head' && userProfile.division_id && userProfile.entity_id) {
        // Head sees ONLY their TEAM users
        query = query
          .eq('entity_id', userProfile.entity_id)
          .eq('division_id', userProfile.division_id);
      } else if (userProfile.role === 'manager' && userProfile.division_id && userProfile.entity_id) {
        // Managers see users in their team (division_id)
        query = query.eq('division_id', userProfile.division_id).eq('entity_id', userProfile.entity_id);
      }
      // Admins see all users (no filter applied)

      const { data, error } = await query.order('full_name');

      if (error) throw error;
      setAvailableReps((data as any[])?.map((rep: any) => ({ id: rep.user_id, name: rep.full_name || rep.email || rep.user_id })) || []);
    } catch (err) {
      console.error('Error fetching available reps:', err);
      setAvailableReps([]);
    }
  };

  // Fetch available managers from user_profiles
  const fetchAvailableManagers = async () => {
    if (!userProfile) return;

    try {
      let query = supabase
        .from('user_profiles')
        .select('id, full_name')
        .eq('role', 'manager')
        .eq('is_active', true);

      // Filter based on user's scope
      if (userProfile.role === 'head') {
        if (userProfile.division_id) {
          query = query.eq('division_id', userProfile.division_id);
        } else if (userProfile.entity_id) {
          query = query.eq('entity_id', userProfile.entity_id);
        }
      } else if (userProfile.role === 'manager') {
        // Manager sees managers in same entity/division
        if (userProfile.entity_id && userProfile.division_id) {
          query = query
            .eq('entity_id', userProfile.entity_id)
            .eq('division_id', userProfile.division_id);
        }
      }

      const { data, error } = await query.order('full_name');

      if (error) throw error;
      setAvailableManagers(data?.map(mgr => ({ id: mgr.id, name: mgr.full_name })) || []);
    } catch (err) {
      console.error('Error fetching managers:', err);
      setAvailableManagers([]);
    }
  };

  const handleUserProfileChange = async () => {
    if (!userProfile) return;
    try {
      await Promise.all([
        fetchTasks(),
        fetchAvailableReps(),
        fetchAvailableManagers(),
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Load data when profile is available
  useEffect(() => {
    handleUserProfileChange(); 
  }, [userProfile]); 
  
  // useEffect(() => {
  //   if (userProfile) {
  //     Promise.all([
  //       fetchTasks(),
  //       fetchAvailableReps(),
  //       fetchAvailableManagers()
  //     ]).finally(() => setLoading(false));
  //   }
  // }, [userProfile]);

  // Refresh data with filters
  const refreshData = async (filters?: FilterOptions) => {
    if (!userProfile) return;
    
    setLoading(true);
    await Promise.all([
      fetchTasks(filters)
    ]);
    setLoading(false);
  };

  // Calculate metrics
  const metrics = {
    totalTasks: tasks.length,
    recentTasks: tasks.slice(0, 10)
  };

  return {
    userProfile,
    tasks,
    availableReps,
    availableHeads,
    availableManagers,
    metrics,
    loading,
    error,
    refreshData
  };
};