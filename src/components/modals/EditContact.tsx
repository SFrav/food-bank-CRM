import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Minus, StickyNote } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useContacts, Contact } from '@/hooks/useContacts';
import { useContactNotes } from '@/hooks/useContactNotes';
import { useContactAllotment } from '@/hooks/useContactAllotment';
import { useToast } from '@/hooks/useToast';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from "@/hooks/useProfile";
import { useRegions, Region } from '@/hooks/useRegions';
import { useDivisions, Division } from '@/hooks/useDivisions';
import { useDivisionSettings } from '@/hooks/useDivisionSettings';
import ContactEditAllotment from '@/components/modals/subcomponents/EditContactAllotment';
import ContactEditForm from '@/components/modals/subcomponents/EditContactForm';

interface EditContactModalProps {
  isOpen: boolean;
  isServing: boolean;
  onClose: () => void;
  onContactUpdated: () => void;
  onMinimise: (contact: Contact, isDirty: boolean, formData: FormData) => void;
  contact: Contact | null;
  restoredFormData?: FormData | null;
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
  owner_id: string;
  notes_new: string;
}

export type { FormData as ContactFormData };

const emptyForm: FormData = { name: '', email: '', phone: '', street_address: '', postcode: '', region_id: '', adults: 1, children_gt16: 0, children_lt16: 0, status: 'inactive', owner_id: '', notes_new: '' };


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
  maxMinimised,
  currentMinimisedCount,
}) => {
  if (!contact) return null;
  const { toast } = useToast();
  const { user } = useAuth();
  const { profile } = useProfile();
  const { regions, loading: loadingRegions } = useRegions();
  const { divisions, loading: loadingDivisions } = useDivisions();
  const { settingsMap, loading: settingsLoading, fetchSettings} = useDivisionSettings();
  // const [divsRegion, setDivsRegion] = useState<Division[]>([]);
  const { deleteContact, updateContact, refetch: fetchContacts } = useContacts();
  const { notes, fetch: fetchNotes } = useContactNotes(contact?.id ?? null);
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
  const [condition1, setCondition1] = useState(false);
  const [condition2, setCondition2] = useState(false);
  const [condition3, setCondition3] = useState(false);
  const [showAllotment, setShowAllotment] = useState(isServing);
  const [servingOngoing, setServingOngoing] = useState(false);

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
      (formData.owner_id !== (contact.owner_id ?? '') && formData.owner_id !== '') ||
      formData.notes_new !== '' || 
      servingOngoing
    );
  }, [contact, formData, servingOngoing]); 

  // if (!user || !profile) return null;

  const divisionSettings = settingsMap[profile?.division_id || ''] ?? {};
  const dayOffset = parseInt(divisionSettings.day_offset ?? '-1', 10);
  const hourOffset = parseInt(divisionSettings.hour_offset ?? '-1', 10);
  const exclWeeks = parseInt(divisionSettings.exclusion_weeks ?? '-1', 10);

  useEffect(() => {
    if (!contact || !isOpen) return;
    setConfirmDelete(false);
    setLocalContact(contact);
    if (isServing) setShowAllotment(isServing);
  }, [contact, isOpen, isServing]);

  useEffect(() => {
    if (!profile) return;
    // const divs = divisions.filter((d) => d.region_id === profile.region_id);
    // setDivsRegion(divs);
    if (profile?.division_id && !settingsMap[profile.division_id]) {
      fetchSettings(profile.division_id);
    }
  }, [profile, divisions]);

  const divsRegion = useMemo(() => divisions.filter(d => d.region_id === profile?.region_id), [divisions, profile]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRegionChange = useCallback((v: string) => setFormData(prev => (
    {...prev, region_id: v})
  ), [setFormData]);

  const handleDivisionChange = useCallback((v: string) => setFormData(prev => (
    {...prev, owner_id: v})
  ), [setFormData, divsRegion]);

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
    onMinimise(contact, isDirty, formData);
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
    if(formData.status !== (contact.status) && formData.status === 'active' && (dayOffset === -1 || hourOffset === -1 || exclWeeks === -1)) {
      toast({ title: 'Error', description: 'Division settings of opening day, opening hours and exclusion period must be set before approving beneficiary', variant: 'destructive' });
      setIsLoading(false);
      return;
    }

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
        user_id: user.id,
        owner_id: formData.owner_id === '' ? contact.owner_id : formData.owner_id || null,
        notes: formData.notes_new.trim() || null 
      });
      if (!success) return;
      onContactUpdated();
      if (showAllotment) return; 
      onClose();
    } catch (err: unknown) {
      console.error(err);
    } finally {
      setIsLoading(false);
      setCondition1(false);
      setCondition2(false);
      setCondition3(false);
    }
  };

  const handleShowAllotment = useCallback(() => setShowAllotment(prev => !prev), []);

  const handleClose = () => {
    setFormData(emptyForm);
    setIgnoreCloseWarning(false);
    setShowUnsavedCloseWarning(false);
    setConfirmDelete(false);
    setDeleting(false);
    setCondition1(false);
    setCondition2(false);
    setCondition3(false);
    setShowAllotment(false);
    setNewAllotmentType('');
    setNewAllotmentNote('');
    onClose();
  };

  const handleUnsavedStay = useCallback(() => { setShowUnsavedCloseWarning(false); }, []);
  const handleUnsavedDiscard = useCallback(() => { setShowUnsavedCloseWarning(false); handleClose(); }, [handleClose]);
 
  return (
    <div>
      <Dialog
        open={isOpen}
        onOpenChange={o => {
          if (!o) {
            if (!ignoreCloseWarning && isDirty) {
              setShowUnsavedCloseWarning(true);
            } else {
              handleClose();
            }
          }
        }}
      >
        <DialogContent className="sm:max-w-[525px] max-h-[90dvh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-start justify-between">
              <div>
                <DialogTitle>Edit Beneficiary</DialogTitle>
                <DialogDescription>Update the beneficiary's details below.</DialogDescription>
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
                  type="button"
                  onClick={handleShowAllotment}
                  className="absolute right-11 top-4 rounded-sm opacity-70 hover:opacity-100 transition-opacity disabled:opacity-30"
                  title="Toggle between allotment and contact details"
                  // disabled={contact?.status !== 'active'}  
                >
                  <StickyNote className="size-4" /> 
                </button>
              </div>
            </div>
          </DialogHeader>
          {/* <span>{String(contact.id)}</span> */}
          {showAllotment ? (
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
          ) : (
            <ContactEditForm
              formData={formData}
              // setFormData={setFormData}
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
              regions={regions}
              divsRegion={divsRegion}
              notes={notes}
              handleDelete={handleDelete}
              setConfirmDelete={setConfirmDelete}
              setIgnoreCloseWarning={setIgnoreCloseWarning}
              handleClose={handleClose}
            />
          )}
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

