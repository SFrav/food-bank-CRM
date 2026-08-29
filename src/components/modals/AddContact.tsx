import React, { useState, useRef, useCallback, useEffect } from 'react';
import { User, Phone, Mail } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/useAuth';
import { useContacts, Contact, ContactDuplicate } from '@/hooks/useContacts';
import { useProfile } from "@/hooks/useProfile";
import { useRegions, Region } from '@/hooks/useRegions';
import { useDivisions, Division } from '@/hooks/useDivisions';
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
  const { user } = useAuth();
  const { profile } = useProfile();
  const { regions } = useRegions();
  const { divisions } = useDivisions();
  const [divsRegion, setDivsRegion] = useState<Division[]>([]);
  const { createContact, checkDuplicates, isExactMatch } = useContacts();
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
    status: 'pending',
    owner_id: '',
    notes: '',
  });

  // if (!user || !profile) return null;

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

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setDuplicateCandidates(null);
    setDupExact(false);
  }, []);

  const handleRegionChange = useCallback((v: string) => setFormData(prev => (
    {...prev, region_id: v})
  ), []);
  
  
  const handleDivisionChange = useCallback((v: string) => setFormData(prev => (
    {...prev, owner_id: v})
  ), [divsRegion]);

  const resetForm = () => {
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
      status: 'pending',
      owner_id: '',
      notes: '',
    });
    setDuplicateCandidates(null);
    setDupExact(false);
  };

  const runDuplicateCheck = useCallback(async () => {
    if (!user) return false;
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
  }, [user, formData, checkDuplicates, isExactMatch]);


  const createNewAnyway = async () => {
    setIsLoading(true);
    try {
      const { success, error } = await createContact({
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
        status: formData.status,
        user_id: user.id,
        owner_id: formData.owner_id || null,
      });

      if (!success) throw new Error(error);

      onContactAdded();
      onClose();
      resetForm();
    } catch (err: unknown) {
      console.error('Create new contact error', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    if (!user) {
      return;
    }
    if (duplicateCandidates) {
      return createNewAnyway();
    }
    const duplicateFound = await runDuplicateCheck();
    if (duplicateFound) return; 
    setIsLoading(true);

    try {
      const { success, error } = await createContact({
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
        status: formData.status || 'pending',
        user_id: user.id,
        owner_id: formData.owner_id || null,
      });

      if (!success) {
        throw new Error(error);
      }

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

      onContactAdded();
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
    onClose();
    resetForm();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[525px]">
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
                The following fileds must be unique: email, phone and the triad name-address-postcode.  
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
              <Label htmlFor="past">Post Code</Label>
              <Input
                id="postcode"
                name="postcode"
                value={formData.postcode}
                onChange={handleInputChange}
                placeholder="Post code"
              />
            </div>            
          
          <div>
            <Label htmlFor="region">Region*</Label>
            <Select
              required={true}
              value={formData.region_id || "none"}
              onValueChange={handleRegionChange}
            >
              <SelectTrigger >
                <SelectValue placeholder="Select Region"/>
              </SelectTrigger>
              <SelectContent>
                {regions.filter((r) => r.is_active === true).map(re => (
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
              value={formData.owner_id || "none"}
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
              <Button type="submit" disabled={isLoading || checkingDup}>
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