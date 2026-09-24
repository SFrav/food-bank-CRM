import React from 'react';
import { PermissionGuard } from '@/components/PermissionGuard';
import { ReferrerSummaryTable } from '@/components/ReferrerSummaryTable';

export default function Referrers() {
  // const [ratings, loading: loadingRating] = useReferrerRating();
  return (
    <div className="space-y-6">
      <PermissionGuard permission="canViewReferrerSummary">
        {/* <ReferrerSummaryTable referrers={ratings.referrer_id}/> */}
        <ReferrerSummaryTable/>
      </PermissionGuard>
    </div>
  );
}