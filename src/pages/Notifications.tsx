import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Bell, AlertTriangle, Target, CheckSquare, Brain, Settings as SettingsIcon, Search, Filter, Clock } from 'lucide-react';
import { useNotifications, Notification } from '@/hooks/useNotificationsContext';

const getTypeIcon = (type: Notification['type']) => {
  switch (type) {
    case 'alert': return <AlertTriangle className="size-4 text-destructive" />;
    case 'dm': return <Target className="size-4 text-destructive" />;
    case 'task': return <Brain className="size-4 text-blue-500" />;
    case 'calendar': return <CheckSquare className="size-4 text-blue-500" />;
    case 'system': return <SettingsIcon className="size-4 text-muted-foreground" />;
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

const NotificationsPage: React.FC = () => {
  const navigate = useNavigate();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [filteredNotifications , setFilteredNotifications] = useState<Notification[]>([]);

  // Filter logic remains, but now relies on the unified 'notifications' state
  useEffect(() => {
    let filtered = notifications;
    if (searchTerm) {
      filtered = filtered.filter(n =>
        n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        n.message.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (selectedType !== 'all') {
      filtered = filtered.filter(n => n.type === selectedType);
    }
    setFilteredNotifications(filtered);
  }, [notifications, searchTerm, selectedType]);

  const tabTypes: Notification['type'][] = [
    'alert', 'dm', 'task', 'calendar', 'system',
  ];

  const availableTabs = tabTypes.filter(type =>
    notifications.some(n => n.type === type)
  );

  const handleNotificationClick = async (n: Notification) => {
    if (!n.is_read) {
      await markAsRead(n.id);
    }
    
    if (n.link) {
      navigate(n.link);
    }
  };

  const getTypeBadgeVariant = (type: Notification['type']) => {
    switch (type) {
      case 'alert': return 'destructive';
      case 'dm': return 'destructive';
      case 'task': return 'default';
      case 'calendar': return 'default';
      case 'system': return 'secondary';
      default: return 'default';
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Notifications</h1>
          <p className="text-muted-foreground">
            {unreadCount > 0 ? `${unreadCount} unread notifications` : 'All up to date'}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button onClick={markAllAsRead}>
            Mark all as read
          </Button>
        )}
      </div>

      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search notifications..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <Tabs value={selectedType} onValueChange={setSelectedType}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          {availableTabs.map(type => (
            <TabsTrigger key={type} value={type}>
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={selectedType} className="space-y-4">
          {filteredNotifications.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Bell className="size-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No new notifications found</h3>
                <p className="text-muted-foreground text-center">
                  {searchTerm ? 'Try adjusting your search terms' : 'All notifications have been cleared'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredNotifications.map((n) => (
                <Card 
                  key={n.id}
                  className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                    !n.is_read ? 'border-l-4 border-l-primary bg-muted/20' : ''
                  }`}
                  onClick={() => handleNotificationClick(n)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-1">
                        {getTypeIcon(n.type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className={`font-medium ${!n.is_read ? 'text-foreground' : 'text-muted-foreground'}`}>
                            {n.title}
                          </h3>
                          <Badge variant={getTypeBadgeVariant(n.type)} className="text-xs">
                            {n.type}
                          </Badge>
                          {!n.is_read && (
                            <div className="size-2 bg-primary rounded-full" />
                          )}
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-2">
                          {n.message}
                        </p>
                        
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="size-3" />
                          {getRelativeTime(n.created_at)}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default NotificationsPage;