'use client';

import { useReportsFiltersStore } from '@/store/useReportsFiltersStore';
import { useReports } from '@/hooks/queries/useReportsQueries';
import { ReportsFilters } from './list/ReportsFilters';
import { ReportsList } from './list/ReportsList';
import { ReportsOverviewSection } from './list/ReportsOverviewSection';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { FadeInUp } from '../wrappers/motion-wrappers';
import { useTranslations } from 'next-intl';
import { Breadcrumbs } from '@/components/shared/Breadcrumbs';

export function ReportsPageClient() {
  const t = useTranslations('reportsPage.list.header');
  const tSand = useTranslations('sand');
  const { listFilters, setPage } = useReportsFiltersStore();
  const { data, isLoading } = useReports(listFilters);
  const meta = data?.meta;
  const kpis = data?.kpis;

  const breadcrumbItems = [
    { label: tSand('home'), href: '/', isHome: true },
    { label: t('title') }
  ];

  return (
    <div className="space-y-8 pb-12">
      <FadeInUp>
        <Breadcrumbs items={breadcrumbItems} />
        <div className="mt-4">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">{t('title')}</h1>
          <p className="text-muted-foreground mt-1 text-lg">
            {t('subtitle')}
          </p>
        </div>
      </FadeInUp>

      <FadeInUp delay={0.1}>
        {(kpis || isLoading) && <ReportsOverviewSection kpis={kpis} isLoading={isLoading} />}
      </FadeInUp>

      <FadeInUp delay={0.2}>
        <div className="rounded-3xl border border-border/50 bg-card/40 p-6 sm:p-8 backdrop-blur-xl shadow-sm">
          <ReportsFilters />
          
          <div className="mt-6">
            <ReportsList />
          </div>

          {/* Pagination Controls */}
          {meta && meta.totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between mt-8 pt-6 border-t border-border/50 gap-4">
              <div className="text-sm text-muted-foreground font-medium">
                {t('showing', {
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
                  {t('previous')}
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
                  {t('next')}
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
