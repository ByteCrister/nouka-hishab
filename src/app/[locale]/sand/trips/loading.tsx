import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <main className="container mx-auto py-8 px-4 max-w-7xl animate-in fade-in duration-500">
      {/* Breadcrumbs Skeleton */}
      <div className="flex items-center space-x-2 mb-6 opacity-60">
        <Skeleton className="h-4 w-12" />
        <span className="text-muted-foreground/30 text-sm">/</span>
        <Skeleton className="h-4 w-16" />
        <span className="text-muted-foreground/30 text-sm">/</span>
        <Skeleton className="h-4 w-20" />
      </div>

      <div className="space-y-8 pb-12">
        {/* Header Skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-3">
            <Skeleton className="h-10 w-56 rounded-md" />
            <Skeleton className="h-4 w-72 rounded-md opacity-60" />
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-32 rounded-xl" />
            <Skeleton className="h-10 w-36 rounded-xl" />
          </div>
        </div>

        {/* KPIs Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="rounded-2xl border border-border/50 bg-card/30 p-5 backdrop-blur-xl space-y-4">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-24 rounded-full opacity-60" />
                <Skeleton className="h-8 w-8 rounded-full opacity-40" />
              </div>
              <Skeleton className="h-8 w-32 rounded-md" />
            </div>
          ))}
        </div>

        {/* List Section Skeleton */}
        <div className="rounded-2xl border border-border/50 bg-card/30 p-6 backdrop-blur-xl space-y-6">
          {/* Toolbar Skeleton */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex w-full sm:w-auto">
              <Skeleton className="h-10 w-full sm:w-[320px] rounded-lg" />
            </div>
            <div className="flex gap-3 w-full sm:w-auto">
              <Skeleton className="h-10 w-full sm:w-[220px] rounded-lg" />
              <Skeleton className="h-10 w-12 rounded-lg" />
            </div>
          </div>

          {/* Grid of Trip Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="rounded-xl border border-border/40 bg-card p-5 space-y-5">
                {/* Card Header */}
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-32 rounded-md" />
                    <Skeleton className="h-3 w-20 rounded-md opacity-60" />
                  </div>
                  <Skeleton className="h-6 w-16 rounded-full" />
                </div>
                {/* Card Body - 3 rows */}
                <div className="space-y-3">
                  <Skeleton className="h-4 w-full rounded-md opacity-50" />
                  <Skeleton className="h-4 w-4/5 rounded-md opacity-50" />
                  <Skeleton className="h-4 w-full rounded-md opacity-50" />
                </div>
                {/* Card Footer */}
                <div className="flex justify-between items-center pt-4 border-t border-border/30">
                  <Skeleton className="h-5 w-24 rounded-md" />
                  <Skeleton className="h-8 w-8 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
