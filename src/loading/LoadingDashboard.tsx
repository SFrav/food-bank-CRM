import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, TrendingUp } from "lucide-react";
import { User, UserPlus, Users } from "lucide-react";
import { useProfile } from '@/hooks/useProfile';
import { useDivisionSummary } from "@/hooks/useDivisionSummary";
import { useReferrerSummary } from "@/hooks/useReferrerSummary";

export const LoadingDashboard = () => {
  const { profile } = useProfile();
  const { loading: loadingFBank } = useDivisionSummary(
    profile?.role === 'admin' || profile?.role === 'head'
      ? profile.entity_id ?? null
      : null
  );
  const { loading: loadingReferrer } = useReferrerSummary(
    profile?.role === 'referrer'
      ? profile.entity_id ?? null
      : null
  );

  if (!profile) { 
    return (
      <Card>
        <CardHeader className="flex justify-between">
          <CardTitle>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="flex items-center gap-3 p-4 border rounded-lg">
              <UserPlus className="size-8 text-primary" />
              <div>
                <p className="h-6 w-105"/>
                <div className="h-6 w-105 bg-muted/100 rounded animate-pulse"/>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (loadingReferrer) {
    return (
      <Card>
        <CardHeader className="flex justify-between">
          <CardTitle>Referrer Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="flex items-center gap-3 p-4 border rounded-lg">
              <UserPlus className="size-8 text-primary" />
              <div>
                <p className="h-6 w-35"/>
                <div className="h-6 w-35 bg-muted/100 rounded animate-pulse"/>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 border rounded-lg">
              <User className="size-8 text-green-600" />
              <div>
                <p className="h-6 w-35"/>
                <div className="h-6 w-35 bg-muted/100 rounded animate-pulse"/>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!loadingReferrer && profile && loadingFBank && !['referrer', 'head'].includes(profile?.role)) { //loading || !profile
    return (
      <Card>
        <CardHeader className="flex justify-between">
          <CardTitle>Division Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="flex items-center gap-3 p-4 border rounded-lg">
              <UserPlus className="size-8 text-primary" />
              <div>
                <p className="h-6 w-35"/>
                <div className="h-6 w-35 bg-muted/100 rounded animate-pulse"/>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 border rounded-lg">
              <User className="size-8 text-green-600" />
              <div>
                <p className="h-6 w-35"/>
                <div className="h-6 w-35 bg-muted/100 rounded animate-pulse"/>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 border rounded-lg">
              <User className="size-8 text-blue-600" />
              <div>
                <p className="h-6 w-35"/>
                <div className="h-6 w-35 bg-muted/100 rounded animate-pulse"/>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
  if (loadingFBank && profile?.role === 'head') { //loading || !profile
    return (
      <Card>
        <CardHeader className="flex justify-between">
          <CardTitle>Division Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="flex items-center gap-3 p-4 border rounded-lg">
              <UserPlus className="size-8 text-primary" />
              <div>
                <p className="h-6 w-35"/>
                <div className="h-6 w-35 bg-muted/100 rounded animate-pulse"/>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 border rounded-lg">
              <User className="size-8 text-green-600" />
              <div>
                <p className="h-6 w-35"/>
                <div className="h-6 w-35 bg-muted/100 rounded animate-pulse"/>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 border rounded-lg">
              <User className="size-8 text-blue-600" />
              <div>
                <p className="h-6 w-35"/>
                <div className="h-6 w-35 bg-muted/100 rounded animate-pulse"/>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 border rounded-lg">
              <User className="size-8 text-blue-600" />
              <div>
                <p className="h-6 w-35"/>
                <div className="h-6 w-35 bg-muted/100 rounded animate-pulse"/>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
}