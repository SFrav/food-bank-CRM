import { useEffect, useState, useReducer } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Search,  TrendingUp,  } from "lucide-react";
import { AddTask } from "@/components/modals/AddTask";
import { EditTask } from "@/components/modals/EditTask";
import { format, startOfWeek, endOfWeek, isWithinInterval } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useCalendarForm } from "@/hooks/useCalendarForm";
import TaskItem from "@/components/TaskItem";
import { TaskType } from "@/components/TaskType";

interface Task {
  id: string;
  task_type: "referrer_request" | "client_requests" | "staff_todo" | "volunteer_todo";
  customer_id: string;
  customer_name?: string;
  pic_id?: string;
  pic_name?: string;
  scheduled_at: string;
  status: "scheduled" | "done" | "cancelled";
  notes?: string;
  created_by: string;
  created_at: string;
}

interface Contact {
  id: string; // formatted as "org:{uuid}" or "ctc:{uuid}"
  name: string;
}

type FilterState = {
  searchQuery: string;
  filterType: string;
  filterStatus: string;
  dateFilter: string;
};

const filterReducer = (
  state: FilterState,
  action: { type: string; payload?: any }
) => {
  switch (action.type) {
    case "SET_SEARCH":
      return { ...state, searchQuery: action.payload };
    case "SET_TYPE":
      return { ...state, filterType: action.payload };
    case "SET_STATUS":
      return { ...state, filterStatus: action.payload };
    case "SET_DATE":
      return { ...state, dateFilter: action.payload };
    default:
      return state;
  }
};

export default function Tasks() {
  const sb = supabase as any;
  const [tasks, setTasks] = useState<Task[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  // const [isAddOpen, setIsAddOpen] = useState(false);
  // const [isEditOpen, setIsEditOpen] = useState(false);
  // const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [uiState, dispatchUI] = useReducer(
    (state: { isAddOpen: boolean; isEditOpen: boolean; editingTask: Task | null }, action: any) => {
      switch (action.type) {
        case 'OPEN_ADD':
          return { ...state, isAddOpen: true };
        case 'CLOSE_ADD':
          return { ...state, isAddOpen: false };
        case 'OPEN_EDIT':
          return { ...state, isEditOpen: true, editingTask: action.payload };
        case 'CLOSE_EDIT':
          return { ...state, isEditOpen: false, editingTask: null };
        default:
          return state;
      }
    },
    { isAddOpen: false, isEditOpen: false, editingTask: null }
  );

  const { toast } = useToast();
  const { user } = useAuth();
  const { profile } = useProfile();
  const location = useLocation();
  const navigate = useNavigate();

  const [filter, dispatchFilter] = useReducer<React.Reducer<FilterState, any>>(
    filterReducer,
    {
      searchQuery: "",
      filterType: "all",
      filterStatus: "all",
      dateFilter: "all",
    }
  );

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("quick") === "add-task") {
      dispatchUI({ type: uiState.isAddOpen ? 'CLOSE_ADD' : 'CLOSE_EDIT' });
      navigate("/tasks", { replace: true });
    }
  }, [navigate]);

  /* Load data */
  useEffect(() => {
    if (user && profile) {
      loadTasks();
      loadBeneficiaries();
    }
  }, [user, profile]);

  const loadTasks = async () => {
    if (!user || !profile) return;
    try {
      const { data: tasksData, error } = await sb.rpc("get_tasks");
      if (error) throw error;
      if (!tasksData) return;
      setTasks(tasksData as any);
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description: "Failed to load tasks.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadBeneficiaries = async () => {
    try {
      const { data, error } = await sb
        .from("contacts")
        .select("id, name")
        .eq("status", 'active')
        .order("name");
      if (error) throw error;
      setContacts(data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const thisWeekStart = startOfWeek(new Date());
  const thisWeekEnd = endOfWeek(new Date());
  const thisWeekTasks = tasks.filter((a) =>
    isWithinInterval(new Date(a.scheduled_at), {
      start: thisWeekStart,
      end: thisWeekEnd,
    })
  );

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.customer_name?.toLowerCase().includes(filter.searchQuery.toLowerCase()) ||
      task.notes?.toLowerCase().includes(filter.searchQuery.toLowerCase()) ||
      task.pic_name?.toLowerCase().includes(filter.searchQuery.toLowerCase());
    const matchesType = filter.filterType === "all" || task.task_type === filter.filterType;
    const matchesStatus = filter.filterStatus === "all" || task.status === filter.filterStatus;
    let matchesDate = true;
    if (filter.dateFilter === "today") {
      matchesDate =
        format(new Date(task.scheduled_at), "yyyy-MM-dd") ===
        format(new Date(), "yyyy-MM-dd");
    } else if (filter.dateFilter === "week") {
      matchesDate = isWithinInterval(new Date(task.scheduled_at), {
        start: thisWeekStart,
        end: thisWeekEnd,
      });
    }
    return matchesSearch && matchesType && matchesStatus && matchesDate;
  });

  const handleUpdateStatus = async (
    id: string,
    newStatus: "scheduled" | "done" | "cancelled"
  ) => {
    try {
      const { error } = await sb.from("calendar").update({ status: newStatus }).eq("id", id);
      if (error) throw error;
      toast({
        title: "Success",
        description: `Task marked as ${newStatus}!`,
      });
      loadTasks();
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description: "Failed to update status.",
        variant: "destructive",
      });
    }
  };

  const { deleteCalendar } = useCalendarForm({ onSuccess: loadTasks });
  const handleDeleteTask = async (eventId: string) => {
    try {
      await deleteCalendar(eventId);
      toast({
        title: "Success",
        description: "Event deleted successfully!",
      });
      loadTasks();
    } catch (error) {
      console.error('Error deleting event:', error);
      toast({
        title: "Error",
        description: "Failed to delete event.",
        variant: "destructive",
      });
    }
  };

  // const handleDeleteTask = async (id: string) => {
  //   try {
  //     const { error } = await sb.from("calendar").delete().eq("id", id);
  //     if (error) throw error;
  //     toast({ title: "Success", description: "Task deleted!" });
  //     loadTasks();
  //   } catch (err) {
  //     console.error(err);
  //     toast({
  //       title: "Error",
  //       description: "Failed to delete task.",
  //       variant: "destructive",
  //     });
  //   }
  // };

  if (loading) {
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

        <Dialog open={uiState.isAddOpen} onOpenChange={() => dispatchUI({ type: uiState.isAddOpen ? 'CLOSE_ADD' : 'OPEN_ADD' })}>
          <DialogTrigger asChild>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="size-4 mr-2" />
              Add Task
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Task</DialogTitle>
            </DialogHeader>
            <AddTask
              beneficiaries={contacts}
              loadContacts={loadBeneficiaries}
              onClose={() => dispatchUI({ type: uiState.isAddOpen ? 'CLOSE_ADD' : 'CLOSE_EDIT' })}
              onAdd={loadTasks}
            />
          </DialogContent>
        </Dialog>
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

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-lg">Tasks ({filteredTasks.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
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
                <TaskItem
                  key={task.id}
                  task={task}
                  onEdit={() => dispatchUI({ type: 'OPEN_EDIT', payload: task })}
                  onDelete={() => handleDeleteTask(task.id)}
                  onStatusChange={handleUpdateStatus}
                />
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={uiState.isEditOpen} onOpenChange={() => dispatchUI({ type: uiState.isEditOpen ? 'CLOSE_EDIT' : 'OPEN_EDIT' })}>
        <DialogTrigger asChild>
          <span className="sr-only" />
        </DialogTrigger>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
          </DialogHeader>
          {uiState.editingTask && (
            <EditTask
              task={uiState.editingTask}
              beneficiaries={contacts}
              loadContacts={loadBeneficiaries}
              onClose={() => dispatchUI({ type: "CLOSE_EDIT" })}
              onUpdate={loadTasks}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}