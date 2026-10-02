import { User, UserPlus, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
// import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useReferrerSummary } from "@/hooks/useReferrerSummary";
import { useProfile } from '@/hooks/useProfile';

export function ReferrerSummary() {
  const { profile } = useProfile();
  const { referrerSummary: referrers, loading, error } = useReferrerSummary(
    profile?.role === 'referrer'
      ? profile.entity_id ?? null
      : null
  );
  // const navigate = useNavigate();

  // const goTo = (path: string) => () => navigate(path);

  // const totalPending = referrers.reduce((sum, r) => sum + r.pending_beneficiaries, 0);
  const totalPending =  Math.max(...referrers.map(r => r.pending_beneficiaries));
  const totalActive = referrers.reduce((sum, r) => sum + r.beneficiaries, 0);
  // const totalWorkforce = referrers.reduce((sum, r) => sum + r.workforce, 0);

  if (!profile) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Referrer Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-12 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardHeader className="flex justify-between">
          <CardTitle>Referrer Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[1,2,3,4].map(i => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Referrer Summary</CardTitle>
        </CardHeader>
        <CardContent>
          {/* <div className="text-sm text-destructive">
            Error loading referrer data: {error}
          </div> */}
        </CardContent>
      </Card>
    );
  }

  if (referrers.length === 1) {
    const ent = referrers[0];
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="size-5" />
            {ent.name}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="flex items-center gap-3 p-4 border rounded-lg">
              <UserPlus className="size-8 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Pending Beneficiaries</p>
                <p className="text-xl font-bold">{ent.pending_beneficiaries}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 border rounded-lg">
              <User className="size-8 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Active Beneficiaries</p>
                <p className="text-xl font-bold">{ent.beneficiaries}</p>
              </div>
            </div>
            {/* <div className="flex items-center gap-3 p-4 border rounded-lg">
              <User className="size-8 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Workforce</p>
                <p className="text-xl font-bold">{ent.workforce}</p>
              </div>
            </div> */}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between">
          <div className="flex items-centre gap-2">
            <Users className="size-5" />
            Referrer Summary
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {referrers.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No referrer referrers found.</p>
          </div>
        ) : (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="flex items-center gap-3 p-4 border rounded-lg">
                <UserPlus className="size-8 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Pending Beneficiaries</p>
                  <p className="text-xl font-bold">{totalPending}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 border rounded-lg">
                <User className="size-8 text-green-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Active Beneficiaries</p>
                  <p className="text-xl font-bold">{totalActive}</p>
                </div>
              </div>
              {/* <div className="flex items-center gap-3 p-4 border rounded-lg">
                <User className="size-8 text-blue-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Workforce</p>
                  <p className="text-xl font-bold">{totalWorkforce}</p>
                </div>
              </div> */}
            </div>

            <div className="border rounded-lg max-w-[50%] overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead> </TableHead>
                    <TableHead className="text-right">Pending Beneficiaries</TableHead>
                    <TableHead className="text-right">Active Beneficiaries</TableHead>
                    {/* <TableHead className="text-right">Workforce</TableHead> */}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {referrers.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell> </TableCell>
                      <TableCell className="text-right">{r.pending_beneficiaries}</TableCell>
                      <TableCell className="text-right">{r.beneficiaries}</TableCell>
                      {/* <TableCell className="text-right">{ent.workforce}</TableCell> */}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}