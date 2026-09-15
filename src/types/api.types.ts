// src/types/api.ts

export interface ApiResponse<T> {
  data: T;
  isInitialData?: boolean;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginatedResult<T> {
  items: T[];
  meta: PaginationMeta;
}

export type SortOrder = 'asc' | 'desc';

export interface ApiErrorShape {
  error: string;
}