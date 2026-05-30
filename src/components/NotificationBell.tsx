import React, { useState } from 'react';
import { Bell, Clock, AlertTriangle, Target, CheckSquare, Brain, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useNotifications, Notification } from '@/hooks/useNotificationsContext';
import { useNavigate } from 'react-router-dom';

const getTypeIcon = (type: Notification['type']) => {
  switch (type) {
    case 'alert': return <AlertTriangle className="size-4 text-destructive" />;
    case 'dm': return <Target className="size-4 text-blue-500" />;
    case 'task': return <Brain className="size-4 text-blue-500" />;
    case 'calendar': return <CheckSquare className="size-4 text-blue-500" />;
    case 'system': return <Settings className="size-4 text-muted-foreground" />;
    default: return <Bell className="size-4" />;
  }
};

const getRelativeTime = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
  return `${Math.floor(diffInMinutes / 1440)}d ago`;
};

export const NotificationBell = () => {
  const navigate = useNavigate();
  const { bellNotifications, unreadBellCount, markAsRead, markAllAsRead } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);

  const handleNotificationClick = async (n: Notification) => {
    if (!n.is_read) await markAsRead(n.id);
    if (n.link) navigate(n.link);
    setIsOpen(false);
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="relative" onClick={() => navigate('/notifications')}>
          <Bell className="size-5" />
          {unreadBellCount > 0 && (
            <Badge variant="destructive" className="absolute -top-2 -right-2 size-5 text-xs">
              {unreadBellCount > 99 ? '99+' : unreadBellCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-80 max-h-96 overflow-y-auto">
        <DropdownMenuLabel>
          <div className="flex justify-between items-center">
            <span>Notifications</span>
            {unreadBellCount > 0 && (
              <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                Mark all read
              </Button>
            )}
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        {bellNotifications.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">
            No new notifications
            <DropdownMenuItem
              className="text-center text-primary"
              onClick={() => {
                navigate('/notifications');
                setIsOpen(false);
              }}
            >
              View notifications page
            </DropdownMenuItem>
          </div>
        ) : (
          <>
            {bellNotifications.map(n => (
              <DropdownMenuItem key={n.id} onClick={() => handleNotificationClick(n)}>
                <div className="flex items-start gap-2 w-full">
                  <div className="flex-shrink-0 mt-0.5">{getTypeIcon(n.type)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className={`text-sm truncate ${!n.is_read ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {n.title}
                      </h4>
                      {!n.is_read && <div className="size-2 bg-primary rounded-full" />}
                    </div>
                    <p className="text-xs line-clamp-2 mt-1">{n.message}</p>
                    <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                      <Clock className="size-3" />
                      {getRelativeTime(n.created_at)}
                    </div>
                  </div>
                </div>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-center text-primary"
              onClick={() => {
                navigate('/notifications');
                setIsOpen(false);
              }}
            >
              View all notifications
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};