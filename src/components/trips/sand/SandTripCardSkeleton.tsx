import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';

export function SandTripCardSkeleton() {
  return (
    <Card className="overflow-hidden border-border/50 bg-card h-full flex flex-col justify-between">
      <CardContent className="p-5 flex flex-col gap-4 flex-1">
        {/* Top row: boat + status */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Skeleton className="w-8 h-8 rounded-lg" />
            <Skeleton className="h-5 w-24 rounded-md" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>
        </div>

        {/* Locations */}
        <div className="flex items-start gap-2 mt-2">
          <Skeleton className="w-4 h-4 rounded-full mt-0.5" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-32 rounded-md" />
            <Skeleton className="h-3 w-24 rounded-md" />
          </div>
        </div>

        {/* Date */}
        <div className="flex items-center gap-2 mt-auto">
          <Skeleton className="w-3.5 h-3.5 rounded-full" />
          <Skeleton className="h-3 w-40 rounded-md" />
        </div>
      </CardContent>
      {/* Cargo + financials (Footer) */}
      <div className="border-t border-border/50 p-4 bg-muted/20 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <Skeleton className="w-3.5 h-3.5 rounded-full" />
          <Skeleton className="h-4 w-16 rounded-md" />
        </div>
        <div className="flex items-center gap-1">
          <Skeleton className="w-3.5 h-3.5 rounded-full" />
          <Skeleton className="h-5 w-20 rounded-md" />
        </div>
      </div>
    </Card>
  );
}
