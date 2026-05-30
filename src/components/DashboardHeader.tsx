import { Badge } from '@/components/ui/badge';
import { Crown, Users, Target, User } from 'lucide-react';

interface DashboardHeaderProps {
  role: 'admin' | 'head' | 'manager' | 'branch_manager' | 'staff';
  className?: string;
}

const ROLE_CONFIG = {
  admin: {
    dashboard: 'System Administrator Dashboard',
    badge: 'System Administrator',
    icon: Crown,
    badgeClass: 'bg-destructive text-destructive-foreground'
  },
  head: {
    dashboard: 'Head Dashboard', 
    badge: 'Level Head',
    icon: Users,
    badgeClass: 'bg-primary text-primary-foreground'
  },
  manager: {
    dashboard: 'Manager Dashboard',
    badge: 'Manager',
    icon: Target,
    badgeClass: 'bg-primary text-primary-foreground'
  },
  branch_manager: {
    dashboard: 'Branch Manager Dashboard',
    badge: 'Field Sales Staff',
    icon: User,
    badgeClass: 'bg-primary text-primary-foreground'
  },
  staff: {
    dashboard: 'Staff Dashboard',
    badge: 'Staff',
    icon: User,
    badgeClass: 'bg-primary text-primary-foreground'
  }
};

export const DashboardHeader = ({ role, className }: DashboardHeaderProps) => {
 
  const config = ROLE_CONFIG[role];
  const IconComponent = config.icon;
  

  return (
    <div className={`flex items-center gap-4 ${className}`}>
      <div className="flex items-center gap-3">
        <IconComponent className="size-8 text-primary" />
        <div>
          <h1 className="text-3xl font-semibold text-foreground">
            {config.dashboard}
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <Badge className={config.badgeClass}>
              {config.badge}
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
};