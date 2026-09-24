import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FadeInUp } from '@/components/wrappers/motion-wrappers';

export function MaintenancePageSkeleton() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header Skeleton */}
      <div>
        <Skeleton className="h-9 w-64 mb-2 rounded-md" />
        <Skeleton className="h-5 w-96 rounded-md opacity-60" />
      </div>

      <FadeInUp>
        {/* KPIs Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="bg-card">
              <CardContent className="p-6 flex items-center space-x-4">
                <Skeleton className="w-12 h-12 rounded-full opacity-50" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-24 opacity-60 rounded-md" />
                  <Skeleton className="h-7 w-32 rounded-md" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {/* Toolbar Skeleton */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-6">
          <div className="flex gap-2 w-full md:w-auto flex-1">
            <Skeleton className="h-10 w-full md:w-[300px] rounded-lg" />
            <Skeleton className="h-10 w-[180px] rounded-lg hidden md:block" />
            <Skeleton className="h-10 w-[180px] rounded-lg hidden md:block" />
          </div>
          <div className="flex gap-2 w-full md:w-auto justify-end">
            <Skeleton className="h-10 w-10 rounded-lg hidden md:block" />
            <Skeleton className="h-10 w-[120px] rounded-lg" />
            <Skeleton className="h-10 w-[120px] rounded-lg" />
          </div>
        </div>
        
        {/* Table Skeleton */}
        <div className="rounded-xl border bg-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead><Skeleton className="h-4 w-20" /></TableHead>
                <TableHead><Skeleton className="h-4 w-24" /></TableHead>
                <TableHead><Skeleton className="h-4 w-40" /></TableHead>
                <TableHead><Skeleton className="h-4 w-24" /></TableHead>
                <TableHead className="text-right"><Skeleton className="h-4 w-16 ml-auto" /></TableHead>
                <TableHead className="w-[80px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...Array(5)].map((_, i) => (
                <TableRow key={i} className="hover:bg-transparent">
                  <TableCell><Skeleton className="h-4 w-24 opacity-80" /></TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <Skeleton className="h-4 w-32 opacity-90" />
                    </div>
                  </TableCell>
                  <TableCell><Skeleton className="h-4 w-48 opacity-70" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-28 opacity-80" /></TableCell>
                  <TableCell className="text-right">
                    <Skeleton className="h-4 w-20 ml-auto opacity-90" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-8 w-8 rounded-md ml-auto" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Pagination Skeleton */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-border/50">
          <Skeleton className="h-4 w-48 opacity-60" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-24 rounded-md opacity-70" />
            <div className="flex items-center gap-1">
              <Skeleton className="h-8 w-8 rounded-md opacity-80" />
              <Skeleton className="h-8 w-8 rounded-md opacity-60" />
              <Skeleton className="h-8 w-8 rounded-md opacity-60" />
            </div>
            <Skeleton className="h-8 w-24 rounded-md opacity-70" />
          </div>
        </div>
      </FadeInUp>
    </div>
  );
}
