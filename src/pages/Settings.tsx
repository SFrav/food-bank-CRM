import React, { useState } from 'react';
import { User, Settings as SettingsIcon, Shield, Moon, Sun, Bell, Globe, Lock, LogOut, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import ProfilePage from '@/pages/Profile'; 
import { NotificationBell } from '@/components/NotificationBell';

type SettingsSection = 'profile' | 'preferences' | 'security';

const settingsNavigation = [
  { id: 'profile' as SettingsSection, label: 'Profile', icon: User },
  { id: 'preferences' as SettingsSection, label: 'Preferences', icon: SettingsIcon },
  { id: 'security' as SettingsSection, label: 'Security', icon: Shield },
];

const timezones = [
  { value: 'UTC', label: 'UTC (GMT+0)' },
  { value: 'America/New_York', label: 'Eastern Time (GMT-5)' },
  { value: 'America/Chicago', label: 'Central Time (GMT-6)' },
  { value: 'America/Denver', label: 'Mountain Time (GMT-7)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (GMT-8)' },
  { value: 'Europe/London', label: 'London (GMT+0)' },
  { value: 'Europe/Paris', label: 'Paris (GMT+1)' },
  { value: 'Asia/Tokyo', label: 'Tokyo (GMT+9)' },
];

export default function Settings() {
  const [activeSection, setActiveSection] = useState<SettingsSection>('profile');
  // const [isDarkMode, setIsDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [twoFactorAuth, setTwoFactorAuth] = useState(false);

  const renderPreferencesSection = () => (
    <Card>
      <CardHeader>
        <CardTitle>Preferences</CardTitle>
        <CardDescription>
          Customize your experience and notification settings
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* @@@ If implemented here then change the source of truth to be in the database, not in CRMLayout or App.tsx. Then remembered between sessions here and temporarily if header used */}
        {/* <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="theme">Theme</Label>
            <p className="text-sm text-muted-foreground">
              Choose your preferred theme
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Sun className="size-4" />
            <Switch
              id="theme"
              checked={isDarkMode}
              onCheckedChange={(checked) => {
                setIsDarkMode(checked);
                document.documentElement.classList.toggle("dark", checked); // Toggle based on the new state
              }}
            />
            <Moon className="size-4" />
          </div>
        </div>

        <Separator /> */}

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="notifications">Notifications</Label>
            <p className="text-sm text-muted-foreground">
              Receive email notifications for updates
            </p>
          </div>
          <Switch
            id="notifications"
            checked={notifications}
            onCheckedChange={setNotifications}
          />
        </div>

        <Separator />

        <div className="space-y-2">
          <Label htmlFor="timezone">Timezone</Label>
          <Select defaultValue="America/New_York">
            <SelectTrigger className="w-full md:w-[300px]">
              <SelectValue placeholder="Select timezone" />
            </SelectTrigger>
            <SelectContent>
              {timezones
                .filter(timezone => timezone.value && timezone.value.trim() !== '' && timezone.label && timezone.label.trim() !== '')
                .map((timezone) => (
                  <SelectItem key={timezone.value} value={timezone.value}>
                    {timezone.label}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>

        <Separator />

        <div className="flex justify-end">
          <Button>Save Changes</Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderSecuritySection = () => (
    <Card>
      <CardHeader>
        <CardTitle>Security Settings</CardTitle>
        <CardDescription>
          Manage your account security and privacy
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center space-x-3">
              <Lock className="size-5 text-muted-foreground" />
              <div>
                <p className="font-medium">Password</p>
                <p className="text-sm text-muted-foreground">
                  Last changed 3 months ago
                </p>
              </div>
            </div>
            <Button variant="outline">Reset Password</Button>
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center space-x-3">
              <Smartphone className="size-5 text-muted-foreground" />
              <div>
                <p className="font-medium">Two-Factor Authentication</p>
                <p className="text-sm text-muted-foreground">
                  Add an extra layer of security
                </p>
              </div>
            </div>
            <Switch
              checked={twoFactorAuth}
              onCheckedChange={setTwoFactorAuth}
            />
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center space-x-3">
              <LogOut className="size-5 text-muted-foreground" />
              <div>
                <p className="font-medium">Active Sessions</p>
                <p className="text-sm text-muted-foreground">
                  Sign out from all other devices
                </p>
              </div>
            </div>
            <Button variant="outline" className="text-destructive hover:text-destructive">
              Logout All Devices
            </Button>
          </div>
        </div>

        <Separator />

        <div className="flex justify-end">
          <Button>Save Changes</Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'profile':
        return <ProfilePage />;
      case 'preferences':
        return renderPreferencesSection();
      case 'security':
        return renderSecuritySection();
      default:
        return <ProfilePage />;
    }
  };

  return (
    <div className="space-y-6">
      {/* <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold text-foreground">Settings</h1>
        <NotificationBell />
      </div> */}
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Navigation Sidebar */}
        <div className="md:col-span-1">
          <Card className="sticky top-0">
            <CardContent className="p-4">
              <nav className="space-y-2">
                {settingsNavigation.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeSection === item.id;
                  
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveSection(item.id)}
                      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                      }`}
                    >
                      <Icon className="size-4" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Area */}
        <div className="md:col-span-3">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}