import { useState } from "react";
import { useNavigate } from 'react-router-dom';
import { Settings } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DivisionSummary } from "@/components/dashboard/DivisionSummary";
import { ReferrerSummary } from "@/components/dashboard/ReferrerSummary";
import { DivisionAllotmentSummary } from "@/components/dashboard/DivisionAllotmentSummary";
import { ReferrerAllotmentSummary } from "@/components/dashboard/ReferrerAllotmentSummary";
import { CalendarDays } from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { useProfile } from "@/hooks/useProfile";
import { PermissionGuard } from '@/components/PermissionGuard';

type AllowedRoles = "branch_manager" | "volunteer" | "staff" | "referrer" | "manager" | "head" | "admin";

export default function Dashboard() {
  const { profile } = useProfile();
  const navigate = useNavigate();

  const goTo = (path: string) => () => navigate(path);

  // const [dateRange, setDateRange] = useState<string>("month");

  const role = profile?.role as AllowedRoles;

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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <DashboardHeader role= {role} /> 
      </div>
      {profile?.role === 'referrer' ? 
      <div>
        <ReferrerSummary/>
        <ReferrerAllotmentSummary/>
      </div>
      :
      <DivisionSummary />
      }
      <PermissionGuard permission="canAccessAnalytics">
        {/* <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-end"> */}
        <DivisionAllotmentSummary/>
        {/* </div> */}

      </PermissionGuard>
    </div>
  );
}