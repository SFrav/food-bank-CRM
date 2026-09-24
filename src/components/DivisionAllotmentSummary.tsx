import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useProfile } from '@/hooks/useProfile';
import { useDivisions } from '@/hooks/useDivisions';
import { useContactAllotmentSummary, WeeklySummary } from '@/hooks/useContactAllotmentSummary';
import { DivisionChart } from '@/components/dashboard/DivisionBeneficiaryChart';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { format, parseISO } from 'date-fns';

export const DivisionAllotmentSummary = () => {
  const { profile } = useProfile();
  const { divisions, loading: divLoading } = useDivisions();
  const{ data: chartData, fetch } = useContactAllotmentSummary();

  const [selectedDivision, setSelectedDivision] = useState<string | null>(
    profile?.division_id ?? null
  );
  // const [chartData, setChartData] = useState([]);

  const filteredDivisions = useMemo(() => {
    if (profile?.division_id) return divisions.filter((d) => d.id === profile?.division_id);
    if (profile?.entity_id) return divisions.filter((d) => d.entity_id ===profile?.entity_id);
    return [];
  }, [profile, divisions]);
;

  const today = new Date();
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(today.getMonth() - 3);

  const [startDate, setStartDate] = useState<Date | undefined>(threeMonthsAgo);
  const [endDate, setEndDate] = useState<Date | undefined>(today);

  // Handlers that convert the raw string from `<input type="date">` into a `Date` object
  const onStartDateSelect = (value: string | undefined) => {
    const d = value ? new Date(value) : undefined;
    setStartDate(d);
  };

  const onEndDateSelect = (value: string | undefined) => {
    const d = value ? new Date(value) : undefined;
    setEndDate(d);
  };

  const handleChartSubmit = async() => {
    if (!selectedDivision) return;
    await fetch(selectedDivision, startDate, endDate);
  };

  

  return (
    <Card>
      <CardHeader>
        <CardTitle>Weekly Referral / Drop‑in Summary</CardTitle>
        <CardDescription>
          View the flow of new cases, drop‑ins, referrals and absences by week.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* 4.1 DIVISION SELECT */}
        {!profile?.division_id && (
          <Select onValueChange={e => setSelectedDivision(e)} value={selectedDivision ?? ''}>
            <SelectTrigger className="w-[240px]">
              <SelectValue placeholder="Select branch" />
            </SelectTrigger>
            <SelectContent>
              {filteredDivisions.map(d => (
                <SelectItem key={d.id} value={d.id}>
                  {d.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        <div className="flex items-center gap-4 flex-wrap">
          {/* START */}
          <div className="flex items-center gap-2">
            <label htmlFor="start-date" className="whitespace-nowrap">
              Start date
            </label>
            <Input
              id="start-date"
              type="date"
              value={startDate ? format(startDate, 'yyyy-MM-dd') : ''}
              onChange={(e) => onStartDateSelect(e.target.value)}
              className="rounded-md border"
            />
          </div>

          {/* END */}
          <div className="flex items-center gap-2">
            <label htmlFor="end-date" className="whitespace-nowrap">
              End date
            </label>
            <Input
              id="end-date"
              type="date"
              value={endDate ? format(endDate, 'yyyy-MM-dd') : ''}
              onChange={(e) => onEndDateSelect(e.target.value)}
              className="rounded-md border"
            />
          </div>
          <Button 
                type="submit" 
                disabled={divLoading}
                onClick={() => handleChartSubmit()}
                className="w-full md:w-auto"
              >
                {divLoading ? 'Updating...' : 'Submit'}
              </Button>
        </div>
        {!divLoading && (
          <DivisionChart data={chartData} />
        )}
      </CardContent>
    </Card>
  );
};