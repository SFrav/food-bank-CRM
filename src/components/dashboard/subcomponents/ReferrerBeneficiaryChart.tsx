import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AreaChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp } from 'lucide-react';
import { ReferrerWeeklySummary } from '@/hooks/useReferrerAllotmentSummary';
import { format, parseISO } from 'date-fns';

interface ReferrerChartProps {
  data?: ReferrerWeeklySummary[];
}

export const ReferrerBeneficiaryChart = ({ data = [] }: ReferrerChartProps) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const chartData = data.map(d => {
    const weekStart = parseISO(d.week_start);
    const isFuture = weekStart > today;
    return {
      week: d.week_start,
      weekFormatted: format(d.week_start, 'MM-dd'),
      cases: Number(d.cases),
      attended: isFuture ? 0 : Number(d.referrals),
      absent: isFuture ? 0 : Number(d.absent),
    };
  });

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload) return null;
    return (
      <div className="bg-popover border rounded-lg p-3 shadow-lg">
        <p className="font-medium">{label}</p>
        {payload.map((p: any, i: number) => (
          <p key={i} className="text-sm" style={{ color: p.color }}>
            {p.name}: {p.value}
          </p>
        ))}
      </div>
    );
  };

  if (chartData.length === 0) {
    return (
      <Card className="h-96 flex items-center justify-center">
        <CardDescription>No data for the selected period.</CardDescription>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <TrendingUp className="size-4 text-primary" />
          Referrer Weekly Summary
        </CardTitle>
        <CardDescription>
          View referrals and absences by week.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="h-[400px] min-h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <defs>
                <linearGradient id="attendedGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.1} />
                </linearGradient>
                <linearGradient id="absentGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1} />
                </linearGradient>
              </defs>

              <CartesianGrid />
              <XAxis
                dataKey="weekFormatted"
                stroke="hsl(var(--muted-foreground))"
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
                niceTicks="snap125"
              />

              <YAxis
                width="auto"
                niceTicks="snap125"
              />

              <Tooltip content={<CustomTooltip />}/>
              <Area
                yAxisId="left"
                stackId="1"
                type="monotone"
                dataKey="absent"
                stroke="#ef4444"
                fillOpacity={1}
                fill="url(#absentGradient)"
                dot={false}
                isAnimationActive={false}
                name="Absent"
              />
              <Area
                yAxisId="left"
                stackId="1"
                type="monotone"
                dataKey="attended"
                stroke="hsl(var(--primary))"
                fillOpacity={1}
                fill="url(#attendedGradient)"
                dot={false}
                isAnimationActive={false}
                name="Attended"
              />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="cases"
                stroke="#f59e0b"
                strokeWidth={3}
                dot={false}
                name="Beneficiaries"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};