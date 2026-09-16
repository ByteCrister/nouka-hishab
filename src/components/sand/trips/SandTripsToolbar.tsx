'use client';

import { useSandTripsFiltersStore } from '@/store/useSandTripsFiltersStore';
import { useBoatsMeta } from '@/hooks/queries/useBoatsMetaQueries';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, RotateCcw, Ship } from 'lucide-react';
import { SAND_TRIP_STATUSES } from '@/constants/db/sand.const';
import type { SandTripStatus } from '@/constants/db/sand.const';

const STATUS_OPTIONS: { value: SandTripStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All Statuses' },
  { value: SAND_TRIP_STATUSES.SCHEDULED, label: 'Scheduled' },
  { value: SAND_TRIP_STATUSES.LOADING, label: 'Loading' },
  { value: SAND_TRIP_STATUSES.IN_TRANSIT, label: 'In Transit' },
  { value: SAND_TRIP_STATUSES.COMPLETED, label: 'Completed' },
  { value: SAND_TRIP_STATUSES.CANCELLED, label: 'Cancelled' },
];

export function SandTripsToolbar() {
  const { filters, setFilter, resetFilters } = useSandTripsFiltersStore();
  const { data: boats } = useBoatsMeta('sand');

  return (
    <div className="flex flex-wrap gap-3 mb-4">
      {/* Search */}
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search trips..."
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
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          {STATUS_OPTIONS.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
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
          <SelectValue placeholder="All Boats" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Boats</SelectItem>
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
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="departureTime:desc">Departure ↓</SelectItem>
          <SelectItem value="departureTime:asc">Departure ↑</SelectItem>
          <SelectItem value="netProfitTk:desc">Profit ↓</SelectItem>
          <SelectItem value="netProfitTk:asc">Profit ↑</SelectItem>
          <SelectItem value="saleAmountTk:desc">Sale ↓</SelectItem>
          <SelectItem value="createdAt:desc">Newest</SelectItem>
        </SelectContent>
      </Select>

      {/* Reset */}
      <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl" onClick={resetFilters} title="Reset filters">
        <RotateCcw className="w-4 h-4" />
      </Button>
    </div>
  );
}
