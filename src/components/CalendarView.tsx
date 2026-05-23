import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus, MoreHorizontal, Edit, Trash2, MapPin, Clock, FileText } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, addMonths, subMonths, parseISO } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AddEventModal } from '@/components/modals/AddEventModal';
import { AddEventBulkModal } from '@/components/modals/AddEventBulkModal';
import { EditEventModal } from '@/components/modals/EditEvent';
import { EventDetailModal } from '@/components/modals/EventDetailModal';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { useCalendarForm } from "@/hooks/useCalendarForm";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CalendarEvent {
  id: string;
  subject: string;
  starts_at: string;
  ends_at?: string | null;
  location: string | null;
  notes: string | null;
  description?: string | null;
  type?: string | null;
  status?: string;
  created_at: string;
}

export const CalendarView: React.FC = () => {
  const { user } = useAuth();
  const { profile } = useProfile();
  const { toast } = useToast();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [filterDate, setFilterDate] = useState<Date | undefined>(undefined);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const fetchEvents = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const startDate = startOfMonth(currentDate);
      const endDate   = endOfMonth(currentDate);

      const { data, error } = await supabase.rpc('get_calendar', {
        start_date: startDate.toISOString(),
        end_date:   endDate.toISOString()
      });

      if (error) throw error;

      const mappedEvents: CalendarEvent[] = (data || []).map((a: any) => ({
        id:          a.id,
        subject:     a.subject || (a.entry_type ? a.entry_type.replace('_', ' ') : 'Task'),
        starts_at:   a.scheduled_at,
        ends_at:     null,
        location:    a.location ?? null,
        description: a.notes ?? null,
        type:        a.entry_type ?? null,
        status:      a.status ?? undefined,
        created_at:  a.created_at ?? new Date().toISOString()
      }));

      setEvents(mappedEvents);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast({
        title: "Error",
        description: "Failed to load events.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [user, profile, currentDate]);


  const { deleteCalendar } = useCalendarForm({ onSuccess: fetchEvents });
  const handleDeleteEvent = async (eventId: string) => {
    try {
      await deleteCalendar(eventId);
      toast({
        title: "Success",
        description: "Event deleted successfully!",
      });
      fetchEvents();
    } catch (error) {
      console.error('Error deleting event:', error);
      toast({
        title: "Error",
        description: "Failed to delete event.",
        variant: "destructive",
      });
    }
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => direction === 'prev' ? subMonths(prev, 1) : addMonths(prev, 1));
  };

  const getEventsForDate = (date: Date) => {
    return events.filter(event => 
      isSameDay(parseISO(event.starts_at), date)
    );
  };

  // const handleDateClick = (date: Date) => {
  //   setSelectedDate(date);
  //   setIsAddModalOpen(true);
  // };

  const handleDateClick = (date: Date) => {
    setFilterDate(date);   
    setIsAddModalOpen(false);  
    setIsDetailModalOpen(false); 
    setSelectedDate(undefined);  
  };

  const handleEditEvent = (event: CalendarEvent) => {
    if (event.type !== 'event') return;
    setSelectedEvent(event);
    setIsDetailModalOpen(false);
    setIsEditModalOpen(true);
  };

  // Generate calendar days
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Add padding days to make a complete week grid
  const startPadding = monthStart.getDay();
  const endPadding = 6 - monthEnd.getDay();
  
  const paddedDays = [
    ...Array.from({ length: startPadding }, (_, i) => new Date(monthStart.getTime() - (startPadding - i) * 24 * 60 * 60 * 1000)),
    ...calendarDays,
    ...Array.from({ length: endPadding }, (_, i) => new Date(monthEnd.getTime() + (i + 1) * 24 * 60 * 60 * 1000))
  ];

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full size-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle> </CardTitle>
              <CardDescription>
                {/* Manage your events and schedule */}
              </CardDescription>
            </div>
            <div className="flex space-x-2">
              <Button onClick={() => setIsBulkModalOpen(true)}>
                <Plus className="size-4 mr-2" />
                Bulk Add
              </Button>
              <Button onClick={() => setIsAddModalOpen(true)}>
                <Plus className="size-4 mr-2" />
                Add Event
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-6">
            <Button variant="outline" size="sm" onClick={() => navigateMonth('prev')}>
              <ChevronLeft className="size-4" />
            </Button>
            <h2 className="text-xl font-semibold">
              {format(currentDate, 'MMMM yyyy')}
            </h2>
            <Button variant="outline" size="sm" onClick={() => navigateMonth('next')}>
              <ChevronRight className="size-4" />
            </Button>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-2">
            {/* Day Headers */}
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
                {day}
              </div>
            ))}

            {/* Calendar Days */}
            {paddedDays.map((date, index) => {
              const dayEvents = getEventsForDate(date);
              const isCurrentMonth = isSameMonth(date, currentDate);
              const isCurrentDay = isToday(date);

              return (
                <div
                  key={date.toISOString()}
                  className={`min-h-[100px] p-2 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors ${
                    !isCurrentMonth ? 'text-muted-foreground bg-muted/20' : ''
                  } ${isCurrentDay ? 'bg-primary/10 border-primary' : ''}`}
                  onClick={() => handleDateClick(date)}
                >
                  <div className={`text-sm font-medium mb-1 ${isCurrentDay ? 'text-primary' : ''}`}>
                    {format(date, 'd')}
                  </div>
                  
                  {/* Events for this day */}
                  <div className="space-y-1">
                    {dayEvents.slice(0, 2).map((event) => (
                      <div
                        key={event.id}
                        className="group relative"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedEvent(event);
                          setIsDetailModalOpen(true);
                        }}
                      >
                        <div className="text-xs p-1 bg-primary/20 text-primary rounded truncate cursor-pointer hover:bg-primary/30 transition-colors">
                          <div className="flex items-center justify-between">
                            <span className="truncate">
                              {format(parseISO(event.starts_at), 'HH:mm')} {event.subject}
                            </span>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="size-4 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <MoreHorizontal className="size-3" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                {/* <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDateClick(date);
                                  }}
                                >
                                  <Edit className="mr-2 size-4" />
                                  Add Event
                                </DropdownMenuItem> */}
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedEvent(event);
                                    setIsDetailModalOpen(true);
                                  }}
                                >
                                  <FileText className="mr-2 size-3" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEditEvent(event);
                                  }}
                                  disabled={event.type !== 'event'}
                                >
                                  <Edit className="mr-2 size-4" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-destructive"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteEvent(event.id);
                                  }}
                                >
                                  <Trash2 className="mr-2 size-3" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                          {/* {event.location && (
                            <div className="flex items-center mt-1 text-xs opacity-75">
                              <MapPin className="size-2 mr-1" />
                              <span className="truncate">{event.location}</span>
                            </div>
                          )} */}
                        </div>
                      </div>
                    ))}
                    {dayEvents.length > 2 && (
                      <div className="text-xs text-muted-foreground">
                        +{dayEvents.length - 2} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Selected day's Events */}
      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle className="text-lg">Events for this day</CardTitle>

          <div className="flex items-center gap-2">
            <Input
              type="date"
              value={filterDate ? format(filterDate, 'yyyy-MM-dd') : ''}
              onChange={(e) => {
                const d = e.target.value ? new Date(e.target.value) : undefined;
                setFilterDate(d);
              }}
              className="h-8 w-35 p-1 text-xs"
            />
            <Button
              size="sm"
              onClick={() => {
                setSelectedDate(filterDate ?? new Date());
                setIsAddModalOpen(true);
              }}
            >
              Add Event
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <div className="space-y-2">
            {events
              .filter(e =>
                filterDate
                  ? isSameDay(parseISO(e.starts_at), filterDate)
                  : isToday(parseISO(e.starts_at))
              ).map((event) => (
                <div
                  key={event.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => {
                    setSelectedEvent(event);
                    setIsDetailModalOpen(true);
                  }}
                >
                  {/* Event details */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Badge variant={event.status === 'cancelled' ? 'destructive' : 'outline'}>
                        {format(parseISO(event.starts_at), 'HH:mm')}
                      </Badge>
                      <span className="font-medium">{event.subject} {event.notes}</span>
                      {event.type && <Badge variant="secondary">{event.type}</Badge>}
                      <span className="font-small">{event.description}</span>
                      {event.location && (
                          <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                          <MapPin className="size-3" />
                          <span>{event.location}</span>
                          </div>
                      )}
                    </div>

                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="size-4 p-0"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreHorizontal className="size-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedEvent(event);
                          setIsDetailModalOpen(true);
                        }}
                      >
                        <FileText className="mr-2 size-3" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditEvent(event);
                        }}
                        disabled={event.type !== 'event'}
                      >
                        <Edit className="mr-2 size-3" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteEvent(event.id);
                        }}
                      >
                        <Trash2 className="mr-2 size-3" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
      <AddEventModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setSelectedDate(undefined);
        }}
        onEventAdded={fetchEvents}
        selectedDate={selectedDate}
      />

      {/* TODO implement bulk upload */}
      <AddEventBulkModal
        isOpen={isBulkModalOpen}
        onClose={() => {
          setIsBulkModalOpen(false);
          setSelectedDate(undefined);
        }}
        onEventAdded={fetchEvents}
      />

      <EventDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedEvent(null);
        }}
        event={selectedEvent}
        onDelete={handleDeleteEvent}
        onEdit={(event) => {
          // TODO: Implement edit functionality in view detail modal
          console.log('Edit event:', event);
        }}
      />
      <EditEventModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        event={selectedEvent}
        onEventUpdated={fetchEvents}
      />    
    </div>
  );
};