import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";

type Organization = {
  id: string;
  name: string;
};

type Contact = {
  id: string;
  full_name: string;
  source: "org" | "ctc";
  raw_id: string;
};

type SalesActivity = {
  id: string;
  activity_type: "call" | "meeting_online" | "visit" | "go_show";
  customer_id: string;
  customer_name?: string;
  pic_id?: string;
  pic_name?: string;
  scheduled_at: string;
  status: "scheduled" | "done" | "canceled";
  notes?: string;
  mom_text?: string;
  mom_added_at?: string;
  created_by: string;
  created_at: string;
};

type UseActivityFormProps = {
  initialActivity?: SalesActivity;
  organizations: Organization[];
  contacts: Contact[];
  loadContacts: (orgId: string) => void;
  onSuccess: () => void;
};

type UseActivityFormReturn = {
  form: {
    activity_type: string;
    customer_id: string;
    scheduled_at: string;
    status: string;
    notes: string;
  };
  setForm: React.Dispatch<React.SetStateAction<{
    activity_type: string;
    customer_id: string;
    scheduled_at: string;
    status: string;
    notes: string;
  }>>;
  selectedContactRef: string;
  setSelectedContactRef: React.Dispatch<React.SetStateAction<string>>;
  submitAdd: () => Promise<void>;
  submitEdit: () => Promise<void>;
  isSubmitting: boolean;
};

export function useActivityForm({
  initialActivity,
  organizations, //@not plumbed in
  contacts,
  loadContacts,
  onSuccess,
}: UseActivityFormProps): UseActivityFormReturn {
  const sb = supabase as any;
  const { toast } = useToast();
  const { user } = useAuth();

  const [form, setForm] = useState({
    activity_type: initialActivity?.activity_type ?? "call",
    customer_id: initialActivity?.customer_id ?? "",
    scheduled_at: initialActivity
      ? format(new Date(initialActivity.scheduled_at), "yyyy-MM-dd'T'HH:mm")
      : format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    status: initialActivity?.status ?? "scheduled",
    notes: initialActivity?.notes ?? "",
  });

  const [selectedContactRef, setSelectedContactRef] = useState(
    initialActivity?.pic_id ? `org:${initialActivity.pic_id}` : "none"
  );

  const [isSubmitting, setIsSubmitting] = useState(false);

  const resolvePicId = async (): Promise<string | null> => {
    if (selectedContactRef === "none" || !form.customer_id) return null;

    if (selectedContactRef.startsWith("org:")) {
      return selectedContactRef.replace("org:", "");
    }

    if (selectedContactRef.startsWith("ctc:")) {
      const selected = contacts.find((c) => c.id === selectedContactRef);
      if (!selected) return null;

      const { data, error } = await sb
        .from("organization_contacts")
        .select("id")
        .eq("organization_id", form.customer_id)
        .eq("full_name", selected.full_name)
        .maybeSingle();

      if (error) throw error;

      if (data?.id) return data.id;

      // No existing contact – create a new one
      const { data: inserted, error: insertErr } = await sb
        .from("organization_contacts")
        .insert({
          organization_id: form.customer_id,
          full_name: selected.full_name,
          email: selected.email ?? null,
          phone: selected.phone ?? null,
          is_primary: false,
          is_active: true,
          created_by: user!.id,
        })
        .select("id")
        .single();

      if (insertErr) throw insertErr;
      return inserted.id;
    }

    return null;
  };

  const submitAdd = async () => {
    if (!form.activity_type || !form.scheduled_at) {
      toast({
        title: "Error",
        description: "Please fill in Activity Type and Scheduled Date & Time.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true)
    try {
      const picId = await resolvePicId();
      const scheduledAtISO = new Date(form.scheduled_at).toISOString();

      const activityData = {
        activity_type: form.activity_type,
        customer_id: form.customer_id || null,
        pic_id: picId,
        scheduled_at: scheduledAtISO,
        status: form.status,
        notes: form.notes || null,
        created_by: user!.id,
      };

      const { error } = await sb.from("sales_activities").insert([activityData]);
      if (error) throw error;

      toast({ title: "Success", description: "Activity created!" });
      onSuccess();
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description: "Failed to create activity.",
        variant: "destructive",
      });
    }
  };

  const submitEdit = async () => {
    if (!form.activity_type || !form.scheduled_at) {
      toast({
        title: "Error",
        description: "Please fill in Activity Type and Scheduled Date & Time.",
        variant: "destructive",
      });
      return;
    }

    if (!initialActivity) return; // safety guard

    try {
      const picId = await resolvePicId();
      const scheduledAtISO = new Date(form.scheduled_at).toISOString();

      const updateData = {
        activity_type: form.activity_type,
        customer_id: form.customer_id || null,
        pic_id: picId,
        scheduled_at: scheduledAtISO,
        status: form.status,
        notes: form.notes || null,
      };

      const { error } = await sb
        .from("sales_activities")
        .update(updateData)
        .eq("id", initialActivity.id);

      if (error) throw error;

      toast({ title: "Success", description: "Activity updated!" });
      onSuccess();
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description: "Failed to update activity.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (initialActivity?.customer_id) {
      loadContacts(initialActivity.customer_id);
    }
  }, [initialActivity?.customer_id, loadContacts]);

  return {
    form,
    setForm,
    selectedContactRef,
    setSelectedContactRef,
    submitAdd,
    submitEdit,
    isSubmitting,
  };
}