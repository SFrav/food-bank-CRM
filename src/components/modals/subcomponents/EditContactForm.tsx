import React, {useState, useEffect, useCallback, useMemo} from 'react';
import { Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Contact } from '@/hooks/useContacts';
import { Region } from '@/hooks/useRegions';
import { Division } from '@/hooks/useDivisions';
import { DivisionOpen } from '@/hooks/useDivisionOpen';
import { Textarea } from '@/components/ui/textarea';
import { ContactFormData } from '@/components/modals/EditContact';
import { PermissionGuard } from '@/components/PermissionGuard';
import { useProfile } from "@/hooks/useProfile";
import { ContactNote } from '@/hooks/useContactNotes';

interface ContactEditFormProps {
  formData: ContactFormData;
  // setFormData: React.Dispatch<React.SetStateAction<ContactFormData>>;
  selectedDays: Set<number>;
  onDayToggle: (day: number) => void;
  openMap: Record<string, Record<number, DivisionOpen>>; 
  maxDaysSelectable: number;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onRegionChange: (v: string) => void;
  onDivisionChange: (v: string) => void;
  onStatusChange: (v: string) => void;
  handleSubmit: (e: React.ChangeEvent) => void; 
  isLoading: boolean;
  isLoadingRegions: boolean;
  isLoadingDivisions: boolean;
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
  notes: ContactNote[];
  handleDelete: () => void;
  setConfirmDelete: React.Dispatch<React.SetStateAction<boolean>>;
  setIgnoreCloseWarning: React.Dispatch<React.SetStateAction<boolean>>;
  handleClose: () => void;
}

const ContactEditForm: React.FC<ContactEditFormProps> = ({
  formData,
  // setFormData,
  selectedDays,
  onDayToggle,
  openMap,
  maxDaysSelectable,
  onInputChange,
  onRegionChange,
  onDivisionChange,
  onStatusChange,
  handleSubmit,
  isLoading,
  isLoadingRegions,
  isLoadingDivisions,
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
  notes,
  handleDelete,
  setConfirmDelete,
  setIgnoreCloseWarning,
  handleClose,
}) => {
  const { profile } = useProfile();

  // const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

  const isManager = ['manager', 'branch_manager'].includes(profile?.role ?? '');
  const isReferrer = profile?.role === 'referrer';
  const isStaff = profile?.role === 'staff';
  const isVolunteer = profile?.role === 'volunteer';

  const referralCondition = useMemo(() => {
    const toPending = formData.status === 'pending' && contact.status === 'inactive';
    const toActive = formData.status === 'active' && contact.status === 'inactive'
    return toPending || toActive;
  },[contact, formData])
    
  const openDayArray = useMemo(() => {
    const managerId = formData.owner_id || contact?.owner_id;
    const division = divsRegion.find(d => String(d.manager_id) === String(managerId));
    return openMap[division?.id ?? ''] ?? {};   // safe fallback
  }, [openMap, divsRegion, formData.owner_id, contact?.owner_id]);

  const daySelectCondition = useMemo(() => {
    if (!contact || !divsRegion) return false; 
    const assignedDivision = divsRegion.some(d => d.manager_id === formData.owner_id);
    const isMultiDay = Object.values(openDayArray).filter(day => day.is_open).length >1;
    return assignedDivision && isMultiDay;  
  }, [divsRegion, openDayArray, formData.owner_id]); 

  const days = useMemo(() => {
    return ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map((label, i) => {
      const isOpenDay = openDayArray?.[i]?.is_open ?? false;
      const isSelected = selectedDays.has(i);
      const disabled = !isOpenDay || (isSelected ? false : selectedDays.size >= maxDaysSelectable);
      return { label, isOpenDay, isSelected, disabled };
    });
  }, [openDayArray, selectedDays, maxDaysSelectable]);

  // const isSelected =  selectedDays.has(i);
  // const handleSyncDays = useCallback(async() => {
  // await deleteContactDaysSingle(selectedDays.filter(d => (d.day_of_week == openMap.day_of_week) && ).id);
  // },[])

  const divsRegionValueCondition = useMemo(() => {
      if (!contact || !divsRegion || !formData.status) return false; 
      const assignedDivision = divsRegion.some(d => d.manager_id === formData.owner_id);
      return formData.status == 'active' && !assignedDivision;  
  }, [contact, divsRegion, formData.status, formData.owner_id]); 


  const conditionsChecked = (condition1 && condition2 && condition3)
  const approveEnabled = conditionsChecked || (formData.status === 'active' && contact.status === 'pending');
  // const approveEnabled = useMemo(() => {
  //   if(!condition1 || !condition2 || !condition3) return false;
  //   return true;
  // },[condition1, condition2, condition3])

  const handleConfirmDelete = useCallback(() => {setConfirmDelete(false)}, []);

  const handleIgnoreCloseWarning = useCallback(() => { setIgnoreCloseWarning(true); handleClose(); }, []);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Name *</Label>
          <Input id="name" 
            name="name" 
            disabled={isReferrer || isStaff || isVolunteer}
            value={formData.name} onChange={onInputChange} placeholder="Full name" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" 
            name="email" 
            type="email" 
            disabled={ isStaff || isVolunteer}
            value={formData.email} onChange={onInputChange} placeholder="Email address" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2 w-[50%] sm:w-full">
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" name="phone" value={formData.phone} onChange={onInputChange} placeholder="Phone number" />
        </div>
        <div> </div>
        <div className="space-y-2">
          <Label htmlFor="street">Street Address</Label>
          <Input
            id="street_address"
            name="street_address"
            value={formData.street_address}
            onChange={onInputChange}
            placeholder="Street Address"
          />
        </div>   
        <div className="space-y-2 w-[50%] sm:w-full">
          <Label htmlFor="post">Post Code</Label>
          <Input
            id="postcode"
            name="postcode"
            // required={true}
            value={formData.postcode}
            onChange={onInputChange}
            placeholder="Post code"
          />
        </div>                 
        <div className="space-y-2 w-[50%] sm:w-full">
            <Label htmlFor="region">Region*</Label>
            <Input
              required
              value={formData.region_id || contact.region_id}
              aria-hidden="true"
              readOnly
              className="sr-only w-[0%]"
            />
            <Select
              disabled={isLoadingRegions || regions.length === 0 || isManager || isReferrer || isStaff || isVolunteer}
              value={formData.region_id || "none"}
              onValueChange={onRegionChange}
            >
              <SelectTrigger >
                <SelectValue placeholder="Select Region"/>
              </SelectTrigger>
              <SelectContent>
                  {regions.filter(r => r.is_active).map(r => (
                    <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2 w-[50%] sm:w-full">
            <Label htmlFor="branch">{formData.status === 'active' && !isLoadingDivisions ? "Branch*" : "Branch"}</Label>
            <Input
              required={formData.status === 'active' && contact.status !== 'active'}
              value={formData.owner_id}
              aria-hidden="true"
              readOnly
              className="sr-only w-[0%]"
            />
            <Select
              required={formData.status === 'active'}
              disabled={isLoadingDivisions || divsRegion.length === 0 || isVolunteer}
              value={divsRegionValueCondition && contact.status !== 'active' ? '' : formData.owner_id}
              onValueChange={onDivisionChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Branch" />
              </SelectTrigger>
              <SelectContent>
                  {divsRegion.map(div => (
                    <SelectItem key={div.manager_id} value={div.manager_id}>
                      {div.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2 space-x-2 w-full">
            <div>
              <label htmlFor="status" className="text-sm">Change status:</label>
              <Select
                value={formData.status}
                onValueChange={onStatusChange}
                disabled={isVolunteer}
              >
                <SelectTrigger className="sm:w-full">
                  <SelectValue placeholder="Select Status"/>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  {contact.status === 'active' ?
                    <SelectItem value="active">Active</SelectItem> : 
                    <SelectItem value="active" disabled={isReferrer}>Approve</SelectItem>
                  }
                </SelectContent>
              </Select>
            </div>
            {approveEnabled && (
            <div>
            <label htmlFor="delay" className="text-sm ">Delay start (days):</label>
            <Input id="delayed-days" name="delayed_days" type='number' min={0} max={30} step={1} 
              value={formData.delayed_days} onChange={onInputChange} placeholder={String(formData.delayed_days)} />
            </div>
            )}
          </div>
          {approveEnabled && daySelectCondition && (
          <div className="grid grid-cols-7 gap-2 mt-0 border-b">
            {days.map(({ label, isSelected, disabled }, i) => (
                <div key={i} className="">
                  <label className="text-xs">{label}</label>
                  <input
                    type="checkbox"
                    // hidden={disabled}
                    disabled={disabled}
                    checked={isSelected}// && isOpenDay}
                    onChange={() => onDayToggle(i)}
                    className="size-4 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>
            ))}
          </div>
          )}
      </div>
      
      <div>
        {referralCondition && (         
          <PermissionGuard permission="canAssignBeneficiaries">
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
          </PermissionGuard>
        )}           
      </div>
      {/* <PermissionGuard permission="canAssignBeneficiaries">
        
    
      </PermissionGuard> */}
      <Label htmlFor="hh_composition">Household Composition</Label>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2 w-[30%] sm:w-full">
          <Label htmlFor="adults">Adults (≥18)</Label>
          <Input id="adults" name="adults" type='number' min={1} step={1} 
          value={formData.adults} onChange={onInputChange} placeholder={String(formData.adults)} />
        </div>
        <div className="space-y-2 w-[30%] sm:w-full">
          <Label htmlFor="children_gt16">Children (≥16)</Label>
          <Input id="gt16" name="children_gt16" type='number' min={0} step={1} 
          value={formData.children_gt16} onChange={onInputChange} placeholder="0" />
        </div>
        <div className="space-y-2 w-[30%] sm:w-full">
          <Label htmlFor="children_lt16">Children ({'<16'})</Label>
          <Input id="lt16" name="children_lt16" type='number' min={0} step={1} 
          value={formData.children_lt16} onChange={onInputChange} placeholder="0" />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">New Note</Label>
        <Textarea id="notes_new" name="notes_new" value={formData.notes_new || ""} onChange={onInputChange} placeholder="Additional notes..." rows={3} />
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
            <Button variant="ghost" size="sm" onClick={handleConfirmDelete} className="size-10" type="button">
              <X className="size-3.5" />
            </Button>
          )}
        </div>

        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={handleIgnoreCloseWarning} disabled={isLoading}>
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