import React, { memo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { User, Phone, Mail } from 'lucide-react';
import { Contact } from '@/hooks/useContacts';

interface DuplicateContactCardProps {
  contact: Contact;
  onSelect: () => void;
}

export const DuplicateContactCard = memo(({ contact, onSelect }: DuplicateContactCardProps) => (
  <Card
    key={contact.id}
    className="hover:shadow-md transition-shadow cursor-pointer"
    onClick={onSelect}
  >
    <CardContent className="pt-6">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-primary/10 rounded-lg">
          <User className="size-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold truncate">{contact.name}</h3>
        </div>
      </div>
      <div className="mt-4 space-y-2 text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <span>{contact.street_address}</span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <span>{contact.postcode}</span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Phone className="size-4 flex-shrink-0" />
          <span>{contact.phone ?? '…'}</span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground max-w-[150px]">
          <Mail className="size-4 flex-shrink-0" />
          <span className="line-clamp-1">{contact.email ?? '…'}</span>
        </div>
      </div>
    </CardContent>
  </Card>
), (prev, next) => prev.contact.id === next.contact.id);