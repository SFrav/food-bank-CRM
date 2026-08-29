import { useState, useCallback, useEffect } from 'react';
import { ContactsTable } from '@/components/ContactsTable';
import { EditContactModal, ContactFormData } from '@/components/modals/EditContact';
import MinimisedContactsBar, { MinimisedContact } from '@/components/MinimisedContactsBar';
import { useContacts, Contact } from '@/hooks/useContacts';
// import { useProfile } from "@/hooks/useProfile";
// import { useDivisions, Division } from '@/hooks/useDivisions';

const MAX_MINIMISED = 3;
const STORAGE_KEY = 'contacts_minimised_tabs';

const loadFromStorage = (): MinimisedContact[] => {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveToStorage = (tabs: MinimisedContact[]) => {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(tabs));
  } catch {}
};

export default function Contacts() {
  //const { profile } = useProfile();
  // const { divisions } = useDivisions();
  // const [divsRegion, setDivsRegion] = useState<Division[]>([]);
  const [filterQueue, setFilterQueue] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  // const [refreshKey, setRefreshKey] = useState(0);
  const [restoredFormData, setRestoredFormData] = useState<ContactFormData | null>(null);
  const [minimised, setMinimised] = useState<MinimisedContact[]>(loadFromStorage);

  const { contacts, loading, refetch } = useContacts(false);

  useEffect(() => {
    saveToStorage(minimised);
  }, [minimised]);

  const handleContactUpdated = useCallback(() => {
    refetch(filterQueue);
    // setRefreshKey(k => k + 1);
  }, [filterQueue]);

  const handleDuplicateAdd = useCallback((dup: Contact) => {
    setEditingContact(dup);
    setIsEditOpen(true);
  }, []);

  const handleRestore = useCallback((id: string) => {
    const entry = minimised.find(m => m.contact.id === id) as MinimisedContact;
    if (!entry) return;
    setMinimised(prev => prev.filter(m => m.contact.id !== id));
    setRestoredFormData(entry.savedFormData ?? null);
    setEditingContact(entry.contact as Contact);
    setIsEditOpen(true);
  }, [minimised]);

  const handleEditContact = useCallback((contact: Contact) => {
    const existing = minimised.find(m => m.contact.id === contact.id);
    if (existing) {
      handleRestore(contact.id);
      return;
    }
    setRestoredFormData(null);
    setEditingContact(contact);
    setIsEditOpen(true);
  }, [minimised, handleRestore]);

  const handleMinimise = useCallback((contact: Contact, isDirty: boolean, formData: ContactFormData) => {
    setIsEditOpen(false);
    setMinimised(prev => {
      const without = prev.filter(m => m.contact.id !== contact.id);
      const capped = without.length >= MAX_MINIMISED ? without.slice(1) : without;
      return [...capped, { contact, isDirty, savedFormData: formData }];
    });
  }, [setMinimised]);

  const handleDiscard = useCallback((id: string) => {
    setMinimised(prev => prev.filter(m => m.contact.id !== id));
  }, [setMinimised]);

  const handleClose = useCallback(() => {
    setIsEditOpen(false);
    setEditingContact(null);
    setRestoredFormData(null);
  }, []);

  return (
    <div className="space-y-6">
      {/* <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-foreground">Contacts</h1>
          <p className="text-muted-foreground">Manage your contact database</p>
        </div>
      </div> */}

      <ContactsTable 
        // key={refreshKey} 
        contacts={contacts}
        loading={loading}
        filterQueue={filterQueue}
        setFilterQueue={setFilterQueue}
        onDuplicateAdd={handleDuplicateAdd}
        onEditContact={handleEditContact} 
        refetch={refetch}
      />

      <EditContactModal
        isOpen={isEditOpen}
        isServing={filterQueue}
        onClose={handleClose}
        onContactUpdated={handleContactUpdated}
        onMinimise={handleMinimise}
        contact={editingContact}
        restoredFormData={restoredFormData}
        maxMinimised={MAX_MINIMISED}
        currentMinimisedCount={minimised.length}
      />

      <MinimisedContactsBar minimised={minimised} onRestore={handleRestore} onDiscard={handleDiscard} />
    </div>
  );
}
