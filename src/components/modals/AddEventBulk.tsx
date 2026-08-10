import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { NativeFileUploader } from '@/components/FileDropzone';
import { useCalendarForm, CalendarCreateInput, TaskT, TaskStatusT } from "@/hooks/useCalendarForm";

interface AddEventBulkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: () => void;
}

type EventRecord = {
  entry_type: TaskT;
  title: string | null;
  event_title: string | null;
  name: string | null;
  location: string | null;
  date: string;
  time: string;
  status: TaskStatusT;
  description: string | null;
};


// export const AddEventBulkModal: React.FC<AddEventBulkModalProps> = ({
//   isOpen,
//   onClose,
//   onAdd,
// }) => {

export default function AddEventBulkModal({
  isOpen,
  onClose,
  onAdd,
}: AddEventBulkModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const { createEventBulk } = useCalendarForm({ onSuccess: onAdd });
  const [isLoading, setIsLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [events, setEvents] = useState<CalendarCreateInput[]>([]);
  const [fileName, setFileName] = useState<string>("");

  const stripQuotes = (s: string | null | undefined) => {
    if (!s) return "";
    return s.replace(/^["']|["']$/g, "").trim();
  };

  const toISO = (dateStr?: string, timeStr = "10:00:00"): string | null => {
    if (!dateStr) return null;
    const cleaned = stripQuotes(dateStr).trim();
    if (!cleaned) return null;

    const dateParts = cleaned.includes("/") ? cleaned.split("/") : cleaned.split("-");
    if (dateParts.length !== 3) return null;

    let day: number, month: number, year: number;
    if (dateParts[0].length === 4) {
      year = parseInt(dateParts[0], 10);
      month = parseInt(dateParts[1], 10);
      day = parseInt(dateParts[2], 10);
    } else {
      day = parseInt(dateParts[0], 10);
      month = parseInt(dateParts[1], 10);
      year = parseInt(dateParts[2], 10);
    }

    if ([day, month, year].some(n => isNaN(n))) return null;

    const paddedMonth = month.toString().padStart(2, "0");
    const paddedDay = day.toString().padStart(2, "0");

    let time = timeStr.trim();
    if (time.length === 5) time += ":00";

    const isoString = `${year}-${paddedMonth}-${paddedDay}T${time}`;
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return null;
    return d.toISOString();
  };

  const parseCSV = (text: string) => {
    const cleaned = text.replace(/^\uFEFF/, "");
    const rows = cleaned.split(/\r?\n/).filter(l => l.trim().length);
    if (rows.length === 0) return [];
    const headers = rows[0]
      .split(",")
      .map(h => stripQuotes(h).toLowerCase().trim());
    return rows.slice(1).map(line => {
      const values = line.split(",").map(v => stripQuotes(v));
      const obj: any = {};
      headers.forEach((h, i) => {
        obj[h] = values[i] ?? null;
      });
      return obj;
    });
  };

  const handleFileSelected = (files: File[]) => {
    const f = files[0];
    setFile(f);
    setFileName(f.name);
    const reader = new FileReader();

    reader.onload = (e) => {
      const content = e.target?.result as string;
      const rows = parseCSV(content);
      console.log("CSV rows parsed:", rows.length);   // debug line
      const mapped = rows
        .filter((row) => row.date)
        .map((row: EventRecord) => ({
          entry_type: "event" as TaskT,
          subject:
            stripQuotes(row.title) ||
            stripQuotes(row.event_title) ||
            stripQuotes(row.name) ||
            "",
          location: stripQuotes(row.location) || null,
          beneficiary_id: null,
          pic_id: null,
          scheduled_at: toISO(row.date, row.time) ?? null,
          status: stripQuotes(row.status) as TaskStatusT ?? "scheduled" as TaskStatusT,
          notes: stripQuotes(row.description) || null,
          created_by: user?.id,
        }))
        .filter((e) => e.subject && e.scheduled_at);

      console.log("Valid events to submit:", mapped.length); // debug line
      setEvents(mapped);
    };

    reader.readAsText(f);
  };

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();

    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to add events.",
        variant: "destructive",
      });
      return;
    }

    if (events.length === 0) {
      toast({
        title: "Error",
        description: "No valid events parsed from file.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await createEventBulk(events);
      setEvents([]);
      setFile(null);
      setFileName("");
      onClose();
    } catch (err: unknown) {
      // const error = err as { message?: string }; 
      console.error("Bulk add error:", err);
      toast({
        title: "Error",
        description: "Failed to add bulk events.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setFileName("");
    onClose();
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Bulk Add Events</DialogTitle>
          <DialogDescription>
            Upload a CSV file to add multiple events at once. 
          </DialogDescription>
          <DialogDescription>
          Column names: title, location, date and time (separate) and description
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <NativeFileUploader
            onFilesSelected={handleFileSelected}
            accept={[".csv"]}
            maxSize={5 * 1024 * 1024}
            maxFiles={1}
            multiple={false}
          />

          {fileName && (
            <p className="text-sm text-muted-foreground">
              Selected file: {fileName}
            </p>
          )}

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || events.length === 0}>
              {isLoading ? "Adding..." : `Add ${events.length} Events`}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};