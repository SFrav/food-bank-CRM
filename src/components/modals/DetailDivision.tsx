import { MapPin } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { DivisionCombined } from '@/pages/Divisions';
import { format } from 'date-fns';

interface DetailDivisionModalProps {
  division: DivisionCombined | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function DetailDivisionModal({ division, isOpen, onClose }: DetailDivisionModalProps) {
  if (!division) return null;

  const days = [
    { label: 'Sun', isSelected: division.is_open_sun, dayIndex: 0 },
    { label: 'Mon', isSelected: division.is_open_mon, dayIndex: 1 },
    { label: 'Tue', isSelected: division.is_open_tue, dayIndex: 2 },
    { label: 'Wed', isSelected: division.is_open_wed, dayIndex: 3 },
    { label: 'Thu', isSelected: division.is_open_thu, dayIndex: 4 },
    { label: 'Fri', isSelected: division.is_open_fri, dayIndex: 5 },
    { label: 'Sat', isSelected: division.is_open_sat, dayIndex: 6 },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <DialogTitle className="text-xl">{division.name}</DialogTitle>
              <DialogDescription className="mt-2">
                {/* {division.street_address && <span className="text-muted-foreground">{division.street_address}</span>} */}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 mt-4">
            {division.street_address && (
            <div className="flex flex-row justify-between">
            <div className="flex flex-row items-start gap-2">
                <MapPin className="size-4 text-muted-foreground mt-1" />
                <p className="text-muted-foreground">{`${division.street_address}${division.postcode ? `, ${division.postcode}` : ''}`}</p>
              </div>
                {division.fee && <Badge variant="secondary">Fee: {division.currency}{division.fee}</Badge>}
            </div>
          )}
          <div className="flex flex-col gap-2 border-b pb-4 max-w-[210px]">
            {division.allotment_weeks && <Badge variant="secondary">{"Allowable duration (max)"}: {division.allotment_weeks} weeks</Badge>}
            {division.frequency && <Badge variant="secondary">{"Frequency per week (max)"}: {division.frequency}</Badge>}
            {division.exclusion_weeks && <Badge variant="secondary">{"Exclusion period"}: {division.exclusion_weeks} weeks</Badge>}
          </div>

          <label className="text-muted-foreground">Opening days:</label>
          <div className="grid grid-cols-7 gap-2 mt-1 border-b pb-2">
            {days.map((d, i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <label className="text-muted-foreground">{d.label}</label>
                <input
                  type="checkbox"
                  // disabled={true}
                  checked={d.isSelected}
                  readOnly
                  className="size-4 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
            ))}
          </div>

          {division.nextClosed && (
            <div className="flex items-start gap-2">
              <div className="flex-1">
                <label className="text-muted-foreground">Next Closed Date</label>
                <div className="text-muted-foreground">{format(division.nextClosed, "dd-MM-yyyy")}</div>
              </div>
            </div>
          )}

        </div>

        <div className="flex items-center justify-end gap-2 mt-6 pt-4 border-t">
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
