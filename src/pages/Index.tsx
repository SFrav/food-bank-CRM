import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useProfile } from "@/hooks/useProfile";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";

const Index = () => {
  const { profile, loading } = useProfile();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;

    if (user && !profile) {
      // Check if this is the admin user by ID
      if (user.id === '3212a172-b6c8-417c-811a-735cc0033041') {
        // This is the admin user, redirect to admin dashboard instead of pending
        navigate('/admin/dashboard', { replace: true });
        return;
      }
      navigate('/pending', { replace: true });
      return;
    }

    if (!user) return;

    if (profile) {
      const roleText = String(profile.role);
      
      if (roleText === 'admin') {
        navigate('/admin/dashboard', { replace: true });
        return;
      }
      
      // Debug logging
      console.log('🔍 [Index] Profile check:', {
        role: profile.role,
        entity_id: profile.entity_id,
        division_id: profile.division_id,
        manager_id: (profile as any).manager_id,
        is_active: profile.is_active
      });

      const managerNeedsApproval = profile.role === 'manager' && (!profile.entity_id || !profile.division_id);
      
      const needsApproval = (
        roleText === 'pending' ||
        managerNeedsApproval

      );

      if (managerNeedsApproval) {
        console.warn('⚠️ [Index] Manager needs approval:', {
          has_entity_id: !!profile.entity_id,
          has_division_id: !!profile.division_id,
          entity_id: profile.entity_id,
          division_id: profile.division_id
        });
      }

      if (needsApproval) {
        navigate('/pending', { replace: true });
        return;
      }

      switch (profile.role) {
        case 'staff':
          navigate('/sales-dashboard', { replace: true });
        case 'account_manager':
          navigate('/sales-dashboard', { replace: true });
          break;
        case 'head':
          navigate('/executive-dashboard', { replace: true });
          break;
        case 'manager':
          navigate('/team-dashboard', { replace: true });
          break;
        case 'admin':
          navigate('/admin/dashboard', { replace: true });
          break;
        default:
          navigate('/auth', { replace: true });
      }
    }
  }, [profile, loading, user, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return null;
};

export default Index;
