import React, { useState, useCallback } from 'react';
import { Trash2, X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useProfile } from '@/hooks/useProfile';
import { useApprove, HoldingCombined } from '@/hooks/useApprove'; 

interface AddAuthProps {
  data: HoldingCombined | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function AddAuthModal({ data, isOpen, onClose }: AddAuthProps) {
  if (!data) return null;
  const { profile } = useProfile();
  const { approveUser, deleteHolding, loading } = useApprove();

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirmDelete) { setConfirmDelete(true); return; }
    setIsDeleting(true);
    const success = await deleteHolding(data.id);
    if (success) onClose();
    setIsDeleting(false);
  };

  const handleApprove = async () => {
    await approveUser(data.id);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="sm:max-w-[525px] max-h-[90dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{data.full_name || data.email || 'Application'}</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">Review & Approve Pending Application</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1">
            <label className="text-sm font-medium mr-3">Role:</label>
            <Badge variant={data.role === 'head' ? 'default' : 'secondary'}>{data.role}</Badge>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium">Full Name:</label>
              <Input readOnly={true} value={data.full_name || ''} className="bg-muted/30" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Email:</label>
              <Input readOnly={true} value={data.email || ''} className="bg-muted/30" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Created on:</label>
              <Input readOnly={true} value={new Date(data.created_at).toLocaleDateString()} className="bg-muted/30" />
            </div>
          </div>

          {data.entity_name && (
            <div className="space-y-2 pt-2">
              <label className="text-sm font-medium">Entity Name:</label>
              <div className="grid grid-cols-2 gap-4">
                <Input readOnly={true} value={data.entity_name || '—'} className="bg-muted/30" />
                {/* <Input readOnly={true} value={data.entity_code || '—'} className="bg-muted/30" /> */}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          {/* Delete Button (Bottom Left) */}
          <Button
            variant={confirmDelete ? 'destructive' : 'outline'}
            size="sm"
            onClick={handleDelete}
            disabled={isDeleting}
            className="mr-auto"
          >
            <Trash2 className="size-3.5 mr-1.5" />
            {confirmDelete ? 'Confirm Delete' : 'Delete'}
          </Button>
          {confirmDelete && (
            <Button variant="ghost" size="sm" onClick={() => setConfirmDelete(false)}>
              <X className="size-3.5 mr-1" />
            </Button>
          )}
          {/* Cancel Button (Left of Approve) */}
          <Button variant="outline" size="sm" onClick={onClose} disabled={loading || isDeleting}>Cancel</Button>

          {/* Approve Button (Bottom Right) */}
          <Button size="sm" onClick={handleApprove} disabled={loading || isDeleting}>
            {loading ? <div className="size-3 animate-spin border border-current border-t-transparent rounded-full mr-2" /> : <Check className="size-3.5 mr-1.5" />}
            Approve
          </Button>

          
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}