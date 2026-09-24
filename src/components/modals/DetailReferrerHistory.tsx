import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { StarRating } from "@/components/ui/star-rating";
import { Label } from '@/components/ui/label';
import { useProfile } from "@/hooks/useProfile";
import { useReferrerRating } from "@/hooks/useReferrerRating";
import { Trash2 } from 'lucide-react';

interface ReferrerRatingHistoryProps {
  isOpen: boolean;
  onClose: () => void;
  referrerId: string;
}

const ReferrerRatingHistory: React.FC<ReferrerRatingHistoryProps> = ({
  isOpen,
  onClose,
  referrerId
}) => {
  const { profile } = useProfile();
  const { ratings, fetchRatings, loading, deleteRating } = useReferrerRating(referrerId);
  
  // useEffect(() => {
  //   if (referrerId && profile) {
  //     fetchRatings(referrerId);
  //   }
  // }, [referrerId, profile]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] max-h-[90dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Rating History</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {loading ? <p>Loading...</p> : (
            <div className="space-y-2">
              {ratings.map((r) => (
                <div key={r.id}>
                  <div className="flex justify-between items-center py-2 border-b">
                    <div className="flex items-center gap-2">
                      {/* <Label className="text-muted-foreground">Rated By:</Label>
                      <span className="font-medium">{r.rater_id}</span> */}
                      <Label className="text-sm text-muted-foreground">Rated on:</Label>
                      <span className="text-sm">{new Date(r.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                    {profile?.role === 'admin' && (
                      <Trash2
                        className="cursor-pointer size-4 text-destructive hover:text-destructive/80"
                        onClick={() => deleteRating(r.id)}
                      />
                    )}
                    </div>
                  </div>
                  <div className="grid grid-col-1 items-centre border-b">
                    <div className="flex justify-between">
                      <Label className="text-sm text-blue-600">Screening:</Label>
                      <StarRating value={r.rate_screening} size="lg" disabled />
                    </div>
                    <div className="flex justify-between">
                      <Label className="text-sm text-blue-600">Crisis support:</Label>
                      <StarRating value={r.rate_support} size="lg" disabled />
                    </div>
                    <div className="flex justify-between">
                      <Label className="text-sm text-blue-600">Informed beneficiary:</Label>
                      <StarRating value={r.rate_inform} size="lg" disabled />
                    </div>
                    <div className="flex justify-between">
                      <Label className="text-sm text-blue-600">Household enumeration:</Label>
                      <StarRating value={r.rate_enumeration} size="lg" disabled />
                    </div>
                    <span className="text-sm text-muted-foreground">Note:</span>
                    <span className="max-w-[400px] text-sm">{r.note}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReferrerRatingHistory;