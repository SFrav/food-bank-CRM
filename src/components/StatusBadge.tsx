import { Badge } from "@/components/ui/badge";

interface BadgeProps {
  role: 'active' | 'inactive' | 'pending' | 'banned' | 'merged';
  className?: string;
}

export const StatusBadge = ({ role, className = "" }: BadgeProps) => {
  const getConfig = (role: string) => {
    switch (role) {
      case 'active':
        return {
          label: 'Active',
          className: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800'
        };
      case 'pending':
        return {
          label: 'Pending',
          className: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800'
        };
      case 'inactive':
        return {
          label: 'Inactive',
          className: 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800'
        };
        case 'banned':
        return {
          label: 'Banned',
          className: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800'
        };
      default:
        return {
          label: 'Unknown',
          className: 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800'
        };
    }
  };

  const config = getConfig(role);

  return (
  <Badge 
    variant='default'
    className={`flex items-center gap-1 ${config.className} ${className}`}
  >
    {config.label}
  </Badge>
);
};