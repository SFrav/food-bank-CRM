import { useState, useEffect, useCallback, useMemo } from "react";
import { ShoppingCart, Search, Phone, MapPin, Mail } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useDivisions, Division } from '@/hooks/useDivisions';
import { useDivisionSettings } from '@/hooks/useDivisionSettings';
import { useDivisionOpen } from '@/hooks/useDivisionOpen';
import { useDivisionClosed } from '@/hooks/useDivisionClosed';
import { useProfile } from "@/hooks/useProfile";
import { useEntities } from '@/hooks/useEntities';
import { useRegions } from '@/hooks/useRegions';
import { useCountries } from '@/hooks/useCountries';
import DetailDivisionModal from '@/components/modals/DetailDivision'

export interface DivisionCombined {
  id: string;
  name: string;
  manager_id: string | null;
  head_id: string | null;
  entity_id: string | null;
  street_address: string | null;
  postcode: string | null;
  region_id: string | null;
  is_active: string | null;
  created_at: string;
  fee: string;
  currency: string;
  allotment_weeks: string;
  frequency: string;
  exclusion_weeks: string;
  is_open_sun: boolean;
  is_open_mon: boolean;
  is_open_tue: boolean;
  is_open_wed: boolean;
  is_open_thu: boolean;
  is_open_fri: boolean;
  is_open_sat: boolean;
  nextClosed: string;
}

const Divisions = () => {
  const { profile } = useProfile();
  const { divisions, loading: divisionsLoading, refetch: refetchDivisions } = useDivisions();
  const { openMap, loading: openLoading, fetchOpen } = useDivisionOpen();
  const { settingsMap, loading: settingsLoading, fetchSettings } = useDivisionSettings();
  const { divisionClosed, loading: closedLoading, fetchClosed } = useDivisionClosed();
  const { entities } = useEntities();
  const { regions, refetch: fetchRegions } = useRegions();
  const { countries} = useCountries();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRegionId, setFilterRegionId] = useState<string>('all');
  const [filterEntityId, setFilterEntityId] = useState<string>('all');
  const [selectedDivision, setSelectedDivision] = useState<DivisionCombined>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const entityNames: Record<string, string> = Object.fromEntries(
    entities.filter(e => e.is_active && !e.is_referrer).map(e => [e.id, e.name])
  );

  const filteredDivisions = useMemo(() => {
    return filterEntityId === 'all' && filterRegionId === 'all'
    ? [...divisions].sort((a, b) => {
        const ea = entityNames[a.entity_id ?? ''] ?? '';
        const eb = entityNames[b.entity_id ?? ''] ?? '';
        if (ea !== eb) return ea.localeCompare(eb);
        return a.name.localeCompare(b.name);
      }) :
      filterEntityId === 'all' && filterRegionId !== 'all' 
      ? [...divisions.filter(d => d.region_id === filterRegionId)].sort((a, b) => {
        const ea = entityNames[a.entity_id ?? ''] ?? '';
        const eb = entityNames[b.entity_id ?? ''] ?? '';
        if (ea !== eb) return ea.localeCompare(eb);
        return a.name.localeCompare(b.name);
      })
    : divisions.filter((d) => d.entity_id === filterEntityId);
  }, [profile, divisions, filterEntityId, filterRegionId]);

  const handleSelectedDivision = useCallback(async(division: Division) => {
    if (!profile) return;
    const settings = await fetchSettings(division.id);
    const openHours = await fetchOpen(division.id);
    const closedDates = await fetchClosed(division.id);
    
    const countryId = regions.find(r => r.id === division.region_id)?.country_id ?? ''
    const currency = countries.find(c => c.id === countryId)?.currency_symbol ?? ''

    const getDay = (day: number) => openHours?.[day] ?? { day_of_week: day, is_open: false, open_time: null, close_time: null };

    const current = new Date();
        current.setDate(1); 
    const filteredClosed = closedDates?.filter(entry => new Date(entry.date) >= current && entry.division_id === division.id)
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()) ?? [];
    const nextClosed = filteredClosed.length > 0 ? filteredClosed[0].date : null;

    const divisionCombined: DivisionCombined = {
      ...division,
      fee: settings?.fee ?? '',
      currency: currency,
      allotment_weeks: settings?.allotment_weeks ?? '',
      frequency: settings?.frequency ?? '',
      exclusion_weeks: settings?.exclusion_weeks ?? '',
      is_open_sun: getDay(0).is_open,
      is_open_mon: getDay(1).is_open,
      is_open_tue: getDay(2).is_open,
      is_open_wed: getDay(3).is_open,
      is_open_thu: getDay(4).is_open,
      is_open_fri: getDay(5).is_open,
      is_open_sat: getDay(6).is_open,
      nextClosed
    };
    setSelectedDivision(divisionCombined);
    setIsDetailOpen(true);
  }, [profile, regions, countries])

  const handleClose = useCallback(() => {
    setIsDetailOpen(false);
  }, []);
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex-wrap flex-col sm:flex sm:flex-row sm:justify-between">
            <div className="sm:flex items-center gap-4">
              <div className="relative w-full sm:w-auto">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  placeholder="Search branches …"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="relative w-full mt-2 sm:mt-0 sm:w-auto">
                <div className="flex flex-col">
                  <label className="text-sm">Region:</label>
                  <Select value={filterRegionId} onValueChange={setFilterRegionId}>
                    <SelectTrigger className="w-full sm:w-[120px] sm:h-[15px]">
                      <SelectValue placeholder="Filter by entity" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Regions</SelectItem>
                      {regions.filter(r => r.is_active).map((r) => (
                        <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="relative w-full mt-2 sm:mt-0 sm:w-auto">
                <div className="flex flex-col">
                  <label className="text-sm">Organisation:</label>
                  <Select value={filterEntityId} onValueChange={setFilterEntityId}>
                    <SelectTrigger className="w-full sm:w-[120px] sm:h-[15px]">
                      <SelectValue placeholder="Filter by entity" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Orgs.</SelectItem>
                      {entities.filter(e => e.is_active).map((e) => (
                        <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {divisionsLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading &hellip;</div>
          ) : filteredDivisions && filteredDivisions.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredDivisions.map((division) => (
                <Card key={division.id} className="hover:shadow-md transition-shadow"
                  onClick={() => handleSelectedDivision(division)}>
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <ShoppingCart className="size-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0 mt-2">
                        <h3 className="font-semibold truncate">{division.name}</h3>
                      </div>
                    </div>
                    {division.street_address && (
                      <div className="flex flex-row items-start p-2 gap-2 text-sm">
                          <MapPin className="size-4 text-muted-foreground mt-0.5" />
                          <p className="text-muted-foreground">{`${division.street_address}, 
                                                                ${division.region_id ? regions?.find(r => r.id === division.region_id)?.name : ''}
                                                                ${division.postcode ? `, ${division.postcode}` : ''}`}
                          </p>
                      </div>
                    )}
                    <div className="p-2 mt-1 space-y-2 text-sm">
                      {division.postcode && (
                        <Badge 
                          variant={division.is_active ? "default" : "secondary"}
                          className="cursor-pointer"
                        >
                          {division.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <ShoppingCart className="size-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {searchQuery ? "No Divisions found" : "No divisions yet"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <DetailDivisionModal
        isOpen={isDetailOpen}
        onClose={handleClose}
        division={selectedDivision}
      />
    </div>
  );
};

export default Divisions;
