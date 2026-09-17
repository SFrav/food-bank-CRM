import { useState, useCallback, useMemo } from 'react';
import { Plus, Edit, Save, X, RefreshCw, Trash2, Users, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useDivisions, Division } from '@/hooks/useDivisions';
import { useEntities } from '@/hooks/useEntities';
import { useProfile } from "@/hooks/useProfile";
import { useToast } from '@/hooks/useToast';
// import { PermissionGuard } from '@/components/PermissionGuard';

export const DivisionManagement = () => {
  const { toast } = useToast();
  const { profile } = useProfile();
  const { divisions, loading, createDivision, updateDivision, deleteDivision, refetch } = useDivisions();
  const { entities } = useEntities();
  const [newDivisionEntityId, setNewDivisionEntityId] = useState<string>('');
  const [newDivisionName, setNewDivisionName] = useState('');
  const [newDivisionAddress, setNewDivisionAddress] = useState('');
  const [newDivisionPostcode, setNewDivisionPostcode] = useState('');
  const [editingDivisionId, setEditingDivisionId] = useState<string | null>(null);
  const [editingDivisionName, setEditingDivisionName] = useState('');
  const [editingDivisionAddress, setEditingDivisionAddress] = useState('');
  const [editingDivisionPostcode, setEditingDivisionPostcode] = useState('');
  const [editingDivisionEntityId, setEditingDivisionEntityId] = useState<string>('');
  const [creatingDivision, setCreatingDivision] = useState(false);
  const [updatingDivision, setUpdatingDivision] = useState<string | null>(null);
  const [deletingDivision, setDeletingDivision] = useState<string | null>(null);
  const [filterEntityId, setFilterEntityId] = useState<string>('all');

  const syncOrgUnits = () => {
    try {
      window.dispatchEvent(new CustomEvent('org-units-changed'));
    } catch (e) {
      // no-op for environments without window
    }
  };

  const entityNames: Record<string, string> = Object.fromEntries(
    entities.filter(e => e.is_active).map(e => [e.id, e.name])
  );

  const handleCreateDivEntitySelect = useCallback((e_id: string) => {
    if(profile?.entity_id) setNewDivisionEntityId(profile.entity_id);
    setNewDivisionEntityId(e_id);
  }, [profile]);

  const filteredDivisions = useMemo(() => {
    if (profile?.entity_id) return divisions.filter((d) => d.entity_id ===profile?.entity_id);
    return filterEntityId === 'all' 
    ? [...divisions].sort((a, b) => {
        const ea = entityNames[a.entity_id ?? ''] ?? '';
        const eb = entityNames[b.entity_id ?? ''] ?? '';
        if (ea !== eb) return ea.localeCompare(eb);
        return a.name.localeCompare(b.name);
      })
    : divisions.filter((d) => d.entity_id === filterEntityId);
  }, [profile, divisions, filterEntityId]);

  const handleCreateDivision = async () => {
    if (!newDivisionName.trim()) {
      toast({ title: 'Error', description: 'Branch name is required', variant: 'destructive' });
      return;
    }
    setCreatingDivision(true);
    try {

      const entityId = newDivisionEntityId !== '' && newDivisionEntityId !== null ? newDivisionEntityId : profile.entity_id;
      const { success, error } = await createDivision(
        newDivisionName.trim(),
        newDivisionAddress.trim(),
        newDivisionPostcode.trim(), 
        entityId);
      if(!success) {
        // toast.error(error ?? 'Failed to create branch');
      return;
      }
      setNewDivisionName('');
      setNewDivisionAddress('');
      setNewDivisionPostcode('');
      setNewDivisionEntityId('');
      syncOrgUnits();
    } catch (err: unknown) {
      const error = err as { message?: string }; 
      // toast.error(error.message || 'Failed to create branch');
    } finally {
      setCreatingDivision(false);
    }
  };

  const handleEditDivision = (division: Division) => {
    setEditingDivisionId(division.id);
    setEditingDivisionName(division.name);
    setEditingDivisionEntityId(division.entity_id || null);
  };

  const handleSaveDivision = async (id: string) => {
    if (!editingDivisionName.trim()) {
      toast({ title: 'Error', description: 'Branch name is required', variant: 'destructive' });
      return;
    }
    if(!['admin', 'head'].includes(profile?.role)) {
      toast({ title: 'Error', description: 'Only admin and head can edit branches', variant: 'destructive' });
      return;
    }
    setUpdatingDivision(id);
    try {
      const entityId =
        editingDivisionEntityId !== null
          ? editingDivisionEntityId
          : null;
      const { success, error } = await updateDivision(
        id, 
        editingDivisionName.trim(),
        editingDivisionAddress.trim(),
        editingDivisionPostcode.trim(),
        entityId,
      );
      if(!success) {
        // toast.error(error ?? 'Failed to create branch');
      return;
      }
      setEditingDivisionId(null);
      setEditingDivisionName('');
      setEditingDivisionAddress('');
      setEditingDivisionPostcode('');
      setEditingDivisionEntityId('');
      syncOrgUnits();
    } catch (err: unknown) {
      const error = err as { message?: string }; 
      // toast.error(error.message || 'Failed to update branch');
    } finally {
      setUpdatingDivision(null);
    }
  };

  const handleCancelDivision = () => {
    setEditingDivisionId(null);
    setEditingDivisionName('');
    setEditingDivisionEntityId('');
  };

  const handleDeleteDivision = async (id: string) => {
    if(!["admin", 'head'].includes(profile?.role)) {
      toast({ title: 'Error', description: 'Only admin and head can delete branches', variant: 'destructive' });
      return;
    }
    //if (!confirm(`Delete division "${name}"? This cannot be undone.`)) return;
    setDeletingDivision(id);
    try {
      const { success, error } = await deleteDivision(id);
      if(!success) {
        // toast.error(error ?? 'Failed to create branch');
      return;
      }
      syncOrgUnits();
    } catch (err: unknown) {
      const error = err as { message?: string }; 
      // toast.error(error.message || 'Failed to delete branch');
    } finally {
      setDeletingDivision(null);
    }
  };

  // const handleRefreshAll = async () => {
  //   await refetch();
  // };

  const handleNewDivisionName = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {setNewDivisionName(e.target.value);}, []);
  const handleNewDivisionAddress = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {setNewDivisionAddress(e.target.value);}, []);
  const handleNewDivisionPostcode = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {setNewDivisionPostcode(e.target.value);}, []);

  const handleClearFilter = useCallback(() => setFilterEntityId('all'), []);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Branch Management</CardTitle>
            <CardDescription>
              Manage branches within entities
            </CardDescription>
          </div>
          {/* <Button variant="outline" size="sm" onClick={handleRefreshAll} disabled={loading}>
            <RefreshCw className={`size-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button> */}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Create Branch */}
        <div className="space-y-4">
          <label className="text-sm font-medium text-foreground">Create branch</label>
          <div className="flex gap-2">
              <Input className="w-[240px]"
                placeholder="Enter branch name..."
                value={newDivisionName}
                onChange={handleNewDivisionName}
                //onKeyDown={(e) => e.key === 'Enter' && handleCreateDivision()}
              />
              <Input className="w-[240px]"
                placeholder="Enter address..."
                value={newDivisionAddress}
                onChange={handleNewDivisionAddress}
              />
              <Input className="w-[130px]"
                placeholder="Enter postcode..."
                value={newDivisionPostcode}
                onChange={handleNewDivisionPostcode}
              />
              <Select value={profile?.entity_id ? profile.entity_id : newDivisionEntityId} onValueChange={handleCreateDivEntitySelect}>
                <SelectTrigger className="w-[140px]">
                   <SelectValue placeholder="Select entity"/>
                </SelectTrigger>
                <SelectContent>
                  {/* <SelectItem value="none">No Entity</SelectItem> */}
                  {profile?.entity_id ? 
                  <SelectItem key={profile.entity_id} value={profile.entity_id}>{profile.entity}</SelectItem> 
                  : entities.map((e) => (
                    <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

            <Button className="w-12"  onClick={handleCreateDivision} disabled={creatingDivision}>
              {creatingDivision ? (
                <Loader2 className="size-4 animate-spin mr-2" />
              ) : (
                <Plus className="size-4" />
              )}
            </Button>
          </div>

          {/* Filter by Entity */}
          {profile?.entity_id === null ? (
            <div>
              <label className="text-sm font-medium text-foreground">Filter by entity</label>
          <div className="flex items-center gap-2">
            
            <Select value={filterEntityId} onValueChange={setFilterEntityId}>
              <SelectTrigger className="w-[240px]">
                <SelectValue placeholder="Filter by entity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Entities</SelectItem>
                {entities.filter(e => e.is_active).map((e) => (
                  <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={handleClearFilter}>Reset</Button>
          </div>
          </div>
          ) : (
           <div></div>
          )}

          {/* Branch Table */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Branch Name</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>Postcode</TableHead>
                <TableHead>Entity</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDivisions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">No divisions found.</TableCell>
                </TableRow>
              ) : (
                filteredDivisions.map((division) => (
                  <TableRow key={division.id}>
                    <TableCell>
                      {editingDivisionId === division.id ? (
                        <Input
                          value={editingDivisionName}
                          onChange={(e) => setEditingDivisionName(e.target.value)}
                          // onKeyDown={(e) => e.key === 'Enter' && handleSaveDivision(division.id)}
                        />
                      ) : (
                        <span className="font-medium">{division.name}</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {editingDivisionId === division.id ? (
                        <Input
                          value={editingDivisionAddress}
                          onChange={(e) => setEditingDivisionAddress(e.target.value)}
                        />
                      ) : (
                        <span className="font-medium">{division.street_address}</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {editingDivisionId === division.id ? (
                        <Input
                          value={editingDivisionPostcode}
                          onChange={(e) => setEditingDivisionPostcode(e.target.value)}
                        />
                      ) : (
                        <span className="font-medium">{division.postcode}</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {editingDivisionId === division.id ? (
                        <Select value={editingDivisionEntityId} onValueChange={setEditingDivisionEntityId}>
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select entity" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">No Entity</SelectItem>
                            {entities.filter(e => e.is_active).map((e) => (
                              <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <span className="text-muted-foreground">{entities.filter(e => e.is_active).find(e => e.id === division.entity_id)?.name || '—'}</span>
                      )}
                    </TableCell>
                    <TableCell>{new Date(division.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {editingDivisionId === division.id ? (
                          <div>
                            <Button size="sm" onClick={() => handleSaveDivision(division.id)} disabled={updatingDivision === division.id}>
                              {updatingDivision === division.id ? <RefreshCw className="size-3 animate-spin" /> : <Save className="size-3" />}
                            </Button>
                            <Button size="sm" variant="outline" onClick={handleCancelDivision} disabled={updatingDivision === division.id}>
                              <X className="size-3" />
                            </Button>
                          </div>
                        ) : (
                          <div>
                            <Button size="sm" variant="outline" onClick={() => handleEditDivision(division)} disabled={updatingDivision === division.id || deletingDivision === division.id}>
                              <Edit className="size-3" />
                            </Button>
                            {/*<Button size="sm" variant="outline" onClick={() => handleDeleteDivision(division.id, division.name)} disabled={updatingDivision === division.id || deletingDivision === division.id} className="text-red-600 hover:text-red-700 hover:bg-red-50">
                              {deletingDivision === division.id ? <RefreshCw className="size-3 animate-spin" /> : <Trash2 className="size-3" />}
                            </Button> */}
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                                >
                                  {deletingDivision === division.id ? (
                                    <Loader2 className="size-4 animate-spin" />
                                  ) : (
                                    <Trash2 className="size-4" />
                                  )}
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Branch</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete "{division.name}"? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeleteDivision(division.id)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>                      
                          </div>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};