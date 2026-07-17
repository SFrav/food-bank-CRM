import { CheckCircle, XCircle, Clock } from 'lucide-react';
import { CalendarEvent } from '@/components/CalendarView';

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
  
const CalendarStatusIcon: React.FC<{
  status: CalendarEvent['status'];
  className?: string;
}> = ({ status, className }) => {

  const Icon = getStatusIcon(status); 
  return <Icon className={className} />;
};

export default CalendarStatusIcon;
