import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Save, X, RefreshCw, Trash2, Loader2 } from 'lucide-react';
import { useRegions, Region } from '@/hooks/useRegions';
import { useToast } from '@/hooks/useToast';

export const RegionManagement = () => {
  const { toast } = useToast();
  const { regions, loading, createRegion, updateRegion, deleteRegion, refetch } = useRegions();
  const [newRegionName, setNewRegionName] = useState('');
  const [newRegionCode, setNewRegionCode] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [editingCode, setEditingCode] = useState('');
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const handleCreate = async () => {
    if (!newRegionName.trim() || !newRegionCode.trim()) {
      toast({ title: 'Error', description: 'Region name and code are required', variant: 'destructive' });
      return;
    }

    setCreating(true);
    try {
      const { data, error } = await createRegion(newRegionName.trim(), newRegionCode.trim().toUpperCase());
      if(!error || data) {
        setNewRegionName('');
        setNewRegionCode('');

      };
    } catch (err: unknown) {
      const error = err as { message?: string }; 
    } finally {
      setCreating(false);
    }
  };

  const handleEdit = (region: Region) => {
    setEditingId(region.id);
    setEditingName(region.name);
    setEditingCode(region.code);
  };

  const handleSave = async (id: string) => {
    if (!editingName.trim() || !editingCode.trim()) {
      toast({ title: 'Error', description: 'Region name and code are required', variant: 'destructive' });
      return;
    }

    setUpdating(id);
    try {
      const { data, error } = await updateRegion(
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
      const {data, error } = await updateRegion(id, null, null, !isActive );
      if(!error || data) toast({ title: 'Error', description: (isActive ? 'Region deactivated' : 'Region activated'), variant: 'destructive' });
    } catch (err: unknown) {
      const error = err as { message?: string }; 
    } finally {
      setUpdating(null);
    }
  };

  const handleDelete = async (id: string, name: string) => { //@Revise to alert
    // if (!confirm(`Are you sure you want to delete the region "${name}"? This action cannot be undone.`)) {
    //   return;
    // }

    setDeleting(id);
    try {
      const result = await deleteRegion(id);
    } catch (err: unknown) {
      const error = err as { message?: string }; 
    } finally {
      setDeleting(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Region Management</CardTitle>
            <CardDescription>
              Manage geographical regions for user profiles
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={refetch} disabled={loading}>
            <RefreshCw className={`size-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add new region */}
        <div className="flex gap-2">
          <Input
            placeholder="Enter region name..."
            value={newRegionName}
            onChange={(e) => setNewRegionName(e.target.value)}
            className="flex-2"
          />
          <Input
            placeholder="Code"
            value={newRegionCode}
            onChange={(e) => setNewRegionCode(e.target.value.toUpperCase())}
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

        {/* Regions table */}
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="size-6 animate-spin" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Region Name</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {regions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No regions found. Create your first region above.
                  </TableCell>
                </TableRow>
              ) : (
                regions.map((region) => (
                  <TableRow key={region.id}>
                    <TableCell>
                      {editingId === region.id ? (
                        <Input
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                        />
                      ) : (
                        <span className="font-medium">{region.name}</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {editingId === region.id ? (
                        <Input
                          value={editingCode}
                          onChange={(e) => setEditingCode(e.target.value.toUpperCase())}
                          className="max-w-[80px]"
                          maxLength={6}
                        />
                      ) : (
                        <Badge variant="outline" className="font-mono">
                          {region.code}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={region.is_active ? "default" : "secondary"}
                        className="cursor-pointer"
                        onClick={() => handleToggleActive(region.id, region.is_active)}
                      >
                        {region.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(region.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {editingId === region.id ? (
                          <>
                            <Button
                              size="sm"
                              onClick={() => handleSave(region.id)}
                              disabled={updating === region.id}
                            >
                              {updating === region.id ? (
                                <RefreshCw className="size-3 animate-spin" />
                              ) : (
                                <Save className="size-3" />
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={handleCancel}
                              disabled={updating === region.id}
                            >
                              <X className="size-3" />
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEdit(region)}
                              disabled={updating === region.id || deleting === region.id}
                            >
                              <Edit className="size-3" />
                            </Button>
                            {/*<Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDelete(region.id, region.name)}
                              disabled={updating === region.id || deleting === region.id}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            > */}
<AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                                >
                                  {deleting === region.id ? (
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
                                    Are you sure you want to delete "{region.name}"? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDelete(region.id, region.name)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>                      
                          </>
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