import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function TaskType({
  value,
  onChange,
  width,
}: {
  value: string;
  onChange: (v: string) => void;
  width: string;
}) {
  return (
      <Select value={value} onValueChange={v => onChange(v)}>
    <SelectTrigger className={width}>
      <SelectValue placeholder="Filter by type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">📣 All</SelectItem>
          <SelectItem value="referrer_request">📞 Referrer Request</SelectItem>
          <SelectItem value="client_requests">👨‍👩‍👧‍👦 Beneficiary Requests</SelectItem>
          <SelectItem value="staff_todo">🧭 Staff TODO</SelectItem>
          <SelectItem value="volunteer_todo">💎 Volunteer TODO</SelectItem>
        </SelectContent>
      </Select>
  );
}