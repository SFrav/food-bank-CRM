import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useActivityForm } from "@/hooks/useActivityForm";

interface Organization {
  id: string;
  name: string;
}

interface Contact {
  id: string;
  full_name: string;
  source: "org" | "ctc";
  raw_id: string;
}

interface AddActivityProps {
  organizations: Organization[];
  contacts: Contact[];
  loadContacts: (orgId: string) => void;
  onClose: () => void;
  onAdd: () => void;
}

export function AddActivity({
  organizations,
  contacts,
  loadContacts,
  onClose,
  onAdd,
}: AddActivityProps) {
  const {
    form,
    setForm,
    selectedContactRef,
    setSelectedContactRef,
    submitAdd,  
    isSubmitting,   
  } = useActivityForm({
    organizations,
    contacts,
    loadContacts,
    onSuccess: onAdd,  
  });

  const handleSave = async () => {
    try{
      await submitAdd(); 
      onClose();       
    } catch {} 
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="activity-type">Activity Type *</Label>
        <Select
          value={form.activity_type}
          onValueChange={v => setForm({ ...form, activity_type: v as string })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="call">📞 Call</SelectItem>
            <SelectItem value="meeting_online">💻 Online Meeting</SelectItem>
            <SelectItem value="visit">🏢 Visit</SelectItem>
            <SelectItem value="go_show">📈 Go Show</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="customer">Customer</Label>
        <Select
          value={form.customer_id || "none"}
          onValueChange={v => {
            setForm({ ...form, customer_id: v === "none" ? "" : v });
            setSelectedContactRef("none");
            if (v !== "none") loadContacts(v);
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select customer" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No customer selected</SelectItem>
            {organizations.map(org => (
              <SelectItem key={org.id} value={org.id}>
                {org.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="contact">Contact Person</Label>
        <Select
          value={selectedContactRef}
          onValueChange={v => setSelectedContactRef(v)}
          disabled={!form.customer_id}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select contact person" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No contact selected</SelectItem>
            {contacts.map(c => (
              <SelectItem key={c.id} value={c.id}>
                {c.full_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="scheduled-at">Scheduled Date & Time *</Label>
        <Input
          id="scheduled-at"
          type="datetime-local"
          value={form.scheduled_at}
          onChange={e => setForm({ ...form, scheduled_at: e.target.value })}
        />
      </div>

      <div>
        <Label htmlFor="status">Status</Label>
        <Select
          value={form.status}
          onValueChange={v => setForm({ ...form, status: v as string })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="scheduled">⏰ Scheduled</SelectItem>
            <SelectItem value="done">✅ Done</SelectItem>
            <SelectItem value="canceled">❌ Canceled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={form.notes}
          onChange={e => setForm({ ...form, notes: e.target.value })}
          placeholder="Add notes about the activity..."
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
          {isSubmitting ? "Saving…" : "Save Activity"}
        </Button>
      </div>
    </div>
  );
}