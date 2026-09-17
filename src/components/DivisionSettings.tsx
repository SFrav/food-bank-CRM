import { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// import { RefreshCw } from 'lucide-react';
import { useDivisions } from '@/hooks/useDivisions';
import { useEntities } from '@/hooks/useEntities';
import { useDivisionSettings, DivisionSettings } from '@/hooks/useDivisionSettings';
import { useDivisionOpen, DivisionOpen } from '@/hooks/useDivisionOpen';
import { useProfile } from "@/hooks/useProfile";

export const DivisionSettingsTable = () => {
  const { profile } = useProfile();
  const { entities } = useEntities();
  const { divisions, loading: divisionsLoading, refetch: refetchDivisions } = useDivisions();
  const { openMap, loading: openLoading, fetchOpen, updateOpen } = useDivisionOpen();
  const { settingsMap, loading: settingsLoading, fetchSettings, updateSetting } = useDivisionSettings();
  const [filterEntityId, setFilterEntityId] = useState<string>('all');

  useEffect(() => {
    if (divisions) {
      divisions.forEach(d => {
        fetchSettings(d.id);
        fetchOpen(d.id); 
    });
    }
  }, [divisions, fetchSettings, fetchOpen]);

  
  const hourOptions = useMemo(() => {
    const opts: { value: string; label: string }[] = [];
    for (let h = 8; h <= 18.5; h += 0.5) {
      const label = `${Math.floor(h)}:${h % 1 === 0 ? '00' : '30'}${h < 12 ? 'am' : 'pm'}`;
      opts.push({ value: h.toString(), label });
    }
    return opts;
  }, []);

  const entityNames: Record<string, string> = Object.fromEntries(
    entities.filter(e => e.is_active && !e.is_referrer).map(e => [e.id, e.name])
  );

  // const filteredDivisions = filterEntityId === 'all' 
  //   ? [...divisions].sort((a, b) => {
  //       const ea = entityNames[a.entity_id ?? ''] ?? '';
  //       const eb = entityNames[b.entity_id ?? ''] ?? '';
  //       if (ea !== eb) return ea.localeCompare(eb);
  //       return a.name.localeCompare(b.name);
  //     })
  //   : divisions.filter((t) => t.entity_id === filterEntityId);

  const filteredDivisions = useMemo(() => {
    if (profile?.division_id) return divisions.filter((d) => d.id === profile?.division_id);
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

  const rowSettings = (divisionId: string) => settingsMap[divisionId] ?? {};

  const openCount = useCallback((divisionId: string) => {
    return Object.values(openMap[divisionId] ?? {}).filter((o: any) => o.is_open).length;
  }, [openMap]);

  const handleFrequencyChange = async(divisionId: string, value: string) => {
    await fetchOpen(divisionId);
    const raw = Number(value);
    const count = Object.values(openMap[divisionId] ?? {}).filter((o: any) => o.is_open).length;
    const clamped = Math.min(raw, Math.max(0, count));
    await updateSetting(divisionId, 'frequency', String(clamped));
  };

  // const handleRefreshAll = async () => {
  //   await refetchDivisions();
  //   divisions.forEach(d => {
  //       fetchOpen(d.id); 
  //   });
  // };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Branch settings</CardTitle>
            <CardDescription>
              Change branch settings
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">

        <div className="space-y-4">
          {/* Filter by Entity */}
          {profile?.entity_id === null ? (
          <div className="flex items-center gap-2">
            <Select value={filterEntityId} onValueChange={setFilterEntityId}>
              <SelectTrigger className="w-[240px]">
                <SelectValue placeholder="Filter by entity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Entities</SelectItem>
                {entities.filter(e => e.is_active && !e.is_referrer).map((e) => (
                  <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={() => setFilterEntityId('all')}>Reset</Button>
          </div>
          ) : (
            <div></div>
          )}

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Entity Name</TableHead>
                <TableHead>Branch Name</TableHead>
                <TableHead>Allotment Duration (weeks)</TableHead>
                <TableHead>Exclusion Period (weeks)</TableHead>
                <TableHead>Visits Per Week (max)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDivisions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                    No branches found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredDivisions.map(division => {
                  // const count = openCount(division.id)
                  const s = rowSettings(division.id);
                  return (
                    <TableRow key={division.id}>
                      <TableCell>
                        <span className="text-muted-foreground">
                          {entities.find(e => e.id === division.entity_id && e.is_active)?.name ?? '—'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">{division.name}</span>
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min={1}
                          step={1}
                          className="w-[100px]"
                          value={s.allotment_weeks ?? ''}
                          onChange={e => updateSetting(division.id, 'allotment_weeks', e.target.value)}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min={1}
                          step={1}
                          className="w-[100px]"
                          value={s.exclusion_weeks ?? ''}
                          onChange={e => updateSetting(division.id, 'exclusion_weeks', e.target.value)}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min={0}
                          max={7}
                          step={1}
                          className="w-[100px]"
                          value={s.frequency ?? ''}
                          onChange={e =>
                            handleFrequencyChange(division.id, e.target.value)
                          }
                        />
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};