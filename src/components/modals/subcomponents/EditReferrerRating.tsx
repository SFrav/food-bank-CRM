import React, { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { StarRating } from "@/components/ui/star-rating"
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useProfile } from "@/hooks/useProfile";
import { useReferrerRating, ReferrerRating } from "@/hooks/useReferrerRating";


interface RateReferrerProps {
  isOpen: boolean;
  onClose: () => void;
  filteredRatings: ReferrerRating | undefined;
  referrerId: string;
  contactId: string;
}


const EditReferrerRate: React.FC<RateReferrerProps> = ({
  isOpen,
  onClose,
  filteredRatings,
  referrerId,
  contactId
}) => {
  const { profile } = useProfile();
  const { updateRating, loading: isLoading } = useReferrerRating(referrerId);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [ratingScreen, setRatingScreen] = useState(filteredRatings?.rate_screening ?? 5)
  const [ratingSupport, setRatingSupport] = useState(filteredRatings?.rate_support ?? 5)
  const [ratingInform, setRatingInform] = useState(filteredRatings?.rate_inform ?? 5)
  const [ratingEnumeration, setRatingEnumeration] = useState(filteredRatings?.rate_enumeration ?? 5)
  const [note, setNote] = useState(filteredRatings?.note ?? '')

  useEffect(() => {
      if (isOpen || !filteredRatings) return; 
      if (!isLoading) {
        setRatingScreen(filteredRatings.rate_screening);
        setRatingSupport(filteredRatings.rate_support);
        setRatingInform(filteredRatings.rate_inform);
        setRatingEnumeration(filteredRatings.rate_enumeration);
        setNote(filteredRatings.note ?? '');
      }
    }, [isOpen, filteredRatings]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNote(value);
  }, []);

  const handleClose = () => {
    // setRatingScreen(5);
    // setRatingSupport(5);
    // setRatingInform(5);
    // setRatingEnumeration(5);
    onClose();
  };

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    if (!profile || !filteredRatings) return;
    setIsSubmitting(true);
    try {
      const { success } = await updateRating({
        id: filteredRatings.id,
        referrer: filteredRatings.referrer_id,
        contact: filteredRatings.contact_id,
        rating_screen: ratingScreen || null,
        rating_support: ratingSupport || null,
        rating_inform: ratingInform || null,
        rating_enumeration: ratingEnumeration || null,
        notes: note.trim() || null,
        updated_by: profile?.user_id,
      });
      // if (!success) throw new Error('Failed to update rating');
      handleClose();
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[525px]  max-h-[90dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Rating of Referrer</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="min-h-[50dvh]">
            <div className="space-y-2">
              <Label>How well did the referrer screen this beneficiary?</Label>
              <StarRating
                value={ratingScreen}
                onChange={setRatingScreen}
                size="xl"          
              />
            </div>
            <div className="space-y-2">
              <Label>Is the referrer providing the support within their remit?</Label>
              <StarRating
                value={ratingSupport}
                onChange={setRatingSupport}
                size="xl"          
              />
            </div>
            <div className="space-y-2">
              <Label>How well did the referrer inform this beneficiary about the food bank?</Label>
              <StarRating
                value={ratingInform}
                onChange={setRatingInform}
                size="xl"          
              />
            </div>
            <div className="space-y-2">
              <Label>How accurately was household composition enumerated?</Label>
              <StarRating
                value={ratingEnumeration}
                onChange={setRatingEnumeration}
                size="xl"          
              />
            </div>
            <div className="space-y-2">
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  name="notes"
                  value={note}
                  onChange={handleInputChange}
                  placeholder="Additional notes..."
                  rows={3}
                />
              </div>
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving…' : 'Save'}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditReferrerRate;
