import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function TaskType({
  value,
  onChange,
  width,
}: {
  value: string;
  onChange: (v: string) => void;
  width?: string | '';
}) {
  return (
      <Select value={value} onValueChange={v => onChange(v)}>
    <SelectTrigger className={width}>
      <SelectValue placeholder="Filter by type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">📣 All</SelectItem>
          <SelectItem value="referrer_request">📞 Referrer Request</SelectItem>
          <SelectItem value="beneficiary_request">👨‍👩‍👧‍👦 Beneficiary Request</SelectItem>
          <SelectItem value="specialist_todo">🧭 Specialist TODO</SelectItem>
          <SelectItem value="associate_todo">💎 Associate TODO</SelectItem>
        </SelectContent>
      </Select>
  );
}