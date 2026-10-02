import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useProfile } from '@/hooks/useProfile';
import { useReferrerAllotmentSummary, ReferrerWeeklySummary } from '@/hooks/useReferrerAllotmentSummary';
import { ReferrerBeneficiaryChart } from '@/components/dashboard/ReferrerBeneficiaryChart';
import { Input } from '@/components/ui/input';
// import { cn } from '@/lib/utils';
import { format, parseISO } from 'date-fns';

export const ReferrerAllotmentSummary = () => {
  const { profile } = useProfile();

  const [mode, setMode] = useState<'caller' | 'entity'>('caller');
  const { data: chartData, fetch, loading } = useReferrerAllotmentSummary(mode);
  const [isSingleUser, setIsSingleUser] = useState(true)

  useEffect(() => {
    if (!profile || !chartData) return;
    setIsSingleUser((chartData.length > 0 ? chartData[0].workforce : 0) <= 1)
  }, [profile, chartData?.length]);

  const today = new Date();
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(today.getMonth() - 3);

  const [startDate, setStartDate] = useState<Date | undefined>(threeMonthsAgo);
  const [endDate, setEndDate] = useState<Date | undefined>(today);

  const onStartDateSelect = (value: string | undefined) => {
    const d = value ? new Date(value) : undefined;
    setStartDate(d);
  };

  const onEndDateSelect = (value: string | undefined) => {
    const d = value ? new Date(value) : undefined;
    setEndDate(d);
  };

  const handleChartSubmit = async() => {
    await fetch(startDate, endDate);
  };

  // const isSingleUser = useMemo(() => {
  //   if (!profile || ! chartData) return true;
  //   return (chartData.length > 0 ? chartData[0].workforce : 0) <= 1;
  // }, [profile, chartData?.length]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Referral Summary</CardTitle>
        <CardDescription>
          View referrals and absences by week
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <Select onValueChange={(e) => !isSingleUser && setMode(e as 'caller' | 'entity')} value={mode} disabled={isSingleUser}>
          <SelectTrigger className="w-[240px]">
            <SelectValue placeholder="Select own or organisation-wide referrals" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem key="caller" value="caller">My referrals</SelectItem>
            <SelectItem key="entity" value="entity">Organisation-wide</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <label htmlFor="start-date" className="whitespace-nowrap">Start date</label>
            <Input
              id="start-date"
              type="date"
              value={startDate ? format(startDate, 'yyyy-MM-dd') : ''}
              onChange={(e) => onStartDateSelect(e.target.value)}
              className="rounded-md border"
            />
          </div>

          <div className="flex items-center gap-2">
            <label htmlFor="end-date" className="whitespace-nowrap">End date</label>
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
            disabled={loading}
            onClick={handleChartSubmit}
            className="w-full md:w-auto"
          >
            {loading ? 'Updating...' : 'Submit'}
          </Button>
        </div>

        {isSingleUser && (
          <div className="text-sm text-muted-foreground p-2 bg-muted rounded-md">
          </div>
        )}

        {!loading && (
          <ReferrerBeneficiaryChart data={chartData} />
        )}
      </CardContent>
    </Card>
  );
};