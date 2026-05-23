import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/useAuth';
import { useCalendarForm } from "@/hooks/useCalendarForm";
import { format } from 'date-fns';

interface AddEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEventAdded: () => void;
  selectedDate?: Date;
}

export const AddEventModal: React.FC<AddEventModalProps> = ({
  isOpen,
  onClose,
  onEventAdded,
  selectedDate,
}) => {
  const { user } = useAuth();

  const {
    form,
    setForm,
    submitAdd,
    isSubmitting,
  } = useCalendarForm({
    onSuccess: onEventAdded,
  });

  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      entry_type: 'event',
    }));
  }, [setForm]);

  useEffect(() => {
    if (selectedDate) {
      // Convert the Date to the format expected by the datetime‑local input
      const formatted = format(selectedDate, "yyyy-MM-dd'T'HH:mm");
      setForm((prev) => ({ ...prev, scheduled_at: formatted }));
    }
  }, [selectedDate, setForm]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!user) return;

    await submitAdd();
    onClose();
  };

  const handleClose = () => {
    onClose();
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Add New Event</DialogTitle>
          <DialogDescription>
            Schedule a new event in your calendar. Fill in the event details below.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="subject">Event Title *</Label>
            <Input
              id="subject"
              name="subject"
              value={form.subject}
              onChange={handleInputChange}
              placeholder="Enter event title"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
            <Label htmlFor="scheduled-at">Scheduled Date & Time *</Label>
            <Input
              id="scheduled-at"
              type="datetime-local"
              value={form.scheduled_at}
              onChange={(e) => setForm((prev) => ({...prev, scheduled_at: e.target.value, })) }
            />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              name="location"
              value={form.location}
              onChange={handleInputChange}
              placeholder="Enter event location"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Description</Label>
            <Textarea
              id="notes"
              name="notes"
              value={form.notes}
              onChange={handleInputChange}
              placeholder="Add event details..."
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="button" disabled={isSubmitting} onClick={handleSave}>
              {isSubmitting ? "Adding…" : "Add Event"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};