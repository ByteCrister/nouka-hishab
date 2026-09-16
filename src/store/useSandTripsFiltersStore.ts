import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { SandTripsFilters, SandTripSortField } from '@/types/sand/trips.types';
import type { SortOrder } from '@/types/api.types';

interface SandTripsFiltersState {
  filters: SandTripsFilters;
  setFilter: <K extends keyof SandTripsFilters>(key: K, value: SandTripsFilters[K]) => void;
  resetFilters: () => void;
  setSort: (field: SandTripSortField, order: SortOrder) => void;
  setPage: (page: number) => void;
}

const initialFilters: SandTripsFilters = {
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

export const useSandTripsFiltersStore = create<SandTripsFiltersState>()(
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
      name: 'nouka-sand-trips-filters',
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
