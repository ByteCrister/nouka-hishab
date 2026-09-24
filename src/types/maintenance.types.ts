// src/types/maintenance.types.ts
import type { PaginationMeta } from './api.types';

export interface MaintenanceListItem {
  id: number;
  maintenanceDate: string;
  description: string;
  costTk: number | null;
  vendorName: string | null;
  notes: string | null;
  boatId: number;
  boatName: string;
}

export interface MaintenanceKpis {
  totalRecords: number;
  totalCostTk: number;
  currentMonthCostTk: number;
}

export interface MaintenanceListResponse {
  items: MaintenanceListItem[];
  meta: PaginationMeta;
  kpis: MaintenanceKpis;
}

export type MaintenanceSortField = 'maintenanceDate' | 'costTk' | 'createdAt';
export type SortOrder = 'asc' | 'desc';

export interface MaintenanceListFilters {
  search: string;
  boatId: string | 'all';
  sortBy: MaintenanceSortField;
  sortOrder: SortOrder;
  fromDate?: string | null;
  toDate?: string | null;
  page: number;
  limit: number;
}
