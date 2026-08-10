import { useReducer, useEffect, useCallback } from 'react'; //, lazy, Suspense
import { CalendarView, CalendarEvent } from '@/components/CalendarView';
import { SelectedDayEvents } from '@/components/CalendarSelected';
import { useAuth } from '@/hooks/useAuth';
import { useCalendar } from '@/hooks/useCalendar';
import AddEventModal from '@/components/modals/AddEvent';
import AddEventBulkModal from '@/components/modals/AddEventBulk';
import EditEventModal from '@/components/modals/EditEvent';
import EventDetailModal from '@/components/modals/DetailEvent';
import { addMonths } from 'date-fns';

// const AddEventModal = lazy(() =>
//   import('@/components/modals/AddEvent')
// );

// const AddEventBulkModal = lazy(() =>
//   import('@/components/modals/AddEventBulk')
// );

// const EditEventModal = lazy(() =>
//   import('@/components/modals/EditEvent')
// );

// const EventDetailModal = lazy(() =>
//   import('@/components/modals/DetailEvent')
// );

type UIState = {
  isAddOpen: boolean;
  isBulkOpen: boolean;
  isEditOpen: boolean;
  isDetailOpen: boolean;
  selectedEvent: CalendarEvent | null;
  selectedDate: Date | null;
  currentDate: Date;
};

type UIAction =
  | { type: 'OPEN_ADD' }
  | { type: 'CLOSE_ADD' }
  | { type: 'OPEN_BULK' }
  | { type: 'CLOSE_BULK' }
  | { type: 'OPEN_DETAIL'; payload: CalendarEvent | null }
  | { type: 'CLOSE_DETAIL' }
  | { type: 'SET_CURRENT'; payload: Date | null }
  | { type: 'SET_SELECTED_DATE'; payload: Date | null }
  | { type: 'OPEN_ADD' }
  | { type: 'OPEN_EDIT'; payload: CalendarEvent }
  | { type: 'CLOSE_EDIT'; payload: null }
  | { type: 'CLOSE_ADD' | 'OPEN_ADD' }
  | { type: 'CLOSE_ADD' | 'CLOSE_EDIT'};

const initialState: UIState = {
  isAddOpen: false,
  isBulkOpen: false,
  isEditOpen: false,
  isDetailOpen: false,
  selectedEvent: null,
  selectedDate: null,
  currentDate: new Date(),
};


function reducer(state: UIState, action: UIAction): UIState {
  switch (action.type) {
    case 'OPEN_ADD':
      return { ...state, isAddOpen: true };
    case 'CLOSE_ADD':
      return { ...state, isAddOpen: false };
    case 'OPEN_BULK':
      return { ...state, isBulkOpen: true };
    case 'CLOSE_BULK':
      return { ...state, isBulkOpen: false };
    case 'OPEN_EDIT':
      return { ...state, isEditOpen: true, selectedEvent: action.payload };
    case 'CLOSE_EDIT':
      return { ...state, isEditOpen: false, selectedEvent: null };
    case 'OPEN_DETAIL':
      return { ...state, isDetailOpen: true, selectedEvent: action.payload };
    case 'CLOSE_DETAIL':
      return { ...state, isDetailOpen: false, selectedEvent: null };
    case 'SET_CURRENT':
      return { ...state, currentDate: action.payload };
    case 'SET_SELECTED_DATE':
      return { ...state, selectedDate: action.payload };
    default:
      return state;
  }
}

export default function Calendar() {
  const { user } = useAuth();
  const { events, loading, fetchEvents, deleteEvent } = useCalendar();
  const [ui, dispatch] = useReducer(reducer, initialState);

  const navigate = useCallback((dir: 'prev' | 'next') => {
    const newDate = dir === 'prev'
      ? addMonths(ui.currentDate, -1)
      : addMonths(ui.currentDate, 1);
    dispatch({ type: 'SET_CURRENT', payload: newDate });
  }, [ui.currentDate]);

  const handleDateClick = useCallback((d: Date) => {
    dispatch({ type: 'SET_SELECTED_DATE', payload: d });
    dispatch({ type: 'CLOSE_ADD' });
    dispatch({ type: 'CLOSE_DETAIL' });
  }, [dispatch]);

  const handleEventClick = useCallback((e: CalendarEvent) => {
    dispatch({ type: 'OPEN_DETAIL', payload: e });
  }, [dispatch]);

  const handleEditEvent = useCallback((e: CalendarEvent) => {
    dispatch({ type: 'OPEN_EDIT', payload: e });
  }, [dispatch]);

  const handleDeleteEvent = useCallback(async (id: string) => {
    await deleteEvent(id);
    dispatch({ type: 'CLOSE_DETAIL' });
  }, [deleteEvent, dispatch]);

  useEffect(() => {
    if (!user) return;
    fetchEvents(ui.currentDate);
  }, [user, ui.currentDate, fetchEvents]);

  return (
    <div className="space-y-6">
      <CalendarView
        events={events}
        isLoading={loading}
        currentDate={ui.currentDate}
        onPrev={() => navigate('prev')}
        onNext={() => navigate('next')}
        onDateClick={handleDateClick}
        onEventClick={handleEventClick}
        onEditClick={handleEditEvent}
        onDeleteClick={handleDeleteEvent}
        onAdd={() => dispatch({ type: 'OPEN_ADD' })}
        onBulkAdd={() => dispatch({ type: 'OPEN_BULK' })}
      />

      <SelectedDayEvents
        events={events}
        date={ui.selectedDate || new Date()}
        onDateSelect={handleDateClick}
        onEdit={handleEditEvent}
        onDelete={handleDeleteEvent}
        onView={handleEventClick}
        onAdd={() => dispatch({ type: 'OPEN_ADD' })}
      />

      {/* <Suspense fallback={<div className="p-4">Loading Modal &hellip;</div>}> */}
        <AddEventModal
          isOpen={ui.isAddOpen}
          onClose={() => dispatch({ type: 'CLOSE_ADD' })}
          selectedDate={ui.selectedDate}
          onAdd={() => fetchEvents(ui.currentDate)}
        />
      {/* </Suspense> */}

      {/* <Suspense fallback={<div className="p-4">Loading Modal &hellip;</div>}> */}
        <AddEventBulkModal
          isOpen={ui.isBulkOpen}
          onClose={() => dispatch({ type: 'CLOSE_BULK' })}
          onAdd={() => fetchEvents(ui.currentDate)}
        />
      {/* </Suspense> */}

      {/* <Suspense fallback={<div className="p-4">Loading Modal &hellip;</div>}> */}
        <EventDetailModal
          isOpen={ui.isDetailOpen}
          onClose={() => dispatch({ type: 'CLOSE_DETAIL' })}
          event={ui.selectedEvent}
          onDelete={handleDeleteEvent}
        />
      {/* </Suspense> */}

      {/* <Suspense fallback={<div className="p-4">Loading Modal &hellip;</div>}> */}
        <EditEventModal
          isOpen={ui.isEditOpen}
          onClose={() => dispatch({ type: 'CLOSE_EDIT' })}
          event={ui.selectedEvent}
          onUpdate={() => fetchEvents(ui.currentDate)}
        />
      {/* </Suspense> */}
    </div>
  );
}