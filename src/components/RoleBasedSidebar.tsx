import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { BarChart3, Users, Calendar, FileText, Settings, PieChart, Building2, Shield, Activity, X, ContactRound, GitBranch, CheckSquare, LogOut, Plus, Bell, Database, UserPlus, Building, TrendingUp, Briefcase, Target, Home, ChevronDown, ChevronRight } from 'lucide-react';
import { useProfile } from '@/hooks/useProfile';
import { useAuth } from '@/hooks/useAuth';
import { RoleBadge } from './RoleBadge';
import { Button } from './ui/button';

interface RoleBasedSidebarProps {
  onClose?: () => void;
  darkMode?: boolean;
}
export const RoleBasedSidebar = ({
  onClose,
  darkMode
}: RoleBasedSidebarProps) => {
  const {
    profile,
    loading
  } = useProfile();
  const {
    signOut
  } = useAuth();

  const navigate = useNavigate();

  if (loading || !profile) {
    return null;
  }
  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
    } finally {
      // Redirect without clearing arbitrary local storage
      if (onClose) onClose();
      navigate('/auth', { replace: true });
    }
  };
  const getNavigationItems = () => {
    switch (profile.role) {
      case 'admin':
        return [
          { title: 'Dashboard', url: '/admin/dashboard', icon: BarChart3 },
          { title: 'User & Roles', url: '/admin/users', icon: Shield },
          { title: 'System Logs', url: '/admin/logs', icon: Database },
          { title: 'Beneficiaries', url: '/beneficiaries', icon: ContactRound },
          { title: 'Referral system', url: '/referrals', icon: UserPlus },
          { title: 'Support Services', url: '/services', icon: Building },
          { title: 'Calendar', url: '/calendar', icon: Calendar },
          { title: 'System Settings', url: '/admin/settings', icon: Settings }
        ];
      case 'head':
        return [
          { title: 'Dashboard', url: '/dashboard', icon: BarChart3 },
          { title: 'Beneficiaries', url: '/beneficiaries', icon: ContactRound },
          { title: 'Referral system', url: '/referrals', icon: UserPlus },
          { title: 'Support Services', url: '/services', icon: Building },
          { title: 'Tasks', url: '/tasks', icon: Activity },
          { title: 'Calendar', url: '/calendar', icon: Calendar },
          { title: 'User & Roles', url: '/admin/users', icon: Shield },
          { title: 'Settings', url: '/settings', icon: Settings }
        ];
      case 'manager':
        return [
          { title: 'Dashboard', url: '/dashboard', icon: Home },
          { title: 'Beneficiaries', url: '/beneficiaries', icon: ContactRound },
          { title: 'Referral system', url: '/referrals', icon: UserPlus },
          { title: 'Support Services', url: '/services', icon: Building },
          { title: 'Tasks', url: '/tasks', icon: Activity },
          { title: 'Calendar', url: '/calendar', icon: Calendar },
          // { title: 'User & Roles', url: '/admin/users', icon: Shield },
          { title: 'Settings', url: '/settings', icon: Settings }
        ];
      case 'account_manager':
        return [
          { title: 'Dashboard', url: '/dashboard', icon: Home },
          { title: 'Beneficiaries', url: '/beneficiaries', icon: ContactRound },
          { title: 'Referral system', url: '/referrals', icon: UserPlus },
          { title: 'Support Services', url: '/services', icon: Building },
          { title: 'Tasks', url: '/tasks', icon: Activity },
          { title: 'Calendar', url: '/calendar', icon: Calendar },
          { title: 'Settings', url: '/settings', icon: Settings }
        ];
      case 'staff':
        return [
          { title: 'Dashboard', url: '/dashboard', icon: Home },
          { title: 'Beneficiaries', url: '/beneficiaries', icon: ContactRound },
          // { title: 'Referral system', url: '/referrals', icon: UserPlus },
          { title: 'Support Services', url: '/services', icon: Building },
          { title: 'Tasks', url: '/tasks', icon: Activity },
          { title: 'Calendar', url: '/calendar', icon: Calendar },
          { title: 'Settings', url: '/settings', icon: Settings }
        ];
      default:
        return [
          { title: 'Beneficiaries', url: '/beneficiaries', icon: ContactRound },
          { title: 'Support Services', url: '/services', icon: Building },
          { title: 'Calendar', url: '/calendar', icon: Calendar },
          { title: 'Settings', url: '/settings', icon: Settings }
        ];
    }
  };

  const navigationItems = getNavigationItems()


  return <div className="flex flex-col h-full bg-sidebar border-r border-sidebar-border">
      {/* Mobile close button */}
      {onClose && <div className="flex items-center justify-between p-4 lg:hidden">
          <div className="flex items-center gap-2">
            <img src={darkMode ? "/uploads/8c148cd9-1116-481a-8d3c-454f3698dd7b.png" : "/uploads/5dc53a1f-9dd0-4780-84e9-823a8105b510.png"} alt="Logo" className="h-8 w-auto" />
            <span className="font-bold text-sidebar-foreground">Food bank CRM</span>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="size-4" />
          </Button>
        </div>}

      {/* Logo - Desktop */}
      <div className="hidden lg:flex items-center gap-2 p-6 border-b border-sidebar-border">
        <img src={darkMode ? "/uploads/8c148cd9-1116-481a-8d3c-454f3698dd7b.png" : "/uploads/5dc53a1f-9dd0-4780-84e9-823a8105b510.png"} alt="Logo" className="h-8 w-auto" />
        <div>
          <h2 className="font-medium text-sidebar-foreground">Food bank CRM</h2>
          <p className="text-xs text-sidebar-foreground/60">Serve humbly in love</p>
        </div>
      </div>

      {/* User Profile */}
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-sidebar-foreground truncate">
              {profile.full_name}
            </p>
          </div>
        </div>
        <RoleBadge role={profile.role} className="mt-2" />
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4">
        <ul className="space-y-2">
           {navigationItems.map(item => {
             const hasChildren = false;
             const isExpanded = false;

             return (
               <li key={item.title}>

                   <NavLink
                     to={item.url}
                     onClick={() => onClose?.()}
                     className={({ isActive }) =>
                       `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors relative ${
                         isActive
                           ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                           : 'text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground'
                       }`
                     }
                   >
                     <item.icon className="size-4 flex-shrink-0" />
                     <span className="truncate flex-1">{item.title}</span>
                   </NavLink>
               </li>
             );
           })}
        </ul>
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-sidebar-border">
        <Button variant="ghost" className="w-full justify-start gap-3 text-sidebar-foreground hover:bg-sidebar-accent/50" onClick={handleLogout}>
          <LogOut className="size-4" />
          Logout
        </Button>
      </div>
    </div>;
};