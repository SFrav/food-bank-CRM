import React, { useState, useMemo, useCallback, useEffect } from 'react';
// import { User, Phone, Mail } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
// import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
// import { useAuth } from '@/hooks/useAuth';
import { useContacts, Contact, ContactDuplicate } from '@/hooks/useContacts';
import { useContactDays } from '@/hooks/useContactDays';
import { useProfile } from "@/hooks/useProfile";
import { useRegions, Region } from '@/hooks/useRegions';
import { useDivisions, Division } from '@/hooks/useDivisions';
import { useDivisionSettings } from '@/hooks/useDivisionSettings';
import { useDivisionOpen } from '@/hooks/useDivisionOpen';
import { PermissionGuard } from '@/components/PermissionGuard';
import { DuplicateContactCard } from '@/components/modals/subcomponents/AddContactDuplicate';


interface AddContactModalProps {
  isOpen: boolean;
  nameInit: string;
  onClose: () => void;
  onDuplicateFound: (c: Contact) => void;
  onContactAdded: () => void;
}

export const AddContactModal: React.FC<AddContactModalProps> = ({
  isOpen,
  nameInit,
  onClose,
  onDuplicateFound,
  onContactAdded,
}) => {
  // const { user } = useAuth();
  const { profile } = useProfile();
  const { regions } = useRegions();
  const { divisions } = useDivisions();
  const { openMap, fetchOpen: fetchDivisionOpenDays } = useDivisionOpen();
  const [divsRegion, setDivsRegion] = useState<Division[]>([]);
  const { settingsMap, fetchSettings} = useDivisionSettings();
  const { createContact, updateContact, checkDuplicates, isExactMatch } = useContacts();
  const { createContactDays } = useContactDays();
  const [checkingDup, setCheckingDup] = useState(false);
  const [duplicateCandidates, setDuplicateCandidates] = useState<ContactDuplicate[] | null>(null);
  const [dupExact, setDupExact] = useState(false);
  // const lastFormDataKey = useRef<string | null>(null);
  // const lastDuplicates = useRef<Contact[] | null>(null);
  // const lastExactMatch = useRef<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<{
    name: string;
    email: string;
    phone: string;
    street_address: string;
    postcode: string;
    region_id: string,
    adults: number;
    children_gt16: number;
    children_lt16: number;
    status: "pending" | "active" | "inactive" | "banned" | "merged";
    delayed_days: number;
    owner_id: string;
    notes: string;
  }>({
    name: '',
    email: '',
    phone: '',
    postcode: '',
    street_address: '',
    region_id: '',
    adults: 1, 
    children_gt16: 0, 
    children_lt16: 0,
    status: 'inactive',
    delayed_days: 7,
    owner_id: '',
    notes: '',
  });

  const [selectedDays, setSelectedDays] = useState<Set<number>>(new Set());

  const [condition1, setCondition1] = useState(false);
  const [condition2, setCondition2] = useState(false);
  const [condition3, setCondition3] = useState(false);
  const approveEnabled = condition1 && condition2 && condition3;
  const referralCondition = formData.status === 'pending' || formData.status === 'active';
  
  const canApprove = ['head', 'manager', 'branch_manager'].includes(profile?.role ?? '');
  const isVolunteer = profile?.role === 'volunteer';

  const activeRegions = regions.filter(r => r.is_active === true)

  useEffect(() => {
    if (!profile || !isOpen) return;
    const divs = divisions.filter((d) => d.region_id === formData.region_id);
    setDivsRegion(divs);
    if (!isOpen || nameInit ==='' || formData.name !== '') return;
    setFormData(prev => ({ ...prev, name: nameInit }));
  }, [profile, isOpen, formData.region_id, formData.name, nameInit, divisions]);

  useEffect(() => {
    if (!isOpen) {
      setDuplicateCandidates(null);
      setDupExact(false);
    }
  }, [isOpen]);

  const divId = useMemo(() => {
     return divsRegion.find(d => d.manager_id === formData.owner_id)?.id;
   }, [divsRegion, formData.owner_id]);

  const openDayArray = useMemo(() => {
    return openMap[divId ?? ''] ?? {};
  }, [divId, openMap]);

  const maxDaysSelectable = useMemo(() => {
    if (!divId) return 1;
    const divSettings = settingsMap[divId] ?? {};
    return parseInt(divSettings.frequency ?? '1', 10);
  }, [divId, settingsMap]);

  const handleDayToggle = useCallback((day: number) => {
    setSelectedDays(prev => {
      const newSet = new Set(prev);
      if (newSet.has(day)) newSet.delete(day);
      else newSet.add(day);
      if (newSet.size > maxDaysSelectable) return prev;
      return newSet;
    });
  }, [maxDaysSelectable]);

  const days = useMemo(() => {
    return ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map((label, i) => {
      const isOpenDay = openDayArray?.[i]?.is_open ?? false;
      const isSelected = selectedDays.has(i);
      const disabled = !isOpenDay || (isSelected ? false : selectedDays.size >= maxDaysSelectable);
      return { label, isOpenDay, isSelected, disabled };
    });
  }, [openDayArray, selectedDays, maxDaysSelectable]);
  
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setDuplicateCandidates(null);
    setDupExact(false);
  }, []);

  const handleRegionChange = useCallback((v: string) => setFormData(prev => (
    {...prev, region_id: v})
  ), []);
  
  
  const handleDivisionChange = useCallback((v: string) => {setFormData(prev => (
    {...prev, owner_id: v}))
    const divId = divsRegion.find(d => d.manager_id === v)?.id
    fetchDivisionOpenDays(divId);
    fetchSettings(divId);
    setSelectedDays(new Set());
  }, [divsRegion]);

  const handleStatusChange = useCallback((v: Contact["status"]) => setFormData(prev => (
    {...prev, status: v})
  ), []);

  const resetForm = () => {
    setDuplicateCandidates(null);
    setDupExact(false);
    setSelectedDays(new Set());
    setFormData({
      name: '',
      email: '',
      phone: '',
      street_address: '',
      postcode: '',
      region_id: '',
      adults: 1,
      children_gt16: 0,
      children_lt16: 0,
      status: 'inactive',
      delayed_days: 7,
      owner_id: '',
      notes: '',
    }); 
  };

  const runDuplicateCheck = useCallback(async () => {
    if (!profile) return false;
    setCheckingDup(true);
    try {
      const duplicates = await checkDuplicates({
        email: formData.email?.trim() || null,
        phone: formData.phone?.trim() || null,
        name: formData.name?.trim() || null,
        street_address: formData.street_address?.trim() || null,
        postcode: formData.postcode?.trim() || null,
      });

      setDuplicateCandidates(duplicates);

      if (duplicates.length === 0) return false;
      if (duplicates.length === 1) {
        const dup = duplicates[0];
        const matchesTriad = dup.name === formData.name && dup.street_address === formData.street_address && dup.postcode === formData.postcode;
        const matchesEmail = dup.email === formData.email;
        const matchesPhone = dup.phone === formData.phone;
        if ((matchesTriad || matchesEmail || matchesPhone) && isExactMatch) setDupExact(true);
      }
      return duplicates.length > 0;
    } catch (err: unknown) {
      console.error('Duplicate check error', err);
      return true;
    } finally {
      setCheckingDup(false);
    }
  }, [profile, formData, checkDuplicates, isExactMatch]);


  const createNewAnyway = useCallback(async () => {
    setIsLoading(true);
    try {
      const { success, data: newContactId, error } = await createContact({
        name: formData.name,
        email: formData.email.trim() || null,
        phone: formData.phone.trim() || null,
        street_address: formData.street_address.trim() || null,
        postcode: formData.postcode.trim() || null,
        region_id: formData.region_id || null,
        adults: formData.adults || null,
        children_gt16: formData.children_gt16 || null,
        children_lt16: formData.children_lt16 || null,
        notes: formData.notes.trim() || null,
        status: formData.status === 'active' ? 'inactive' : formData.status,
        delayed_days: formData.delayed_days || 7,
        user_id: profile?.user_id,
        owner_id: formData.owner_id || profile?.user_id,
      }, selectedDays ? Array.from(selectedDays) : null);

      if (!success) throw new Error(error);

      // if (newContactId && selectedDays.size > 0) {
      //   const daysToCreate = Array.from(selectedDays).map(d => ({ day_of_week: d, is_available: true }));
      //   await createContactDays(newContactId, daysToCreate);
      // }

      // if ( newContactId && formData.status === 'active') {
      //   await updateContact({
      //   id: newContactId,
      //   name: null,
      //   email: null,
      //   phone: null,
      //   street_address: null,
      //   postcode: null,
      //   region_id: null,
      //   adults: null,
      //   children_gt16: null,
      //   children_lt16: null,
      //   status: formData.status,
      //   delayed_days: formData.delayed_days || 7,
      //   user_id: null,
      //   owner_id: null,
      //   notes: null 
      // })
      // };

      onContactAdded();
      setCondition1(false);
      setCondition2(false);
      setCondition3(false);
      onClose();
      resetForm();
    } catch (err: unknown) {
      console.error('Create new contact error', err);
    } finally {
      setIsLoading(false);
    }
  }, [formData, selectedDays]);

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    if (!profile) {
      return;
    }

    if (duplicateCandidates) {
      return createNewAnyway();
    }
    const duplicateFound = await runDuplicateCheck();
    if (duplicateFound) return; 
    setIsLoading(true);
    setDuplicateCandidates(null);
    setDupExact(false);

    try {
      const { success, data: newContactId, error } = await createContact({
        name: formData.name,
        email: formData.email.trim() || null,
        phone: formData.phone.trim() || null,
        street_address: formData.street_address.trim() || null,
        postcode: formData.postcode.trim() || null,
        region_id: formData.region_id || null,
        adults: formData.adults || null,
        children_gt16: formData.children_gt16 || null,
        children_lt16: formData.children_lt16 || null,
        notes: formData.notes.trim() || null,
        status: formData.status ?? 'inactive',
        delayed_days: formData.delayed_days || 7,
        user_id: profile?.user_id,
        owner_id: formData.owner_id || profile?.user_id,
      }, selectedDays ? Array.from(selectedDays) : null);

      if (!success) {
        throw new Error(error);
      }
    
      // if (newContactId && selectedDays.size > 0) {
      //   const daysToCreate = Array.from(selectedDays).map(d => ({ day_of_week: d, is_available: true }));
      //   await createContactDays(newContactId, daysToCreate);
      // }

      // if ( newContactId && formData.status === 'active') {
      //   await updateContact({
      //   id: newContactId,
      //   name: null,
      //   email: null,
      //   phone: null,
      //   street_address: null,
      //   postcode: null,
      //   region_id: null,
      //   adults: null,
      //   children_gt16: null,
      //   children_lt16: null,
      //   status: formData.status,
      //   delayed_days: formData.delayed_days || 7,
      //   user_id: null,
      //   owner_id: null,
      //   notes: null 
      // })
      // };
      
      onContactAdded();
      setCondition1(false);
      setCondition2(false);
      setCondition3(false);
      onClose();
      resetForm();
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDuplicateCandidates = useCallback(() => {setDuplicateCandidates(null)}, [])
  
  const handleClose = () => {
    // setFormData({
    //   name: '',
    //   email: '',
    //   phone: '',
    //   street_address: '',
    //   postcode: '',
    //   region_id: '',
    //   adults: 1, 
    //   children_gt16: 0, 
    //   children_lt16: 0,
    //   status: 'pending',
    //   owner_id: '',
    //   notes: '',
    // });
    setCondition1(false);
    setCondition2(false);
    setCondition3(false);
    onClose();
    resetForm();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[525px]  max-h-[90dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Beneficiary</DialogTitle>
          {/* <DialogDescription>
            Add a new beneficiary. Fill in the details below.
          </DialogDescription> */}
        </DialogHeader>
        {duplicateCandidates && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {dupExact ? "The following contact already contains information that must be unique."  : 
              "Existing contacts match some of the information you entered. Choose one to edit, or create a new contact."}
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {duplicateCandidates.map((c) => (
                <DuplicateContactCard
                  contact={c}
                  onSelect={() => { onDuplicateFound(c); handleClose(); }}
                />  
              ))}
            </div>
            <div>
            <p className="text-xs text-muted-foreground">
                The following fields must be unique: email, phone and the triad name-address-postcode.  
            </p>
            </div>
            <div className="flex justify-between">
              <Button variant="outline" onClick={handleDuplicateCandidates}>
                Back to form
              </Button>
              <Button onClick={createNewAnyway} disabled={dupExact}> 
                
                Create New Anyway
                </Button>
            </div>
          </div>
        )}
        {!duplicateCandidates && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Full name"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Email address"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="Phone number"
              />
            </div>
            <div></div>
            <div className="space-y-2">
              <Label htmlFor="past">Street Address</Label>
              <Input
                id="street_address"
                name="street_address"
                value={formData.street_address}
                onChange={handleInputChange}
                placeholder="Street Address"
              />
            </div>        
            <div className="space-y-2">
              <Label htmlFor="past">Post Code*</Label>
              <Input
                id="postcode"
                name="postcode"
                // required
                value={formData.postcode}
                onChange={handleInputChange}
                placeholder="Post code"
              />
            </div>            
          
            <div>
              <Label htmlFor="region">Region*</Label>
              <Input
                required
                value={formData.region_id}
                aria-hidden="true"
                className="sr-only"
                readOnly
              />
              <Select
                value={formData.region_id || ""}
                onValueChange={handleRegionChange}
              >
                <SelectTrigger id="region">
                  <SelectValue placeholder="Select Region" />
                </SelectTrigger>
                <SelectContent>
                  {activeRegions.map((re) => (
                    <SelectItem key={re.id} value={re.id}>
                      {re.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          
          <PermissionGuard permission="canAssignBeneficiaries"> 
            <div>
              <Label htmlFor="branch">Branch</Label>
              <Select
                value={formData.owner_id || ""}
                onValueChange={handleDivisionChange}
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
          </PermissionGuard>
          <div className="flex gap-2 space-x-2 w-full sm:w-full md:w-full">
            <div>
            <label htmlFor="status" className="text-sm">Change status:</label>
            <Select
              value={formData.status}
              onValueChange={handleStatusChange}
              disabled={isVolunteer}
            >
              <SelectTrigger className="sm:w-full">
                <SelectValue placeholder="Select Status"/>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="active" disabled={!canApprove}>Approve</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {approveEnabled && (
            <div>
            <label htmlFor="delay" className="text-sm">Delay start (days):</label>
            <Input id="delayed-days" name="delayed_days" type='number' min={0} max={30} step={1} 
              value={formData.delayed_days} onChange={handleInputChange} placeholder={String(formData.delayed_days)} />
            </div>
            )}
        </div>
        {formData.owner_id && approveEnabled && (
          <div className="grid grid-cols-7 gap-2 mt-1 border-b">
            {days.map(({ label, isSelected, disabled }, i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <label className="text-xs">{label}</label>
                <input
                  type="checkbox"
                  disabled={disabled}
                  checked={isSelected}
                  onChange={() => handleDayToggle(i)}
                  className="size-4 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
            ))}
          </div>
        )}     
      </div>
      <div className="flex gap-2 space-x-2 w-full sm:w-full md:w-full">
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
        <Label htmlFor="adults">Household Composition</Label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="adults">Adults</Label>
            <Input id="adults" name="adults" type='number' min={1} step={1} 
            value={formData.adults} onChange={handleInputChange} placeholder={String(formData.adults)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="children_gt16">Children (≥16)</Label>
            <Input id="gt16" name="children_gt16" type='number' min={0} step={1} 
            value={formData.children_gt16} onChange={handleInputChange} placeholder="0" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="children_lt16">Children ({'<16'})</Label>
            <Input id="lt16" name="children_lt16" type='number' min={0} step={1} 
            value={formData.children_lt16} onChange={handleInputChange} placeholder="0" />
          </div>
        </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              placeholder="Additional notes..."
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4"> {/*flex justify-between items-center pt-4 */}
            {/* <div className="flex items-center space-x-2">
              <Label htmlFor="past">Approve:</Label>
                <Switch
                  id="status"
                  checked={formData.status === 'active'}
                  onCheckedChange={(checked) => {
                    const newStatus = checked ? 'active' : 'pending';
                    setFormData((prev) => ({ ...prev, status: newStatus }));
                  }}
                />
            </div>
            <div className="flex items-center space-x-2"> */}
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading || checkingDup || !approveEnabled}>
                {isLoading || checkingDup ? "Checking..." : "Save"}
              </Button>
            {/* </div> */}
          </div>
        </form>
        )}
      </DialogContent>
    </Dialog>
  );
};