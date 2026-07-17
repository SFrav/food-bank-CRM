import { MoreHorizontal, MapPin, CheckCircle, XCircle, Clock, FileText, Edit, Trash2, Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format, isSameDay, isToday, parseISO } from 'date-fns';
import type { CalendarEvent } from '@/components/CalendarView';
import CalendarStatusIcon from "@/components/CalendarStatusIcon"

export const SelectedDayEvents: React.FC<{
  events: CalendarEvent[];
  date: Date | null;
  onDateSelect: (d: Date) => void;
  onEdit: (e: CalendarEvent) => void;
  onDelete: (id: string) => void;
  onView: (e: CalendarEvent) => void;
  onAdd: () => void; 
}> = ({ events, date, onDateSelect, onEdit, onDelete, onView, onAdd }) => {
  const filter = date
    ? events.filter(e => isSameDay(parseISO(e.starts_at), date))
    : events.filter(e => isToday(parseISO(e.starts_at)));

  if (filter.length === 0) return null;
 
  const getStatusBadgeColor = (status: CalendarEvent["status"]) => {
    const variants = {
      scheduled: "bg-amber-50 text-amber-700 border-amber-200",
      done: "bg-emerald-50 text-emerald-700 border-emerald-200",
      cancelled: "bg-red-50 text-red-700 border-red-200",
    };
    return variants[status as keyof typeof variants] ?? variants.scheduled;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-5">
          <CardTitle className="text-lg">
            Events for {date ? format(date, 'PPP') : 'Today'}
          </CardTitle>
            {/* <Input
              type="date"
              value={date ? format(date, 'yyyy-MM-dd') : ''}
              onChange={(e) => {
                const date = e.target.value ? new Date(e.target.value) : undefined;
                onDateSelect(date);
              }}
              className="h-8 w-8 p-1 text-xs"
            /> */}
        </div>
      </CardHeader>
      <CardContent>
        {filter.map(ev => (
          <div
            key={ev.id}
            onClick={() => onView(ev)}
            className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
          >
            <div className="cursor-pointer w-[95%] mx-auto"> {/* Add to class for horizontal presentation: flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors */}
              <Badge>
                {format(parseISO(ev.starts_at), 'HH:mm')}</Badge>
              <div className="flex max-w-[80%] text-sm text-muted-foreground"> {/* if horizontal: max-w-[400px] truncate text-left mx-2  */}
                {ev.type === "event" ? (
                  <p>{ev.subject}</p>
                ) : (
                  <p>{ev.subject.split('_').pop().charAt(0).toUpperCase() + ev.subject.split('_').pop().slice(1)}: {ev.notes}</p>
                )}
              </div>
              {ev.location && (
                <div className="flex gap-1 text-sm text-muted-foreground">
                  <MapPin className="size-4 ml-0"/>
                  <p>{ev.location}</p>
                  
                </div>
              )}
              <Badge className={`${getStatusBadgeColor(ev.status)} border`}>
                <CalendarStatusIcon className="size-3 mr-1" status={ev.status} />
                {ev.status}
              </Badge>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="p-0">
                  <MoreHorizontal className="size-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onView(ev)}>
                  <FileText className="mr-2 size-3" />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => {e.stopPropagation(); onEdit(ev)}}
                  disabled={ev.type !== 'event'}
                >
                  <Edit className="mr-2 size-4"/>
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={(e) => {e.stopPropagation(); onDelete(ev.id)}}
                >
                  <Trash2 className="mr-2 size-3"/>
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};