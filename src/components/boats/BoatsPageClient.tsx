'use client';

import { useBoatFiltersStore } from '@/store/useBoatFiltersStore';
import { useBoats } from '@/hooks/queries/useBoatsQueries';
import { BoatsHeader } from './BoatsHeader';
import { BoatsOverviewSection } from './BoatsOverviewSection';
import { BoatsToolbar } from './BoatsToolbar';
import { BoatsList } from './BoatsList';
import { BoatsDashboardSection } from './dashboard/BoatsDashboardSection';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { FadeInUp } from '../wrappers/motion-wrappers';

export function BoatsPageClient() {
  const { listFilters, setPage } = useBoatFiltersStore();
  const { data } = useBoats(listFilters);
  const sharedT = useTranslations('shared');
  const meta = data?.meta;

  return (
    <div className="space-y-8 pb-12">
      <FadeInUp>
        <BoatsHeader />
      </FadeInUp>

      <FadeInUp delay={0.1}>
        <BoatsOverviewSection />
      </FadeInUp>

      <FadeInUp delay={0.2}>
        <BoatsDashboardSection />
      </FadeInUp>

      <FadeInUp delay={0.3}>
        <div className="rounded-3xl border border-border/50 bg-card/40 p-6 sm:p-8 backdrop-blur-xl shadow-sm">
          <BoatsToolbar />
          <div className="mt-6">
            <BoatsList />
          </div>

          {/* Pagination Controls */}
          {meta && meta.totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between mt-8 pt-6 border-t border-border/50 gap-4">
              <div className="text-sm text-muted-foreground font-medium">
                {sharedT('pagination.showing', {
                  start: (meta.page - 1) * meta.limit + 1,
                  end: Math.min(meta.page * meta.limit, meta.total),
                  total: meta.total
                })}
              </div>
              
              <div className="flex items-center gap-2 bg-muted/30 p-1.5 rounded-xl border border-border/40">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setPage(meta.page - 1)}
                  disabled={meta.page === 1}
                  className="rounded-lg hover:bg-background/80"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  {sharedT('pagination.previous')}
                </Button>
                
                <div className="flex items-center gap-1 px-2 border-x border-border/50">
                  {Array.from({ length: meta.totalPages }).map((_, i) => (
                    <Button
                      key={i + 1}
                      variant={meta.page === i + 1 ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setPage(i + 1)}
                      className={`w-8 h-8 p-0 rounded-lg ${meta.page === i + 1 ? 'shadow-md' : 'hover:bg-background/80'}`}
                    >
                      {i + 1}
                    </Button>
                  ))}
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setPage(meta.page + 1)}
                  disabled={meta.page === meta.totalPages}
                  className="rounded-lg hover:bg-background/80"
                >
                  {sharedT('pagination.next')}
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </FadeInUp>
    </div>
  );
}


