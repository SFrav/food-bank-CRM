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

export interface Opportunity {
  id: string;
  name: string;
  description: string | null;
  amount: number | null;
  currency: string;
  probability: number;
  stage: string | null;
  forecast_category: string | null;
  next_step_title: string | null;
  next_step_due_date: string | null;
  is_closed: boolean;
  is_won: boolean;
  owner_id: string;
  customer_id: string;
  end_user_id: string | null;
  customer_name?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  created_from_activity_id?: string | null;
  last_activity_at?: string | null;
  // Backward compatibility with Deal interface
  company_name: string;
  contact_person: string | null;
  contact_email?: string | null;
  deal_value: number;
  notes?: string | null;
}

export interface SalesActivity {
  id: string;
  activity_time: string;
  activity_type: 'Call' | 'Email' | 'Meeting';
  customer_name: string;
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
  const [activities, setActivities] = useState<SalesActivity[]>([]);
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


  // Fetch activities based on user role
  const fetchActivities = async (filters?: FilterOptions) => {
    if (!userProfile || !user) return;

    try {
      // First attempt: query the new v2 table
      let query = supabase.from('sales_activity_v2').select('*');

      // Role-based filtering (v2 uses created_by)
      if (userProfile.role === 'account_manager') {
        query = query.eq('created_by', user.id);
      } else if (userProfile.role === 'head' && userProfile.division_id && userProfile.entity_id) {
        // Head sees ONLY their TEAM activities
        const { data: teamUsers } = await (supabase as any)
          .from('user_profiles')
          .select('user_id')
          .eq('division_id', userProfile.division_id)
          .eq('entity_id', userProfile.entity_id);

        const userIds = (teamUsers || []).map((u: any) => u.user_id).filter(Boolean);
        if (userIds.length > 0) {
          query = query.in('created_by', userIds);
        }
      } else if (userProfile.role === 'manager' && userProfile.division_id && userProfile.entity_id) {
        const { data: teamUsers } = await (supabase as any)
          .from('user_profiles')
          .select('user_id')
          .eq('division_id', userProfile.division_id)
          .eq('entity_id', userProfile.entity_id);

        const userIds = (teamUsers || []).map((u: any) => u.user_id).filter(Boolean);
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

        const userIds = (managerUsers || []).map((u: any) => u.user_id).filter(Boolean);
        if (userIds.length > 0) {
          query = query.in('created_by', userIds);
        }
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      // If v2 relation is missing (42P01 or 404), fall back to legacy table
      if (error && (error.code === '42P01' || (error.message || '').includes('sales_activity_v2'))) {
        // Legacy attempt: query the old table which uses user_id
        let legacyQuery = supabase.from('sales_activity').select('*');

        if (userProfile.role === 'account_manager') {
          legacyQuery = legacyQuery.eq('user_id', user.id);
        } else if (userProfile.role === 'head' && userProfile.division_id && userProfile.entity_id) {
          // Head sees ONLY their TEAM activities (legacy)
          const { data: teamUsers } = await (supabase as any)
            .from('user_profiles')
            .select('user_id')
            .eq('division_id', userProfile.division_id)
            .eq('entity_id', userProfile.entity_id);

          const userIds = (teamUsers || []).map((u: any) => u.user_id).filter(Boolean);
          if (userIds.length > 0) {
            legacyQuery = legacyQuery.in('user_id', userIds);
          }
        } else if (userProfile.role === 'manager' && userProfile.division_id && userProfile.entity_id) {
          const { data: teamUsers } = await (supabase as any)
            .from('user_profiles')
            .select('user_id')
            .eq('division_id', userProfile.division_id)
            .eq('entity_id', userProfile.entity_id);

          const userIds = (teamUsers || []).map((u: any) => u.user_id).filter(Boolean);
          if (userIds.length > 0) {
            legacyQuery = legacyQuery.in('user_id', userIds);
          }
        }

        if (filters?.selectedRep && userProfile.role !== 'account_manager') {
          legacyQuery = legacyQuery.eq('user_id', filters.selectedRep);
        }

        if (filters?.selectedManager && filters.selectedManager !== 'all' && userProfile.role === 'manager') {
          const { data: managerUsers } = await (supabase as any)
            .from('user_profiles')
            .select('user_id')
            .eq('division_id', filters.selectedManager);

          const userIds = (managerUsers || []).map((u: any) => u.user_id).filter(Boolean);
          if (userIds.length > 0) {
            legacyQuery = legacyQuery.in('user_id', userIds);
          }
        }

        const { data: legacyData, error: legacyError } = await legacyQuery.order('created_at', { ascending: false });
        if (legacyError) throw legacyError;

        const mappedActivities: SalesActivity[] = (legacyData || []).map((activity: any) => ({
          id: activity.id,
          activity_time: activity.activity_time || activity.created_at,
          activity_type:
            activity.activity_type?.toLowerCase() === 'meeting'
              ? 'Meeting'
              : activity.activity_type?.toLowerCase() === 'email'
                ? 'Email'
                : 'Call',
          customer_name: activity.customer_name || '-',
          notes: activity.notes || undefined,
          user_id: activity.user_id,
          created_at: activity.created_at || activity.activity_time,
        }));

        setActivities(mappedActivities);
        return;
      }

      if (error) throw error;

      const mappedActivities: SalesActivity[] = (data || []).map((activity: any) => ({
        id: activity.id,
        activity_time: activity.scheduled_at || activity.created_at,
        activity_type:
          activity.activity_type?.toLowerCase() === 'meeting'
            ? 'Meeting'
            : activity.activity_type?.toLowerCase() === 'email'
              ? 'Email'
              : 'Call',
        customer_name: activity.customer_name || '-',
        notes: activity.notes || activity.mom_text || undefined,
        user_id: activity.created_by,
        created_at: activity.created_at || activity.scheduled_at,
      }));

      setActivities(mappedActivities);
    } catch (err) {
      console.error('Failed to load activities:', err);
      setError('Failed to load activities');
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

  // Load data when profile is available
  useEffect(() => {
    if (userProfile) {
      Promise.all([
        fetchActivities(),
        fetchAvailableReps(),
        fetchAvailableManagers()
      ]).finally(() => setLoading(false));
    }
  }, [userProfile]);

  // Refresh data with filters
  const refreshData = async (filters?: FilterOptions) => {
    if (!userProfile) return;
    
    setLoading(true);
    await Promise.all([
      fetchActivities(filters)
    ]);
    setLoading(false);
  };

  // Calculate metrics
  const metrics = {
    totalActivities: activities.length,
    recentActivities: activities.slice(0, 10)
  };

  return {
    userProfile,
    activities,
    availableReps,
    availableHeads,
    availableManagers,
    metrics,
    loading,
    error,
    refreshData
  };
};