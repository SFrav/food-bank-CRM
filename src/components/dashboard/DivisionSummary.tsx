import { User, UserPlus, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { useDivisions } from "@/hooks/useDivisionSummary";
import { useProfile } from '@/hooks/useProfile';

export function DivisionSummary() {
  const { profile } = useProfile();
  const { divisions, loading, error } = useDivisions(
    profile?.role === 'admin' || profile?.role === 'head'
      ? profile.entity_id ?? null
      : null,
    profile?.role ?? null
  );

  const totalPending =  Math.max(...divisions.map(d => d.pending_beneficiaries)); // divisions.reduce((sum, d) => sum + d.pending_beneficiaries, 0);
  const totalActive = divisions.reduce((sum, d) => sum + d.beneficiaries, 0);
  const totalWorkforce = divisions.reduce((sum, d) => sum + d.workforce, 0);

  if (!profile) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Division Summary</CardTitle>
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
        <CardHeader>
          <CardTitle>Division Summary</CardTitle>
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
          <CardTitle>Division Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-destructive">
            Error loading division data: {error}
          </div>
        </CardContent>
      </Card>
    );
  }

  const isPrivileged = ['admin', 'head'].includes(profile?.role ?? '');

  if (!isPrivileged && divisions.length === 1) {
    const div = divisions[0];
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="size-5" />
            {div.name}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="flex items-center gap-3 p-4 border rounded-lg">
              <UserPlus className="size-8 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Pending Beneficiaries</p>
                <p className="text-xl font-bold">{div.pending_beneficiaries}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 border rounded-lg">
              <User className="size-8 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Beneficiaries</p>
                <p className="text-xl font-bold">{div.beneficiaries}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 border rounded-lg">
              <User className="size-8 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Workforce</p>
                <p className="text-xl font-bold">{div.workforce}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Privileged: show table
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="size-5" />
          Division Summary
        </CardTitle>
      </CardHeader>
      <CardContent>
        {divisions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No divisions found for the selected entity.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
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
                  <p className="text-sm text-muted-foreground">Total Beneficiaries</p>
                  <p className="text-xl font-bold">{totalActive}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 border rounded-lg">
                <User className="size-8 text-yellow-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Referrers</p>
                  <p className="text-xl font-bold">0</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 border rounded-lg">
                <User className="size-8 text-blue-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Workforce</p>
                  <p className="text-xl font-bold">{totalWorkforce}</p>
                </div>
              </div>
            </div>

            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Branch</TableHead>
                    {/* <TableHead className="text-right">Pending</TableHead> */}
                    <TableHead className="text-right">Beneficiaries</TableHead>
                    {/* <TableHead className="text-right">Referrers</TableHead> */}
                    <TableHead className="text-right">Workforce</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {divisions.map((div) => (
                    <TableRow key={div.id}>
                      <TableCell>{div.name}</TableCell>
                      {/* <TableCell className="text-right">{div.pending_beneficiaries}</TableCell> */}
                      <TableCell className="text-right">{div.beneficiaries}</TableCell>
                      {/* <TableCell className="text-right">{div.referrers}</TableCell> */}
                      <TableCell className="text-right">{div.workforce}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}