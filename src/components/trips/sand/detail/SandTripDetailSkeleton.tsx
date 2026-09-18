import { Skeleton } from '@/components/ui/skeleton';

export function SandTripDetailSkeleton() {
  return (
    <div className="space-y-6 pb-12 mt-6">
      {/* Header Skeleton */}
      <div className="flex flex-wrap items-start justify-between gap-4 rounded-2xl border border-border/50 bg-card/60 backdrop-blur-xl p-6">
        <div className="flex items-start gap-4">
          <Skeleton className="w-12 h-12 rounded-xl" />
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-6 w-24 rounded-full" />
            </div>
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-32" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-32 rounded-xl" />
          <Skeleton className="h-9 w-24 rounded-xl hidden sm:flex" />
          <Skeleton className="h-9 w-24 rounded-xl hidden sm:flex" />
          <Skeleton className="h-9 w-24 rounded-xl" />
        </div>
      </div>

      {/* Profit Banner Skeleton */}
      <div className="rounded-2xl border p-5 flex items-center justify-between bg-card/40">
        <div className="flex items-center gap-3">
          <Skeleton className="w-8 h-8 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-8 w-32" />
          </div>
        </div>
        <div className="flex gap-6 text-right">
          <div className="space-y-2">
            <Skeleton className="h-3 w-16 ml-auto" />
            <Skeleton className="h-5 w-24 ml-auto" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-3 w-16 ml-auto" />
            <Skeleton className="h-5 w-24 ml-auto" />
          </div>
        </div>
      </div>

      {/* Detail Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="rounded-2xl border border-border/50 bg-card/60 p-6 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Skeleton className="w-4 h-4" />
              <Skeleton className="h-4 w-32" />
            </div>
            {[...Array(3)].map((_, j) => (
              <div key={j} className="flex items-center justify-between py-2.5 border-b border-border/40 last:border-0">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-32" />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}


