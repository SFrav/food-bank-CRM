import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { StarRating } from "@/components/ui/star-rating";
import { ReferrerSummaryRow } from '@/components/ReferrerSummaryRow';
import ReferrerRatingHistory from '@/components/modals/DetailReferrerHistory';
import { useProfile } from '@/hooks/useProfile';
import { useReferrerRating, ReferrerRatingAverage } from '@/hooks/useReferrerRating';

export const ReferrerSummaryTable = () => {
  const { profile } = useProfile();
  const { averageRatings, fetchAverageRatings, loading } = useReferrerRating();
  // const [loading, setLoading] = useState(true);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [selectedReferrerId, setSelectedReferrerId] = useState<string | null>(null);

  // useEffect(() => {
  //   if (profile?.region_id) {
  //     fetchAverageRatings(profile.region_id);
  //   }
  // }, [profile?.region_id]);

  const handleOpenHistory = useCallback((referrerId: string) => {
    setSelectedReferrerId(referrerId);
    setIsHistoryOpen(true);
  }, []);

  if (loading) return <div className="flex justify-center py-8"><div className="animate-spin rounded-full size-8 border-b-2 border-primary" /></div>;

  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>Referrer Rating Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Entity</TableHead>
                  <TableHead>Referrer Name</TableHead>
                  <TableHead>Screening</TableHead>
                  <TableHead>Support</TableHead>
                  <TableHead>Inform</TableHead>
                  <TableHead>Enumeration</TableHead>
                  <TableHead>Last Rated</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {averageRatings.map((row, index) => (
                  <ReferrerSummaryRow
                    row={row}
                    index={index}
                    onOpenHistory={handleOpenHistory}
                  />
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      <ReferrerRatingHistory
          isOpen={isHistoryOpen}
          onClose={() => setIsHistoryOpen(false)}
          referrerId={selectedReferrerId ?? ''}
        />
    </div>
  );
};