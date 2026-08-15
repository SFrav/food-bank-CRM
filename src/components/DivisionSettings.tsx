import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// import { RefreshCw } from 'lucide-react';
import { useDivisions } from '@/hooks/useDivisions';
import { useEntities } from '@/hooks/useEntities';
import { useDivisionSettings, DivisionSettings } from '@/hooks/useDivisionSettings';

export const DivisionSettingsTable = () => {
  const { entities } = useEntities();
  const { divisions, loading: divisionsLoading, refetch: refetchDivisions } = useDivisions();
  const { settingsMap, loading: settingsLoading, fetchSettings, updateSetting } = useDivisionSettings();
  const [filterEntityId, setFilterEntityId] = useState<string>('all');

  useEffect(() => {
    if (divisions) {
      divisions.forEach(d => fetchSettings(d.id));
    }
  }, [divisions, fetchSettings]);

  
  const hourOptions = useMemo(() => {
    const opts: { value: string; label: string }[] = [];
    for (let h = 8; h <= 18.5; h += 0.5) {
      const label = `${Math.floor(h)}:${h % 1 === 0 ? '00' : '30'}${h < 12 ? 'am' : 'pm'}`;
      opts.push({ value: h.toString(), label });
    }
    return opts;
  }, []);

  const filteredDivisions = filterEntityId === 'all'
    ? divisions
    : divisions.filter(t => t.entity_id === filterEntityId);

  const rowSettings = (divisionId: string) => settingsMap[divisionId] ?? {};

  // const handleRefreshAll = async () => {
  //   await refetchDivisions();
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
          <div className="flex items-center gap-2">
            <Select value={filterEntityId} onValueChange={setFilterEntityId}>
              <SelectTrigger className="w-[240px]">
                <SelectValue placeholder="Filter by entity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Entities</SelectItem>
                {entities.map((e) => (
                  <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={() => setFilterEntityId('all')}>Reset</Button>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Entity Name</TableHead>
                <TableHead>Branch Name</TableHead>
                <TableHead>Allotment Duration (weeks)</TableHead>
                <TableHead>Exclusion Period (weeks)</TableHead>
                <TableHead>Day Serving</TableHead>
                <TableHead>Time Open</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDivisions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                    No branches found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredDivisions.map(division => {
                  const s = rowSettings(division.id);
                  return (
                    <TableRow key={division.id}>
                      <TableCell>
                        <span className="text-muted-foreground">
                          {entities.find(e => e.id === division.entity_id)?.name ?? '—'}
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
                          min={0}
                          step={1}
                          className="w-[100px]"
                          value={s.exclusion_weeks ?? ''}
                          onChange={e => updateSetting(division.id, 'exclusion_weeks', e.target.value)}
                        />
                      </TableCell>
                      <TableCell>
                        <Select
                          value={s.day_offset ?? ''}
                          onValueChange={v => updateSetting(division.id, 'day_offset', v)}
                        >
                          <SelectTrigger className="w-[100px]">
                            <SelectValue placeholder="Select day" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="0">Monday</SelectItem>
                            <SelectItem value="1">Tuesday</SelectItem>
                            <SelectItem value="2">Wednesday</SelectItem>
                            <SelectItem value="3">Thursday</SelectItem>
                            <SelectItem value="4">Friday</SelectItem>
                            <SelectItem value="5">Saturday</SelectItem>
                            <SelectItem value="6">Sunday</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={s.hour_offset ?? ''}
                          onValueChange={v => updateSetting(division.id, 'hour_offset', v)}
                        >
                          <SelectTrigger className="w-[100px]">
                            <SelectValue placeholder="Select time" />
                          </SelectTrigger>
                          <SelectContent>
                            {hourOptions.map(h => (
                              <SelectItem key={h.value} value={h.value}>
                                {h.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
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