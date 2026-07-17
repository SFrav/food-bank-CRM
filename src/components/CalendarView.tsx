import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, addMonths, subMonths, parseISO } from 'date-fns';
import { ChevronLeft, ChevronRight, Plus, MoreHorizontal, Edit, Trash2, MapPin, Clock, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

export type CalendarEvent = {
  id: string;
  subject: string;
  starts_at: string;
  ends_at?: string | null;
  location?: string | null;
  notes?: string | null;
  type?: string | null;
  status: "scheduled" | "done" | "cancelled";
  created_at: string;
  // stopPropagation: () => void;
};

export interface CalendarViewProps {
  events: CalendarEvent[];
  isLoading: boolean;
  currentDate: Date;
  onPrev: () => void;
  onNext: () => void;
  onDateClick: (d: Date) => void;
  onEventClick: (e: CalendarEvent) => void;
  onEditClick: (e: CalendarEvent) => void;
  onDeleteClick: (id: string) => void;
  onAdd: () => void;
  onBulkAdd: () => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  events,
  isLoading,
  currentDate,
  onPrev,
  onNext,
  onDateClick,
  onEventClick,
  onEditClick,
  onDeleteClick,
  onAdd,
  onBulkAdd,
}) => {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startPad = monthStart.getDay();
  const endPad = 6 - monthEnd.getDay();
  const padded = [
    ...Array.from({ length: startPad }, (_, i) => new Date(monthStart.getTime() - (startPad - i) * 86400000)),
    ...days,
    ...Array.from({ length: endPad }, (_, i) => new Date(monthEnd.getTime() + (i + 1) * 86400000)),
  ];
  const eventsFor = (d: Date) => events.filter(ev => isSameDay(parseISO(ev.starts_at), d));

  if (isLoading)
    return (
      <Card>
        <CardContent className="p-8 flex justify-center">
          <div className="animate-spin rounded-full size-8 border-b-2 border-primary" />
        </CardContent>
      </Card>
    );
  
  return (
    <Card>
      <CardHeader className="flex items-center">
        <div className="grid grid-cols-3 place-items-center w-[390px]">
          <Button variant="outline" size="sm" onClick={onPrev}>
            <ChevronLeft className="size-4" />
          </Button>
          <CardTitle className="text-lg">
           {format(currentDate, 'MMMM yyyy')} 
          </CardTitle>
          <Button variant="outline" size="sm" onClick={onNext}>
            <ChevronRight className="size-4" />
          </Button>
        </div>
        <div className="flex gap-2">
          <Button onClick={onBulkAdd}>
            <Plus className="size-4 mr-2" />Bulk Add
          </Button>
          <Button onClick={onAdd}>
            <Plus className="size-4 mr-2" />Add Event
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-7 gap-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
            <div key={d} className="p-2 text-center text-sm font-medium text-muted-foreground">{d}</div>
          ))}
          {padded.map(date => {
            const dayEvents = eventsFor(date);
            const currMonth = isSameMonth(date, currentDate);
            const today = isToday(date);
            return (
              <div
                key={date.toISOString()}
                className={`min-h-[100px] p-2 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors ${
                  !currMonth ? 'text-muted-foreground bg-muted/20' : ''
                } ${today ? 'bg-primary/10 border-primary' : ''}`}
                onClick={() => onDateClick(date)}
              >
                <div className={`text-sm font-medium mb-1 ${today ? 'text-primary' : ''}`}>
                  {format(date, 'd')}
                </div>
                <div className="space-y-1">
                  {dayEvents.slice(0, 2).map(ev => (
                    <div
                      key={ev.id}
                      className="group relative"
                      onClick={e => {
                        e.stopPropagation();
                        //onEventClick(ev);
                      }}
                    >
                      <div className="text-xs p-1 bg-primary/20 text-primary rounded cursor-pointer hover:bg-primary/30 transition-colors">
                        <div className="flex items-center justify-between">
                          <span className="truncate">{format(parseISO(ev.starts_at), 'HH:mm')} {ev.subject}</span>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="size-4 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={e => e.stopPropagation()}
                              >
                                <MoreHorizontal className="size-3" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={e => {e.stopPropagation(); onEventClick(ev);}}>
                                <FileText className="mr-2 size-3" />View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={e => {e.stopPropagation(); onEditClick(ev);}}
                                disabled={ev.type !== 'event'}
                              >
                                <Edit className="mr-2 size-4" />Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={e => {e.stopPropagation(); onDeleteClick(ev.id);}}
                              >
                                <Trash2 className="mr-2 size-3" />Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </div>
                  ))}
                  {dayEvents.length > 2 && (
                    <div className="text-xs text-muted-foreground">+{dayEvents.length - 2} more</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};