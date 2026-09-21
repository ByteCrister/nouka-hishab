import type { ReportListFilters } from '@/types/reports.types';

export const REPORT_LIST_DEFAULT_FILTERS: ReportListFilters = {
  search: '',
  category: 'all',
  status: 'all',
  sortBy: 'createdAt',
  sortOrder: 'desc',
  page: 1,
  limit: 20,
};
