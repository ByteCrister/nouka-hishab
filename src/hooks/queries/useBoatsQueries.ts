import { useQuery } from '@tanstack/react-query';
import api from '@/utils/axios';
import type { 
    BoatListFilters, 
    BoatTripsFilters, 
    BoatListResponse,
    BoatDetailResponse,
    BoatTripsResponse
} from '@/types/boats.types';

// Strip empty values before sending to the API
function compact<T extends object>(obj: T): Partial<T> {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(obj)) {
        if (v === '' || v === null || v === undefined) continue;
        out[k] = v;
    }
    return out as Partial<T>;
}

const API_URL = '/boats';

export const boatKeys = {
    all: ['boats'] as const,
    lists: () => [...boatKeys.all, 'list'] as const,
    list: (filters: BoatListFilters) => [...boatKeys.lists(), filters] as const,
    details: () => [...boatKeys.all, 'detail'] as const,
    detail: (id: string) => [...boatKeys.details(), id] as const,
    trips: (id: string) => [...boatKeys.detail(id), 'trips'] as const,
    tripsList: (id: string, filters: BoatTripsFilters) => [...boatKeys.trips(id), filters] as const,
};

export function useBoats(filters: BoatListFilters) {
    return useQuery({
        queryKey: boatKeys.list(filters),
        queryFn: async () => {
            const params = compact({
                search: filters.search.trim() || undefined,
                sector: filters.sector !== 'all' ? filters.sector : undefined,
                status: filters.status !== 'all' ? filters.status : undefined,
                sortBy: filters.sortBy,
                sortOrder: filters.sortOrder,
                page: filters.page,
                limit: filters.limit,
            });

            const { data } = await api.get<{ data: BoatListResponse }>(API_URL, { params });
            return data.data;
        },
    });
}

export function useBoatDetail(publicId: string) {
    return useQuery({
        queryKey: boatKeys.detail(publicId),
        queryFn: async () => {
            const { data } = await api.get<{ data: BoatDetailResponse }>(`${API_URL}/${publicId}`);
            return data.data;
        },
        enabled: !!publicId,
    });
}

export function useBoatTrips(publicId: string, filters: BoatTripsFilters) {
    return useQuery({
        queryKey: boatKeys.tripsList(publicId, filters),
        queryFn: async () => {
            const params = compact({
                search: filters.search.trim() || undefined,
                status: filters.status !== 'all' ? filters.status : undefined,
                fromDate: filters.fromDate ?? undefined,
                toDate: filters.toDate ?? undefined,
                sortBy: filters.sortBy,
                sortOrder: filters.sortOrder,
                page: filters.page,
                limit: filters.limit,
            });

            const { data } = await api.get<{ data: BoatTripsResponse }>(
                `${API_URL}/${publicId}/trips`,
                { params },
            );
            return data.data;
        },
        enabled: !!publicId,
    });
}


