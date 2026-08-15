import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, FileText, Trash2 } from 'lucide-react';

interface Service {
  id: string;
  name: string;
  org_type: 'government' | 'ngo' | 'faith_based';
  website: string ;
  phone: string | null;
  email: string | null;
  service: string| null;
  notes: string | null;
  address: {
    street: string;
    city: string;
    state: string;
    postcode: string;
    country: string;
  };
  approval_status: string | null;
  is_active: boolean;
  created_by: string | null;
  created_at: string;
  region_id: string;
}

interface DetailServiceModalProps {
  service: Service | null;
  isOpen: boolean;
  onClose: () => void;
  onDelete?: (serviceId: string) => void;
}

export default function DetailServiceModal({
  service,
  isOpen,
  onClose,
  // onEdit,
  onDelete,
}: DetailServiceModalProps) {
  if (!service) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <DialogTitle className="text-xl">{service.name}</DialogTitle>
              <DialogDescription className="mt-2">

              </DialogDescription>
            </div>
            {/* <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="size-8 p-0"
            >
              <X className="size-4" />
            </Button> */}
          </div>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Type and Status */}
          <div className="flex items-center gap-2">
            {service.service && (
              // <div className="text-muted-foreground">{service.service}</div>
              <Badge variant="secondary">{service.service}</Badge>
            )}
          </div>

          {service.address.street && (
            <div className="flex items-start gap-2 text-sm">
              <div>
                <MapPin className="size-4 text-muted-foreground mt-0.5" />
                <div className="text-muted-foreground">{`${service.address.street}, ${service.address.city}, ${service.address.postcode}`}</div>
              </div>
            </div>
          )}

          {service.phone && (
            <div className="flex items-start gap-2 text-sm">
              <div>
                <div className="font-medium">Phone</div>
                <div className="text-muted-foreground">{service.phone}</div>
              </div>
            </div>
          )}

          {service.email && (
            <div className="flex items-start gap-2 text-sm">
              <div>
                <div className="font-medium">Email</div>
                <div className="text-muted-foreground">{service.email}</div>
              </div>
            </div>
          )}

          {/* Description */}
          {service.notes && (
            <div className="flex items-start gap-2 text-sm">
              <FileText className="size-4 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <div className="font-medium mb-1">Notes</div>
                <div className="text-muted-foreground whitespace-pre-wrap">
                  {service.notes}
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 mt-6 pt-4 border-t">
          {onDelete && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                  onDelete(service.id);
                  onClose();
              }}
            >
              <Trash2 className="size-4 mr-2" />
              Delete
            </Button>
          )}
          {/* {onEdit && (
            <Button
              variant="default"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleEditservice(service);
                onClose();
              }}
            >
              <Edit className="size-4 mr-2" />
              Edit
            </Button>
          )} */}
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

