import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
//import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { ArrowRightLeft, Maximize2, Minimize } from 'lucide-react';
import { useToast } from '@/hooks/useToast';
import { useContacts, Contact } from '@/hooks/useContacts';
import { useRegions } from '@/hooks/useRegions';
import { cn } from '@/lib/utils';

interface MergeContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMerged: () => void;
  primary: Contact | null;
  secondary: Contact | null;
}

const COMPARISON_FIELDS: Array<keyof Contact> = [
  'name',
  'email',
  'phone',
  'street_address',
  'postcode',
  'region_id',
  'adults',
  'children_gt16',
  'children_lt16',
];

export const MergeContactModal: React.FC<MergeContactModalProps> = ({
  isOpen,
  onClose,
  onMerged,
  primary: initialPrimary,
  secondary: initialSecondary,
}) => {
  if (!initialPrimary || !initialSecondary) return null;
  const { mergeContacts } = useContacts();
  const { toast } = useToast();

  const [primary, setPrimary] = useState<Contact>(initialPrimary);
  const [secondary, setSecondary] = useState<Contact>(initialSecondary);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { regions } = useRegions();

  useEffect(() => {
    if (!isOpen) return;
    setPrimary(initialPrimary);
    setSecondary(initialSecondary);
  }, [initialPrimary, initialSecondary]);

  const toggle = () => {
    setPrimary(prev => {
      const oldPrimary = prev;
      setPrimary(secondary);
      setSecondary(oldPrimary);
      return secondary;
    });
  };

  const regionName = (id?: string | null) => {
    if (!id) return '';
    const match = regions.find(r => r.id === id);
    return match?.name ?? id;
  };

  const handleMerge = async () => {
    setLoading(true);
    const { success, error } = await mergeContacts(primary.id, secondary.id);
    setLoading(false);
    if (!success) {
      toast({ title: 'Error', description: error ?? 'Merge failed', variant: 'destructive' });
      return;
    }
    toast({ title: 'Success', description: 'Contacts merged' });
    onMerged();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={o => (o ? undefined : onClose())}>
      <DialogContent
        className={cn(
          'sm:max-w-[525px] max-h-[90dvh] overflow-y-auto',
          isFullScreen && 'sm:max-w-[900px] max-w-full max-h-full',
        )}
      >
        <DialogHeader>
          <div className="flex items-start justify-between">
          <div>
          <DialogTitle>Merge Contacts</DialogTitle>
          <DialogDescription>Only notes, requests and referral details will be combined.</DialogDescription>
          </div>
          <div className="flex gap-2 truncate align-right">
            <button
              onClick={() => setIsFullScreen(prev => !prev)}
              title={isFullScreen ? 'Restore' : 'Maximise'}
              className="absolute right-9.5 top-4.5 rounded-sm opacity-70 hover:opacity-100 transition-opacity"
              aria-label={isFullScreen ? 'Restore window' : 'Maximise window'}
            >
              {isFullScreen ? <Minimize className="size-3.5" /> : <Maximize2 className="size-3.5" />}
            </button>
          </div>
          </div>
          <div className="flex flex-col items-center">
            <button
              onClick={toggle}
              title="Swap primary/secondary"
              className="p-2 rounded-md hover:bg-primary/10 transition-colors"
              aria-label="Swap primary and secondary contacts"
            >
              <ArrowRightLeft className="size-4" />
            </button>
          </div>
        </DialogHeader>

        <div
          className={cn(
            'p-0 flex flex-col md:flex-row gap-4',
            isFullScreen && 'h-full',
          )}
        >
           
          {/* Primary side – read only */}
          <div
            className={cn(
              'flex-1 p-4 rounded-md bg-white shadow-sm',
              isFullScreen && 'h-full',
            )}
          >
            <div className="mb-2 border-b">
            <label className="text-sm font-medium mb-1">Primary</label>
            </div>
            {COMPARISON_FIELDS.map(field => (
              <div key={field} className="mb-2">
                {field === 'region_id' ? (
                <div>
                <Label className="text-sm font-medium">
                  {"Region"}
                </Label>
                  <Input
                    id={field}
                    value={regionName(primary[field] ?? '')}
                    disabled
                    className="mt-1"
                  />
                  </div>
                ) : (
                  <div>
                    <Label htmlFor={field} className="text-sm font-medium capitalize">
                      {field.replace(/_/g, ' ').replace(/gt16/g, '(≥16)').replace(/lt16/g, '(<16)')}
                    </Label>
                  <Input
                    id={field}
                    value={primary[field] ?? ''}
                    disabled
                    // onChange={e =>
                    //   setPrimary(prev => ({ ...prev, [field]: e.target.value }))
                    // }
                    className="mt-1"
                    type={['adults', 'children_gt16', 'children_lt16'].includes(field) ? 'number' : 'text'}
                  />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Secondary side – read‑only */}
          <div
            className={cn(
              'flex-1 p-4 rounded-md bg-gray-100 shadow-sm',
              isFullScreen && 'h-full',
            )}
          >
            <div className="mb-2 border-b">
            <label className="text-sm font-medium">Duplicate</label>
            </div>
            {COMPARISON_FIELDS.map(field => (
              <div key={field} className="mb-2">
                {field === 'region_id' ? (
                <div>
                <Label className="text-sm font-medium">
                  {"Region"}
                </Label>
                  <Input
                    id={field}
                    value={regionName(secondary[field] ?? '')}
                    disabled
                    className="mt-1"
                  />
                  </div>
                ) : (
                  <div>
                    <Label htmlFor={field} className="text-sm font-medium capitalize">
                      {field.replace(/_/g, ' ').replace(/gt16/g, '(≥16)').replace(/lt16/g, '(<16)')}
                    </Label>
                  <Input
                    id={field}
                    value={secondary[field] ?? ''}
                    disabled
                    // onChange={e =>
                    //   setPrimary(prev => ({ ...prev, [field]: e.target.value }))
                    // }
                    className="mt-1"
                    type={['adults', 'children_gt16', 'children_lt16'].includes(field) ? 'number' : 'text'}
                  />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <DialogFooter className="flex justify-end p-4 gap-2 border-t">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleMerge} disabled={loading}>
            {loading ? <span className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> : 'Merge'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};