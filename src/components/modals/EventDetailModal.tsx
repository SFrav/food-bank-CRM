import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, MapPin, FileText, Edit, Trash2, X } from 'lucide-react';
import { format, parseISO } from 'date-fns';

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

interface EventDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: CalendarEvent | null;
  onEdit?: (event: CalendarEvent) => void;
  onDelete?: (eventId: string) => void;
}

export function EventDetailModal({
  isOpen,
  onClose,
  event,
  // onEdit,
  onDelete,
}: EventDetailModalProps) {
  if (!event) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <DialogTitle className="text-xl">{event.subject}</DialogTitle>
              <DialogDescription className="mt-2">

              </DialogDescription>
            </div>
            {/* <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="size-8 p-0"
            >
              <X className="size-4" />
            </Button> */}
          </div>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Type and Status */}
          <div className="flex items-center gap-2">
            {event.type && (
              <Badge variant="secondary">{event.type}</Badge>
            )}
            {event.status && (
              <Badge
                variant={
                  event.status === 'completed'
                    ? 'default'
                    : event.status === 'cancelled'
                    ? 'destructive'
                    : 'outline'
                }
              >
                {event.status}
              </Badge>
            )}
          </div>

          {/* Date and Time */}
          <div className="flex items-center gap-2 text-sm">
            <Clock className="size-4 text-muted-foreground" />
            <div>
              <div className="font-medium">
                {format(parseISO(event.starts_at), 'EEEE, MMMM d, yyyy')}
              </div>
              <div className="text-muted-foreground">
                {format(parseISO(event.starts_at), 'HH:mm')}
                {event.ends_at && ` - ${format(parseISO(event.ends_at), 'HH:mm')}`}
              </div>
            </div>
          </div>

          {/* Location */}
          {event.location && (
            <div className="flex items-start gap-2 text-sm">
              <MapPin className="size-4 text-muted-foreground mt-0.5" />
              <div>
                <div className="font-medium">Location</div>
                <div className="text-muted-foreground">{event.location}</div>
              </div>
            </div>
          )}

          {/* Description */}
          {event.description && (
            <div className="flex items-start gap-2 text-sm">
              <FileText className="size-4 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <div className="font-medium mb-1">Description</div>
                <div className="text-muted-foreground whitespace-pre-wrap">
                  {event.description}
                </div>
              </div>
            </div>
          )}

          {/* Created At */}
          <div className="text-xs text-muted-foreground pt-2 border-t">
            Created: {format(parseISO(event.created_at), 'MMM d, yyyy HH:mm')}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 mt-6 pt-4 border-t">
          {onDelete && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                  onDelete(event.id);
                  onClose();
              }}
            >
              <Trash2 className="size-4 mr-2" />
              Delete
            </Button>
          )}
          {/* {onEdit && (
            <Button
              variant="default"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleEditEvent(event);
                onClose();
              }}
            >
              <Edit className="size-4 mr-2" />
              Edit
            </Button>
          )} */}
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

