import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { TripsFilters, TripSortField } from '@/types/trips.types';
import type { SortOrder } from '@/types/api.types';
import { SECTORS } from '@/constants/db/app.const';

interface TripsFiltersState {
  filters: TripsFilters;
  setFilter: <K extends keyof TripsFilters>(key: K, value: TripsFilters[K]) => void;
  resetFilters: () => void;
  setSort: (field: TripSortField, order: SortOrder) => void;
  setPage: (page: number) => void;
}

const initialFilters: TripsFilters = {
  sector: SECTORS.SAND,
  status: 'all',
  boatPublicId: null,
  search: '',
  fromDate: null,
  toDate: null,
  sortBy: 'departureTime',
  sortOrder: 'desc',
  page: 1,
  limit: 10,
};

export const useTripsFiltersStore = create<TripsFiltersState>()(
  persist(
    (set) => ({
      filters: initialFilters,

      setFilter: (key, value) =>
        set((state) => ({
          filters: { ...state.filters, [key]: value, page: 1 }, // Reset page on filter change
        })),

      resetFilters: () =>
        set(() => ({
          filters: initialFilters,
        })),

      setSort: (sortBy, sortOrder) =>
        set((state) => ({
          filters: { ...state.filters, sortBy, sortOrder },
        })),

      setPage: (page) =>
        set((state) => ({
          filters: { ...state.filters, page },
        })),
    }),
    {
      name: 'nouka-trips-filters',
      version: 1, // Added version for migration
      migrate: (persistedState: unknown, version: number) => {
        const state = persistedState as TripsFiltersState;
        if (version === 0) {
          // If the persisted state had 'all' as the sector, migrate it to SAND
          if ((state?.filters?.sector as unknown as string) === 'all') {
            state.filters.sector = SECTORS.SAND;
          }
        }
        return state;
      },
      partialize: (state) => ({
        filters: {
          ...state.filters,
          // Don't persist search or page
          search: '',
          page: 1,
        },
      }),
    }
  )
);


