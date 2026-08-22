import React, {useState} from 'react';
import { Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Contact } from '@/hooks/useContacts';
import { Region } from '@/hooks/useRegions';
import { Division } from '@/hooks/useDivisions';
import { Textarea } from '@/components/ui/textarea';
import { ContactFormData } from '@/components/modals/EditContact';
import { PermissionGuard } from '@/components/PermissionGuard';
import { ContactNote } from '@/hooks/useContactNotes';

interface ContactEditFormProps {
  formData: ContactFormData;
  setFormData: React.Dispatch<React.SetStateAction<ContactFormData>>;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleSubmit: (e: React.ChangeEvent) => void; 
  isLoading: boolean;
  isDirty: boolean;
  confirmDelete: boolean;
  deleting: boolean;
  condition1: boolean;
  condition2: boolean;
  condition3: boolean;
  setCondition1: React.Dispatch<React.SetStateAction<boolean>>;
  setCondition2: React.Dispatch<React.SetStateAction<boolean>>;
  setCondition3: React.Dispatch<React.SetStateAction<boolean>>;
  contact: Contact | null;
  regions: Region[];
  divsRegion: Division[];
  loadDivsRegion: (dId: string) => Division[];
  notes: ContactNote[];
  handleDelete: () => void;
  setConfirmDelete: React.Dispatch<React.SetStateAction<boolean>>;
  setIgnoreCloseWarning: React.Dispatch<React.SetStateAction<boolean>>;
  handleClose: () => void;
}

const ContactEditForm: React.FC<ContactEditFormProps> = ({
  formData,
  setFormData,
  handleInputChange,
  handleSubmit,
  isLoading,
  isDirty,
  confirmDelete,
  deleting,
  condition1,
  condition2,
  condition3,
  setCondition1,
  setCondition2,
  setCondition3,
  contact,
  regions,
  divsRegion,
  loadDivsRegion,
  notes,
  handleDelete,
  setConfirmDelete,
  setIgnoreCloseWarning,
  handleClose,
}) => {
  const approveEnabled = condition1 && condition2 && condition3;
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Name *</Label>
          <Input id="name" name="name" value={formData.name} onChange={handleInputChange} placeholder="Full name" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} placeholder="Email address" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2 w-[50%] sm:w-full">
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="Phone number" />
        </div>
        <div> </div>
        <div className="space-y-2">
          <Label htmlFor="street">Street Address</Label>
          <Input
            id="street_address"
            name="street_address"
            value={formData.street_address}
            onChange={handleInputChange}
            placeholder="Street Address"
          />
        </div>   
        <div className="space-y-2 w-[50%] sm:w-full">
          <Label htmlFor="post">Post Code</Label>
          <Input
            id="postcode"
            name="postcode"
            value={formData.postcode}
            onChange={handleInputChange}
            placeholder="Post code"
          />
        </div>                 
        <div className="space-y-2 w-[50%] sm:w-full">
            <Label htmlFor="region">Region *</Label>
            <Select
              required={true}
              value={formData.region_id || "none"}
              onValueChange={v => {
                setFormData({ ...formData, region_id: v });
              }}
            >
              <SelectTrigger >
                <SelectValue placeholder="Select Region"/>
              </SelectTrigger>
              <SelectContent>
                {regions.filter((d) => d.is_active === true).map(re => (
                  <SelectItem key={re.id} value={re.id}>
                    {re.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <PermissionGuard permission="canAssignBeneficiaries"> 
            <div className="space-y-2 w-[50%] sm:w-full">
              <Label htmlFor="branch">{formData.status === 'active' ? "Branch*" : "Branch"}</Label>
              <Select
                required={formData.status === 'active'}
                value={formData.status === 'active' && 
                  !divsRegion.some(d=>d.manager_id===formData.owner_id) ? undefined : formData.owner_id}
                onValueChange={v => {                
                  setFormData({ ...formData, owner_id: v });
                  loadDivsRegion(v);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Branch" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No branch selected</SelectItem>
                  {divsRegion.map(div => (
                    <SelectItem key={div.manager_id} value={div.manager_id}>
                      {div.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </PermissionGuard>
      </div>
      <div className="flex align-left space-x-2">
        <div>
          <PermissionGuard permission="canAssignBeneficiaries">
          <label htmlFor="status" className="text-sm">Change status:</label>
        {contact?.status === 'pending' && (         
            <div className="space-y-2 mb-4">
              <PermissionGuard permission="canApproveBeneficiaries">
              <div>
              <div className="flex items-center space-x-2">
                <Switch id="step1" checked={condition1} onCheckedChange={setCondition1} />
                <span className="text-sm text-muted-foreground">The applicant is in a crisis situation</span>
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="step2" checked={condition2} onCheckedChange={setCondition2} />
                <span className="text-sm text-muted-foreground">Information about subsidised food has been provided</span>
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="step3" checked={condition3} onCheckedChange={setCondition3} />
                <span className="text-sm text-muted-foreground">Support services are working to resolve the crisis</span>
              </div>
              </div>
            </PermissionGuard>
            </div>
            )}      
              <div className="flex items-center space-x-2 w-[50%] sm:w-full">
                <Select
                  value={formData.status}
                  onValueChange={(v: Contact["status"]) => {
                    setFormData({ ...formData, status: v });
                  }}
                >
                  <SelectTrigger className="sm:w-full">
                    <SelectValue placeholder="Select Status"/>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <PermissionGuard permission="canApproveBeneficiaries">
                    <SelectItem value="inactive">Inactive</SelectItem>
                    {approveEnabled && (
                    <SelectItem value="active">Approve</SelectItem>
                    )}
                    </PermissionGuard>
                  </SelectContent>
                </Select>
                {/* <Switch
                  id="status"
                  checked={formData.status === 'active'}
                  disabled={!approveEnabled}
                  onCheckedChange={(checked) => {
                    if (!approveEnabled) return;               
                    const newStatus = checked ? 'active' : 'pending';
                    setFormData(prev => ({ ...prev, status: newStatus }));
                  }}
                />
                <span className="text-sm text-muted-foreground">Approve beneficiary</span>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="status_decline"
                  checked={formData.status === 'inactive'}
                  disabled={approveEnabled}
                  onCheckedChange={(checked) => {
                    if (approveEnabled) return;            
                    const newStatus = checked ? 'inactive' : 'pending';
                    setFormData(prev => ({ ...prev, status: newStatus }));
                  }}
                />
                <span className="text-sm text-muted-foreground">Decline beneficiary</span> */}
              </div>   
              </PermissionGuard>
            </div>    
      </div>
      <Label htmlFor="hh_composition">Household Composition</Label>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2 w-[30%] sm:w-full">
          <Label htmlFor="adults">Adults (≥18)</Label>
          <Input id="adults" name="adults" type='number' min={1} step={1} 
          value={formData.adults} onChange={handleInputChange} placeholder={String(formData.adults)} />
        </div>
        <div className="space-y-2 w-[30%] sm:w-full">
          <Label htmlFor="children_gt16">Children (≥16)</Label>
          <Input id="gt16" name="children_gt16" type='number' min={0} step={1} 
          value={formData.children_gt16} onChange={handleInputChange} placeholder="0" />
        </div>
        <div className="space-y-2 w-[30%] sm:w-full">
          <Label htmlFor="children_lt16">Children ({'<16'})</Label>
          <Input id="lt16" name="children_lt16" type='number' min={0} step={1} 
          value={formData.children_lt16} onChange={handleInputChange} placeholder="0" />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">New Note</Label>
        <Textarea id="notes_new" name="notes_new" value={formData.notes_new || ""} onChange={handleInputChange} placeholder="Additional notes..." rows={3} />
      </div>

      {/* Footer text - case specific warnings */}
      {(!isDirty && !confirmDelete) && <p className="text-xs invisible">Invisible - shh</p>} {/*Blank line to keep vertical space change to a minimum */}
      {(isDirty && !confirmDelete) && <p className="text-xs text-amber-500">You have unsaved changes</p>}
      {confirmDelete && <p className="text-xs text-amber-500 mb-1">Confirm delete of beneficiary? This cannot be reversed</p>}      

      <div className="flex justify-between gap-2 mt-2">
        
        <div className="flex items-center gap-2">
          <Button
            variant={confirmDelete ? 'destructive' : 'outline'}
            size="sm"
            onClick={handleDelete}
            disabled={deleting || isLoading || !contact}
            className="mr-auto size-10"
            type="button"
          >
            <Trash2 className="size-3.5" />
            {confirmDelete ? '' : ''} {/* confirmDelete ? 'Confirm' : 'Delete' */}
          </Button>

          {confirmDelete && (
            <Button variant="ghost" size="sm" onClick={() => setConfirmDelete(false)} className="size-10" type="button">
              <X className="size-3.5" />
            </Button>
          )}
        </div>

        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={() => { setIgnoreCloseWarning(true); handleClose(); }} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading || !isDirty}>
            {isLoading ? 'Saving…' : 'Save'}
          </Button>
        </div>
      </div>
      {notes.map(n => (
        <div key={n.note_id} className="space-y-1">
          <Textarea
            disabled
            value={n.note_text}
            rows={1}
            className="bg-muted min-h-[20px]"
          />
          <small className="text-xs text-muted-foreground">
            {n.creator_name ?? 'Unknown'} •{' '}
            {new Date(n.created_at).toLocaleDateString('en-GB')} {new Date(n.created_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
          </small>
        </div>
      ))}
    </form>
  );
};

export default ContactEditForm;