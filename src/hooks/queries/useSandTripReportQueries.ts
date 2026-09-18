// src/hooks/queries/useSandTripReportQueries.ts
// ─── PDF Report TanStack Query Hooks ─────────────────────────────────────────
// Follows the exact same pattern as useSandTripsQueries.ts.
// Both hooks are LAZY by default (enabled: false) — they only fire when the
// caller explicitly triggers them by setting `enabled: true`.

import { useQuery, type UseQueryOptions, type UseQueryResult } from '@tanstack/react-query';
import { api, extractErrorMessage } from '@/utils/axios';
import { tripKeys } from './useTripsQueries';
import type {
  SandTripReportDTO,
  SingleSandTripReportDTO,
  SandTripsReportFilters,
} from '@/types/sand-report.types';

// ─── Query key factory ────────────────────────────────────────────────────────

export const sandTripReportKeys = {
  all: ['sandTripReports'] as const,
  listReports: () => [...sandTripReportKeys.all, 'list'] as const,
  listReport: (filters: SandTripsReportFilters) =>
    [...sandTripReportKeys.listReports(), { filters }] as const,
  singleReports: () => [...sandTripReportKeys.all, 'single'] as const,
  singleReport: (publicId: string) =>
    [...sandTripReportKeys.singleReports(), publicId] as const,
};

// ─── Fetch functions ──────────────────────────────────────────────────────────

async function fetchSandTripsReport(
  filters: SandTripsReportFilters
): Promise<SandTripReportDTO> {
  const params = {
    boatPublicId: filters.boatPublicId,
    fromDate: filters.fromDate,
    toDate: filters.toDate,
  };
  const { data } = await api.get<{ data: SandTripReportDTO }>('/sand/reports/trips', {
    params,
  });
  return data.data;
}

async function fetchSingleSandTripReport(
  publicId: string
): Promise<SingleSandTripReportDTO> {
  const { data } = await api.get<{ data: SingleSandTripReportDTO }>(
    `/sand/reports/trips/${publicId}`
  );
  return data.data;
}

// ─── Hooks ────────────────────────────────────────────────────────────────────

/**
 * Lazy query for the list-page multi-trip PDF export.
 * Only fires when `filters` is non-null AND `enabled` is true.
 *
 * Typical usage:
 *   const [enabled, setEnabled] = useState(false);
 *   const query = useSandTripsReport(filters, { enabled });
 *   // trigger: setEnabled(true)
 */
export function useSandTripsReport(
  filters: SandTripsReportFilters | null,
  options?: Omit<UseQueryOptions<SandTripReportDTO, Error>, 'queryKey' | 'queryFn'>
): UseQueryResult<SandTripReportDTO, Error> {
  const safeFilters = filters ?? {
    boatPublicId: '',
    fromDate: '',
    toDate: '',
  };
  return useQuery<SandTripReportDTO, Error>({
    queryKey: sandTripReportKeys.listReport(safeFilters),
    queryFn: () =>
      fetchSandTripsReport(safeFilters).catch((err) => {
        throw new Error(extractErrorMessage(err));
      }),
    enabled: !!filters && !!(options?.enabled ?? true),
    staleTime: 5 * 60 * 1000, // 5 min — same data = same PDF within session
    gcTime: 10 * 60 * 1000,   // keep in cache 10 min after unmount
    ...options,
  });
}

/**
 * Lazy query for the detail-page single-trip PDF export.
 * Fires only when `publicId` is non-empty AND `enabled` is true.
 */
export function useSingleSandTripReport(
  publicId: string,
  options?: Omit<UseQueryOptions<SingleSandTripReportDTO, Error>, 'queryKey' | 'queryFn'>
): UseQueryResult<SingleSandTripReportDTO, Error> {
  return useQuery<SingleSandTripReportDTO, Error>({
    queryKey: sandTripReportKeys.singleReport(publicId),
    queryFn: () =>
      fetchSingleSandTripReport(publicId).catch((err) => {
        throw new Error(extractErrorMessage(err));
      }),
    enabled: !!publicId && !!(options?.enabled ?? true),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    ...options,
  });
}



