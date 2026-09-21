import { Skeleton } from '@/components/ui/skeleton';
import { FadeInUp } from '@/components/wrappers/motion-wrappers';

export function BoatDetailSkeleton() {
  return (
    <div className="pb-12 space-y-6 animate-pulse">
      {/* Breadcrumbs Skeleton */}
      <div className="flex gap-2 items-center mb-8">
        <Skeleton className="h-4 w-12" />
        <span className="text-muted-foreground/30">/</span>
        <Skeleton className="h-4 w-16" />
        <span className="text-muted-foreground/30">/</span>
        <Skeleton className="h-4 w-32" />
      </div>

      {/* Header Skeleton */}
      <FadeInUp>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 p-6 bg-card rounded-2xl shadow-sm border border-border/50 mb-8">
          <div className="space-y-4 w-full md:w-auto">
            <div className="flex flex-wrap items-center gap-3">
              <Skeleton className="h-9 w-48" />
              <div className="flex gap-2">
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-6 w-24 rounded-full" />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-12" />
              </div>
            </div>
            <Skeleton className="h-4 w-full max-w-sm mt-2" />
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto mt-4 md:mt-0">
            <Skeleton className="flex-1 md:flex-none h-10 w-full md:w-24 rounded-md" />
            <Skeleton className="flex-1 md:flex-none h-10 w-full md:w-28 rounded-md" />
          </div>
        </div>
      </FadeInUp>

      {/* KPIs Skeleton */}
      <FadeInUp delay={0.1}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="rounded-xl border border-border/50 bg-card p-5 shadow-sm">
              <div className="flex items-center space-x-3 mb-3">
                <Skeleton className="w-9 h-9 rounded-lg" />
                <Skeleton className="h-4 w-24" />
              </div>
              <Skeleton className="h-7 w-32" />
            </div>
          ))}
        </div>
      </FadeInUp>

      {/* Gallery Skeleton */}
      <FadeInUp delay={0.2}>
        <div className="bg-card rounded-2xl shadow-sm border border-border/50 p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Skeleton className="w-5 h-5 rounded-md" />
              <Skeleton className="h-6 w-24" />
            </div>
            <div className="flex flex-col items-end gap-2">
               <Skeleton className="h-9 w-36 rounded-md" />
               <Skeleton className="h-3 w-20" />
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="aspect-[4/3] rounded-xl w-full" />
            ))}
          </div>
        </div>
      </FadeInUp>
      
      {/* Documents Skeleton */}
      <FadeInUp delay={0.3}>
        <div className="bg-card rounded-2xl shadow-sm border border-border/50 p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Skeleton className="w-5 h-5 rounded-md" />
              <Skeleton className="h-6 w-32" />
            </div>
            <div className="flex flex-col items-end gap-2">
               <Skeleton className="h-9 w-40 rounded-md" />
               <Skeleton className="h-3 w-24" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex flex-col p-4 rounded-xl border border-border/50 bg-background/50 h-[130px] justify-between">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Skeleton className="w-10 h-10 rounded-lg" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-12" />
                    </div>
                  </div>
                </div>
                <Skeleton className="h-5 w-28 rounded" />
              </div>
            ))}
          </div>
        </div>
      </FadeInUp>

      {/* Trips Skeleton */}
      <FadeInUp delay={0.4}>
        <div className="mt-12 bg-card rounded-2xl shadow-sm border border-border/50 p-6">
          <Skeleton className="h-8 w-24 mb-6" />
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <Skeleton className="h-10 w-full sm:max-w-sm rounded-md" />
            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              <Skeleton className="h-10 w-full sm:w-[180px] rounded-md" />
              <Skeleton className="h-10 w-full sm:w-32 rounded-md" />
            </div>
          </div>

          <div className="rounded-xl border border-border/50 bg-card overflow-hidden shadow-sm">
            <div className="bg-muted/50 border-b border-border/50 p-4 grid grid-cols-6 gap-4 items-center min-w-[800px]">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-24 justify-self-end" />
              <Skeleton className="h-4 w-24 justify-self-end" />
              <Skeleton className="h-4 w-20" />
            </div>
            <div className="divide-y divide-border/50 overflow-x-auto">
              <div className="min-w-[800px]">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="p-4 grid grid-cols-6 gap-4 items-center bg-background/50">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-24 justify-self-end" />
                    <Skeleton className="h-4 w-24 justify-self-end" />
                    <Skeleton className="h-6 w-24 rounded-full" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </FadeInUp>
    </div>
  );
}


