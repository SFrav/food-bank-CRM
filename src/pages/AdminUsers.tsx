import React, { useState } from 'react';
import { Settings2, Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { RoleBadge } from '@/components/RoleBadge';
import { useAdminUsers } from '@/hooks/useAdminUsers';
import EditUserModal from '@/components/modals/EditUserModal';
import { useProfile } from '@/hooks/useProfile';
import { PermissionGuard } from '@/components/PermissionGuard';
import { useTitles } from '@/hooks/useTitles';
import { useEntities } from '@/hooks/useEntities';
import { useDivisions } from '@/hooks/useDivisions';
import { toast } from 'sonner';

type RoleFilter = 'all' | 'account_manager' | 'staff' | 'head' | 'manager' | 'admin' | 'pending';

export default function AdminUsers() {
  const { profile } = useProfile();
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all');
  const { users, loading: usersLoading, refetch, updateUserProfile, deleteUser } = useAdminUsers(searchQuery, roleFilter);
  const { titles } = useTitles();
  const { entities, refetch: refetchEntities } = useEntities();
  const { refetch: refetchTeams } = useDivisions();

  React.useEffect(() => {
    const handler = () => {
      refetchTeams();
      refetchEntities(); // Also refresh entities when entities change
    };
    window.addEventListener('org-units-changed', handler);
    return () => window.removeEventListener('org-units-changed', handler);
  }, [refetchTeams, refetchEntities]);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [savingUsers, setSavingUsers] = useState<Set<string>>(new Set());

  const filteredUsers = users || [];

  const saveUserRole = async (
    userId: string,
    role: string,
    entityId: string | null,
    divisionId: string | null,
    managerId: string | null,
  ) => {
    setSavingUsers(prev => new Set(prev).add(userId));
    const result = await updateUserProfile(userId, role, entityId, divisionId, managerId);
    setSavingUsers(prev => { const s = new Set(prev); s.delete(userId); return s; });
    if (result.success) {
      toast.success('User updated successfully');
      setTimeout(() => refetch(), 300);
    } else {
      toast.error(result.error || 'Failed to update user');
    }
    return result;
  };

  const handleDeleteUser = async (userId: string) => {
    setSavingUsers(prev => new Set(prev).add(userId));
    const result = await deleteUser(userId);
    setSavingUsers(prev => { const s = new Set(prev); s.delete(userId); return s; });
    if (!result.success) {
      toast.error('Failed to delete user: ' + (result.error || 'Unknown error'));
    } else {
      toast.success(result.message || 'User deleted successfully');
      refetch();
    }
    return result;
  };

  return (
    <div className="space-y-6">
      {/* <div className="flex items-center gap-2">
        <Settings2 className="size-8 text-primary" />
        <h1 className="text-3xl font-semibold text-foreground">Admin Dashboard</h1>
      </div> */}

      <PermissionGuard permission="canAccessUserManagement">
        <Card>
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <CardTitle className="text-xl">Manage User Roles</CardTitle>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <div className="relative">
                <Search className="absolute left-3 top-3 size-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 w-full sm:w-64"
                />
              </div>
              <Select value={roleFilter} onValueChange={(value: RoleFilter) => setRoleFilter(value)}>
                <SelectTrigger className="w-full sm:w-40">
                  <Filter className="mr-2 size-4" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
          <SelectItem value="all">All Roles</SelectItem>
          <SelectItem value="pending">Pending Assignment</SelectItem>
          <SelectItem value="account_manager">Field Sales Staff</SelectItem>
          <SelectItem value="head">Level Head</SelectItem>
          <SelectItem value="manager">Level Manager</SelectItem>
          <SelectItem value="admin">System Administrator</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <div className="min-w-[800px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[140px]">Name</TableHead>
                    <TableHead className="min-w-[180px] hidden sm:table-cell">Email</TableHead>
                    <TableHead className="min-w-[140px]">Role</TableHead>
                    <TableHead className="min-w-[120px] text-right text-muted-foreground text-xs font-normal">
                      Click row to edit
                    </TableHead>
                  </TableRow>
                </TableHeader>
              <TableBody>
                {usersLoading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                      Loading users &hellip;
                    </TableCell>
                  </TableRow>
                ) : filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                      No users found
                    </TableCell>
                  </TableRow>
                ) : filteredUsers.map((user) => (
                  <TableRow
                    key={user.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => setSelectedUser(user)}
                  >
                    <TableCell className="font-medium">
                      <div className="truncate max-w-[160px]" title={user.full_name || 'No name'}>
                        {user.full_name || 'No name'}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground hidden sm:table-cell">
                      <div className="truncate max-w-[200px]" title={user.email || ''}>
                        {user.email || '—'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <RoleBadge role={user.role} />
                    </TableCell>
                    <TableCell className="text-right text-xs text-muted-foreground">
                      {savingUsers.has(user.id)
                        ? <div className="inline-block size-3 animate-spin border border-current border-t-transparent rounded-full" />
                        : entities.find(e => e.id === user.entity_id)?.name || '—'
                      }
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>
      </PermissionGuard>
      <EditUserModal
        user={selectedUser}
        open={!!selectedUser}
        onClose={() => setSelectedUser(null)}
        onSave={saveUserRole}
        onDelete={handleDeleteUser}
        entities={entities}
        titles={titles}
        currentUserRole={profile?.role}
        currentUserId={profile?.id}
      />
    </div>
  );
}