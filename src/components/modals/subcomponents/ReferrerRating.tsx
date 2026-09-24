import React, { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { StarRating } from "@/components/ui/star-rating"
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useProfile } from "@/hooks/useProfile";
import { useReferrerRating } from "@/hooks/useReferrerRating";


interface RateReferrerProps {
  isOpen: boolean;
  onClose: () => void;
  referrerId: string;
  contactId: string;
}


const ReferrerRateForm: React.FC<RateReferrerProps> = ({
  isOpen,
  onClose,
  referrerId,
  contactId
}) => {
  const { profile } = useProfile();
  const { createRating, loading: isLoading } = useReferrerRating();
  const [ratingScreen, setRatingScreen] = useState(5)
  const [ratingSupport, setRatingSupport] = useState(5)
  const [ratingInform, setRatingInform] = useState(5)
  const [ratingEnumeration, setRatingEnumeration] = useState(5)
  const [note, setNote] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNote(value);
  }, []);

  const handleClose = () => {
    setRatingScreen(5);
    setRatingSupport(5);
    setRatingInform(5);
    setRatingEnumeration(5);
    onClose();
  };

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    if (!profile) {
      return;
    }
    setIsSubmitting(true);
    try {
      const { success, error } = await createRating({
        referrer: referrerId,
        contact: contactId || null,
        rating_screen: ratingScreen || null,
        rating_support: ratingSupport || null,
        rating_inform: ratingInform || null,
        rating_enumeration: ratingEnumeration || null,
        notes: note.trim() || null,
        created_by: profile?.user_id,
      });
      if (!success) {
        throw new Error(error);
      }
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
          <DialogTitle>Rate Referrer</DialogTitle>
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

export default ReferrerRateForm;