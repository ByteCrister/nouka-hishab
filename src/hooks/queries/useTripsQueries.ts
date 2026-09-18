import { useQuery, UseQueryOptions, keepPreviousData } from '@tanstack/react-query';
import { api, extractErrorMessage } from '@/utils/axios';
import { TripListResponse, TripsFilters, SandTripDetail } from '@/types/trips.types';

export const tripKeys = {
  all: ['trips'] as const,
  lists: () => [...tripKeys.all, 'list'] as const,
  list: (filters: TripsFilters) => [...tripKeys.lists(), { filters }] as const,
  details: () => [...tripKeys.all, 'detail'] as const,
  detail: (id: string) => [...tripKeys.details(), id] as const,
};

// ─── List ─────────────────────────────────────────────────────────────────────

async function fetchTrips(filters: TripsFilters): Promise<TripListResponse> {
  // Strip null/empty values so they don't appear in the query string
  const params = Object.fromEntries(
    Object.entries(filters).filter(([, v]) => v !== null && v !== undefined && v !== '')
  );
  const { data } = await api.get<{ data: TripListResponse }>('/trips', { params });
  return data.data;
}

export function useTrips(filters: TripsFilters) {
  return useQuery({
    queryKey: tripKeys.list(filters),
    queryFn: () => fetchTrips(filters).catch((err) => { throw new Error(extractErrorMessage(err)); }),
    placeholderData: keepPreviousData,
  });
}

// ─── Detail (Sand specific for now) ───────────────────────────────────────────

async function fetchSandTripDetail(publicId: string): Promise<SandTripDetail> {
  const { data } = await api.get<{ data: SandTripDetail }>(`/trips/sand/${publicId}`);
  return data.data;
}

export function useSandTripDetail(
  publicId: string,
  options?: Omit<UseQueryOptions<SandTripDetail, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: tripKeys.detail(publicId),
    queryFn: () => fetchSandTripDetail(publicId).catch((err) => { throw new Error(extractErrorMessage(err)); }),
    enabled: !!publicId,
    ...options,
  });
}


