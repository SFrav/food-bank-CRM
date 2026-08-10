import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Search, Plus, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { StatusBadge } from '@/components/StatusBadge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PermissionGuard } from '@/components/PermissionGuard';
import { AddContactModal } from '@/components/modals/AddContact';
import { MergeContactModal } from '@/components/modals/MergeContact';
import { useContacts, Contact } from '@/hooks/useContacts';
import { useDivisionSettings, DivisionSettings } from '@/hooks/useDivisionSettings';
import { useProfile } from '@/hooks/useProfile';
import { useToast } from '@/hooks/useToast';

interface ContactsTableProps {
  contacts: Contact[];
  loading: boolean;
  filterQueue: boolean;
  setFilterQueue: (value: boolean) => void;
  onDuplicateAdd: (dup: Contact) => void;
  onEditContact: (contact: Contact) => void;
  refetch: (filterQueue: boolean) => Promise<void>;
}

export const ContactsTable: React.FC<ContactsTableProps> = ({
  contacts,
  loading,
  filterQueue,
  setFilterQueue,
  onDuplicateAdd,
  onEditContact,
  refetch
}) => {
  // const [orderDesc] = useState(false);
  // const [filterQueue, setFilterQueue] = useState(false);
  // const { contacts, loading, refetch } = useContacts(orderDesc); //orderDesc, filterQueue
  const { toast } = useToast();
  const { settingsMap, loading: settingsLoading, fetchSettings} = useDivisionSettings();
  const { profile, updateProfile, refetch: fetchProfile, loading: loadingProfile } = useProfile();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTerm, setFilterTerm] = useState('all');
  // const [filterTermStore, setFilterTermStore] = useState('active');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [mergeDialogOpen, setMergeDialogOpen] = useState(false);
  const [primaryMerge, setPrimaryMerge] = useState<Contact | null>(null);
  const [secondaryMerge, setSecondaryMerge] = useState<Contact | null>(null);

  const divisionSettings = settingsMap[profile?.division_id || ''] ?? {};
  const dayOffset = parseInt(divisionSettings.day_offset ?? '-1', 10);
  const todayIndex = (new Date().getDay() + 6) % 7; 
  const dayServing = todayIndex === dayOffset;

  useEffect(() => {
    if (!profile || selected.size !== 2) return;
    const ids = Array.from(selected);
    const primary = contacts.find(c => c.id === ids[0]) ?? null;
    const secondary = contacts.find(c => c.id === ids[1]) ?? null;
    if (primary && secondary) {
      setPrimaryMerge(primary);
      setSecondaryMerge(secondary);
      setMergeDialogOpen(true);
      // setSelected(new Set());
    }
    if (profile?.division_id && !settingsMap[profile.division_id]) {
      fetchSettings(profile.division_id);
    }
  }, [profile, selected, contacts, refetch, fetchSettings]); //, refetch

  useEffect(() => {
    if (profile?.division_id && !settingsMap[profile.division_id]) {
      fetchSettings(profile.division_id);
    }
  }, [profile?.division_id, fetchSettings, settingsMap]);

  const toggleSelection = (id: string, checked: boolean) => {
    setSelected(prev => {
      const newSet = new Set(prev);
      if (checked) newSet.add(id);
      else newSet.delete(id);
      return newSet;
    });
  };

  const filteredContacts = useMemo(() => { //@ consider refactor to DB
    const q = searchTerm.toLowerCase();
    if (!searchTerm && filterTerm !== "all") {
      return contacts.filter((c) => c.status?.toLowerCase() === filterTerm && c.status?.toLowerCase() !== 'merged')
    };
    if (searchTerm && filterTerm === "all") {
      return contacts.filter(
      (c) =>
        (c.name.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q) ||
        c.phone?.toLowerCase().includes(q)) &&
        c.status?.toLowerCase() !== 'merged'
    );
    };
    if (searchTerm && filterTerm !== "all") {
      return contacts.filter(
      (c) =>
        (c.name.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q) ||
        c.phone?.toLowerCase().includes(q)) &&
        c.status?.toLowerCase() === filterTerm && 
        c.status?.toLowerCase() !== 'merged'
      );
    };
    if (!searchTerm && filterTerm === "all") {return contacts.filter((c) => c.status?.toLowerCase() !== 'merged')};
  }, [searchTerm, filterTerm, contacts]);

  const exportToCSV = () => {
    const headers = ['Name', 'Email', 'Phone', 'Notes', 'Created At'];
    const rows = filteredContacts.map((c) => [
      `"${c.name}"`,
      `"${c.email ?? ''}"`,
      `"${c.phone ?? ''}"`,
      //`"${c.status ?? ''}"`,
      `"${c.notes ?? ''}"`,
      `"${new Date(c.created_at).toLocaleDateString()}"`,
    ].join(','));
    const blob = new Blob([[headers.join(','), ...rows].join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `contacts-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: 'Success', description: 'Contacts exported to CSV!' });
  };

  // const handleQueueRefetch = useCallback(() => {
  //   refetch(filterQueue)
  // }, [refetch, filterQueue]);

  // const handleNameInit = (searchTerm: string) => {
  //   if (searchTerm.length > 6) return searchTerm; 
  //   return '';
  // };
  const handleNameInit = useMemo(() => {
    if (searchTerm.length > 6) return searchTerm; 
    return '';
  }, [searchTerm]);

  const handleAddRefetch = () => {
    refetch(filterQueue);
    setSearchTerm('');
  }

  const handleMerged = () => {
    refetch(filterQueue);
    setSelected(new Set());
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          {/* <CardTitle> </CardTitle>
          <CardDescription> </CardDescription>
        </CardHeader>
        <CardContent> */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6 items-center justify-between">
            <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-muted-foreground " />
              <Input
                placeholder="Search by name, email or status …"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-[300px]"
              />
            </div>
            <div className="relative flex-1">
              <Select
                value={filterTerm} 
                onValueChange={(e) => {setFilterTerm(e); }} //setFilterTermStore(e);
              >
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Status filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="relative flex-1">
              <PermissionGuard permission="canServeBeneficiaries">
                <div className={`flex flex-col items-end ${!dayServing ? 'invisible' : ''}`}>
                  <label className="text-sm">Queue:</label>
                  <Switch
                    id="queue"
                    onCheckedChange={checked => {
                      setFilterQueue(checked);
                      refetch(checked);
                    }}
                  />
                </div>
              </PermissionGuard>
            </div>
            </div>
            <div className="flex gap-2">
              {filterTerm === 'all' && searchTerm.length > 2 && (
              <Button onClick={() => setIsAddModalOpen(true)}>
                <Plus className="size-4 mr-2" />Add Beneficiary
              </Button>
              )}
              <Button variant="outline" onClick={exportToCSV} disabled={filteredContacts.length === 0}>
                <Download className="size-4 mr-2" />Export CSV
              </Button>
            </div>
          </div>
          </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full size-8 border-b-2 border-primary" />
            </div>
          ) : filteredContacts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {/* {searchTerm ? '' : 'No contacts yet.'}
              {!searchTerm && (
                <div className="mt-4">
                  <Button onClick={() => setIsAddModalOpen(true)}>
                    <Plus className="size-4 mr-2" />Add Your First Beneficiary
                  </Button>
                </div>
              )} */}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead> </TableHead>
                    <TableHead className="max-w-[150px]">Name</TableHead>
                    <TableHead className="hidden sm:table-cell max-w-[180px]">Email</TableHead>
                    <TableHead className="hidden md:table-cell max-w-[80px]">Phone</TableHead>
                    <TableHead className="hidden lg:table-cell max-w-[80px]">Status</TableHead>
                    <TableHead className="text-right hidden lg:table-cell max-w-[200px] ">
                      Latest Note
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredContacts.map((c, index) => (
                    <TableRow key={c.id} className="cursor-pointer hover:bg-muted/50" onClick={() => onEditContact(c)}>
                        {!filterQueue && filteredContacts.length >1 ? ( 
                      <TableCell className="font-medium">
                        <div onClick={e => e.stopPropagation()}>
                        <Checkbox
                          checked={selected.has(c.id)}
                          onCheckedChange={(checked) => {
                            if (!checked && selected.has(c.id)) toggleSelection(c.id, false);
                            else if (checked && selected.size < 2) toggleSelection(c.id, true);}}
                        />
                        </div>
                      </TableCell>
                        ) : (
                      <TableCell className="font-medium size-4">
                        {index + 1}
                      </TableCell>
                       )}
                      <TableCell className="font-medium max-w-[150px] line-clamp-2">{c.name}</TableCell>
                      <TableCell className="hidden sm:table-cell max-w-[180px] line-clamp-2">
                        {c.email ? (
                          // <a
                          //   href={`mailto:${c.email}`}
                          //   className="text-primary hover:underline"
                          //   onClick={(e) => e.stopPropagation()}
                          // >
                            <span>{c.email}</span>
                          // </a>
                        ) : (
                          <span className="text-muted-foreground">&hellip;</span>
                        )}
                      </TableCell>
                      <TableCell className="hidden md:table-cell max-w-[80px]">
                        {c.phone ? (
                          // <a
                          //   href={`tel:${c.phone}`}
                          //   className="text-primary hover:underline"
                          //   onClick={(e) => e.stopPropagation()}
                          // >
                            <span>{c.phone}</span>
                          // </a>
                        ) : (
                          <span className="text-muted-foreground">&hellip;</span>
                        )}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell max-w-[80px]">
                        {c.status ? ( <StatusBadge role={c.status}/> 
                        ) : (<span className="text-muted-foreground">&hellip;</span>)}
                      </TableCell>
                        <TableCell className="text-xs text-muted-foreground pl-3 pr-3 max-w-[200px]">
                          {c.notes ? (
                            <span className=" line-clamp-2" title={c.notes}>
                              {c.notes}
                            </span>
                          ) : (
                            <span className="line-clamp-2" > &hellip; </span>
                          )}
                        </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
          
          {filteredContacts.length > 0 ? (
            <div className="flex justify-between items-center mt-4 text-sm text-muted-foreground">
              <span>
                Showing {filteredContacts.length} of {contacts.length} beneficiaries
              </span>
              {selected.size === 2 ? (
                <Button 
                  onClick={() => setMergeDialogOpen(true)}>Merge selected</Button>
              ) : (
                <Button variant="ghost" size="sm" onClick={() => {setSearchTerm(''); setFilterTerm('all')}}>Clear search</Button>
              )
              }              
              
            </div>
          ) : (
          <div className="flex justify-between items-center mt-4 text-sm text-muted-foreground">
            <span>
              No contacts match your search
            </span>
          {searchTerm && selected.size !==2  && <Button variant="ghost" size="sm" onClick={() => {setSearchTerm(''); setFilterTerm('all')}}>Clear search</Button>} 
            </div>
        )}
        </CardContent>
      </Card>

      <AddContactModal
        isOpen={isAddModalOpen}
        nameInit={handleNameInit}
        onDuplicateFound={onDuplicateAdd}
        onClose={() => setIsAddModalOpen(false)}
        onContactAdded={handleAddRefetch}
      />
      <MergeContactModal
        isOpen={mergeDialogOpen}
        onClose={() => setMergeDialogOpen(false)}
        onMerged={handleMerged}
        primary={primaryMerge ?? ({} as Contact)}
        secondary={secondaryMerge ?? ({} as Contact)}
      />
    </div>
  );
};