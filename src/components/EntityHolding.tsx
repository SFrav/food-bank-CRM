import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
// import { useCountries, Country } from '@/hooks/useCountries';
import { useApprove } from '@/hooks/useApprove'


export const EntityHolding = () => {
  // const { countries, loading: loadingCounty, refetch: refetchCountry } = useCountries();
  const { holdingEntities, loading } = useApprove();
  

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-6">
          <Loader2 className="size-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Entity Applications</CardTitle>
        <CardDescription>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Entities List */}
          <div>
            <h3 className="text-lg font-medium mb-4">Entity Application</h3>
            {holdingEntities.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                 No entity applications found
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Country</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {holdingEntities.map((entity) => (
                    <TableRow key={entity.id}>
                      <TableCell>
                          {entity.name}
                      </TableCell>
                      <TableCell>
                          {entity.code || '-'}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-mono">
                          {entity.country_name}
                        </Badge>
                      </TableCell>

                      <TableCell>
                        <Badge 
                          variant={entity.is_referrer ? "default" : "secondary"}
                          className="cursor-pointer"
                          >
                          {entity.is_referrer ? 'Referrer' : 'Food bank'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(entity.created_at).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};