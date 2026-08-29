import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { TableCell, TableRow } from '@/components/ui/table';
import { StatusBadge } from '@/components/StatusBadge';
import { PermissionGuard } from '@/components/PermissionGuard';
import { Contact } from '@/hooks/useContacts';

import { CheckedState } from '@radix-ui/react-checkbox';

interface ContactRowProps {
  contact: Contact;
  index: number;
  selected: Set<string>;
  filterQueue: boolean;
  totalCount: number;
  onCheckedChange: (checked: CheckedState, id: string) => void;
  onEdit: (contact: Contact) => void;
}

export const ContactRow = React.memo(({
     contact,
     index,
     selected,
     filterQueue,
     totalCount,
     onCheckedChange,
     onEdit
   }: ContactRowProps) => {
     const showCheckbox = !filterQueue && totalCount > 1
     return(
      <TableRow
        //  key={contact.id}
         className="cursor-pointer hover:bg-muted/50"
         onClick={() => onEdit(contact)}
       >
         {showCheckbox ? (
           <TableCell className="font-medium">
             <PermissionGuard permission="canMergeBeneficiaries">
               <div onClick={(e) => e.stopPropagation()}>
                 <Checkbox
                   checked={selected.has(contact.id)}
                   onCheckedChange={(checked) => onCheckedChange(checked, contact.id)}
                 />
               </div>
             </PermissionGuard>
           </TableCell>
         ) : (
           <TableCell className="font-medium size-4">
             {index + 1}
           </TableCell>
         )}
         <TableCell className="sm:table-cell sm:max-w-[100px] sm:line-clamp-2">{contact.name}</TableCell>
         <TableCell className="sm:table-cell sm:max-w-[125px] line-clamp-2">
           {contact.email ? (
             <span>{contact.email}</span>
           ) : (
             <span className="text-muted-foreground">&hellip;</span>
           )}
         </TableCell>
         <TableCell className="sm:table-cell sm:max-w-[80px]">
           {contact.phone ? (
             <span>{contact.phone}</span>
           ) : (
             <span className="text-muted-foreground">&hellip;</span>
           )}
         </TableCell>
         <TableCell className="sm:table-cell sm:max-w-[200px]">
           {contact.status ? (
             <StatusBadge role={contact.status} />
           ) : (
             <span className="text-muted-foreground">&hellip;</span>
           )}
         </TableCell>
         <TableCell className="text-xs text-muted-foreground pl-3 pr-3 sm:table-cell sm:max-w-[120px]">
           {contact.notes ? (
             <span className="line-clamp-2" title={contact.notes}>
               {contact.notes}
             </span>
           ) : (
             <span className="line-clamp-2"> &hellip; </span>
           )}
         </TableCell>
       </TableRow>
     );
   }, (prev, next) => {
     return (
       prev.contact.id === next.contact.id &&
       prev.selected === next.selected &&
       prev.filterQueue === next.filterQueue &&
       prev.totalCount === next.totalCount &&
       prev.index === next.index
     );
   });
