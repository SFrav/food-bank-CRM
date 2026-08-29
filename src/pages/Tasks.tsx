import { useEffect, useState, useReducer, useCallback } from "react"; //, lazy, Suspense
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search,  TrendingUp,  } from "lucide-react";
import AddTaskModal from "@/components/modals/AddTask";
import EditTaskModal from "@/components/modals/EditTask";
import { format, startOfWeek, endOfWeek, isWithinInterval } from "date-fns";
// import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useContacts, Contact } from '@/hooks/useContacts';
import { useTasks, Task, TaskStatus } from '@/hooks/useTasks';
import TaskSelected from "@/components/TaskSelected";
import { TaskType } from "@/components/TaskType";

// const AddTaskModal = lazy(() =>
//   import('@/components/modals/AddTask')
// );

// const EditTaskModal = lazy(() =>
//   import('@/components/modals/EditTask')
// );

type UIState = {
  isAddOpen: boolean;
  isEditOpen: boolean;
  selectedTask: Task | null;
};


const initialState: UIState = {
  isAddOpen: false,
  isEditOpen: false,
  selectedTask: null,
};

type FilterState = {
  searchQuery: string;
  filterType: string;
  filterStatus: string;
  dateFilter: string;
};

type UIAction =
  | { type: 'OPEN_ADD' }
  | { type: 'CLOSE_ADD' }
  | { type: 'OPEN_EDIT'; payload: Task }
  | { type: 'CLOSE_EDIT'; payload: null }
  | { type: 'CLOSE_ADD' | 'OPEN_ADD' }
  | { type: 'CLOSE_ADD' | 'CLOSE_EDIT'};

type FilterAction =
  | { type: 'SET_SEARCH'; payload: string }
  | { type: 'SET_TYPE'; payload: string }
  | { type: 'SET_STATUS'; payload: string }
  | { type: 'SET_DATE'; payload: string };

const filterReducer = (
  state: FilterState,
  action: FilterAction
): FilterState => {
  switch (action.type) {
    case 'SET_SEARCH':
      return { ...state, searchQuery: action.payload };
    case 'SET_TYPE':
      return { ...state, filterType: action.payload };
    case 'SET_STATUS':
      return { ...state, filterStatus: action.payload };
    case 'SET_DATE':
      return { ...state, dateFilter: action.payload };
    default:
      return state;
  }
};

function stateReducer(state: UIState, action: UIAction ): UIState {
  switch (action.type) {
    case 'OPEN_ADD':
      return { ...state, isAddOpen: true };
    case 'CLOSE_ADD':
      return { ...state, isAddOpen: false };
    case 'OPEN_EDIT':
      return { ...state, isEditOpen: true, selectedTask: action.payload };
    case 'CLOSE_EDIT':
      return { ...state, isEditOpen: false, selectedTask: null };
    default:
      return state;
  }
}

export default function Tasks() {
  // const { user } = useAuth();
  const { profile } = useProfile();
  const { tasks, loading, fetch: loadTasks, updateStatus, deleteTask } = useTasks(); 
  const { contacts, loading: contactsLoading } = useContacts();       
  const [beneficiaries, setBeneficiaries] = useState<Contact[]>([]);

  const [ui, dispatchUI] = useReducer(stateReducer, initialState);

  
  // const [uiState, dispatchUI] = useReducer<
  //   { isAddOpen: boolean; isEditOpen: boolean; editingTask: Task | null },
  //   any
  // >(
  //   (state, action) => {
  //     switch (action.type) {
  //       case 'OPEN_ADD':
  //         return { ...state, isAddOpen: true };
  //       case 'CLOSE_ADD':
  //         return { ...state, isAddOpen: false };
  //       case 'OPEN_EDIT':
  //         return { ...state, isEditOpen: true, editingTask: action.payload };
  //       case 'CLOSE_EDIT':
  //         return { ...state, isEditOpen: false, editingTask: null };
  //       default:
  //         return state;
  //     }
  //   },
  //   { isAddOpen: false, isEditOpen: false, editingTask: null }
  // );

  const [filter, dispatchFilter] = useReducer(filterReducer, {
    searchQuery: '',
    filterType: 'all',
    filterStatus: 'all',
    dateFilter: 'all',
  });

useEffect(() => {
  // if (!user || !profile) return;
  if (!profile) return;
  const active = contacts.filter((c) => c.status === "active");
  setBeneficiaries(active);
}, [profile, contacts]); //user, 


  const loadBeneficiaries = (): Contact[] => {
    return beneficiaries;
  };

  const thisWeekStart = startOfWeek(new Date());
  const thisWeekEnd   = endOfWeek(new Date());

  const thisWeekTasks = tasks.filter((t) =>
    isWithinInterval(new Date(t.scheduled_at), {
      start: thisWeekStart,
      end:   thisWeekEnd,
    })
  );

  const filteredTasks = tasks.filter((t) => {
    const matchesSearch =
      t.beneficiary_name?.toLowerCase().includes(filter.searchQuery.toLowerCase()) ||
      t.notes?.toLowerCase().includes(filter.searchQuery.toLowerCase()) ||
      t.pic_name?.toLowerCase().includes(filter.searchQuery.toLowerCase());

    const matchesType = filter.filterType === 'all' || t.entry_type === filter.filterType;
    const matchesStatus = filter.filterStatus === 'all' || t.status === filter.filterStatus;

    let matchesDate = true;
    if (filter.dateFilter === 'today') {
      matchesDate =
        format(new Date(t.scheduled_at), 'yyyy-MM-dd') ===
        format(new Date(), 'yyyy-MM-dd');
    } else if (filter.dateFilter === 'week') {
      matchesDate = isWithinInterval(new Date(t.scheduled_at), {
        start: thisWeekStart,
        end:   thisWeekEnd,
      });
    }

    return matchesSearch && matchesType && matchesStatus && matchesDate;
  });

  const handleOpenAdd = useCallback(() => dispatchUI({ type: ui.isAddOpen ? 'CLOSE_ADD' : 'OPEN_ADD' }), [dispatchUI, ui]);
  const handleOpenEdit = useCallback((task: Task) => dispatchUI({ type: 'OPEN_EDIT', payload: task }), [dispatchUI]); //@ uses in-line call
  const handleCloseAdd = useCallback(() => dispatchUI({ type: ui.isAddOpen ? 'CLOSE_ADD' : 'CLOSE_EDIT' }), [dispatchUI, ui]);
  const handleCloseEdit = useCallback(() => dispatchUI({ type: 'CLOSE_EDIT' }), [dispatchUI]);

  const handleUpdateStatus = async (id: string, newStatus: TaskStatus) => {
    const { success, error } = await updateStatus(id, newStatus);
    if(!error || success) await loadTasks();
  };

  const handleDeleteTask = async (eventId: string) => { //@ uses in-line call
    try {
      const { success, error } = await deleteTask(eventId);
      if(!error || success) await loadTasks();
    } catch (error) {
      console.error('Error deleting event:', error);
    }
  };

  if (loading && tasks.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        Loading tasks…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Badge className="bg-primary/10 text-primary border-primary/20 flex items-center gap-1">
            <TrendingUp className="size-3" />
            {thisWeekTasks.length} this week
          </Badge>
        </div>
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90" onClick={handleOpenAdd}>
            <Plus className="size-4 mr-2" />
            Add Task
          </Button>
      </div>

      <Card className="bg-card border-border">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground size-4" />
              <Input
                placeholder="Search tasks …"
                value={filter.searchQuery}
                onChange={(e) =>
                  dispatchFilter({ type: "SET_SEARCH", payload: e.target.value })
                }
                className="pl-10"
              />
            </div>

            <div className="flex gap-2">
              <TaskType
                value={filter.filterType}
                onChange={(v) => dispatchFilter({ type: "SET_TYPE", payload: v })}
                width="w-[150px]"
              />
 
              <Select
                value={filter.filterStatus}
                onValueChange={(v) =>
                  dispatchFilter({ type: "SET_STATUS", payload: v })
                }
              >
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Status filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="scheduled">⏰ Scheduled</SelectItem>
                  <SelectItem value="done">✅ Done</SelectItem>
                  <SelectItem value="cancelled">❌ Cancelled</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={filter.dateFilter}
                onValueChange={(v) => dispatchFilter({ type: "SET_DATE", payload: v })}
              >
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Date filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border-border max-h-[calc(100vh-20rem)] overflow-hidden">
        <CardHeader>
          <CardTitle className="text-lg">Tasks ({filteredTasks.length})</CardTitle>
        </CardHeader>
        <CardContent className="overflow-y-auto">
          <div className="space-y-4 max-h-[calc(100vh-16rem)]">
            {filteredTasks.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No tasks found.{" "}
                {filter.searchQuery ||
                filter.filterType !== "all" ||
                filter.filterStatus !== "all" ||
                filter.dateFilter !== "all"
                  ? "Try adjusting your filters."
                  : "Add your first task!"}
              </div>
            ) : (
              filteredTasks.map((task) => (
                <TaskSelected
                  key={task.id}
                  task={task}
                  onEdit={() => handleOpenEdit(task)}
                  onDelete={() => handleDeleteTask(task.id)}
                  onStatusChange={handleUpdateStatus}
                />
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* <Suspense fallback={<div className="p-4">Loading Modal &hellip;</div>}> */}
        <AddTaskModal
          isOpen={ui.isAddOpen}
          beneficiaries={beneficiaries}
          loadContacts={loadBeneficiaries}
          onClose={handleCloseAdd}
          onAdd={loadTasks}
        />
      {/* </Suspense> */}
      {ui.selectedTask && (
      // <Suspense fallback={<div className="p-4">Loading Modal &hellip;</div>}>
        <EditTaskModal
          isOpen={ui.isEditOpen}
          task={ui.selectedTask}
          beneficiaries={beneficiaries}
          loadContacts={loadBeneficiaries}
          onClose={handleCloseEdit}
          onUpdate={loadTasks}
        />
      // </Suspense>
      )}
    </div>
  );
}