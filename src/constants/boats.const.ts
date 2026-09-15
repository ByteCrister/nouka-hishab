// src/constants/sand/boats.const.ts
import { SECTORS, type SectorName } from '@/constants/db/app.const';
import { BOAT_STATUSES, type BoatStatus, BOAT_CAPACITY_UNITS, type BoatCapacityUnit } from '@/constants/db/boats.const';
export { BOAT_STATUSES, type BoatStatus, BOAT_CAPACITY_UNITS, type BoatCapacityUnit };
import { SAND_TRIP_STATUSES, type SandTripStatus } from '@/constants/db/sand.const';
import type {
  BoatSortField,
  BoatTripSortField,
  BoatListFilters,
  BoatTripsFilters,
} from '@/types/boats.types';

// ─── Pagination ────────────────────────────────────────────────────────────
export const BOATS_PAGE_DEFAULT_LIMIT = 10;
export const BOATS_PAGE_LIMIT_OPTIONS = [10, 20, 50, 100] as const;

export const BOAT_TRIPS_DEFAULT_LIMIT = 10;
export const BOAT_TRIPS_LIMIT_OPTIONS = [10, 20, 50] as const;

// ─── Defaults ──────────────────────────────────────────────────────────────
export const BOAT_LIST_DEFAULT_FILTERS: BoatListFilters = {
  sector: 'all',
  search: '',
  status: 'all',
  sortBy: 'createdAt',
  sortOrder: 'desc',
  page: 1,
  limit: BOATS_PAGE_DEFAULT_LIMIT,
};

export const BOAT_TRIPS_DEFAULT_FILTERS: BoatTripsFilters = {
  status: 'all',
  search: '',
  fromDate: null,
  toDate: null,
  sortBy: 'departureTime',
  sortOrder: 'desc',
  page: 1,
  limit: BOAT_TRIPS_DEFAULT_LIMIT,
};

// ─── Sort options (for dropdowns) ──────────────────────────────────────────
export const BOAT_SORT_OPTIONS: { value: BoatSortField; label: string }[] = [
  { value: 'createdAt', label: 'Newest first' },
  { value: 'name', label: 'Name' },
  { value: 'capacityValue', label: 'Capacity' },
  { value: 'boatValueTk', label: 'Boat value' },
  { value: 'status', label: 'Status' },
];

export const BOAT_TRIP_SORT_OPTIONS: { value: BoatTripSortField; label: string }[] = [
  { value: 'departureTime', label: 'Departure date' },
  { value: 'netProfitTk', label: 'Net profit' },
  { value: 'saleAmountTk', label: 'Sale amount' },
];

// ─── Status filter options ─────────────────────────────────────────────────
const prettify = (s: string) =>
  s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

export const BOAT_STATUS_FILTER_OPTIONS: {
  value: BoatStatus | 'all';
  label: string;
}[] = [
  { value: 'all', label: 'All statuses' },
  ...Object.values(BOAT_STATUSES).map((s) => ({ value: s, label: prettify(s) })),
];

export const BOAT_SECTOR_FILTER_OPTIONS: {
  value: SectorName | 'all';
  label: string;
}[] = [
  { value: 'all', label: 'All sectors' },
  ...Object.values(SECTORS).map((s) => ({ value: s, label: prettify(s) })),
];

export const BOAT_TRIP_STATUS_FILTER_OPTIONS: {
  value: SandTripStatus | 'all';
  label: string;
}[] = [
  { value: 'all', label: 'All statuses' },
  ...Object.values(SAND_TRIP_STATUSES).map((s) => ({
    value: s,
    label: prettify(s),
  })),
];