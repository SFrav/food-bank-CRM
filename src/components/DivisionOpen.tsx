import { useState, useEffect, useCallback, useMemo } from 'react';
import { Plus, Loader2, Trash2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useEntities } from '@/hooks/useEntities';
import { useDivisions, Division } from '@/hooks/useDivisions';
import { useDivisionOpen } from '@/hooks/useDivisionOpen';
import { useDivisionClosed, DivisionClosed } from '@/hooks/useDivisionClosed';
import { useDivisionSettings } from '@/hooks/useDivisionSettings';
import { useProfile } from "@/hooks/useProfile";
import { useToast } from '@/hooks/useToast';
import { format } from 'date-fns';

const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thusday', 'Friday', 'Saturday', 'Sunday'];

export const DivisionOpenTable = () => {
  const { toast } = useToast();
  const { profile } = useProfile();
  const { entities } = useEntities();
  const { divisions, loading: divisionsLoading } = useDivisions();
  const { fetchSettings } = useDivisionSettings();
  const { openMap, loading: openLoading, fetchOpen, updateOpen } = useDivisionOpen();
  const { divisionClosed, loading: closedLoading, fetchClosed, createClosed, updateClosed, deleteClosed } = useDivisionClosed();
  const [creatingClosed, setCreatingClosed] = useState(false);
  const [addClosedDate, setAddClosedDate] = useState(new Date());
  const [addingDate, setAddingDate] = useState(false);
  const [selectedDivisionId, setSelectedDivisionId] = useState<string | null>(null);
  const [filterEntityId, setFilterEntityId] = useState<string>('all');

  const entityNames: Record<string, string> = Object.fromEntries(
    entities.filter(e => e.is_active && !e.is_referrer).map(e => [e.id, e.name])
  );

  const filteredDivisions = useMemo(() => {
    if (profile?.division_id) return divisions.filter((d) => d.id === profile?.division_id);
    if (profile?.entity_id) return divisions.filter((d) => d.entity_id === profile?.entity_id);
    return filterEntityId === 'all' 
    ? [...divisions].sort((a, b) => {
        const ea = entityNames[a.entity_id ?? ''] ?? '';
        const eb = entityNames[b.entity_id ?? ''] ?? '';
        if (ea !== eb) return ea.localeCompare(eb);
        return a.name.localeCompare(b.name);
      })
    : divisions.filter((d) => d.entity_id === filterEntityId);
  }, [profile, divisions, filterEntityId]);

  const filteredClosedDates = useMemo(() => {
    if (divisionClosed) {
      const current = new Date();
      current.setDate(1); 
      return divisionClosed
        .filter(entry => new Date(entry.date) >= current)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }
  },[divisionClosed])

  useEffect(() => {
    if (filteredDivisions) {
      filteredDivisions.forEach(d => {
        fetchOpen(d.id); 
        fetchClosed(d.id);
      });
    }
  }, [filteredDivisions, fetchOpen, fetchClosed]);

  const handleUpdateOpen = async(divisionId: string, dayIdx: number, is_open: boolean, open_time: string, close_time: string) => {
    await updateOpen(divisionId, dayIdx, is_open, open_time, close_time);
    await fetchSettings(divisionId);
  };

  const formatTime = (t: string | null) => t ? t.slice(0, 5) : '';

  const rowOpeningHours = (divisionId: string, day: number) =>
    openMap[divisionId]?.[day] ?? { day_of_week: day, is_open: false, open_time: null, close_time: null };

  const handleAddClosedDate = async(divisionId: string, date) => {
    setSelectedDivisionId(divisionId);
    setAddClosedDate(new Date((date.target as HTMLInputElement).value));
    setAddingDate(true);
  };

  const roundToNearestQuarter = (date: Date) => {
    const ms = 15 * 60 * 1000;          // 15 minutes in ms
    return new Date(Math.round(date.getTime() / ms) * ms);
  };
  
  const handleCreateClosed = async (div: Division) => {
    if (!div) return;
    if (addClosedDate < new Date()) {
      toast({
          title: 'Error', description: 'Choose a future date. Past closures are not recorded', variant: 'destructive',
        });
      return;
    }
    const dayIndex = (addClosedDate.getDay() + 6) % 7; // Adjust for Monday=0
    const isOpen = openMap[div.id]?.[dayIndex]?.is_open;
    if (!isOpen) {
      toast({title: 'Error', description: 'Choose a date when the branch will be open', variant: 'destructive',});
      return;
    }
    // const isDuplicate = filteredClosedDates[div.id]?.[addClosedDate]?.date;
    const isDuplicate = divisionClosed.some(c => c.division_id === div.id && c.date.slice(0, 10) === addClosedDate.toISOString().slice(0, 10))
    if (isDuplicate) {
      toast({title: 'Error', description: 'Date already marked as closed', variant: 'destructive',});
      return;
    }
    setCreatingClosed(true);
    const dateISO = roundToNearestQuarter(new Date(addClosedDate)).toISOString();
    // dateISO = roundToNearestQuarter(dateISO);
    const {success } = await createClosed(div.id, dateISO);
    if (success) {// fetchClosed(div.id);
      await fetchClosed(div.id);
    }
    setAddClosedDate(new Date());
    setCreatingClosed(false);
  };

  // const handleUpdateClosed = async (division_id, date) => {
  //   await updateClosed(division_id, date);
  // };

  const handleDeleteClosed = async (row: DivisionClosed) => {
    const {success } = await deleteClosed(row.id);
    if (success) await fetchClosed(row.division_id);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Branch Operating Hours</CardTitle>
        <CardDescription>
          Set opening days and hours. 
        </CardDescription>
      </CardHeader>
      <CardContent>
        <span className="text-xs text-muted-foreground">NB: reducing the number of days open will automatically change the maximum visits per week and all current pending referrals. 
          Active referrals will retain their visit frequency</span>
        {profile?.entity_id === null ? (
          <div className="flex items-center gap-2 mb-5">
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
          </div> ) : (
            <div className="mb-0"></div>
          )}
        {/* <div className="grid gap-1 md:grid-cols-1 lg:grid-cols-1"> */}
          {filteredDivisions?.map(d => (
            <div className="flex flex-row">
            <Card key={d.id} className="w-[80%]">
              <CardHeader>
                {/* <CardTitle></CardTitle> */}
                <CardDescription className="text-full">{d.name}</CardDescription>
              </CardHeader>
              <CardContent>
                {/* <div className="items-end"> */}
                <div className="grid grid-cols-7 text-sm mb-1"> 
                  {DAY_NAMES.map((day, dayIdx) => (
                    <label key={dayIdx} > 
                      {day}
                    </label> 
                  ))}
                </div>
                <div className="grid grid-cols-7 mb-1 ">
                  {DAY_NAMES.map((day , dayIdx) => (
                    <Switch
                      key={dayIdx}
                      checked={rowOpeningHours(d.id, dayIdx).is_open}
                      disabled={openLoading}
                      onCheckedChange={(checked) => handleUpdateOpen(
                        d.id,
                        dayIdx,
                        checked,
                        rowOpeningHours(d.id, dayIdx).open_time,
                        rowOpeningHours(d.id, dayIdx).close_time
                      )}
                      className="w-11"
                    />
                  ))}
                </div>

                <div className="grid grid-cols-7">
                  {DAY_NAMES.map((_, dayIdx) => {
                    const data = rowOpeningHours(d.id, dayIdx);
                    return (
                      <div className="flex gap-1" key={dayIdx}>
                        <div className="px-1 border-r tabIndex={-1}">
                        <label className="text-sm"> 
                          Open
                        </label>
                        <Input
                          type="time"
                          value={formatTime(data.open_time)}
                          onChange={(e) => {
                            handleUpdateOpen(d.id, dayIdx, data.is_open, e.target.value, data.close_time)}
                          }
                          className="size-9 p-2"
                        />
                        </div>
                        <div>
                        <label className="text-sm"> 
                          Close
                        </label>
                        <Input
                          type="time"
                          value={formatTime(data.close_time)}
                          onChange={(e) => {
                            handleUpdateOpen(d.id, dayIdx, data.is_open, data.open_time, e.target.value)}
                          }
                          className="size-9 p-2"
                        />
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                {/* </div> */}
              </CardContent>
            </Card>
            <Card className="w-[20%]">
              <CardHeader>
                {/* <CardTitle></CardTitle> */}
                <CardDescription >
                  <Input
                    id="add-date"
                    name="add_date"
                    type="date"
                    value={addClosedDate?.toISOString().slice(0, 10)}
                    onChange={(e) => handleAddClosedDate(d.id, e)}
                    className="size-9 p-2"
                  />
                </CardDescription>      
              </CardHeader>  
              <label className="text-sm text-muted-foreground ml-8.5 mb-5">
                Scheduled closures
              </label>
              <CardContent className="max-h-[100px] overflow-y-auto">
                  {filteredClosedDates.filter(c => c.division_id === d.id).length === 0 ? (
                    <span className="flex text-sm text-center align-center text-muted-foreground">
                      Click button to add (+)
                    </span>
                ) : (
                  filteredClosedDates.filter(c => c.division_id === d.id).map((closed) => (
                    <div key={closed.id} className="flex justify-between border-t border-b">
                      <span className="text-sm text-muted-foreground">
                        {format(closed.date, "dd-MM-yyyy")}
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        className="size-4 text-destructive hover:bg-destructive hover:text-destructive-foreground"
                        onClick={(e) => handleDeleteClosed(closed)} disabled={closedLoading}
                      >     
                        <Trash2 className="size-1" />
                      </Button>
                    </div>

                  ))
              )}
               </CardContent>
               <CardFooter>
                {addingDate && selectedDivisionId === d.id && (
                  <div className="grid grid-col-1">
                  <span className="text-xs text-muted-foreground"> Add: {format(addClosedDate, "dd-MM-yyyy")} </span>
                  <Button className="size-9" onClick={() => handleCreateClosed(d)} disabled={creatingClosed}>
                    {creatingClosed ? (
                      <Loader2 className="size-4 animate-spin mr-2" />
                    ) : (
                      <Plus className="size-4" />
                    )}
                  </Button>
                  </div>
                )}
                </CardFooter>
            </Card> 
            </div>
          ))}
        {/* </div> */}
      </CardContent>
    </Card>
  );
};