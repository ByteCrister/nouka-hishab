import { Skeleton } from '@/components/ui/skeleton';
import { FadeInUp } from '@/components/wrappers/motion-wrappers';

export function BoatDetailSkeleton() {
  return (
    <div className="pb-12 space-y-6 animate-pulse">
      {/* Breadcrumbs Skeleton */}
      <div className="flex gap-2 items-center mb-8">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-4 rounded-full" />
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-4 rounded-full" />
        <Skeleton className="h-4 w-24" />
      </div>

      {/* Header Skeleton */}
      <FadeInUp>
        <div className="bg-card/50 border border-border/50 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row justify-between items-start gap-6 shadow-sm">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Skeleton className="w-12 h-12 rounded-xl" />
              <div>
                <Skeleton className="h-8 w-48 mb-2" />
                <div className="flex gap-2">
                  <Skeleton className="h-5 w-20 rounded-full" />
                  <Skeleton className="h-5 w-24 rounded-full" />
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex gap-3 w-full sm:w-auto">
            <Skeleton className="h-10 w-24 rounded-xl" />
            <Skeleton className="h-10 w-24 rounded-xl" />
            <Skeleton className="h-10 w-10 rounded-xl" />
          </div>
        </div>
      </FadeInUp>

      {/* KPIs Skeleton */}
      <FadeInUp delay={0.1}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-card border border-border/50 rounded-2xl p-6 flex flex-col gap-3">
              <div className="flex justify-between items-center">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-8 w-8 rounded-xl" />
              </div>
              <Skeleton className="h-8 w-24" />
            </div>
          ))}
        </div>
      </FadeInUp>

      {/* Gallery Skeleton */}
      <FadeInUp delay={0.2}>
        <div className="bg-card border border-border/50 rounded-2xl p-6 space-y-4">
          <div className="flex justify-between items-center mb-4">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-9 w-28 rounded-xl" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="aspect-square rounded-xl w-full" />
            ))}
          </div>
        </div>
      </FadeInUp>
      
      {/* Documents Skeleton */}
      <FadeInUp delay={0.3}>
        <div className="bg-card border border-border/50 rounded-2xl p-6 space-y-4">
          <div className="flex justify-between items-center mb-4">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-9 w-32 rounded-xl" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24 rounded-xl w-full" />
            ))}
          </div>
        </div>
      </FadeInUp>

      {/* Trips Skeleton */}
      <FadeInUp delay={0.4}>
        <div className="mt-12 bg-card rounded-2xl shadow-sm border border-border/50 p-6 space-y-6">
          <Skeleton className="h-8 w-40" />
          <div className="flex gap-4">
            <Skeleton className="h-10 flex-1 rounded-xl" />
            <Skeleton className="h-10 w-40 rounded-xl" />
            <Skeleton className="h-10 w-40 rounded-xl" />
          </div>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-20 w-full rounded-xl" />
            ))}
          </div>
        </div>
      </FadeInUp>
    </div>
  );
}
