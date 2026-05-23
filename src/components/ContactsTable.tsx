import React, { useMemo } from 'react';
import { Search, Plus, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AddContactModal } from '@/components/modals/AddContactModal';
import { useContacts } from '@/hooks/useContacts';
import { useToast } from '@/hooks/use-toast';

export interface Contact {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  status: string | null;
  notes: string | null;
  created_at: string;
}

interface ContactsTableProps {
  onEditContact: (contact: Contact) => void;
}

interface BadgeProps {
  role: 'active' | 'inactive' | 'pending';
  className?: string;
}

export const StatusBadge = ({ role, className = "" }: BadgeProps) => {
  const getConfig = (role: string) => {
    switch (role) {
      case 'active':
        return {
          label: 'Active',
          className: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800'
        };
      case 'pending':
        return {
          label: 'Pending',
          className: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800'
        };
      case 'inactive':
        return {
          label: 'Inactive',
          className: 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800'
        };
      default:
        return {
          label: 'Unknown',
          className: 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800'
        };
    }
  };

  const config = getConfig(role);

  return (
  <Badge 
    variant='default'
    className={`flex items-center gap-1 ${config.className} ${className}`}
  >
    {config.label}
  </Badge>
);
};

export const ContactsTable: React.FC<ContactsTableProps> = ({ onEditContact }) => {
  const [orderDesc] = React.useState(false);
  const { contacts, loading, refetch} = useContacts(orderDesc);
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = React.useState('');
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);



  const filteredContacts = useMemo(() => {
    if (!searchTerm) return contacts;
    const q = searchTerm.toLowerCase();
    return contacts.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q) ||
        c.phone?.toLowerCase().includes(q) ||
        c.status?.toLowerCase().includes(q)
    );
  }, [searchTerm, contacts]);

  const exportToCSV = () => {
    const headers = ['Name', 'Email', 'Phone', 'Company', 'Notes', 'Created At'];
    const rows = filteredContacts.map((c) => [
      `"${c.name}"`,
      `"${c.email ?? ''}"`,
      `"${c.phone ?? ''}"`,
      `"${c.status ?? ''}"`,
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
    
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          {/* <CardTitle> </CardTitle>
          <CardDescription> </CardDescription>
        </CardHeader>
        <CardContent> */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or email …"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={exportToCSV} disabled={filteredContacts.length === 0}>
                <Download className="size-4 mr-2" />Export CSV
              </Button>
              <Button onClick={() => setIsAddModalOpen(true)}>
                <Plus className="size-4 mr-2" />Add Beneficiary
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
              {searchTerm ? 'No contacts match your search.' : 'No contacts yet.'}
              {!searchTerm && (
                <div className="mt-4">
                  <Button onClick={() => setIsAddModalOpen(true)}>
                    <Plus className="size-4 mr-2" />Add Your First Beneficiary
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead className="hidden sm:table-cell">Email</TableHead>
                    <TableHead className="hidden md:table-cell">Phone</TableHead>
                    <TableHead className="hidden lg:table-cell">Status</TableHead>
                    <TableHead className="text-right text-xs font-normal text-muted-foreground">
                      Note
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredContacts.map((c) => (
                    <TableRow key={c.id} className="cursor-pointer hover:bg-muted/50" onClick={() => onEditContact(c)}>
                      <TableCell className="font-medium">{c.name}</TableCell>
                      <TableCell className="hidden sm:table-cell">
                        {c.email ? (
                          <a
                            href={`mailto:${c.email}`}
                            className="text-primary hover:underline"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {c.email}
                          </a>
                        ) : (
                          <span className="text-muted-foreground">&hellip;</span>
                        )}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {c.phone ? (
                          <a
                            href={`tel:${c.phone}`}
                            className="text-primary hover:underline"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {c.phone}
                          </a>
                        ) : (
                          <span className="text-muted-foreground">&hellip;</span>
                        )}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        {c.status ? <StatusBadge role={c.status}>
                          {c.status} </StatusBadge> : <span className="text-muted-foreground">&hellip;</span>}
                      </TableCell>
                        <TableCell className="text-right text-xs text-muted-foreground pl-1 pr-0">
                          {c.notes ? (
                            <span className="max-w-[150px] line-clamp-2" title={c.notes}>
                              {c.notes}
                            </span>
                          ) : (
                            '&hellip;'
                          )}
                        </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {filteredContacts.length > 0 && (
            <div className="flex justify-between items-center mt-4 text-sm text-muted-foreground">
              <span>
                Showing {filteredContacts.length} of {contacts.length} beneficiaries
              </span>
              {searchTerm && <Button variant="ghost" size="sm" onClick={() => setSearchTerm('')}>Clear search</Button>}
            </div>
          )}
        </CardContent>
      </Card>

      <AddContactModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onContactAdded={refetch}
      />
    </div>
  );
};