import { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useEntities } from '@/hooks/useEntities';
import { useEntitySettings, EntitySettings } from '@/hooks/useEntitySettings';

export const EntitySettingsTable = () => {
  const { entities } = useEntities();
  const { settingsMap, fetchSettings, updateSetting } = useEntitySettings();

  useEffect(() => {
    if (entities) {
      entities.forEach(d => fetchSettings(d.id));
    }
  }, [entities, fetchSettings]);

    const rowSettings = (entityId: string) => settingsMap[entityId] ?? {};

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Entity settings</CardTitle>
            <CardDescription>
              Change settings on approvals and notifications
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Entity Name</TableHead>
                <TableHead>Referrer Request</TableHead>
                <TableHead>Contact Notify</TableHead>
                <TableHead>Contact Approve</TableHead>
                <TableHead>Contact Ban</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entities.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                    No entities found.
                  </TableCell>
                </TableRow>
              ) : (
                entities.map(entity => {
                  const s = rowSettings(entity.id);
                  return (
                    <TableRow key={entity.id}>
                      <TableCell>
                        <span className="text-muted-foreground">
                          {entity.name}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={s.referrer_request ?? ''}
                          onValueChange={v => updateSetting(entity.id, 'referrer_request', v)}
                        >
                          <SelectTrigger className="w-[100px]">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="head">Head</SelectItem>
                            <SelectItem value="manager">Manager</SelectItem>
                            <SelectItem value="branch_manager">Branch Manager</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Select
                            value={s.contact_notify ?? ''}
                            onValueChange={v => updateSetting(entity.id, 'contact_notify', v)}
                          >
                            <SelectTrigger className="w-[100px]">
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="head">Head</SelectItem>
                              <SelectItem value="manager">Manager</SelectItem>
                              <SelectItem value="branch_manager">Branch Manager</SelectItem>
                            </SelectContent>
                          </Select>
                      </TableCell>
                      <TableCell>
                        <Select
                            value={s.contact_approve ?? ''}
                            onValueChange={v => updateSetting(entity.id, 'contact_ban', v)}
                          >
                            <SelectTrigger className="w-[100px]">
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="head">Head</SelectItem>
                              <SelectItem value="manager">Manager</SelectItem>
                              <SelectItem value="branch_manager">Branch Manager</SelectItem>
                              <SelectItem value="staff">Staff</SelectItem>
                              <SelectItem value="volunteer">Volunteer</SelectItem>
                            </SelectContent>
                          </Select>
                      </TableCell>
                      <TableCell>
                        <Select
                            value={s.contact_ban ?? ''}
                            onValueChange={v => updateSetting(entity.id, 'contact_ban', v)}
                          >
                            <SelectTrigger className="w-[100px]">
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="head">Head</SelectItem>
                              <SelectItem value="manager">Manager</SelectItem>
                              <SelectItem value="branch_manager">Branch Manager</SelectItem>
                            </SelectContent>
                          </Select>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
      </CardContent>
    </Card>
  );
};