import { Skeleton } from '@/components/ui/skeleton';

export function SandTripEditSkeleton() {
  return (
    <div className="relative overflow-hidden bg-card/70 backdrop-blur-xl p-8 rounded-2xl border border-border/50 shadow-lg max-w-5xl mx-auto mt-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Skeleton className="w-10 h-10 rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
        <Skeleton className="h-9 w-24 rounded-xl hidden sm:flex" />
      </div>

      {/* Sections */}
      {[...Array(4)].map((_, sectionIndex) => (
        <section key={sectionIndex}>
          <div className="flex items-center gap-2 mb-4">
            <Skeleton className="w-4 h-4" />
            <Skeleton className="h-4 w-32" />
          </div>
          <div className={`grid gap-5 ${sectionIndex === 3 ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
            {[...Array(sectionIndex === 3 ? 8 : 3)].map((_, fieldIndex) => (
              <div key={fieldIndex} className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-11 w-full rounded-xl" />
              </div>
            ))}
          </div>
        </section>
      ))}

      {/* Footer */}
      <div className="pt-4 border-t border-border flex items-center justify-end">
        <Skeleton className="h-11 w-32 rounded-xl" />
      </div>
    </div>
  );
}
