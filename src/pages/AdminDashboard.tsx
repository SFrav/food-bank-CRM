import React from 'react';
import { useNavigate } from 'react-router-dom';
// import { RoleBadge } from '@/components/RoleBadge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useProfile } from '@/hooks/useProfile';
import { Users, Settings, Shield, Database, User, Sliders } from 'lucide-react';
import { DashboardHeader } from '@/components/DashboardHeader';

const AdminDashboard: React.FC = () => {
  const { profile } = useProfile();
  const navigate = useNavigate();

  const goTo = (path: string) => () => navigate(path);
  const goToTab = (tab: string) => () => navigate(`/settings?tab=${tab}`);

  // const handleManageUserRoles = () => {
  //   navigate('/admin/users');
  // };

  // const handleLogs = () => {
  //   navigate('/admin/logs');
  // };

  // const handleOther = () => {
  //   navigate('/admin');
  // };


  // const handleProfile = () => {
  //   navigate('/settings?tab=profile');
  // };

  // const handlePreferences = () => {
  //   navigate('/settings?tab=preferences');
  // };

  // const handleSecurity = () => {
  //   navigate('/settings?tab=security');
  // };

  return (
    <div className="space-y-8">
      {/* Header */}
      <DashboardHeader role="admin" />

      {/* Welcome Card */}
      <Card>
        <CardHeader>
          <CardTitle>Welcome back, {profile?.full_name || 'Administrator'}!</CardTitle>
          <CardDescription>
            Manage users, system settings, and organizational structure.
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Main Content Tabs */}
      <Tabs defaultValue="users" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="size-4" />
            Manage Users
          </TabsTrigger>
          <TabsTrigger value="system" className="flex items-center gap-2">
            <Settings className="size-4" />
            System Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="size-5" />
                  User Role Management
                </CardTitle>
                <CardDescription>
                  Assign and manage user roles across the organization
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Control access levels and permissions for all users in the system.
                </p>
                <Button className="w-[250px]" onClick={goTo('/admin/users')}>
                  Manage User Roles
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="size-5" />
                  System logs
                </CardTitle>
                <CardDescription>
                  View and manage system logs
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Access information about system usage.
                </p>
                <Button className="w-[250px]" onClick={goTo('/admin/logs')}>
                  View logs
                </Button>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Manage organisation</CardTitle>
              <CardDescription>
                Manage entities, divisions (teams) and regions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                View, add, remove or edit entities, divisions and regions
              </p>
              <Button className="w-[250px]" onClick={goTo('/admin')}>
                Review entities and divisions
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="size-5" />
                  Profile
                </CardTitle>
                <CardDescription>
                  Manage user profile settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Configure user account information and personal settings.
                </p>
                <Button variant="outline" className="w-full" onClick={goToTab('profile')}>
                  Profile Settings
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sliders className="size-5" />
                  Preferences
                </CardTitle>
                <CardDescription>
                  Customize system preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Adjust application preferences and user interface settings.
                </p>
                <Button variant="outline" className="w-full" onClick={goToTab('preferences')}>
                  Preferences
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="size-5" />
                  Security
                </CardTitle>
                <CardDescription>
                  Security and access controls
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Configure authentication, authorization, and security policies.
                </p>
                <Button variant="outline" className="w-full" onClick={goToTab('security')}>
                  Security Settings
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;