import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DivisionSummary } from "@/components/dashboard/DivisionSummary";
import { DivisionChart } from "@/components/dashboard/DivisionBeneficiaryChart";
import { CalendarDays } from "lucide-react";
import { DashboardHeader } from "@/components/DashboardHeader";
import { useProfile } from "@/hooks/useProfile";

export default function Dashboard() {
  const { profile } = useProfile();
  const [dateRange, setDateRange] = useState<string>("month");

  const role = profile?.role as string;

  if (!profile) {
    return (
      <div className={`flex items-center gap-4 `}>
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-3xl font-semibold text-foreground">

            </h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge className= 'bg-primary text-primary-foreground'>
                User
              </Badge>
            </div>
          </div>
        </div>
      </div>
    );
  }  

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <DashboardHeader role= {role || 'staff'} /> 
      </div>

      <DivisionSummary />

      {/* Filters Section */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-end">

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-foreground">Date Range</label>
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-full sm:w-[150px]">
              <SelectValue placeholder="Select range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">This Month</SelectItem>
              <SelectItem value="month">Year to Date</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <CalendarDays className="size-4" />
            Custom Range
          </Button>
        </div>
      </div>

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Column - Primary Content */}
        <div className="xl:col-span-2 space-y-6">
          <DivisionChart dateRange={dateRange} />
        </div>

        {/* Right Column - Secondary Content */}
        <div className="space-y-6">
          
        </div>
      </div>
    </div>
  );
}