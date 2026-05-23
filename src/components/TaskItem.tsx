import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Phone, Baby, ShipWheel, CheckCircle, XCircle, Clock, Edit, Trash2, Gem } from "lucide-react";

interface Task {
  id: string;
  entry_type: "referrer_request" | "client_requests" | "staff_todo" | "volunteer_todo" | "event";
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

interface TaskItemProps {
  task: Task;
  onEdit: () => void;
  onDelete: () => void;
  onStatusChange: (
    id: string,
    newStatus: "scheduled" | "done" | "cancelled"
  ) => void;
}

interface TaskItemProps {
  task: Task;
  onEdit: () => void;
  onDelete: () => void;
  onStatusChange: (
    id: string,
    newStatus: "scheduled" | "done" | "cancelled"
  ) => void;
}

export default function TaskItem({
  task,
  onEdit,
  onDelete,
  onStatusChange,
}: TaskItemProps) {
  const formattedDate = format(
    new Date(task.scheduled_at),
    "MMM d, yyyy 'at' HH:mm"
  );

  const getTaskIcon = (type: string) => {
    switch (type) {
      case "referrer_request":
        return Phone;
      case "client_requests":
        return Baby;
      case "staff_todo":
        return ShipWheel;
      case "volunteer_todo":
        return Gem;
      default:
        return Phone;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "done":
        return CheckCircle;
      case "cancelled":
        return XCircle;
      case "scheduled":
      default:
        return Clock;
    }
  };

  const getTaskBadgeColor = (type: string) => {
    const variants = {
      call: "bg-sky-50 text-sky-700 border-sky-200 hover:bg-sky-100",
      client_requests:
        "bg-violet-50 text-violet-700 border-violet-200 hover:bg-violet-100",
      staff_todo: "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100",
      volunteer_todo:
        "bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100",
    };
    return variants[type as keyof typeof variants] ?? variants.call;
  };

  const getStatusBadgeColor = (status: string) => {
    const variants = {
      scheduled: "bg-amber-50 text-amber-700 border-amber-200",
      done: "bg-emerald-50 text-emerald-700 border-emerald-200",
      cancelled: "bg-red-50 text-red-700 border-red-200",
    };
    return variants[status as keyof typeof variants] ?? variants.scheduled;
  };

  const TaskIcon = getTaskIcon(task.entry_type);
  const StatusIcon = getStatusIcon(task.status);

  return (
    <div
      key={task.id}
      className="p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2 flex-1">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <TaskIcon className="size-4" />
              <Badge className={`${getTaskBadgeColor(task.entry_type)} border`}>
                {task.entry_type.replace("_", " ")}
              </Badge>
              <Badge className={`${getStatusBadgeColor(task.status)} border`}>
                <StatusIcon className="size-3 mr-1" />
                {task.status}
              </Badge>
            </div>
          </div>

          {/* <div className="space-y-1">
            <h4 className="font-medium text-foreground">{task.customer_name}</h4>
            {task.pic_name && (
              <p className="text-sm text-muted-foreground">Contact: {task.pic_name}</p>
            )}
          </div> */}

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>{formattedDate}</span>
          </div>

          {task.notes && (
            <p className="text-sm text-muted-foreground bg-muted/50 rounded p-2">
              {task.notes}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 ml-4">
          {task.status === "scheduled" && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onStatusChange(task.id, "done")}
              >
                <CheckCircle className="size-3 mr-1" />
                Done
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onStatusChange(task.id, "cancelled")}
              >
                <XCircle className="size-3 mr-1" />
                Cancel
              </Button>
            </>
          )}
          <Button variant="outline" size="sm" onClick={onEdit}>
            <Edit className="size-3" />
          </Button>
          <Button variant="outline" size="sm" onClick={onDelete}>
            <Trash2 className="size-3" />
          </Button>
        </div>
      </div>
    </div>
  );
}