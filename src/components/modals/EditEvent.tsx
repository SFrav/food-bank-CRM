import { useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCalendarForm } from "@/hooks/useCalendarForm";
import { format } from 'date-fns';

interface CalendarEvent {
  id: string;
  subject: string;
  starts_at: string;
  ends_at?: string | null;
  location?: string | null;
  description?: string | null;
  type?: string | null;
  status?: string;
  created_at: string;
}

interface EditEventProps {
  isOpen: boolean;
  onClose: () => void;
  event: CalendarEvent | null;
  onEventUpdated: () => void;
}

export function EditEventModal({
  isOpen,
  onClose,
  event,
  onEventUpdated,
}: EditEventProps) {
  const { form, setForm, submitEdit, isSubmitting } = useCalendarForm({
    initialCalendar: event
      ? {
          id: event.id,
          entry_type: 'event',
          subject: event.subject,
          location: event.location ?? '',
          beneficiary_id: '',
          scheduled_at: format(new Date(event.starts_at), "yyyy-MM-dd'T'HH:mm"),
          status: event.status ?? 'scheduled',
          notes: event.description ?? '',
        }
      : undefined,
    onSuccess: onEventUpdated,
  });

  useEffect(() => {
    if (!event) return;
    setForm({
      entry_type: 'event',
      subject: event.subject,
      location: event.location ?? '',
      beneficiary_id: '',
      scheduled_at: format(new Date(event.starts_at), "yyyy-MM-dd'T'HH:mm"),
      status: event.status ?? 'scheduled',
      notes: event.description ?? '',
    });
  }, [event, setForm]);
    
  const handleSave = async () => {
    if (!event) return;
    await submitEdit();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Edit Event</DialogTitle>
          <DialogDescription>
            Update the details of the event below.
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="subject">Event Title *</Label>
            <Input
              id="subject"
              name="subject"
              value={form.subject}
              onChange={e => setForm({ ...form, subject: e.target.value })}
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
                onChange={e => setForm({ ...form, scheduled_at: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              name="location"
              value={form.location}
              onChange={e => setForm({ ...form, location: e.target.value })}
              placeholder="Enter event location"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Description</Label>
            <Textarea
              id="notes"
              name="notes"
              value={form.notes}
              onChange={e => setForm({ ...form, notes: e.target.value })}
              placeholder="Add event details..."
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="button" onClick={handleSave} disabled={isSubmitting}>
              {isSubmitting ? 'Updating…' : 'Update Event'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}