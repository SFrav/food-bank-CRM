import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export const LoadingContactsTable = () => {
  const rows = Array.from({ length: 7 }, (_, i) => i);
  return (
    <div className="rounded-md border overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead />
            <TableHead className="sm:max-w-[100px] animate-pulse bg-muted/30 rounded-sm"></TableHead>
            <TableHead className="sm:max-w-[125px] animate-pulse bg-muted/30 rounded-sm"></TableHead>
            <TableHead className="sm:max-w-[80px] animate-pulse bg-muted/30 rounded-sm"></TableHead>
            <TableHead className="w-[200px] sm:max-w-[80px] animate-pulse bg-muted/30 rounded-sm"></TableHead>
            <TableHead className="w-[200px] sm:max-w-[80px] animate-pulse bg-muted/30 rounded-sm"></TableHead>
            <TableHead className="sm:max-w-[80px] animate-pulse bg-muted/30 rounded-sm"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((i) => (
            <TableRow key={i} className="py-2 hover:bg-muted/50">
              <TableCell className="font-medium animate-pulse bg-gray-100 rounded-sm sm:w-[40px] h-[70px]" />
              <TableCell className="sm:table-cell sm:max-w-[100px] animate-pulse bg-gray-100 rounded-sm h-[70px]" />
              <TableCell className="sm:table-cell sm:max-w-[125px] animate-pulse bg-gray-100 rounded-sm h-[70px]" />
              <TableCell className="sm:table-cell sm:max-w-[80px] animate-pulse bg-gray-100 rounded-sm h-[70px]" />
              <TableCell className="sm:table-cell sm:max-w-[200px] animate-pulse bg-gray-100 rounded-sm h-[70px]" />
              <TableCell className="text-xs text-muted-foreground pl-3 pr-3 sm:table-cell sm:max-w-[120px] h-[70px] animate-pulse bg-gray-100 rounded-sm" />
              <TableCell className="text-xs text-muted-foreground pl-3 pr-3 sm:table-cell sm:max-w-[120px] h-[70px] animate-pulse bg-gray-100 rounded-sm" />
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};