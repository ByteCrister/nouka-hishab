import { useQuery, UseQueryOptions, keepPreviousData } from '@tanstack/react-query';
import { api, extractErrorMessage } from '@/utils/axios';
import { SandTripListResponse, SandTripsFilters, SandTripDetailResponse } from '@/types/sand/trips.types';

export const sandTripKeys = {
  all: ['sandTrips'] as const,
  lists: () => [...sandTripKeys.all, 'list'] as const,
  list: (filters: SandTripsFilters) => [...sandTripKeys.lists(), { filters }] as const,
  details: () => [...sandTripKeys.all, 'detail'] as const,
  detail: (id: string) => [...sandTripKeys.details(), id] as const,
};

// ─── List ─────────────────────────────────────────────────────────────────────

async function fetchSandTrips(filters: SandTripsFilters): Promise<SandTripListResponse> {
  // Strip null/empty values so they don't appear in the query string
  const params = Object.fromEntries(
    Object.entries(filters).filter(([, v]) => v !== null && v !== undefined && v !== '')
  );
  const { data } = await api.get<{ data: SandTripListResponse }>('/sand/trips', { params });
  return data.data;
}

export function useSandTrips(filters: SandTripsFilters) {
  return useQuery({
    queryKey: sandTripKeys.list(filters),
    queryFn: () => fetchSandTrips(filters).catch((err) => { throw new Error(extractErrorMessage(err)); }),
    placeholderData: keepPreviousData,
  });
}

// ─── Detail ───────────────────────────────────────────────────────────────────

async function fetchSandTripDetail(publicId: string): Promise<SandTripDetailResponse> {
  const { data } = await api.get<{ data: SandTripDetailResponse }>(`/sand/trips/${publicId}`);
  return data.data;
}

export function useSandTripDetail(
  publicId: string,
  options?: Omit<UseQueryOptions<SandTripDetailResponse, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: sandTripKeys.detail(publicId),
    queryFn: () => fetchSandTripDetail(publicId).catch((err) => { throw new Error(extractErrorMessage(err)); }),
    enabled: !!publicId,
    ...options,
  });
}
