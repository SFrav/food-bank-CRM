import { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Plus, Trash2, Edit3, Loader2 } from 'lucide-react';
import { useEntities } from '@/hooks/useEntities';
import { useToast } from '@/hooks/useToast';
import { Badge } from '@/components/ui/badge';

export const EntityManagement = () => {
  const { entities, loading, createEntity, updateEntity, deleteEntity } = useEntities();
  const { toast } = useToast();
  const [newEntityName, setNewEntityName] = useState('');
  const [newEntityCode, setNewEntityCode] = useState('');
  const [newEntityReferrer, setNewEntityReferrer] = useState(false);
  const [editingEntity, setEditingEntity] = useState<{ id: string; name: string; code: string, is_referrer: boolean } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [deletingEntityId, setDeletingEntityId] = useState<string | null>(null);

  const handleCreateEntity = async () => {
    if (!newEntityName.trim()) return;

    setIsLoading(true);
    const { error } = await createEntity(newEntityName.trim(), newEntityCode.trim(), newEntityReferrer || undefined);
    
    if (error) {
      toast({
        title: "Error",
        description: error,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Entity created successfully",
      });
      setNewEntityName('');
      setNewEntityCode('');
      setNewEntityReferrer(false);
      
      try {
        window.dispatchEvent(new CustomEvent('org-units-changed'));
        console.log('Entity created, refresh event dispatched');
      } catch (e) {
        console.error('Failed to dispatch refresh event:', e);
      }
    }
    setIsLoading(false);
  };

  const handleUpdateEntity = async () => {
    if (!editingEntity) return;

    setIsLoading(true);
    const { error } = await updateEntity(editingEntity.id, {
      name: editingEntity.name,
      code: editingEntity.code || undefined,
      is_referrer: editingEntity.is_referrer || undefined
    });
    
    if (error) {
      toast({
        title: "Error",
        description: error,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Entity updated successfully",
      });
      setEditingEntity(null);
      
      // Trigger refresh event
      try {
        window.dispatchEvent(new CustomEvent('org-units-changed'));
      } catch (e) {
        console.error('Failed to dispatch refresh event:', e);
      }
    }
    setIsLoading(false);
  };

  const handleDeleteEntity = async (id: string) => {
    setDeletingEntityId(id);
    setIsLoading(true);
    const { error } = await deleteEntity(id);
    
    if (error) {
      toast({
        title: "Error",
        description: error,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Entity deleted successfully",
      });
      
      // Trigger refresh event
      try {
        window.dispatchEvent(new CustomEvent('org-units-changed'));
      } catch (e) {
        console.error('Failed to dispatch refresh event:', e);
      }
    }
    setDeletingEntityId(null);
    setIsLoading(false);
  };

  const toggleEntityStatus = async (id: string, currentStatus: boolean) => {
    const { error } = await updateEntity(id, { is_active: !currentStatus });
    
    if (error) {
      toast({
        title: "Error",
        description: error,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: `Entity ${!currentStatus ? 'activated' : 'deactivated'} successfully`,
      });
      // Trigger refresh event
      try {
        window.dispatchEvent(new CustomEvent('org-units-changed'));
      } catch (e) {
        console.error('Failed to dispatch refresh event:', e);
      }
    }
  };

  const handleNewEntityName = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {setNewEntityName(e.target.value);}, []);
  const handleNewEntityCode = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {setNewEntityCode(e.target.value);}, []);

  const handleCancelSave = useCallback(() => setEditingEntity(null), []);

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-6">
          <Loader2 className="size-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Entity Management</CardTitle>
        <CardDescription>
          Manage organizational entities. Entities represent different business units or companies
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Create New Entity */}
          <div className="border rounded-lg p-4">
            <h3 className="text-lg font-medium mb-4">Add New Entity</h3>
            <div className="grid grid-cols-1 md:flex md:items-end gap-2">
              <div>
                <Label htmlFor="entity-name">Entity Name *</Label>
                <Input
                  id="entity-name"
                  value={newEntityName}
                  onChange={handleNewEntityName}
                  placeholder="e.g., Acme Corp"
                />
              </div>
              <div>
                <Label htmlFor="entity-code">Entity Code</Label>
                <Input
                  id="entity-code"
                  value={newEntityCode}
                  onChange={handleNewEntityCode}
                  placeholder="e.g., ACME"
                />
              </div>
              <div>
                <Label htmlFor="entity-referrer">Is Referrer</Label>
                <div className="flex items-end mt-1">
                <Switch
                  id="entity-referrer"
                  className="w-15 mb-3"
                  checked={newEntityReferrer}
                  onCheckedChange={checked => setNewEntityReferrer(checked)}
                />
                </div>
              </div>
              <div className="flex items-center mb-2 ml-4">
                <Button
                  onClick={handleCreateEntity}
                  disabled={!newEntityName.trim() || isLoading}
                  className="w-12 h-8"
                >
                  {isLoading ? (
                    <Loader2 className="size-4 animate-spin mr-2" />
                  ) : (
                    <Plus className="size-4" />
                  )}
                  {/* Add Entity */}
                </Button>
              </div>
              <div></div>
            </div>
          </div>

          {/* Entities List */}
          <div>
            <h3 className="text-lg font-medium mb-4">Existing Entities</h3>
            {entities.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No entities found. Create your first entity above.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {entities.map((entity) => (
                    <TableRow key={entity.id}>
                      <TableCell>
                        {editingEntity?.id === entity.id ? (
                          <Input
                            value={editingEntity.name}
                            onChange={(e) => setEditingEntity({ ...editingEntity, name: e.target.value })}
                            className="max-w-xs"
                          />
                        ) : (
                          entity.name
                        )}
                      </TableCell>
                      <TableCell>
                        {editingEntity?.id === entity.id ? (
                          <Input
                            value={editingEntity.code}
                            onChange={(e) => setEditingEntity({ ...editingEntity, code: e.target.value })}
                            className="max-w-xs"
                          />
                        ) : (
                          entity.code || '-'
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={entity.is_active ? "default" : "secondary"}
                          className="cursor-pointer"
                          onClick={() => toggleEntityStatus(entity.id, entity.is_active)}
                        >
                          {entity.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={entity.is_referrer ? "default" : "secondary"}
                          className="cursor-pointer"
                          >
                          {entity.is_referrer ? 'Referrer' : 'Food bank'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(entity.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          {editingEntity?.id === entity.id ? (
                            <div>
                              <Button
                                size="sm"
                                onClick={handleUpdateEntity}
                                disabled={isLoading}
                              >
                                {isLoading ? (
                                  <Loader2 className="size-4 animate-spin" />
                                ) : (
                                  'Save'
                                )}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={handleCancelSave}
                              >
                                Cancel
                              </Button>
                            </div>
                          ) : (
                            <div>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setEditingEntity({
                                  id: entity.id,
                                  name: entity.name,
                                  code: entity.code || '',
                                  is_referrer: entity.is_referrer || false
                                })}
                              >
                                <Edit3 className="size-4" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    disabled={isLoading}
                                    size="sm"
                                    variant="outline"
                                    className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                                  >
                                    {deletingEntityId === entity.id ? (
                                      <Loader2 className="size-4 animate-spin" />
                                    ) : (
                                      <Trash2 className="size-4" />
                                    )}
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Entity</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete "{entity.name}"? This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDeleteEntity(entity.id)}
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
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};