import { Skeleton } from '@/components/ui/skeleton';
import { FadeInUp, StaggerContainer, StaggerItem } from '@/components/wrappers/motion-wrappers';
import { RecentTripsSkeleton } from './RecentTripsSkeleton';
import { RecentMaintenanceSkeleton } from './RecentMaintenanceSkeleton';

export function BoatsDashboardSkeleton() {
  return (
    <div className="space-y-8 pb-8 border-b border-border/40 mb-8">
      {/* Stat cards skeleton */}
      <StaggerContainer className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <StaggerItem key={i}>
            <div className="rounded-2xl border border-border/40 bg-card/60 backdrop-blur-sm p-6 relative overflow-hidden h-[156px] shadow-sm flex flex-col justify-between">
              <div className="flex flex-row items-center justify-between space-y-0">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-10 w-10 rounded-xl" />
              </div>
              <div>
                <Skeleton className="h-9 w-32 mt-2" />
                <Skeleton className="h-6 w-40 mt-3 rounded-md" />
              </div>
            </div>
          </StaggerItem>
        ))}
      </StaggerContainer>

      {/* Actions skeleton */}
      <FadeInUp delay={0.15}>
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between bg-card/40 backdrop-blur-sm border border-border/40 rounded-2xl p-6 shadow-sm">
          <Skeleton className="h-7 w-32" />
          <div className="flex flex-wrap gap-3 w-full sm:w-auto">
            <Skeleton className="h-11 w-full sm:w-32 rounded-xl" />
            <Skeleton className="h-11 w-full sm:w-32 rounded-xl" />
            <Skeleton className="h-11 w-full sm:w-32 rounded-xl" />
          </div>
        </div>
      </FadeInUp>

      {/* Recent lists skeleton */}
      <FadeInUp delay={0.3}>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3">
            <RecentTripsSkeleton />
          </div>
          <div className="lg:col-span-2">
            <RecentMaintenanceSkeleton />
          </div>
        </div>
      </FadeInUp>
    </div>
  );
}


