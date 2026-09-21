import { create } from 'zustand';
import type { SortOrder } from '@/types/api.types';
import type { ReportListFilters, ReportSortField } from '@/types/reports.types';
import { REPORT_LIST_DEFAULT_FILTERS } from '@/constants/reports.const';
import type { ReportCategory, ReportStatus } from '@/constants/db/app.const';

interface ReportsFiltersState {
  listFilters: ReportListFilters;
  setSearch: (v: string) => void;
  setCategory: (v: ReportCategory | 'all') => void;
  setStatus: (v: ReportStatus | 'all') => void;
  setSort: (by: ReportSortField, order?: SortOrder) => void;
  setPage: (p: number) => void;
  setLimit: (l: number) => void;
  resetListFilters: () => void;
}

export const useReportsFiltersStore = create<ReportsFiltersState>((set) => ({
  listFilters: { ...REPORT_LIST_DEFAULT_FILTERS },
  setSearch: (v) => set((s) => ({ listFilters: { ...s.listFilters, search: v, page: 1 } })),
  setCategory: (v) => set((s) => ({ listFilters: { ...s.listFilters, category: v, page: 1 } })),
  setStatus: (v) => set((s) => ({ listFilters: { ...s.listFilters, status: v, page: 1 } })),
  setSort: (by, order) => set((s) => ({
    listFilters: { ...s.listFilters, sortBy: by, sortOrder: order ?? s.listFilters.sortOrder, page: 1 }
  })),
  setPage: (p) => set((s) => ({ listFilters: { ...s.listFilters, page: p } })),
  setLimit: (l) => set((s) => ({ listFilters: { ...s.listFilters, limit: l, page: 1 } })),
  resetListFilters: () => set({ listFilters: { ...REPORT_LIST_DEFAULT_FILTERS } }),
}));
