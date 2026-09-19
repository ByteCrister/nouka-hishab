import { create } from 'zustand';
import type { SortOrder } from '@/types/api.types';
import type { MaintenanceListFilters, MaintenanceSortField } from '@/types/maintenance.types';

export const MAINTENANCE_LIST_DEFAULT_FILTERS: MaintenanceListFilters = {
    search: '',
    boatId: 'all',
    sortBy: 'maintenanceDate',
    sortOrder: 'desc',
    fromDate: null,
    toDate: null,
    page: 1,
    limit: 10,
};

interface MaintenanceFiltersState {
    filters: MaintenanceListFilters;
    setSearch: (v: string) => void;
    setBoat: (v: string | 'all') => void;
    setSort: (by: MaintenanceSortField, order?: SortOrder) => void;
    setFilter: <K extends keyof MaintenanceListFilters>(key: K, value: MaintenanceListFilters[K]) => void;
    setPage: (p: number) => void;
    setLimit: (l: number) => void;
    resetFilters: () => void;
}

export const useMaintenanceFiltersStore = create<MaintenanceFiltersState>((set) => ({
    filters: { ...MAINTENANCE_LIST_DEFAULT_FILTERS },
    setSearch: (v) => set((s) => ({ filters: { ...s.filters, search: v, page: 1 } })),
    setBoat: (v) => set((s) => ({ filters: { ...s.filters, boatId: v, page: 1 } })),
    setSort: (by, order) => set((s) => ({
        filters: { ...s.filters, sortBy: by, sortOrder: order ?? s.filters.sortOrder, page: 1 }
    })),
    setFilter: (key, value) => set((s) => ({
        filters: { ...s.filters, [key]: value, page: 1 }
    })),
    setPage: (p) => set((s) => ({ filters: { ...s.filters, page: p } })),
    setLimit: (l) => set((s) => ({ filters: { ...s.filters, limit: l, page: 1 } })),
    resetFilters: () => set({ filters: { ...MAINTENANCE_LIST_DEFAULT_FILTERS } }),
}));
