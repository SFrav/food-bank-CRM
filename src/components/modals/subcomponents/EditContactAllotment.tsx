
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
// import { PermissionGuard } from '@/components/PermissionGuard';
import { useDivisions, Division } from '@/hooks/useDivisions';
import { useDivisionSettings } from '@/hooks/useDivisionSettings';
import { Contact } from '@/hooks/useContacts';
import { ContactAllotment } from '@/hooks/useContactAllotment';
import { ContactFormData } from '@/components/modals/EditContact';


interface ContactEditAllotmentProps {
  contact: Contact | null; 
  formData: ContactFormData;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleSubmit?: () => void;
  isLoading: boolean;
  isDirty: boolean;
  handleMarkServing: (entryId: string) => Promise<void>;
  handleToggleInfant: () => Promise<void>;
  handleToggleAllergies: () => Promise<void>;
  handleToggleVegetarian: () => Promise<void>;
  handleToggleHallal: () => Promise<void>;
  handleAddAllotment: (v: string) => Promise<void>;
  loadingAllotment: boolean; 
  allotment: ContactAllotment[];
  newAllotmentType: string;
  // setNewAllotmentType: React.Dispatch<React.SetStateAction<string>>;
  newAllotmentNote: string;
  setNewAllotmentNote: React.Dispatch<React.SetStateAction<string>>;
  handleMarkAttended: (entryId: string) => Promise<void>;
  handleMarkServed: (entryId: string) => Promise<void>;
}

 
const ContactEditAllotment: React.FC<ContactEditAllotmentProps> = ({
  contact,
  formData,
  handleInputChange,
  handleSubmit,
  isLoading,
  isDirty,
  handleMarkServing,
  handleToggleInfant,
  handleToggleAllergies,
  handleToggleVegetarian,
  handleToggleHallal,
  handleAddAllotment,
  loadingAllotment,
  allotment,
  newAllotmentType,
  // setNewAllotmentType,
  handleMarkAttended,
  handleMarkServed,
}) => {
  const { divisions } = useDivisions();
  const { settingsMap, fetchSettings } = useDivisionSettings();
  const [divId, setDivId] = useState('');
  const [showAll, setShowAll] = useState(false);

  const divisionSettings = settingsMap[divId || ''] ?? {}; 
  const allotmentWeeks = parseInt(divisionSettings.allotment_weeks ?? '0', 10);
  const exclusionWeeks = parseInt(divisionSettings.exclusion_weeks ?? '0', 10);
  const visibleMonths = Math.max(3, Math.ceil((allotmentWeeks + exclusionWeeks) / 4));

  // const entryUpdate = useMemo(() => {
  //   fetchAllotment();
  //   return allotment;
  // }, [allotment, handleMarkServing])

  useEffect(() => {
    if (!contact) return;
    const div = String(divisions.filter((d) => d.manager_id === contact.owner_id).map(d => (d.id))); 
    setDivId(div);

    if (div && !settingsMap[div]) {
      fetchSettings(div);
    }
  }, [contact, divisions, fetchSettings]);

  const displayedAllotment = useMemo(() => {
    if (!allotment) return [];
    const arr = [...allotment];
    if (showAll) {
      return arr.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }
    const allotmentRecent = new Date();
    allotmentRecent.setDate(1); 
    allotmentRecent.setMonth(allotmentRecent.getMonth() - visibleMonths); 
    return arr
      .filter(entry => new Date(entry.date) >= allotmentRecent)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [allotment, showAll, visibleMonths]);

  const lastAllotment = useMemo<ContactAllotment | undefined>(() => {
    if (!allotment || allotment.length === 0) return undefined;
    
    const sortedAllotment = [...allotment].sort((a, b) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime(); 
    });
    return sortedAllotment[0] ?? undefined;
  }, [allotment]);

  const normalizeDate = (d: string | Date) => {
    const n = new Date(d);
    n.setHours(0, 0, 0, 0);
    return n;
  };

  const isRecent = (dateStr: string): boolean => {
    const d = normalizeDate(dateStr);
    const n = new Date(); 
    n.setHours(0, 0, 0, 0);
    const limit = new Date(n);
    limit.setDate(n.getDate() + 2);
    return d >= n && d <= limit;
  };

  const today = useMemo(() => new Date().toLocaleDateString('en-GB'), []);

  // const enrichedAllotments = useMemo(() => allotment.map(a => ({ ...a, _d: normalizeDate(a.date) })), [allotment]);

  //  const currentAllotment = useMemo(() => {
  //    const recent = enrichedAllotments
  //      .filter(a => {
  //        const n = new Date(); n.setHours(0,0,0,0);
  //        const limit = new Date(n); limit.setDate(n.getDate() + 2);
  //        return a._d >= n && a._d <= limit;
  //      })
  //      .sort((a, b) => b._d.getTime() - a._d.getTime());
  //    return recent[0] ?? null;
  //  }, [enrichedAllotments]);

  //  const isServed = useMemo(() => {
  //    return enrichedAllotments.some(a => a.served && new Date(a.date).toLocaleDateString('en-GB') === today);
  //  }, [enrichedAllotments, today]);

  const handleShowScope = useCallback((v: string) => {setShowAll(v === 'all')}, []);
  

  return (
    <div>
    <div className="flex items-center justify-between px-4 py-2 border-b">
      <div className="flex items-center text-sm gap-2">
        <span className="font-sm">{contact?.name ?? 'Contact'}</span>
        
        </div>
          <Select
            value={showAll ? 'all' : 'current'}
            onValueChange={handleShowScope}
          >
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="current">Current only</SelectItem>
              <SelectItem value="all">All</SelectItem>
            </SelectContent>
          </Select>
      </div>
      {contact && (
          <div className="flex flex-col gap-2">
            <div className="grid grid-cols-4 gap-4 py-4 border-b">  
              <div>
                <Label htmlFor="adults">Adults (≥18)</Label>             
                <Input
                  type="number"
                  name="adults"
                  min={1}
                  value={formData.adults ?? ''}
                  onChange={handleInputChange}
                  placeholder="Adults"
                  className="w-full"
                />
              </div>
              <div>
                <Label htmlFor="children_gt16">Children (≥16)</Label>
                <Input
                  type="number"
                  name="children_gt16"
                  min={0}
                  value={formData.children_gt16 ?? ''}
                  onChange={handleInputChange}
                  placeholder="Children ≥16"
                  className="w-full"
                />
              </div>
              <div>
                <Label htmlFor="adults">Children ({'<16'})</Label>
                <Input
                  type="number"
                  name="children_lt16"
                  min={0}
                  value={formData.children_lt16 ?? ''}
                  onChange={handleInputChange}
                  placeholder="Children <16"
                  className="w-full"
                />
              </div>
                <Button type="submit" onClick={handleSubmit} 
                  className="mt-5.5"
                  disabled={isLoading || !isDirty}>
                  {isLoading ? 'Saving…' : 'Save'}
                </Button>
            </div>

            <div className="flex flex-wrap gap-2 py-4 border-b">
              <Badge
                variant={contact.infant ? 'default' : 'secondary'}
                className="cursor-pointer"
                onClick={() => handleToggleInfant()}
              >
                Infant: {contact.infant ? 'Yes' : 'No'}
              </Badge>

              <Badge
                variant={contact.allergies ? 'default' : 'secondary'}
                className="cursor-pointer"
                onClick={() => handleToggleAllergies()}
              >
                Allergies: {contact.allergies ? 'Yes' : 'No'}
              </Badge>

              <Badge
                variant={contact.vegetarian ? 'default' : 'secondary'}
                className="cursor-pointer"
                onClick={() => handleToggleVegetarian()}
              >
                Vegetarian: {contact.vegetarian ? 'Yes' : 'No'}
              </Badge>

              <Badge
                variant={contact.hallal ? 'default' : 'secondary'}
                className="cursor-pointer"
                onClick={() => handleToggleHallal()}
              >
                Hallal: {contact.hallal ? 'Yes' : 'No'}
              </Badge>
            </div>
          </div>
          
        )}
        
    <form className="space-y-4">
      <div className="min-h-[50dvh]">
          <div>
            {displayedAllotment.length === 0 ? (
              <p>No recent allotment</p>
            ) : (
            <div className="grid grid-cols-4 text-sm text-center gap-0 mb-2 max-w-[400px] py-4 border-b">
              <p className="invisible">  </p>
              <span> Attended </span>
              <span> Serving </span>
              <span> Served </span>
            </div>
            )}
            {displayedAllotment.map(entry => {
              const entryDate = new Date(entry.date).toLocaleDateString('en-GB');
              const isPast = new Date(entry.date) < new Date();
              const muted = isPast || entry.served;
              const todayMatch =
                new Date(entry.date).toLocaleDateString('en-GB') === today;
              return (
                <div
                  key={entry.allotment_id}
                  className={`grid grid-cols-4 text-sm items-center gap-0 mb-2 max-w-[400px] 
                    ${muted ? 'text-muted-foreground' : ''}`}
                >
                  <span>
                    Visit {entry.visit_num} on {entryDate}
                  </span>
                  <div className="flex justify-center">
                    {todayMatch && (
                      <Checkbox
                        checked={entry.attended ?? false}
                        disabled={loadingAllotment}
                        onCheckedChange={() => !entry.attended && handleMarkAttended(entry.allotment_id)}
                      />
                    )}
                  </div>
                  <div className="flex justify-center">
                    {todayMatch && (
                      <Checkbox
                        checked={entry.serving ?? false}
                        disabled={loadingAllotment}
                        onCheckedChange={() => {
                          // if (entry.serving) return;
                          handleMarkServing(entry.allotment_id);
                        }}
                      />
                    )}
                  </div>
                  {!isPast ? (
                    <div className="flex justify-center">
                      <span> </span>
                    </div>
                  ) : (
                    <div className="flex justify-center">
                      {isRecent(entry.date) ? ( 
                        <Checkbox
                          checked={entry.served ?? false}
                          onCheckedChange={() => !entry.served && handleMarkServed(entry.allotment_id)}
                          disabled={!(entry.serving) && loadingAllotment}
                        />
                      ) : (
                        // If not in the 5‑day window, show the checkbox disabled
                        <Checkbox checked={entry.served ?? false} disabled />
                      )}
                    </div>
                  )}
                </div>
              );
            })}
            <div className="mt-4 py-4 border-t">
              <Label htmlFor="new-type">Add discretionary visit for today</Label>
              <Select
                value={newAllotmentType}
                onValueChange={v => handleAddAllotment(v)}
                disabled={loadingAllotment}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent >
                  <SelectItem value="referral">Rescheduled</SelectItem>
                  <SelectItem value="drop_in">Drop‑in</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
      </div>
    </form>
    <div className="grid grid-cols-1 text-sm w-full"> 
      {lastAllotment?.referrer_name ? (
        <span className="sm:table-cell sm:max-w-full">
          Last referred by: {lastAllotment?.referrer_name}
        </span>
      ) : (
        <span>  </span>
      )}
      {lastAllotment?.approver_name ? (
        <span className="sm:table-cell sm:max-w-full">
          Last approved: {lastAllotment?.approver_name}
        </span>
      ) : (
        <span></span>
      )}
    </div>
    </div>
  );
};

export default ContactEditAllotment;