import { useState, useEffect, useCallback, useMemo } from 'react';
import { Check, Trash2, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { RoleBadge } from '@/components/RoleBadge';
import { ProfileReview } from '@/hooks/useAdminUsers';
import { useDivisions } from '@/hooks/useDivisions';
import { useProfile } from '@/hooks/useProfile';

interface UserRow {
  id: string;
  full_name: string | null;
  email: string | null;
  role: ProfileReview['role'];
  region_id: string | null;
  entity_id: string | null;
  division_id: string | null;
  manager_id: string | null;
}

interface Entity { id: string; name: string; is_active: boolean; }
interface Region { id: string; name: string; is_active: boolean; }

interface EditUserModalProps {
  user: UserRow | null;
  isOpen: boolean;
  usersLoading: boolean;
  onClose: () => void;
  onSave: (
    userId: string,
    role: string,
    entityId: string | null,
    divisionId: string | null,
    managerId: string | null,
    regionId: string | null,
  ) => Promise<{ success: boolean; error?: string }>;
  onDelete: (userId: string) => Promise<{ success: boolean; error?: string | unknown }>;
  entities: Entity[];
  regions: Region[];
  currentUserRole: ProfileReview['role'];
  currentUserId: string | undefined;
}

const EditUserModal = ({
  user, isOpen, usersLoading, onClose, onSave, onDelete,
  entities, regions, currentUserRole, currentUserId,
}: EditUserModalProps) => {
  if (!user) return null;
  const { profile } = useProfile();
  const [role, setRole] = useState<ProfileReview['role']>('pending');
  const [regionId, setRegionId] = useState<string | null>(null);
  const [entityId, setEntityId] = useState<string | null>(null);
  const [divisionId, setDivisionId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteInput, setDeleteInput] = useState('');
  const [showRoleWarning, setShowRoleWarning] = useState(false);

  const { divisions, divManagerCheck, loading: divisionsLoading } = useDivisions();

  const filteredDivisions = useMemo(() => {
    if (entityId || profile?.entity_id) {
      const e = entityId ?? profile?.entity_id;
      return divisions.filter(d => d.entity_id === e);
    }
    return [];
  }, [divisions, entityId, profile?.entity_id]);

  useEffect(() => {
    if (isOpen && user) {
      setRole(user.role);
      setRegionId(user.region_id);
      setEntityId(user.entity_id);
      setDivisionId(user.division_id);
      setShowDeleteConfirm(false);
      setDeleteInput('');
      setShowRoleWarning(false);
    } else if (!isOpen) {
      setShowDeleteConfirm(false);
      setDeleteInput('');
      setShowRoleWarning(false);
    }
  }, [isOpen, user]);

  const isSelf = user.id === currentUserId;
  const isAdminTarget = user.role === 'admin';
  const canManage = ['admin', 'head'].includes(currentUserRole)
    ? !isSelf
    : currentUserRole === 'manager' ? user.role !== 'admin' && user.role !== 'manager'
      : currentUserRole === 'branch_manager' ? user.role !== 'admin' && user.role !== 'manager' && user.role !== 'branch_manager'
      : false;

  const isDirty =
    role !== user.role ||
    regionId !== user.region_id ||
    entityId !== user.entity_id ||
    divisionId !== user.division_id;

  const handleSave = async () => {
    setIsSaving(true);
    if (!['admin', 'head'].includes(role)) {
      const { success, error } = await divManagerCheck(divisionId === 'none' ? null : divisionId, role);
      if (!success || error) { setIsSaving(false); return; }
    }

    const result = await onSave(
      user.id, role,
      entityId === 'none' ? null : entityId,
      divisionId === 'none' ? null : divisionId,
      user.manager_id ?? null,
      regionId === 'none' ? null : regionId
    );
    setIsSaving(false);
    if (result.success) onClose();
  };

  const handleDelete = () => {
    if (['head', 'manager', 'branch_manager'].includes(user.role)) {
      setShowRoleWarning(true);
    } else {
      setShowDeleteConfirm(true);
    }
  };

  const handleConfirmDelete = useCallback(() => {
    setShowDeleteConfirm(false);
    setDeleteInput('');
  }, []);

  const handleDeleteExecute = async () => {
    setDeleting(true);
    const result = await onDelete(user.id);
    setDeleting(false);
    setShowDeleteConfirm(false);
    setDeleteInput('');
    if (result.success) onClose();
  };

  const isNameMatch = deleteInput.trim().toLowerCase() === (user.full_name ?? '').trim().toLowerCase();

  return (
    <Dialog open={isOpen} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="sm:max-w-[525px] max-h-[90dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{user.full_name || user.email || 'User'}</DialogTitle>
          <DialogDescription></DialogDescription>
          <p className="text-sm text-muted-foreground">{user.email}</p>
        </DialogHeader>

        {!canManage ? (
          <div className="py-4 space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Role:</span>
              <RoleBadge role={user.role} />
            </div>
            <p className="text-xs text-muted-foreground">You do not have permission to edit this user.</p>
          </div>
        ) : (
          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <Label>Role</Label>
              <Select value={role} onValueChange={(v) => setRole(v as ProfileReview['role'])} disabled={isSaving || isSelf}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending Assignment</SelectItem>
                  <SelectItem value="associate">Associate</SelectItem>
                  <SelectItem value="specialist">Specialist</SelectItem>
                  <SelectItem value="branch_manager">Food Bank Manager</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="head" disabled={currentUserRole !== 'admin'}>Head</SelectItem>
                  <SelectItem value="referrer" disabled={currentUserRole !== 'admin'}>Referrer</SelectItem>
                  <SelectItem value="admin" disabled={currentUserRole !== 'admin'}>System Administrator</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Region</Label>
              <Select value={regionId || 'none'} onValueChange={(v) => setRegionId(v === 'none' ? null : v)} disabled={isSaving || !['admin', 'head', 'manager'].includes(currentUserRole)}>
                <SelectTrigger><SelectValue placeholder="Select region" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none" disabled={!['admin'].includes(currentUserRole)}><span className="text-muted-foreground">No Region</span></SelectItem>
                  {regions.filter((r) => r.is_active && r.id?.trim()).map((r) => (<SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Entity</Label>
              <Select value={entityId} onValueChange={setEntityId} disabled={isSaving || !['admin'].includes(currentUserRole)}>
                <SelectTrigger><SelectValue placeholder="Select entity" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none"><span className="text-muted-foreground">No Entity</span></SelectItem>
                  {entities.filter((e) => e.is_active && e.id?.trim()).map((e) => (<SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Branch</Label>
              <Select value={divisionId} onValueChange={setDivisionId} disabled={divisionsLoading || entityId === null || isSaving || !['admin', 'head', 'manager'].includes(currentUserRole)}>
                <SelectTrigger><SelectValue placeholder="Select branch" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none"><span className="text-muted-foreground">No Branch</span></SelectItem>
                  {filteredDivisions.map((d) => (<SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        <DialogFooter className="flex-col sm:flex-row gap-2">
          {canManage && (
            <>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDelete}
                    disabled={deleting || isSaving || isSelf || isAdminTarget}
                    className="mr-auto"
                  >
                    <Trash2 className="size-3.5 mr-1.5" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
                    <AlertDialogDescription>
                      Warning: deleting a user will remove all of their beneficiary notes, referral/approval history and log activity. Making users inactive is preferrable. Type the user's full name and press the button to confirm
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <div className="space-y-2 py-2">
                    <p className="text-sm mb-4">User name: {user.full_name}</p>
                    <Label>Enter Full Name to Confirm</Label>
                    <input
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                      placeholder={user.full_name ?? 'Full Name'}
                      value={deleteInput}
                      onChange={(e) => setDeleteInput(e.target.value)}
                      autoFocus
                    />
                  </div>
                  <AlertDialogFooter>
                    <AlertDialogCancel onClick={handleConfirmDelete}>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeleteExecute}
                      disabled={!isNameMatch || deleting}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      {deleting ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4 mr-1.5" />}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              {showRoleWarning && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="sm" onClick={() => setShowRoleWarning(false)}><X className="size-3.5" /></Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Role Restriction</AlertDialogTitle>
                      <AlertDialogDescription>
                        Please reassign all entities and branches from this user and change their role to pending before deleting.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel onClick={() => setShowRoleWarning(false)}>Close</AlertDialogCancel>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}

              <Button variant="outline" size="sm" onClick={onClose} disabled={isSaving}>Close</Button>
              <Button size="sm" onClick={handleSave} disabled={isSaving || !isDirty}>
                {isSaving ? <><div className="size-3 animate-spin border border-current border-t-transparent rounded-full mr-2" />Saving…</> : <><Check className="size-3.5 mr-1.5" />Save</>}
              </Button>
            </>
          )}
          {!canManage && (<Button variant="outline" size="sm" onClick={onClose}>Close</Button>)}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditUserModal;
