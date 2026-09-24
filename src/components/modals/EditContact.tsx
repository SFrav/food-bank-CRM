import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Minus, Maximize2, Minimize } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useContacts, Contact } from '@/hooks/useContacts';
import { useContactNotes } from '@/hooks/useContactNotes';
import { useContactDays } from '@/hooks/useContactDays';
import { useContactAllotment } from '@/hooks/useContactAllotment';
import { useToast } from '@/hooks/useToast';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from "@/hooks/useProfile";
import { useRegions, Region } from '@/hooks/useRegions';
import { useDivisions, Division } from '@/hooks/useDivisions';
import { useDivisionOpen, DivisionOpen } from '@/hooks/useDivisionOpen';
import { useDivisionSettings } from '@/hooks/useDivisionSettings';
import ContactEditAllotment from '@/components/modals/subcomponents/EditContactAllotment';
import ContactEditForm from '@/components/modals/subcomponents/EditContactForm';
import { cn } from '@/lib/utils';

interface EditContactModalProps {
  isOpen: boolean;
  
  isServing: boolean;
  onClose: () => void;
  onContactUpdated: () => void;
  onMinimise: (contact: Contact, isDirty: boolean, formData: FormData, conditions: { c1: boolean; c2: boolean; c3: boolean }) => void;
  contact: Contact | null;
  restoredFormData?: FormData | null;
  restoredConditions?: { c1: boolean; c2: boolean; c3: boolean } | null;
  initialConditions: { c1: boolean; c2: boolean; c3: boolean } | null;
  maxMinimised: number;
  currentMinimisedCount: number;
}

export interface FormData {
  name: string;
  email: string;
  phone: string;
  street_address: string;
  postcode: string;
  region_id: string;
  adults: number;
  children_gt16: number;
  children_lt16: number;
  status: "pending" | "active" | "inactive" | "banned" | "merged";
  delayed_days: number;
  owner_id: string;
  notes_new: string;
}

export type { FormData as ContactFormData };

const emptyForm: FormData = { name: '', email: '', phone: '', street_address: '', postcode: '', region_id: '', adults: 1, children_gt16: 0, children_lt16: 0, status: 'inactive', delayed_days: 7, owner_id: '', notes_new: '' };


const formFromContact = (c: Contact): FormData => ({
  name: c.name || '',
  email: c.email || '',
  phone: c.phone || '',
  street_address: c.street_address || '',
  postcode: c.postcode || '',
  region_id: c.region_id || '',
  adults: c.adults || 1,
  children_gt16: c.children_gt16 || 0,
  children_lt16: c.children_lt16 || 0,
  status: c.status || 'inactive',
  delayed_days: c.delayed_days || 7,
  owner_id: c.owner_id || '',
  notes_new: '',
});

export const EditContactModal: React.FC<EditContactModalProps> = ({
  isOpen,
  isServing,
  onClose,
  onContactUpdated,
  onMinimise,
  contact,
  restoredFormData,
  initialConditions,
  restoredConditions,
  maxMinimised,
  currentMinimisedCount,
}) => {
  if (!contact) return null;
  const { toast } = useToast();
  const { user } = useAuth();
  const { profile } = useProfile();
  const { regions, loading: loadingRegions } = useRegions();
  const { divisions, loading: loadingDivisions } = useDivisions();
  const { openMap, fetchOpen: fetchDivisionOpenDays } = useDivisionOpen();
  const { settingsMap, fetchSettings} = useDivisionSettings();
  // const [divsRegion, setDivsRegion] = useState<Division[]>([]);
  const { deleteContact, updateContact, refetch: fetchContacts } = useContacts();
  const { notes, fetch: fetchNotes } = useContactNotes(contact?.id ?? null);
  const { contactDays, upsertContactDays, fetchContactDays, deleteContactDays} = useContactDays();
  const { allotment, markAttendance, markAllotmentServing, markServed, insertDiscretionary, 
    loading: loadingAllotment, fetch: fetchAllotment, error: errorAllotment} = useContactAllotment(contact?.id ?? null);
  const [newAllotmentType, setNewAllotmentType] = useState<'referral' | 'drop_in' | ''>('');
  const [newAllotmentNote, setNewAllotmentNote] = useState('');
  // const [adding, setAdding] = useState(false);
  const [localContact, setLocalContact] = useState<Contact | null>(contact);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>(() => 
    contact && isOpen ? (restoredFormData ?? formFromContact(contact)) : emptyForm
  );
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  // const [showMinimiseWarning, setShowMinimiseWarning] = useState(false);
  const [showMaxTabsWarning, setShowMaxTabsWarning] = useState(false);
  const [showUnsavedCloseWarning, setShowUnsavedCloseWarning] = useState(false);
  const [ignoreCloseWarning, setIgnoreCloseWarning] = useState(false);
  const [condition1, setCondition1] = useState(initialConditions?.c1 ?? false);
  const [condition2, setCondition2] = useState(initialConditions?.c2 ?? false);
  const [condition3, setCondition3] = useState(initialConditions?.c3 ?? false);
  // const [showAllotment, setShowAllotment] = useState(isServing);
  const [servingOngoing, setServingOngoing] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [selectedDays, setSelectedDays] = useState<Set<number>>(new Set());
  // const [openDays, setOpenDays] = useState<Record<number, boolean>>({});

  const isDirty = useMemo(() => {
    if (!contact) return false;
    return (
      formData.name !== (contact.name ?? '') ||
      formData.email !== (contact.email ?? '') ||
      formData.phone !== (contact.phone ?? '') ||
      formData.street_address !== (contact.street_address ?? '') ||
      formData.postcode !== (contact.postcode ?? '') ||
      formData.region_id !== (contact.region_id ?? '') ||
      formData.adults !== (contact.adults ?? 1) ||
      formData.children_gt16 !== (contact.children_gt16 ?? 0) ||
      formData.children_lt16 !== (contact.children_lt16 ?? 0) ||
      formData.status !== (contact.status ?? 'pending') ||
      formData.delayed_days !== (contact.delayed_days ?? 7) ||
      (formData.owner_id !== (contact.owner_id ?? '') && formData.owner_id !== '') ||
      formData.notes_new !== '' || 
      servingOngoing
    );
  }, [contact, formData, servingOngoing]); 

  // if (!user || !profile) return null;

  const activeRegions = regions.filter(r => r.is_active === true)

  const divsRegion = useMemo(() => divisions.filter(d => d.region_id === formData.region_id), [divisions, formData.region_id]);

  const divId = useMemo(() => {
    const managerId = formData.owner_id || contact?.owner_id;
    return divsRegion.find(d => d.manager_id === managerId)?.id
  }, [divsRegion, contact.owner_id, formData.owner_id])

  useEffect(() => {
    if (!contact || !isOpen) return;
    setFormData(restoredFormData ?? formFromContact(contact));
    if (restoredConditions) {
      setCondition1(restoredConditions.c1);
      setCondition2(restoredConditions.c2);
      setCondition3(restoredConditions.c3);
    } else {
      setCondition1(initialConditions?.c1 ?? false);
      setCondition2(initialConditions?.c2 ?? false);
      setCondition3(initialConditions?.c3 ?? false);
    }
  }, [restoredFormData, restoredConditions, initialConditions, contact, isOpen]);

  useEffect(() => {
    if (!contact || !isOpen) return;
    setSelectedDays(new Set(contactDays.filter((d: any) => d.is_available).map((d: any) => d.day_of_week)));
  }, [contactDays]);

  useEffect(() => {
    if (!contact || !isOpen) return;
    setConfirmDelete(false);
    setLocalContact(contact);
    fetchContactDays(contact.id);
    setSelectedDays(new Set(contactDays.filter((d: any) => d.is_available).map((d: any) => d.day_of_week)));
  }, [contact?.id, isOpen]);

  useEffect(() => {
    if (!contact || !divId) return;
    fetchDivisionOpenDays(divId);
    fetchSettings(divId);
  }, [divId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRegionChange = useCallback((v: string) => setFormData(prev => (
    {...prev, region_id: v})
  ), [setFormData]);

  const handleDivisionChange = useCallback(async(v: string) => { setFormData(prev => (
    {...prev, owner_id: v}));
    setSelectedDays(new Set());
    await deleteContactDays(contact.id);
  }
, [setFormData, setSelectedDays, deleteContactDays, contact?.id]);

  const handleStatusChange = useCallback((v: Contact["status"]) => setFormData(prev => (
    {...prev, status: v})
  ), [setFormData]);

  const handleMinimiseClick = () => {
    if (currentMinimisedCount >= maxMinimised) {
      setShowMaxTabsWarning(true);
      return;
    }
    doMinimise();
    //setShowAllotment(false);
  };

  const doMinimise = () => {
    if (!contact) return;
    onMinimise(contact, isDirty, formData, {c1: condition1, c2: condition2, c3: condition3});
  };

  const handleDelete = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    if (!contact) return;
    setDeleting(true);
    const { success, error } = await deleteContact(contact.id);
    setDeleting(false);
    if (!success) return;
    onClose();
    onContactUpdated();
  };

  const maxDaysSelectable = useMemo(() => { 
    if (!divId) return   
    const divSettings = settingsMap[divId || ''] ?? {}; 
    if (!divSettings) return
    return parseInt(divSettings.frequency ?? '1', 10)
      // return divSettings;
    }, [divId, settingsMap, formData.owner_id]);

  const handleDayToggle = useCallback(async(day: number) => {
    if (!contact) return;
    //?contactDays - sync with this toggle
    const newSet = new Set(selectedDays);
    if (newSet.has(day)) newSet.delete(day);
    else newSet.add(day);
    if (newSet.size > maxDaysSelectable) return;
    setSelectedDays(newSet);
    await upsertContactDays(contact.id, day, newSet.has(day));
  }, [contact, selectedDays, maxDaysSelectable]);

  const handleMarkAttended = async (entryId: string) => {
    if (!entryId) return;
    const { success } = await markAttendance(entryId);
    // if(success) await fetchAllotment();
  };

  const handleMarkServing = async (entryId: string) => {
    if (!contact) return;
      const { success, error } = await markAllotmentServing(entryId);
      if(!success) {
        setServingOngoing(false);
        // await fetchAllotment();
        return;
      }
      setServingOngoing(true);
      // await fetchAllotment();
      
  };

  const handleMarkServed = async (entryId: string) => {
    if (!entryId) return;
    const { success, error } = await markServed(entryId);
    if(!success) {
      // await fetchAllotment();
      return;
    }
    onContactUpdated();
    setServingOngoing(false);
    // await fetchAllotment();
  };

  const handleAddAllotment = async (type: "referral" | "drop_in" | "") => {
    setNewAllotmentType(type);

    if (type === '' || !user?.id) return;

    const note = type === 'referral' ? 'Rescheduled visit' : 'Approved drop‑in';
    const { success } = await insertDiscretionary(type as "referral" | "drop_in", note, user.id);
    if(success){
      // await fetchAllotment();
      setNewAllotmentType('');
      await fetchNotes();
    };
  };

  const handleToggleInfant = async () => {
    if (!localContact) return;
    const updated = { ...localContact, infant: !localContact.infant };
    const { success } = await updateContact(updated);
    if(success){
    setLocalContact(updated);
    fetchContacts(false);
    };
    // onContactUpdated(); 
  };

  const handleToggleAllergies = async () => {
    if (!localContact) return;
    const updated = { ...localContact, allergies: !localContact.allergies };
    const { success } = await updateContact(updated);
    if(success) setLocalContact(updated);
    // onContactUpdated();
  };

  const handleToggleVegetarian = async () => {
    if (!localContact) return;
    const updated = { ...localContact, vegetarian: !localContact.vegetarian };
    const { success } = await updateContact(updated);
    if(success) setLocalContact(updated);

    // onContactUpdated();
  };

  const handleToggleHallal = async () => {
    if (!localContact) return;
    const updated = { ...localContact, hallal: !localContact.hallal };
    const { success } = await updateContact(updated);
    if(success) setLocalContact(updated);
  };

  const handleSubmit = async (e?: React.SubmitEvent<HTMLFormElement>) => {
    e?.preventDefault();
    if (!contact) return;
    setIsLoading(true);

    if (formData.status !== (contact.status) && formData.status === 'active') {
      const targetOwnerId = formData.owner_id === '' ? contact.owner_id : formData.owner_id;
      if (!divsRegion.some(d => String(d.manager_id) === String(targetOwnerId))) {
        toast({ title: 'Error', description: 'Branch must be set before approving beneficiary', variant: 'destructive' });
        setIsLoading(false);
        return;
      }
      const targetDivId = divisions.find(d => String(d.manager_id) === String(targetOwnerId))?.id;
      if (targetDivId) {
        const divSettings = await fetchSettings(targetDivId);   
        if (!divSettings) { 
          setIsLoading(false);
          return;
        }
        const aWeeks = parseInt(divSettings.allotment_weeks ?? '-1', 10);
        const frequency = parseInt(divSettings.frequency ?? '-1', 10);
        const eWeeks = parseInt(divSettings.exclusion_weeks ?? '-1', 10);
        if (aWeeks === -1 || frequency === -1 || frequency === 0 || eWeeks === -1) {
          toast({ title: 'Error', description: 'Branch settings of allotment period, frequency and exclusion period must be set before approving beneficiary', variant: 'destructive' });
          setIsLoading(false);
          return;
        }
      }
    };

    try {
      const { success, error } = await updateContact({
        id: contact.id,
        name: formData.name.trim(),
        email: formData.email.trim() || null,
        phone: formData.phone.trim() || null,
        street_address: formData.street_address.trim() || null,
        postcode: formData.postcode.trim() || null,
        region_id: formData.region_id.trim() || null,
        adults: formData.adults || null,
        children_gt16: formData.children_gt16 || null,
        children_lt16: formData.children_lt16 || null,
        status: formData.status || 'inactive',
        delayed_days: formData.delayed_days || 7,
        user_id: user.id,
        owner_id: formData.owner_id === '' ? contact.owner_id : formData.owner_id || profile?.user_id,
        notes: formData.notes_new.trim() || null 
      });
      if (!success) return;
      onContactUpdated();
      // if (showAllotment) return; 
      setIsFullScreen(false);
      setCondition1(false);
      setCondition2(false);
      setCondition3(false);
      onClose();
    } catch (err: unknown) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // const handleShowAllotment = useCallback(() => setShowAllotment(prev => !prev), []);

  const handleClose = async() => {
    setFormData(emptyForm);
    setIgnoreCloseWarning(false);
    setShowUnsavedCloseWarning(false);
    setConfirmDelete(false);
    setDeleting(false);
    setCondition1(false);
    setCondition2(false);
    setCondition3(false);
    setIsFullScreen(false);
    // setShowAllotment(false);
    setNewAllotmentType('');
    setNewAllotmentNote('');
    // await deleteContactDays(contact.id);
    onClose();
  };

  const handleUnsavedStay = useCallback(() => { setShowUnsavedCloseWarning(false); }, []);
  const handleUnsavedDiscard = useCallback(() => { setShowUnsavedCloseWarning(false); handleClose(); }, [handleClose]);

  const handleViewSize = useCallback(() => setIsFullScreen(prev => !prev), []);
   
  return (
    <div>
      <Dialog open={isOpen} onOpenChange={o => {
          if (!o) {if (!ignoreCloseWarning && isDirty) {
              setShowUnsavedCloseWarning(true);
            } else {
              handleClose();
            }}
        }}
      >
        <DialogContent className = {cn(
                  'sm:max-w-[525px] max-h-[90dvh] overflow-y-auto',
                  isFullScreen && 'sm:max-w-[900px] max-w-full max-h-full',
                )} >  {/* className="sm:max-w-[525px] max-h-[90dvh] overflow-y-auto"> */}
          <DialogHeader>
            <div className="flex items-start justify-between">
              <div>
                <DialogTitle>Edit Beneficiary's Details</DialogTitle>
                <DialogDescription></DialogDescription>
              </div>
              <div className="flex gap-2 truncate align-right">
                <button
                  type="button"
                  onClick={handleMinimiseClick}
                  className="absolute right-17 top-4 rounded-sm opacity-70 hover:opacity-100 transition-opacity"
                  title="Minimise"
                >
                  <Minus className="size-4" />
                </button>
                <button
                  onClick={handleViewSize}
                  title={isFullScreen ? 'Restore' : 'Maximise'}
                  className="absolute right-11 top-4 rounded-sm opacity-70 hover:opacity-100 transition-opacity"
                  aria-label={isFullScreen ? 'Restore window' : 'Maximise window'}
                >
                  {isFullScreen ? <Minimize className="size-3.5" /> : <Maximize2 className="size-3.5" />}
                </button>
              </div>
            </div>
          </DialogHeader>
          <Tabs defaultValue={isServing ? "allotment" : "form"} className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="form" className="flex items-center">
                Details
              </TabsTrigger>
              <TabsTrigger value="allotment" className="flex items-center">
                Allotments
              </TabsTrigger>
            </TabsList>
      
            <TabsContent value="form" className="space-y-6">
              <ContactEditForm
                  formData={formData}
                  selectedDays={selectedDays}
                  onDayToggle={handleDayToggle}
                  openMap={openMap}
                  maxDaysSelectable={maxDaysSelectable}
                  onInputChange={handleInputChange}
                  onRegionChange={handleRegionChange}
                  onDivisionChange={handleDivisionChange}
                  onStatusChange={handleStatusChange}
                  handleSubmit={handleSubmit}
                  isLoading={isLoading}
                  isLoadingRegions={loadingRegions}
                  isLoadingDivisions={loadingDivisions}
                  isDirty={isDirty}
                  confirmDelete={confirmDelete}
                  deleting={deleting}
                  condition1={condition1}
                  condition2={condition2}
                  condition3={condition3}
                  setCondition1={setCondition1}
                  setCondition2={setCondition2}
                  setCondition3={setCondition3}
                  contact={contact}
                  regions={activeRegions}
                  divsRegion={divsRegion}
                  notes={notes}
                  handleDelete={handleDelete}
                  setConfirmDelete={setConfirmDelete}
                  setIgnoreCloseWarning={setIgnoreCloseWarning}
                  handleClose={handleClose}
                />
            </TabsContent>

            <TabsContent value="allotment" className="space-y-6">
              <ContactEditAllotment
                contact={localContact}
                formData={formData}
                handleInputChange={handleInputChange}
                handleSubmit={handleSubmit}
                isLoading={isLoading}
                isDirty={isDirty}
                // isServing={isServing}
                handleMarkServing={handleMarkServing}
                handleToggleInfant={handleToggleInfant}
                handleToggleAllergies={handleToggleAllergies}
                handleToggleVegetarian={handleToggleVegetarian}
                handleToggleHallal={handleToggleHallal}
                handleAddAllotment={handleAddAllotment}
                loadingAllotment={loadingAllotment} //@disabled in hook to avoid UI flicker on load
                allotment={allotment}
                newAllotmentType={newAllotmentType}
                // setNewAllotmentType={setNewAllotmentType}
                newAllotmentNote={newAllotmentNote}
                setNewAllotmentNote={setNewAllotmentNote}
                handleMarkAttended={handleMarkAttended}
                // handleMarkServing={handleMarkServing}
                handleMarkServed={handleMarkServed}
              />
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* <AlertDialog open={showMinimiseWarning} onOpenChange={setShowMinimiseWarning}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unsaved changes</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes for <strong>{contact?.name}</strong>. They'll be preserved in the minimised tab
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Stay here</AlertDialogCancel>
            <AlertDialogAction onClick={doMinimise}>Minimise</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog> */}

      <AlertDialog open={showMaxTabsWarning} onOpenChange={setShowMaxTabsWarning}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Maximum tabs reached</AlertDialogTitle>
            <AlertDialogDescription>
              The maximum number of minimised tabs is <strong>{maxMinimised}</strong>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>OK</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showUnsavedCloseWarning} onOpenChange={setShowUnsavedCloseWarning}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogDescription>
              You have unsaved changes for <strong>{contact?.name}</strong>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleUnsavedStay}>Stay</AlertDialogCancel>
            <AlertDialogAction onClick={handleUnsavedDiscard}>
              Discard
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

