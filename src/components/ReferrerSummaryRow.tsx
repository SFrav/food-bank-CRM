import React, {useEffect} from 'react';
import { TableCell, TableRow } from '@/components/ui/table';
import { StarRating } from "@/components/ui/star-rating";
import { ReferrerRatingAverage } from '@/hooks/useReferrerRating';

interface ReferrerSummaryRowProps {
  row: ReferrerRatingAverage;
  index: number;
  onOpenHistory: (referrerId: string) => void;
}

export const ReferrerSummaryRow = React.memo(({ 
  row, 
  index, 
  onOpenHistory 
}: ReferrerSummaryRowProps) => {

  return (
    <TableRow
      className="cursor-pointer hover:bg-muted/50"
      onClick={() => onOpenHistory(row.referrer_id)}
    >
      <TableCell className="sm:table-cell sm:max-w-[40px]">{row.entity_name}</TableCell>
      <TableCell className="sm:table-cell sm:max-w-[40px]">{row.referrer_name}</TableCell>
      <TableCell className="sm:table-cell sm:max-w-[100px]"><StarRating value={row.rate_screening} size="sm" disabled /></TableCell>
      <TableCell className="sm:table-cell sm:max-w-[100px]"><StarRating value={row.rate_support} size="sm" disabled /></TableCell>
      <TableCell className="sm:table-cell sm:max-w-[100px]"><StarRating value={row.rate_inform} size="sm" disabled /></TableCell>
      <TableCell className="sm:table-cell sm:max-w-[100px]"><StarRating value={row.rate_enumeration} size="sm" disabled /></TableCell>
      <TableCell className="sm:table-cell sm:max-w-[100px]">{row.last_rating}</TableCell>
    </TableRow>
  );
}, (prev, next) => { 
  return(prev.row.referrer_id === next.row.referrer_id) 
  }
);