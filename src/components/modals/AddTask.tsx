import React, { useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCalendarForm, TaskT, TaskStatusT } from "@/hooks/useCalendarForm";
import { TaskType } from "@/components/TaskType";

interface Beneficiary {
  id: string;
  name: string;
}

interface AddTaskProps {
  isOpen: boolean;
  beneficiaries: Beneficiary[];
  loadContacts: (cId: string) => void;
  onClose: () => void;
  onAdd: () => void;
}

export default function AddTaskModal({
  isOpen,
  beneficiaries,
  loadContacts,
  onClose,
  onAdd,
}: AddTaskProps) {
  const { form, setForm, createEvent: createTask, isSubmitting, } = useCalendarForm({ beneficiaries, loadContacts, onSuccess: onAdd, });

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setForm((prev) => ({ ...prev, [name]: value }));
    }, []);
    // e => setForm({ ...form, scheduled_at: e.target.value })

  const handleSave = async () => {
    const { success } = await createTask(); 
    if(success){
      onClose(); 
    };      
  };

  const handleClose = () => {
    onClose();
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[525px]">
      <DialogHeader>
        <DialogTitle>Add New Task</DialogTitle>
        <DialogDescription> </DialogDescription>
      </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="task-type">Task Type *</Label>
            <TaskType
              value={form.entry_type}
              onChange={(v: TaskT) => setForm({ ...form, entry_type: v })}
            />
          </div>

          {form.entry_type === "beneficiary_request" && (
          <div>
            <Label htmlFor="beneficiary">Beneficiary</Label>
            <Select
              value={form.beneficiary_id || "none"}
              onValueChange={v => {
                setForm({ ...form, beneficiary_id: v === "none" ? "" : v });
                if (v !== "none") loadContacts(v);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select beneficiary" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No beneficiary selected</SelectItem>
                {beneficiaries.map(co => (
                  <SelectItem key={co.id} value={co.id}>
                    {co.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

          <div>
            <Label htmlFor="scheduled-at">Scheduled Date & Time *</Label>
            <Input
              id="scheduled-at"
              name="scheduled_at"
              type="datetime-local"
              value={form.scheduled_at}
              onChange={handleInputChange}
            />
          </div>

          <div>
            <Label htmlFor="status">Status</Label>
            <Select
              value={form.status}
              onValueChange={(v: TaskStatusT) => setForm({ ...form, status: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="scheduled">⏰ Scheduled</SelectItem>
                <SelectItem value="done">✅ Done</SelectItem>
                <SelectItem value="cancelled">❌ Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              name="notes"
              value={form.notes}
              onChange={handleInputChange}
              placeholder="Add notes about the task..."
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave} className="bg-primary hover:bg-primary/90"
                    disabled={isSubmitting}
                    >
              {isSubmitting ? "Saving…" : "Save Task"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}