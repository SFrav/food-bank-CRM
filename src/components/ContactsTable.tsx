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
import { useDivisions } from '@/hooks/useDivisions';
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
  const { profile } = useProfile();
  const { divisions } = useDivisions(profile?.entity_id);
  const { settingsMap, loading: settingsLoading, fetchSettings} = useDivisionSettings();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTermStatus, setFilterTermStatus] = useState('all');
  const [filterTermBranch, setFilterTermBranch] = useState('all');
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
  }, [profile, selected, contacts, refetch, fetchSettings]); 

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

  const totalContacts = useMemo(() => {
    return contacts.filter(contact => {
      const status = contact.status?.toLowerCase()
      if (status === 'merged') return false;
      return true;
    })
  }, [contacts])

  const filteredContacts = useMemo(() => {
    const orgDivIds = new Set(divisions.map(d => d.manager_id).filter(Boolean));
    const search = searchTerm.trim().toLowerCase();

    return contacts.filter(contact => {
      const status = contact.status?.toLowerCase();

      if (status === 'merged') return false;

      if (filterTermStatus !== 'all' && status !== filterTermStatus) return false;

      if (filterTermBranch === 'org-wide') {
        if (!orgDivIds.has(contact.owner_id)) return false;
      } else if (filterTermBranch !== 'all') {
        if (!contact.owner_id?.includes(filterTermBranch)) return false;
      }

      if (search) {
        const nameMatch = contact.name?.toLowerCase().includes(search);
        const emailMatch = contact.email?.toLowerCase().includes(search);
        const phoneMatch = contact.phone?.toLowerCase().includes(search);

        if (!(nameMatch || emailMatch || phoneMatch)) return false;
      }
      return true; 
    });
  }, [searchTerm, filterTermStatus, filterTermBranch, contacts, divisions]);

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
    toast({ title: 'Success', description: 'Contacts exported to CSV' });
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
          <div className="flex-wrap flex-col sm:flex sm:flex-row sm:justify-between">
            <div className="sm:flex items-center gap-4">
              <div className="relative w-full sm:w-auto">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, email or status …"
                  value={searchTerm}
                  onChange={(e) => {setSearchTerm(e.target.value); setSelected(new Set());}}
                  className="pl-10 w-full sm:w-[300px]"
                />
              </div>
              <div className="relative w-full mt-2 sm:mt-0 sm:w-auto">
                <div className="flex flex-col">
                  <label className="text-sm">Branch:</label>
                  <Select 
                    value={filterTermBranch} 
                    onValueChange={(e) => {setFilterTermBranch(e); setSelected(new Set());}} 
                  >
                    <SelectTrigger className="w-full sm:w-[120px] sm:h-[15px]">
                      <SelectValue placeholder="Branch filter" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="org-wide">Org-wide</SelectItem>
                      {divisions.map(d => (
                        <SelectItem key={d.id} value={d.manager_id}>
                          {d.name}
                          </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="relative w-full mt-2 sm:mt-0 sm:w-auto">
                <div className="flex flex-col">
                  <label className="text-sm">Status:</label>
                  <Select
                    value={filterTermStatus} 
                    onValueChange={(e) => {setFilterTermStatus(e); setSelected(new Set());}} //setFilterTermStore(e);
                  >
                    <SelectTrigger className="w-full sm:w-[120px] sm:h-[15px]">
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
              </div>
              <div className="relative w-full sm:w-auto">
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
            <div className="sm:flex gap-1">
              {filterTermStatus === 'all' && searchTerm.length > 2 && (
              <Button className="w-[50%] sm:w-full" 
                onClick={() => setIsAddModalOpen(true)}>
                <Plus className="size-4 mr-0" />Add Beneficiary
              </Button>
              )}
              <PermissionGuard permission="canApproveBeneficiaries">
                <Button className="w-[50%] sm:w-full" 
                  variant="outline" onClick={exportToCSV} disabled={filteredContacts.length === 0}>
                  <Download className="size-4 mr-0" />Export CSV
                </Button>
              </PermissionGuard>
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
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead> </TableHead>
                    <TableHead className="sm:max-w-[100px]">Name</TableHead>
                    <TableHead className="sm:max-w-[125px]">Email</TableHead>
                    <TableHead className="sm:max-w-[80px]">Phone</TableHead>
                    <TableHead className="w-[200px] sm:max-w-[80px]">Status</TableHead>
                    <TableHead className="text-right sm:max-w-[120px] ">
                      Latest Note
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredContacts.map((c, index) => (
                    <TableRow key={c.id} className="cursor-pointer hover:bg-muted/50" onClick={() => onEditContact(c)}>
                        {!filterQueue && filteredContacts.length >1 ? ( 
                      <TableCell className="font-medium">
                      <PermissionGuard permission="canMergeBeneficiaries">
                        <div onClick={e => e.stopPropagation()}>
                          <Checkbox
                            checked={selected.has(c.id)}
                            onCheckedChange={(checked) => {
                              if (!checked && selected.has(c.id)) toggleSelection(c.id, false);
                              else if (checked && selected.size < 2) toggleSelection(c.id, true);}}
                          />
                          </div>
                        </PermissionGuard>
                      </TableCell>
                        ) : (
                      <TableCell className="font-medium size-4">
                        {index + 1}
                      </TableCell>
                       )}
                      <TableCell className="sm:table-cell sm:max-w-[100px] sm:line-clamp-2">{c.name}</TableCell>
                      <TableCell className="sm:table-cell sm:max-w-[125px] line-clamp-2">
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
                      <TableCell className="sm:table-cell sm:max-w-[80px]">
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
                      <TableCell className="sm:table-cell sm:max-w-[200px]">
                        {c.status ? ( <StatusBadge role={c.status}/> 
                        ) : (<span className="text-muted-foreground">&hellip;</span>)}
                      </TableCell>
                        <TableCell className="text-xs text-muted-foreground pl-3 pr-3 sm:table-cell sm:max-w-[120px]">
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
                Showing {filteredContacts.length} of {totalContacts.length} beneficiaries
              </span>
              {selected.size === 2 ? (
                <Button 
                  onClick={() => setMergeDialogOpen(true)}>Merge selected</Button>
              ) : (
                <Button variant="ghost" size="sm" onClick={() => {setSearchTerm(''); setFilterTermStatus('all'); setFilterTermBranch('all')}}>Clear search</Button>
              )
              }              
              
            </div>
          ) : (
          <div className="flex justify-between items-center mt-4 text-sm text-muted-foreground">
            <span>
              No contacts match your search
            </span>
          {searchTerm && selected.size !==2  && <Button variant="ghost" size="sm" onClick={() => {setSearchTerm(''); setFilterTermStatus('all'); setFilterTermBranch('all')}}>Clear search</Button>} 
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