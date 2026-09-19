'use client';

import { useTripsFiltersStore } from '@/store/useTripsFiltersStore';
import { useTrips } from '@/hooks/queries/useTripsQueries';
import { TripsKpiSection } from './TripsKpiSection';
import { TripsToolbar } from './TripsToolbar';
import { SandTripCard } from './sand/SandTripCard';
import { SandTripCardSkeleton } from './sand/SandTripCardSkeleton';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Plus, Sailboat } from 'lucide-react';
import Link from 'next/link';
import { FadeInUp } from '@/components/wrappers/motion-wrappers';
import { useTranslations } from 'next-intl';
import { SandTripReportExportButton } from '@/components/sand/reports/SandTripReportExportButton';

export function TripsPageClient() {
  const t = useTranslations('trips');
  const { filters, setPage } = useTripsFiltersStore();
  const { data, isLoading, isFetching } = useTrips(filters);
  const meta = data?.meta;
  const items = data?.items ?? [];

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
            {t('header.title')}
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {t('header.subtitle')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <SandTripReportExportButton mode="list" />
          <Button asChild className="h-10 px-5 rounded-xl bg-gradient-to-r from-river-500 to-river-600 hover:from-river-600 hover:to-river-700 text-white shadow-md shadow-river-500/20">
            <Link href="/trips/sand/new">
              <Plus className="w-4 h-4 mr-2" />
              {t('header.newSandTrip')}
            </Link>
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <TripsKpiSection />

      {/* List */}
      <div className="rounded-2xl border border-border/50 bg-card/30 p-6 backdrop-blur-xl">
        <TripsToolbar />

        {isLoading || isFetching ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mt-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <SandTripCardSkeleton />
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="p-4 bg-muted/40 rounded-full mb-4">
              <Sailboat className="w-10 h-10 text-muted-foreground/40" />
            </div>
            <h3 className="text-lg font-semibold text-muted-foreground">{t('empty.title')}</h3>
            <p className="text-sm text-muted-foreground/70 mt-1 mb-6">
              {t('empty.subtitle')}
            </p>
            <Button asChild variant="outline">
              <Link href="/trips/sand/new">
                <Plus className="w-4 h-4 mr-2" /> {t('empty.logFirst')}
              </Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mt-4">
            {items.map((trip, i) => (
              <FadeInUp key={trip.publicId} delay={i * 0.04}>
                <SandTripCard trip={trip} />
              </FadeInUp>
            ))}
          </div>
        )}

        {/* Pagination */}
        {meta && meta.totalPages > 1 && (
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-border/50">
            <div className="text-sm text-muted-foreground">
              {t('pagination.showing', {
                from: (meta.page - 1) * meta.limit + 1,
                to: Math.min(meta.page * meta.limit, meta.total),
                total: meta.total,
              })}
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setPage(meta.page - 1)} disabled={meta.page === 1}>
                <ChevronLeft className="w-4 h-4 mr-1" /> {t('pagination.previous')}
              </Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: meta.totalPages }).map((_, i) => (
                  <Button
                    key={i + 1}
                    variant={meta.page === i + 1 ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setPage(i + 1)}
                    className="w-8 h-8 p-0"
                  >
                    {i + 1}
                  </Button>
                ))}
              </div>
              <Button variant="outline" size="sm" onClick={() => setPage(meta.page + 1)} disabled={meta.page === meta.totalPages}>
                {t('pagination.next')} <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


