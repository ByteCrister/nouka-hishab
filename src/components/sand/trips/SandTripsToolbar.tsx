'use client';

import { useSandTripsFiltersStore } from '@/store/useSandTripsFiltersStore';
import { useBoatsMeta } from '@/hooks/queries/useBoatsMetaQueries';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, RotateCcw, Ship } from 'lucide-react';
import { SAND_TRIP_STATUSES } from '@/constants/db/sand.const';
import type { SandTripStatus } from '@/constants/db/sand.const';
import { useTranslations } from 'next-intl';

export function SandTripsToolbar() {
  const t = useTranslations('sandTrips');
  const { filters, setFilter, resetFilters } = useSandTripsFiltersStore();
  const { data: boats } = useBoatsMeta('sand');

  const STATUS_OPTIONS: { value: SandTripStatus | 'all'; labelKey: string }[] = [
    { value: 'all', labelKey: 'status.all' },
    { value: SAND_TRIP_STATUSES.SCHEDULED, labelKey: 'status.scheduled' },
    { value: SAND_TRIP_STATUSES.LOADING, labelKey: 'status.loading' },
    { value: SAND_TRIP_STATUSES.IN_TRANSIT, labelKey: 'status.in_transit' },
    { value: SAND_TRIP_STATUSES.COMPLETED, labelKey: 'status.completed' },
    { value: SAND_TRIP_STATUSES.CANCELLED, labelKey: 'status.cancelled' },
  ];

  return (
    <div className="flex flex-wrap gap-3 mb-4">
      {/* Search */}
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder={t('toolbar.searchPlaceholder')}
          value={filters.search}
          onChange={(e) => setFilter('search', e.target.value)}
          className="pl-9 h-10 rounded-xl bg-background/50"
        />
      </div>

      {/* Status */}
      <Select
        value={filters.status}
        onValueChange={(v) => setFilter('status', v as SandTripStatus | 'all')}
      >
        <SelectTrigger className="w-[150px] h-10 rounded-xl bg-background/50">
          <SelectValue placeholder={t('toolbar.allStatuses')} />
        </SelectTrigger>
        <SelectContent>
          {STATUS_OPTIONS.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>{t(opt.labelKey as Parameters<typeof t>[0])}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Boat filter */}
      <Select
        value={filters.boatPublicId ?? 'all'}
        onValueChange={(v) => setFilter('boatPublicId', v === 'all' ? null : v)}
      >
        <SelectTrigger className="w-[160px] h-10 rounded-xl bg-background/50">
          <Ship className="w-4 h-4 mr-2 text-muted-foreground" />
          <SelectValue placeholder={t('toolbar.allBoats')} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t('toolbar.allBoats')}</SelectItem>
          {boats?.map((b) => (
            <SelectItem key={b.publicId} value={b.publicId}>{b.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* From date */}
      <Input
        type="date"
        value={filters.fromDate ?? ''}
        onChange={(e) => setFilter('fromDate', e.target.value || null)}
        className="w-[150px] h-10 rounded-xl bg-background/50"
        title="From date"
      />

      {/* To date */}
      <Input
        type="date"
        value={filters.toDate ?? ''}
        onChange={(e) => setFilter('toDate', e.target.value || null)}
        className="w-[150px] h-10 rounded-xl bg-background/50"
        title="To date"
      />

      {/* Sort */}
      <Select
        value={`${filters.sortBy}:${filters.sortOrder}`}
        onValueChange={(v) => {
          const [field, order] = v.split(':') as [typeof filters.sortBy, typeof filters.sortOrder];
          setFilter('sortBy', field);
          setFilter('sortOrder', order);
        }}
      >
        <SelectTrigger className="w-[170px] h-10 rounded-xl bg-background/50">
          <SelectValue placeholder={t('toolbar.allStatuses')} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="departureTime:desc">{t('toolbar.departureDesc')}</SelectItem>
          <SelectItem value="departureTime:asc">{t('toolbar.departureAsc')}</SelectItem>
          <SelectItem value="netProfitTk:desc">{t('toolbar.profitDesc')}</SelectItem>
          <SelectItem value="netProfitTk:asc">{t('toolbar.profitAsc')}</SelectItem>
          <SelectItem value="saleAmountTk:desc">{t('toolbar.saleDesc')}</SelectItem>
          <SelectItem value="createdAt:desc">{t('toolbar.newest')}</SelectItem>
        </SelectContent>
      </Select>

      {/* Reset */}
      <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl" onClick={resetFilters} title={t('toolbar.resetFilters')}>
        <RotateCcw className="w-4 h-4" />
      </Button>
    </div>
  );
}
