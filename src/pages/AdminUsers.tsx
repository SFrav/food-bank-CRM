import React, { useState, useEffect, useCallback, useMemo, lazy, Suspense } from 'react';
import { Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { RoleBadge } from '@/components/RoleBadge';
import { Users, useAdminUsers } from '@/hooks/useAdminUsers';
// import EditUserModal from '@/components/modals/EditUser';
import { useProfile } from '@/hooks/useProfile';
import { PermissionGuard } from '@/components/PermissionGuard';
import { useRegions } from '@/hooks/useRegions';
import { useEntities } from '@/hooks/useEntities';
import { useDivisions } from '@/hooks/useDivisions';
import { useToast } from '@/hooks/useToast';

const EditUserModal = lazy(() =>
  import('@/components/modals/EditUser')
);

type RoleFilter = 'all' | 'admin' | 'head' | 'manager' | 'referrer' | 'branch_manager' | 'staff' | 'volunteer' |  'pending';

export default function AdminUsers() {
  const { profile } = useProfile();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all');
  const { users, loading: usersLoading, refetch, updateUserProfile, deleteUser } = useAdminUsers(searchQuery, roleFilter);
  const { regions } = useRegions();
  const { entities, refetch: refetchEntities } = useEntities();
  const { refetch: refetchDivisions } = useDivisions();

  useEffect(() => {
    const handler = () => {
      refetchDivisions();
      refetchEntities();
    };
    window.addEventListener('org-units-changed', handler);
    return () => window.removeEventListener('org-units-changed', handler);
  }, [refetchDivisions, refetchEntities]);
  const [selectedUser, setSelectedUser] = useState<Users | null>(null);
  const [savingUsers, setSavingUsers] = useState<Set<string>>(new Set());

  const filteredUsers = useMemo(() => users ?? [], [users]);

  const saveUserRole = useCallback(async (
    userId: string,
    role: string,
    entityId: string | null,
    divisionId: string | null,
    managerId: string | null,
    regionId: string | null
  ) => {
    setSavingUsers(prev => new Set(prev).add(userId));
    const result = await updateUserProfile(userId, role as Users['role'], entityId, divisionId, managerId, regionId);
    setSavingUsers(prev => { const s = new Set(prev); s.delete(userId); return s; });
    if (result.success) {
      // toast({description: 'User updated successfully', variant: 'default'});
    } else {
      toast({ title: 'Error', description: result.error || 'Failed to update user', variant: 'destructive' });
    }
    return result;
  }, [updateUserProfile]);

  const handleDeleteUser = useCallback(async (userId: string) => {
    setSavingUsers(prev => new Set(prev).add(userId));
    const result = await deleteUser(userId);
    setSelectedUser(null);
    setSavingUsers(prev => { const s = new Set(prev); s.delete(userId); return s; });
    if (!result.success) {
      return result;
    } else {
    }
    return result;
  }, [deleteUser, refetch]);


  return (
    <div className="space-y-6">
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
          <SelectItem value="volunteer">Volunteer</SelectItem>
          <SelectItem value="staff">Staff Member</SelectItem>
          <SelectItem value="branch_manager">Food Bank Manager</SelectItem>
          <SelectItem value="manager">Level Manager</SelectItem>
          <SelectItem value="head">Level Head</SelectItem>
          <SelectItem value="referrer">Referrer</SelectItem>
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
                    <TableHead className="w-[200px]">Role</TableHead>
                    <TableHead className="min-w-[120px] text-right text-muted-foreground text-xs font-normal">
                      Entity
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
      {!!selectedUser && (
        <Suspense fallback={<div className="p-4">Loading Modal &hellip;</div>}>
          <EditUserModal
            //key={selectedUser?.id ?? 'modal'} //@Workaround to resolve this issue: "Internal React error: Expected static flag was missing.". Not related to lazy load. Adding usersLoading checks to modal didn't resolve
            user={selectedUser}
            isOpen={!!selectedUser}
            usersLoading={usersLoading}
            onClose={() => setSelectedUser(null)}
            onSave={saveUserRole}
            onDelete={handleDeleteUser}
            entities={entities}
            regions={regions}
            currentUserRole={profile?.role}
            currentUserId={profile?.id}
          />
        </Suspense>
      )}
    </div>
  );
}