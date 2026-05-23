import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";

type Beneficiary = {
  id: string;
  name: string;
};

type Calendar = {
  id: string;
  entry_type: "referrer_request" | "client_requests" | "staff_todo" | "volunteer_todo" | "event";
  subject?: string;
  location?: string
  beneficiary_id: string;
  scheduled_at: string;
  status: "scheduled" | "done" | "cancelled";
  notes?: string;
  created_by: string;
  created_at: string;
};

type useCalendarFormProps = {
  initialCalendar?: Calendar;
  beneficiaries?: Beneficiary[];
  loadContacts?: (coId: string) => void;
  onSuccess: () => void;
};

export type TaskT = "referrer_request" | "client_requests" | "staff_todo" | "volunteer_todo" | "event";
export type TaskStatusT = "scheduled" | "done" | "cancelled";

export function useCalendarForm({
  initialCalendar,
  loadContacts,
  onSuccess,
}: useCalendarFormProps) {
  const sb = supabase as any;
  const { toast } = useToast();
  const { user } = useAuth();

  const [form, setForm] = useState({
    entry_type: initialCalendar?.entry_type ?? "referrer_request",
    subject: initialCalendar?.subject ?? "",
    location: initialCalendar?.location ?? "",
    beneficiary_id: initialCalendar?.beneficiary_id ?? "",
    scheduled_at: initialCalendar
      ? format(new Date(initialCalendar.scheduled_at), "yyyy-MM-dd'T'HH:mm")
      : format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    status: initialCalendar?.status ?? "scheduled",
    notes: initialCalendar?.notes ?? "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitAdd = async () => {
    if (!form.entry_type || !form.scheduled_at) {
      toast({
        title: "Error",
        description: "Please fill in the required details.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const scheduledAtISO = new Date(form.scheduled_at).toISOString();

      const { error } = await sb.rpc("create_calendar", {
        p_entry_type: form.entry_type,
        p_subject: form.subject || null,
        p_location: form.subject || null,
        p_beneficiary_id: form.beneficiary_id || null,
        p_pic_id: form.beneficiary_id || null,
        p_scheduled_at: scheduledAtISO,
        p_status: form.status,
        p_notes: form.notes || null,
        p_created_by: user!.id,
      });

      if (error) throw error;

      toast({ title: "Success", description: "Calendar entry created!" });
      onSuccess();
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description: "Failed to create calendar entry.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitAddBulk = async (events: any[]) => {
    if (!user) throw new Error("User not authenticated");
    setIsSubmitting(true);
    try {
      const { error } = await sb.rpc("create_calendar_bulk", {
        events,
      });
      if (error) throw error;
      toast({ title: "Success", description: `${events.length} events added.` });
      onSuccess();
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description: "Bulk insert failed.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitEdit = async () => {
    if (!form.entry_type || !form.scheduled_at) {
      toast({
        title: "Error",
        description: "Please fill in the required details",
        variant: "destructive",
      });
      return;
    }

    if (!initialCalendar) return;

    setIsSubmitting(true);
    try {
      const scheduledAtISO = new Date(form.scheduled_at).toISOString();

      const { error } = await sb.rpc("update_calendar", {
        p_id: initialCalendar.id,
        p_entry_type: form.entry_type,
        p_subject: form.subject || null,
        p_location: form.subject || null,
        p_beneficiary_id: form.beneficiary_id || null,
        p_pic_id: form.beneficiary_id || null,
        p_scheduled_at: scheduledAtISO,
        p_status: form.status,
        p_notes: form.notes || null,
      });

      if (error) throw error;

      toast({ title: "Success", description: "Calendar updated!" });
      onSuccess();
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description: "Failed to update calendar.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteCalendar = async (calendarId: string) => {
    setIsSubmitting(true);
    try {
      const { error } = await sb.rpc("delete_calendar", { p_id: calendarId });
      if (error) throw error;
      toast({ title: "Deleted", description: "Calendar entry removed." });
      onSuccess();
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description: "Failed to delete calendar entry.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (initialCalendar?.beneficiary_id && loadContacts) {
      loadContacts(initialCalendar.beneficiary_id);
    }
  }, [initialCalendar?.beneficiary_id, loadContacts]);

  return {
    form,
    setForm,
    submitAdd,
    submitAddBulk,
    submitEdit,
    deleteCalendar,
    isSubmitting,
  };
}