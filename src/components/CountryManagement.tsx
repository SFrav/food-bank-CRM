import { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Save, X, RefreshCw, Trash2, Loader2 } from 'lucide-react';
import { useCountries, Country } from '@/hooks/useCountries';
import { useToast } from '@/hooks/useToast';

export const CountryManagement = () => {
  const { toast } = useToast();
  const { countries, loading, createCountry, updateCountry, refetch } = useCountries();
  const [newCountryName, setNewCountryName] = useState('');
  const [newCountryCode, setNewCountryCode] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [editingCode, setEditingCode] = useState('');
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const getDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB');
  };

  const handleCreate = async () => {
    if (!newCountryName.trim() || !newCountryCode.trim()) {
      toast({ title: 'Error', description: 'Country name and code are required', variant: 'destructive' });
      return;
    }

    setCreating(true);
    try {
      const { data, error } = await createCountry(newCountryName.trim(), newCountryCode.trim().toUpperCase());
      if(!error || data) {
        setNewCountryName('');
        setNewCountryCode('');

      };
    } catch (err: unknown) {
      const error = err as { message?: string }; 
    } finally {
      setCreating(false);
    }
  };

  const handleEdit = (country: Country) => {
    setEditingId(country.id);
    setEditingName(country.name);
    setEditingCode(country.code);
  };

  const handleSave = async (id: string) => {
    if (!editingName.trim() || !editingCode.trim()) {
      toast({ title: 'Error', description: 'Country name and code are required', variant: 'destructive' });
      return;
    }

    setUpdating(id);
    try {
      const { data, error } = await updateCountry(
        id, 
        editingName.trim() || null,
        editingCode.trim().toUpperCase() || null,
        null
      );
      if(!error || data) {
        setEditingId(null);
        setEditingName('');
        setEditingCode('');
      }
    } catch (err: unknown) {
      const error = err as { message?: string }; 
    } finally {
      setUpdating(null);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditingName('');
    setEditingCode('');
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    setUpdating(id);
    try {
      const {data, error } = await updateCountry(id, null, null, !isActive );
      if(!error || data) toast({ title: 'Error', description: (isActive ? 'Country deactivated' : 'Country activated'), variant: 'destructive' });
    } catch (err: unknown) {
      const error = err as { message?: string }; 
    } finally {
      setUpdating(null);
    }
  };

  const handleNewCountryName = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {setNewCountryName(e.target.value);}, []);
  const handleNewCountryCode = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {setNewCountryCode(e.target.value);}, []);
  const handleEditCountryName = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {setEditingName(e.target.value);}, []);
  const handleEditCountryCode = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {setEditingCode(e.target.value);}, []);
    
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Country Management</CardTitle>
            <CardDescription>
              Manage countries
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={refetch} disabled={loading}>
            <RefreshCw className={`size-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add new country */}
        <div className="flex gap-2">
          <Input
            placeholder="Enter country name..."
            value={newCountryName}
            onChange={handleNewCountryName}
            className="flex-2"
          />
          <Input
            placeholder="Code"
            value={newCountryCode}
            onChange={handleNewCountryCode}
            className="flex-1 max-w-[100px]"
            maxLength={6}
          />
          <Button onClick={handleCreate} disabled={creating}>
            {creating ? (
              <RefreshCw className="size-4 animate-spin" />
            ) : (
              <Plus className="size-4" />
            )}
          </Button>
        </div>

        {/* Countries table */}
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="size-6 animate-spin" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Country Name</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {countries.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No countries found. Create your first country above.
                  </TableCell>
                </TableRow>
              ) : (
                countries.map((country) => (
                  <TableRow key={country.id}>
                    <TableCell>
                      {editingId === country.id ? (
                        <Input
                          value={editingName}
                          onChange={handleEditCountryName}
                        />
                      ) : (
                        <span className="font-medium">{country.name}</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {editingId === country.id ? (
                        <Input
                          value={editingCode}
                          onChange={handleEditCountryCode}
                          className="max-w-[80px]"
                          maxLength={6}
                        />
                      ) : (
                        <Badge variant="outline" className="font-mono">
                          {country.code}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={country.is_active ? "default" : "secondary"}
                        className="cursor-pointer"
                        onClick={() => handleToggleActive(country.id, country.is_active)}
                      >
                        {country.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {getDate(country.created_at)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {editingId === country.id ? (
                          <div>
                            <Button
                              size="sm"
                              onClick={() => handleSave(country.id)}
                              disabled={updating === country.id}
                            >
                              {updating === country.id ? (
                                <RefreshCw className="size-3 animate-spin" />
                              ) : (
                                <Save className="size-3" />
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={handleCancel}
                              disabled={updating === country.id}
                            >
                              <X className="size-3" />
                            </Button>
                          </div>
                        ) : (
                          <div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEdit(country)}
                              disabled={updating === country.id || deleting === country.id}
                            >
                              <Edit className="size-3" />
                            </Button>                    
                          </div>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};