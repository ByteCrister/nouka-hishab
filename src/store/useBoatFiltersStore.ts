import { create } from 'zustand';
import type { SortOrder } from '@/types/api.types';
import type { BoatListFilters, BoatTripsFilters, BoatSortField, BoatTripSortField } from '@/types/boats.types';
import { BOAT_LIST_DEFAULT_FILTERS, BOAT_TRIPS_DEFAULT_FILTERS, type BoatStatus } from '@/constants/boats.const';
import type { SectorName } from '@/constants/db/app.const';
import type { SandTripStatus } from '@/constants/db/sand.const';

interface BoatsFiltersState {
    listFilters: BoatListFilters;
    setSearch: (v: string) => void;
    setSector: (v: SectorName | 'all') => void;
    setStatus: (v: BoatStatus | 'all') => void;
    setSort: (by: BoatSortField, order?: SortOrder) => void;
    setPage: (p: number) => void;
    setLimit: (l: number) => void;
    resetListFilters: () => void;

    tripsFilters: BoatTripsFilters;
    setTripsStatus: (v: SandTripStatus | 'all') => void;
    setTripsSearch: (v: string) => void;
    setTripsDateRange: (from: string | null, to: string | null) => void;
    setTripsSort: (by: BoatTripSortField, order?: SortOrder) => void;
    setTripsPage: (p: number) => void;
    setTripsLimit: (l: number) => void;
    resetTripsFilters: () => void;
}

export const useBoatFiltersStore = create<BoatsFiltersState>((set) => ({
    listFilters: { ...BOAT_LIST_DEFAULT_FILTERS },
    setSearch: (v) => set((s) => ({ listFilters: { ...s.listFilters, search: v, page: 1 } })),
    setSector: (v) => set((s) => ({ listFilters: { ...s.listFilters, sector: v, page: 1 } })),
    setStatus: (v) => set((s) => ({ listFilters: { ...s.listFilters, status: v, page: 1 } })),
    setSort: (by, order) => set((s) => ({
        listFilters: { ...s.listFilters, sortBy: by, sortOrder: order ?? s.listFilters.sortOrder, page: 1 }
    })),
    setPage: (p) => set((s) => ({ listFilters: { ...s.listFilters, page: p } })),
    setLimit: (l) => set((s) => ({ listFilters: { ...s.listFilters, limit: l, page: 1 } })),
    resetListFilters: () => set({ listFilters: { ...BOAT_LIST_DEFAULT_FILTERS } }),

    tripsFilters: { ...BOAT_TRIPS_DEFAULT_FILTERS },
    setTripsStatus: (v) => set((s) => ({ tripsFilters: { ...s.tripsFilters, status: v, page: 1 } })),
    setTripsSearch: (v) => set((s) => ({ tripsFilters: { ...s.tripsFilters, search: v, page: 1 } })),
    setTripsDateRange: (from, to) => set((s) => ({ tripsFilters: { ...s.tripsFilters, fromDate: from, toDate: to, page: 1 } })),
    setTripsSort: (by, order) => set((s) => ({
        tripsFilters: { ...s.tripsFilters, sortBy: by, sortOrder: order ?? s.tripsFilters.sortOrder, page: 1 }
    })),
    setTripsPage: (p) => set((s) => ({ tripsFilters: { ...s.tripsFilters, page: p } })),
    setTripsLimit: (l) => set((s) => ({ tripsFilters: { ...s.tripsFilters, limit: l, page: 1 } })),
    resetTripsFilters: () => set({ tripsFilters: { ...BOAT_TRIPS_DEFAULT_FILTERS } }),
}));
