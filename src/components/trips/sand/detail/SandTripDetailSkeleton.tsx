import { Skeleton } from '@/components/ui/skeleton';

export function SandTripDetailSkeleton() {
  return (
    <div className="space-y-6 pb-12 mt-6 animate-in fade-in duration-500">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card/60 p-6 rounded-2xl border border-border/50 backdrop-blur-xl">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Skeleton className="h-8 w-48 rounded-lg" />
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
          <Skeleton className="h-4 w-64 rounded-md opacity-60" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-32 rounded-xl" />
          <Skeleton className="h-9 w-24 rounded-xl hidden sm:flex" />
          <Skeleton className="h-9 w-24 rounded-xl hidden sm:flex" />
          <Skeleton className="h-9 w-24 rounded-xl" />
        </div>
      </div>

      {/* Profit Banner Skeleton */}
      <div className="rounded-2xl border p-5 flex flex-wrap items-center justify-between gap-4 bg-card/40">
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

      {/* 3-Column Layout Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Trip Info, Cargo & Assets, Expenses, Attachments */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Location & Timing Card */}
            <div className="rounded-2xl border border-border/50 bg-card/60 p-6 space-y-6 h-full">
              <div className="flex items-center gap-2 mb-4">
                <Skeleton className="w-4 h-4 rounded-full" />
                <Skeleton className="h-5 w-32 rounded-md" />
              </div>
              <div className="space-y-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex justify-between items-center py-2 border-b border-border/30 last:border-0">
                    <Skeleton className="h-4 w-24 rounded-md opacity-70" />
                    <Skeleton className="h-4 w-32 rounded-md" />
                  </div>
                ))}
              </div>
            </div>

            {/* Cargo Card */}
            <div className="rounded-2xl border border-border/50 bg-card/60 p-6 space-y-6 h-full">
              <div className="flex items-center gap-2 mb-4">
                <Skeleton className="w-4 h-4 rounded-full" />
                <Skeleton className="h-5 w-36 rounded-md" />
              </div>
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex justify-between items-center py-2 border-b border-border/30 last:border-0">
                    <Skeleton className="h-4 w-20 rounded-md opacity-70" />
                    <Skeleton className="h-4 w-28 rounded-md" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Notes Section Skeleton */}
          <div className="rounded-2xl border border-border/50 bg-card/60 p-6">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <Skeleton className="w-4 h-4 rounded-full" />
                <Skeleton className="h-5 w-16 rounded-md" />
              </div>
            </div>
            <Skeleton className="h-16 w-full rounded-xl" />
          </div>

          {/* Expenses Section Skeleton */}
          <div className="rounded-2xl border border-border/50 bg-card/60 p-6">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <Skeleton className="w-4 h-4 rounded-full" />
                <Skeleton className="h-5 w-28 rounded-md" />
              </div>
              <Skeleton className="h-8 w-24 rounded-lg" />
            </div>
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl border border-border/40 bg-background/40">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-32 rounded-md" />
                      <Skeleton className="h-3 w-20 rounded-md opacity-60" />
                    </div>
                  </div>
                  <Skeleton className="h-5 w-20 rounded-md" />
                </div>
              ))}
            </div>
          </div>

          {/* Attachments Section Skeleton */}
          <div className="rounded-2xl border border-border/50 bg-card/60 p-6">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <Skeleton className="w-4 h-4 rounded-full" />
                <Skeleton className="h-5 w-32 rounded-md" />
              </div>
              <Skeleton className="h-8 w-28 rounded-lg" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="rounded-xl border border-border/40 bg-background/40 p-2 space-y-2">
                  <Skeleton className="h-24 w-full rounded-lg" />
                  <Skeleton className="h-3 w-3/4 rounded-md mx-auto" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Financials Sidebar Skeleton */}
        <div className="lg:col-span-1 space-y-6">
          <div className="rounded-2xl border border-border/50 bg-card/60 p-6 sticky top-6">
            <div className="flex items-center gap-2 mb-6">
              <Skeleton className="w-4 h-4 rounded-full" />
              <Skeleton className="h-5 w-24 rounded-md" />
            </div>
            
            <div className="space-y-5">
              {/* Cost Breakdown */}
              <div className="space-y-4">
                <Skeleton className="h-4 w-28 rounded-md mb-2 opacity-60" />
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex justify-between items-start">
                    <div className="space-y-1.5">
                      <Skeleton className="h-4 w-24 rounded-md" />
                      <Skeleton className="h-3 w-16 rounded-md opacity-50" />
                    </div>
                    <Skeleton className="h-4 w-20 rounded-md" />
                  </div>
                ))}
                
                {/* Dashed Separator */}
                <div className="my-3 pt-3 border-t-2 border-dashed border-border/60 flex justify-between items-center">
                  <Skeleton className="h-4 w-32 rounded-md opacity-80" />
                  <Skeleton className="h-4 w-24 rounded-md" />
                </div>
              </div>

              {/* Revenue */}
              <div className="space-y-4 mt-8 pt-4 border-t border-border/30">
                <div className="flex justify-between items-center">
                  <Skeleton className="h-4 w-24 rounded-md opacity-80" />
                  <Skeleton className="h-4 w-24 rounded-md" />
                </div>
                <div className="flex justify-between items-center">
                  <Skeleton className="h-4 w-24 rounded-md opacity-80" />
                  <Skeleton className="h-4 w-24 rounded-md" />
                </div>

                {/* Double Line */}
                <div className="pt-3">
                  <div className="border-t border-solid border-border/80"></div>
                  <div className="mt-0.5 mb-3 border-t border-solid border-border/80"></div>
                  
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-5 w-24 rounded-md" />
                    <Skeleton className="h-6 w-28 rounded-md" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
