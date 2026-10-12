
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Printer } from 'lucide-react';
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
import { useContactAllotmentSummary } from '@/hooks/useContactAllotmentSummary';
import { usePrintSlip } from '@/hooks/usePrintSlip';
import { ContactFormData } from '@/components/modals/EditContact';
import { useProfile } from "@/hooks/useProfile";
import { useReferrerRating, ReferrerRating } from "@/hooks/useReferrerRating";
import AddReferrerRating from '@/components/modals/subcomponents/AddReferrerRating'
import EditReferrerRating from '@/components/modals/subcomponents/EditReferrerRating'


interface ContactEditAllotmentProps {
  isOpen: boolean;
  contact: Contact | null; 
  formData: ContactFormData;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleSubmit?: () => void;
  isLoading: boolean;
  isLoadingAllotment: boolean; 
  // isLoadingSummary: boolean;
  isDirty: boolean;
  handleMarkServing: (entryId: string) => Promise<void>;
  handleToggleInfant: () => Promise<void>;
  handleToggleAllergies: () => Promise<void>;
  handleToggleVegetarian: () => Promise<void>;
  handleToggleHallal: () => Promise<void>;
  handleAddAllotment: (v: string) => Promise<void>;
  allotment: ContactAllotment[];
  // queueNumber: number;
  newAllotmentType: string;
  // setNewAllotmentType: React.Dispatch<React.SetStateAction<string>>;
  newAllotmentNote: string;
  setNewAllotmentNote: React.Dispatch<React.SetStateAction<string>>;
  handleMarkAttended: (entryId: string) => Promise<void>;
  handleMarkServed: (entryId: string) => Promise<void>;
}

 
const ContactEditAllotment: React.FC<ContactEditAllotmentProps> = ({
  isOpen,
  contact,
  formData,
  handleInputChange,
  handleSubmit,
  isLoading,
  isLoadingAllotment,
  // isLoadingSummary,
  isDirty,
  handleMarkServing,
  handleToggleInfant,
  handleToggleAllergies,
  handleToggleVegetarian,
  handleToggleHallal,
  handleAddAllotment,
  allotment,
  // queueNumber,
  newAllotmentType,
  // setNewAllotmentType,
  handleMarkAttended,
  handleMarkServed,
}) => {
  const { profile } = useProfile();
  const { divisions } = useDivisions();
  const { settingsMap, fetchSettings } = useDivisionSettings();
  const { ratings, loading: loadingRatings, fetchRatings } = useReferrerRating();
  const { data: allotmentSummary, fetch: fetchSummary, loading: loadingSummary } = useContactAllotmentSummary();
  const { printSlip } = usePrintSlip();
  const [divId, setDivId] = useState('');
  const [showAll, setShowAll] = useState(false);
  const [isAddRateReferrerOpen, setIsAddRateReferrerOpen] = useState(false);
  const [isEditRateReferrerOpen, setIsEditRateReferrerOpen] = useState(false);
  const [ratingInactive, setRatingInactive] = useState(true);
  const [filteredRatings, setFilteredRatings] = useState([]);

  const callerReferrer = profile?.role === 'referrer';

  const divisionSettings = settingsMap[divId || ''] ?? {}; 
  const allotmentWeeks = parseInt(divisionSettings.allotment_weeks ?? '0', 10);
  const exclusionWeeks = parseInt(divisionSettings.exclusion_weeks ?? '0', 10);
  const visibleMonths = Math.max(3, Math.ceil((allotmentWeeks + exclusionWeeks) / 4));

  // const entryUpdate = useMemo(() => {
  //   fetchAllotment();
  //   return allotment;
  // }, [allotment, handleMarkServing])

  useEffect(() => {
    if (!contact || !isOpen) return;
    const div = String(divisions.filter((d) => d.manager_id === contact.owner_id).map(d => (d.id))); 
    setDivId(div);

    if (div && !settingsMap[div]) {
      fetchSettings(div);
    }
  }, [contact, divisions]);

  const currentWeekStart = (() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - d.getDay() + 1);
    return d;
  })();

  useEffect(() => {
    if(!contact?.id || !allotment || allotment.length === 0 || !isOpen) return; 
    const today = new Date();
    const tomorrow = new Date();
    today.setTime(1);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const todayAllotment = allotment.find(entry => new Date(entry.date) >= today && new Date(entry.date) < tomorrow);
    if (!todayAllotment) return;
    console.log(todayAllotment);
    const div = todayAllotment?.division_id;
    // new Promise(f => setTimeout(f, 1000));
    const latestSummary = Object.values(allotmentSummary)[0];
    if (latestSummary?.week_start) {
      const latestWeek = new Date(latestSummary.week_start);
      if (latestWeek.toDateString() === currentWeekStart.toDateString()) return;
    };
    fetchSummary(div, new Date(), tomorrow);
  }, [contact?.id, allotment]);

  const queueNumber = useMemo(() => {
    const sum = Object.values(allotmentSummary);
    return (sum[0]?.referrals || 0) + (sum[0]?.dropins || 0)
  }, [allotmentSummary]);

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
  
  useEffect(() => {
    if (!contact || !profile || !lastAllotment || !isOpen) return; //|| isAddRateReferrerOpen
    fetchRatings(lastAllotment.referrer_id);
    if (!loadingRatings) {
      setRatingInactive(!ratings.some(r => r.is_referrer));
      setFilteredRatings(ratings.filter(r => r.contact_id === contact.id && r.rater_id === profile.user_id));
    }
  }, [contact, profile, lastAllotment, loadingRatings, isAddRateReferrerOpen]);

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
                    Visit {entry.visit_num ?? '-'} on {entryDate}
                  </span>
                    {todayMatch && (
                      <div className="flex items-center gap-1 justify-end mr-5">
                      <Checkbox
                        checked={entry.attended ?? false}
                        disabled={isLoadingAllotment}
                        onCheckedChange={() => !entry.attended && handleMarkAttended(entry.allotment_id)}
                      />
                      <Printer
                        className={`${todayMatch && entry.attended && !entry.serving && !entry.served ? 
                          "size-4 cursor-pointer text-muted-foreground hover:text-foreground" : "size-4 invisible"}`}
                          
                        onClick={() => printSlip({
                          queueNumber,
                          name: contact?.name || '',
                          adults: formData.adults || 0,
                          childrenGt16: formData.children_gt16 || 0,
                          childrenLt16: formData.children_lt16 || 0,
                          infant: contact?.infant || false,
                          allergies: contact?.allergies || false,
                          vegetarian: contact?.vegetarian || false,
                          hallal: contact?.hallal || false
                        })}
                      />
                      </div>
                    )} 
                  <div className="flex justify-center">
                    {todayMatch && (
                      <Checkbox
                        checked={entry.serving ?? false}
                        disabled={isLoadingAllotment}
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
                          disabled={!(entry.serving) && isLoadingAllotment}
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
                disabled={isLoadingAllotment || callerReferrer}
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
          <div className="grid grid-cols-1 text-sm w-full"> 
            {lastAllotment?.referrer_name ? (
            <span className="sm:table-cell sm:max-w-full">
              Last referred by: {lastAllotment?.referrer_name}{' '}
              {filteredRatings.length > 0 ? (
                <a
                  className="text-primary cursor-pointer hover:underline"
                  onClick={() => setIsEditRateReferrerOpen(true)}
                  hidden={callerReferrer || ratingInactive}
                >
                  (update referrer rating)
                </a>
              ) : (
                <a
                  className="text-primary cursor-pointer hover:underline"
                  onClick={() => setIsAddRateReferrerOpen(true)}
                  hidden={callerReferrer || ratingInactive}
                >
                  (rate referrer)
                </a>
              )}
            </span>
          ) : (
            <span>  </span>
          )}
          {lastAllotment?.approver_name ? (
            <span className="sm:table-cell sm:max-w-full">
              Last approved by: {lastAllotment?.approver_name}
            </span>
          ) : (
            <span></span>
          )}
        </div>
      </div>
    </form>
    <AddReferrerRating
      isOpen={isAddRateReferrerOpen}
      onClose={() => setIsAddRateReferrerOpen(false)}
      referrerId={lastAllotment?.referrer_id ?? ''}
      contactId={contact?.id ?? ''}
    />
    <EditReferrerRating
      isOpen={isEditRateReferrerOpen}
      onClose={() => setIsEditRateReferrerOpen(false)}
      filteredRatings={filteredRatings[0]}
      referrerId={lastAllotment?.referrer_id ?? ''}
      contactId={contact?.id ?? ''}
    />
    </div>
    
  );
};

export default ContactEditAllotment;