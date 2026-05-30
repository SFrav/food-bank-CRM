import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DivisionSummary } from "@/components/dashboard/DivisionSummary";
import { DivisionChart } from "@/components/dashboard/DivisionBeneficiaryChart";
import { CalendarDays } from "lucide-react";
import { DashboardHeader } from "@/components/DashboardHeader";
import { useProfile } from "@/hooks/useProfile";
import { useAdminUsers } from '@/hooks/useAdminUsers';
import { useCreateNotifications } from "@/hooks/useNotifications";
import { PermissionGuard } from '@/components/PermissionGuard';

type AllowedRoles = "branch_manager" | "staff" | "manager" | "head" | "admin";

export default function Dashboard() {
  const { profile } = useProfile();
  const { users: allUsers, loading: usersLoading } = useAdminUsers('', '');
  const {createNotification} = useCreateNotifications();
  const [dateRange, setDateRange] = useState<string>("month");
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [targetUser, setTargetUser] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [type, setType] = useState<'dm' | 'alert'>('dm');

  const filteredUsers = useMemo(() => {
    if (!profile) return [];   
    return allUsers.filter((u: any) => u.entity_id === profile.entity_id);
  }, [allUsers, profile]);

  const handleSubmit = async () => {
    const result = await createNotification(
      title,
      message,
      '/notifications',
      type,
      type === 'dm' ? targetUser : null,
      type === 'alert' ? targetRole : null
    );
    if (result.success) {
      setTitle('');
      setMessage('');
      setTargetUser('');
      setTargetRole('');
    }
  };

  const role = profile?.role as AllowedRoles;

  if (!profile) {
    return (
      <div className={`flex items-center gap-4 `}>
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-3xl font-semibold text-foreground">

            </h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge className= 'bg-primary text-primary-foreground'>
                User
              </Badge>
            </div>
          </div>
        </div>
      </div>
    );
  }  

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <DashboardHeader role= {role || 'staff'} /> 
      </div>

      <DivisionSummary />

      <PermissionGuard permission="canAccessAnalytics">
        {/* Filters Section */}
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-end">

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-foreground">Date Range</label>
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue placeholder="Select range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">This Month</SelectItem>
                <SelectItem value="month">Year to Date</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-2">
              <CalendarDays className="size-4" />
              Custom Range
            </Button>
          </div>
        </div>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Left Column - Primary Content */}
            <div className="xl:col-span-2 space-y-6">
              <DivisionChart dateRange={dateRange} />
            </div>

          {/* Right Column - Secondary Content */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Post Notification</CardTitle>
              </CardHeader>
              <CardContent>
                <Select value={type} onValueChange={v => setType(v as any)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dm">Direct Message (DM)</SelectItem>
                    <SelectItem value="alert">Alert</SelectItem>
                  </SelectContent>
                </Select>

                <Input placeholder="Title" className="mt-4" value={title} onChange={e => setTitle(e.target.value)} />
                <Textarea placeholder="Message" className="mt-4" value={message} onChange={e => setMessage(e.target.value)} />

                {type === 'dm' && (
                  <Select
                    value={targetUser}
                    onValueChange={setTargetUser}
                    disabled={usersLoading}
                  >
                    <SelectTrigger className="mt-4 w-full">
                      <SelectValue placeholder="Select a user" />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredUsers.map((user: any) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.full_name ?? user.email}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}

                {type === 'alert' && (
                  <Select value={targetRole} onValueChange={v => setTargetRole(v as any)}>
                    <SelectTrigger className="w-full mt-4">
                      <SelectValue placeholder="Target role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="branch_manager">Branch Manager</SelectItem>
                      <SelectItem value="staff">Staff</SelectItem>
                      <SelectItem value="volunteer">Volunteer</SelectItem>
                      <SelectItem value="referrer">Referrer</SelectItem>
                    </SelectContent>
                  </Select>
                )}

                <Button variant="default" className="mt-4" onClick={handleSubmit}>
                  Post
                </Button>   
              </CardContent>
            </Card>         
          </div>
        </div>
      </PermissionGuard>

    </div>
  );
}