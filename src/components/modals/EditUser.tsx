import { useState, useEffect, useCallback } from 'react';
import { Check, Trash2, X } from 'lucide-react';
import { toast } from "sonner";
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { RoleBadge } from '@/components/RoleBadge';
import { Users } from '@/hooks/useAdminUsers';
import { useDivisions } from '@/hooks/useDivisions'; 
import { supabase } from '@/integrations/supabase/client';

interface UserRow {
  id: string;
  full_name: string | null;
  email: string | null;
  role: Users['role'];
  region_id: string | null;
  entity_id: string | null;
  division_id: string | null;
  manager_id: string | null;
}

interface Entity { id: string; name: string; is_active: boolean; }
// interface Division { id: string; name: string; }
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
  currentUserRole: Users['role'];
  currentUserId: string | undefined;
}

const EditUserModal = ({
  user, isOpen, usersLoading, onClose, onSave, onDelete,
  entities, regions, currentUserRole, currentUserId,
}: EditUserModalProps) => {
  if (!user) return null;
  const [role, setRole] = useState<Users['role']>('pending');
  const [regionId, setRegionId] = useState<string>('');
  const [entityId, setEntityId] = useState<string>('none');
  const [divisionId, setDivisionId] = useState<string>('none');
  const [isSaving, setIsSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const { divisions: filteredDivisions, loading: divisionsLoading } = useDivisions(
    entityId === 'none' ? null : entityId
  );

  // Sync local state when user changes
  useEffect(() => {
    if (!isOpen || usersLoading) return;
    //console.log('EditUserModal user:', user);
    if (user) {
      setRole(user.role);
      setRegionId(user.region_id ?? '');
      setEntityId(user.entity_id || 'none');
      setDivisionId(user.division_id ?? 'none');
      setConfirmDelete(false);
    }
  }, [user, isOpen, usersLoading]);

  // if (!user) return null;

  const isSelf = user.id === currentUserId;
  const isAdminTarget = user.role === 'admin';
  const canManage = currentUserRole === 'admin'
    ? !isSelf
    : currentUserRole === 'manager'
      ? user.role !== 'admin' && user.role !== 'manager'
      : false;

  const isDirty =
    role !== user.role ||
    (regionId || '') !== (user.region_id ?? '') ||
    (entityId === 'none' ? null : entityId) !== user.entity_id ||
    (divisionId === 'none' ? null : divisionId) !== user.division_id;

  const handleSave = async () => {
    setIsSaving(true);

    if (role === 'branch_manager' && divisionId !== 'none') {
      const { data, error } = await supabase.rpc('get_manager_by_division', {
        p_division_id: divisionId,
      });

      if (error || !data) {
        setIsSaving(false);
        toast.error(
          "The selected division has no manager. Please assign one first."
        );
        return;
      }
    }
      
    const result = await onSave(
      user.id,
      role,
      entityId === 'none' ? null : entityId,
      divisionId === 'none' ? null : divisionId,
      user.manager_id ?? null,
      regionId === 'none' ? null : regionId,
    );
    setIsSaving(false);
    if (result.success) onClose();
  };

  const handleDelete = async () => {
    if (!confirmDelete) { setConfirmDelete(true); return; }
    setDeleting(true);
    const result = await onDelete(user.id);
    setDeleting(false);
    if (result.success) onClose();
  };

  const handleConfirmDelete = useCallback(() => setConfirmDelete(false), []);

  return (
    <Dialog open={isOpen} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="sm:max-w-[525px] max-h-[90dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {user.full_name || user.email || 'User'}
          </DialogTitle>
          <DialogDescription> </DialogDescription>
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
            {/* Role */}
            <div className="space-y-1">
              <Label>Role</Label>
              <Select
                value={role}
                onValueChange={(v) => setRole(v as Users['role'])}
                disabled={isSaving || isSelf}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
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

            {/* Region */}
            <div className="space-y-1">
              <Label>Region</Label>
              <Select
                value={regionId || 'none'}
                onValueChange={(v) => setRegionId(v === 'none' ? '' : v)}
                disabled={isSaving}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Optional" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">
                    <span className="text-muted-foreground">No Region</span>
                  </SelectItem>
                  {regions
                    .filter((r) => r.is_active && r.id?.trim())
                    .map((r) => (
                      <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            {/* Entity */}
            <div className="space-y-1">
              <Label>Entity</Label>
              <Select value={entityId} onValueChange={setEntityId} disabled={isSaving}>
                <SelectTrigger>
                  <SelectValue placeholder="Select entity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">
                    <span className="text-muted-foreground">No Entity</span>
                  </SelectItem>
                  {entities
                    .filter((e) => e.is_active && e.id?.trim())
                    .map((e) => (
                      <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            {/* Division */}
            <div className="space-y-1">
              <Label>Branch</Label>
              <Select
                value={divisionId}
                onValueChange={setDivisionId}
                disabled={divisionsLoading || entityId === 'none' || isSaving}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select branch" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">
                    <span className="text-muted-foreground">No Branch</span>
                  </SelectItem>
                  {filteredDivisions.map((d) => (
                    <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        <DialogFooter className="flex-col sm:flex-row gap-2">
          {canManage && (
            <>
              {/* Delete — two-step confirm */}
              <Button
                variant={confirmDelete ? 'destructive' : 'outline'}
                size="sm"
                onClick={handleDelete}
                disabled={deleting || isSaving || isSelf || isAdminTarget}
                className="mr-auto"
              >
                <Trash2 className="size-3.5 mr-1.5" />
                {confirmDelete ? '' : ''} {/* confirmDelete ? 'Confirm' : 'Delete' */}
              </Button>
              {confirmDelete && (
                <Button variant="ghost" size="sm" onClick={handleConfirmDelete}>
                  <X className="size-3.5 mr-1" />  
                </Button>
              )}

              <Button variant="outline" size="sm" onClick={onClose} disabled={isSaving}>
                Close
              </Button>
              <Button size="sm" onClick={handleSave} disabled={isSaving || !isDirty}>
                {isSaving
                  ? <><div className="size-3 animate-spin border border-current border-t-transparent rounded-full mr-2" />Saving…</>
                  : <><Check className="size-3.5 mr-1.5" />Save</>
                }
              </Button>
            </>
          )}
          {!canManage && (
            <Button variant="outline" size="sm" onClick={onClose}>Close</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>

  );
};

export default EditUserModal;
