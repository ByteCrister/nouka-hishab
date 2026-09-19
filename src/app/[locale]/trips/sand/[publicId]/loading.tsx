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

      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card/40 p-6 rounded-2xl border border-border/50 backdrop-blur-sm">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Skeleton className="h-8 w-48 rounded-lg" />
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
            <Skeleton className="h-4 w-64 rounded-md opacity-60" />
          </div>
          <Skeleton className="h-10 w-10 rounded-xl" />
        </div>

        {/* 3-Column Layout Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* LEFT COLUMN: Trip Info & Assets */}
          <div className="lg:col-span-4 space-y-6">
            {/* Trip Info Card */}
            <div className="rounded-2xl border border-border/50 bg-card/60 p-6 space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <Skeleton className="w-4 h-4 rounded-full" />
                <Skeleton className="h-5 w-32 rounded-md" />
              </div>
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex justify-between items-center py-2 border-b border-border/30 last:border-0">
                    <Skeleton className="h-4 w-24 rounded-md opacity-70" />
                    <Skeleton className="h-4 w-32 rounded-md" />
                  </div>
                ))}
              </div>
            </div>

            {/* Cargo & Assets Card */}
            <div className="rounded-2xl border border-border/50 bg-card/60 p-6 space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <Skeleton className="w-4 h-4 rounded-full" />
                <Skeleton className="h-5 w-36 rounded-md" />
              </div>
              <div className="space-y-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex justify-between items-center py-2 border-b border-border/30 last:border-0">
                    <Skeleton className="h-4 w-20 rounded-md opacity-70" />
                    <Skeleton className="h-4 w-28 rounded-md" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* MIDDLE COLUMN: Expenses & Attachments */}
          <div className="lg:col-span-5 space-y-6">
            {/* Expenses Section */}
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

            {/* Attachments Section */}
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

          {/* RIGHT COLUMN: Financials & Notes */}
          <div className="lg:col-span-3 space-y-6">
            {/* Financials Section */}
            <div className="rounded-2xl border border-border/50 bg-card/60 p-6">
              <div className="flex items-center gap-2 mb-6">
                <Skeleton className="w-4 h-4 rounded-full" />
                <Skeleton className="h-5 w-24 rounded-md" />
              </div>
              
              <div className="space-y-5">
                {/* Cost Breakdown */}
                <div className="space-y-4">
                  <Skeleton className="h-4 w-28 rounded-md mb-2 opacity-60" />
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="flex justify-between items-start">
                      <div className="space-y-1.5">
                        <Skeleton className="h-4 w-24 rounded-md" />
                        <Skeleton className="h-3 w-16 rounded-md opacity-50" />
                      </div>
                      <Skeleton className="h-4 w-20 rounded-md" />
                    </div>
                  ))}
                  <div className="my-3 pt-3 border-t-2 border-dashed border-border/60 flex justify-between items-center">
                    <Skeleton className="h-4 w-32 rounded-md opacity-80" />
                    <Skeleton className="h-4 w-24 rounded-md" />
                  </div>
                </div>

                {/* Revenue */}
                <div className="space-y-4 pt-4 border-t border-border/30">
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-4 w-24 rounded-md opacity-80" />
                    <Skeleton className="h-4 w-24 rounded-md" />
                  </div>
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-4 w-24 rounded-md opacity-80" />
                    <Skeleton className="h-4 w-24 rounded-md" />
                  </div>
                </div>

                {/* Net Profit */}
                <div className="pt-4 mt-4 border-t-2 border-primary/20">
                  <div className="flex justify-between items-center p-3 rounded-xl bg-primary/5 border border-primary/10">
                    <Skeleton className="h-5 w-24 rounded-md" />
                    <Skeleton className="h-6 w-28 rounded-md" />
                  </div>
                </div>
              </div>
            </div>

            {/* Notes Section */}
            <div className="rounded-2xl border border-border/50 bg-card/60 p-6">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <Skeleton className="w-4 h-4 rounded-full" />
                  <Skeleton className="h-5 w-16 rounded-md" />
                </div>
              </div>
              <Skeleton className="h-24 w-full rounded-xl" />
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}
