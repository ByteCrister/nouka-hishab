import { useQuery } from '@tanstack/react-query';
import api from '@/utils/axios';
import type { 
    MaintenanceListFilters, 
    MaintenanceListResponse 
} from '@/types/maintenance.types';

// Strip empty values before sending to the API
function compact<T extends object>(obj: T): Partial<T> {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(obj)) {
        if (v === '' || v === null || v === undefined) continue;
        out[k] = v;
    }
    return out as Partial<T>;
}

const API_URL = '/maintenance';

export const maintenanceKeys = {
    all: ['maintenance'] as const,
    lists: () => [...maintenanceKeys.all, 'list'] as const,
    list: (filters: MaintenanceListFilters) => [...maintenanceKeys.lists(), filters] as const,
};

export function useMaintenanceList(filters: MaintenanceListFilters) {
    return useQuery({
        queryKey: maintenanceKeys.list(filters),
        queryFn: async () => {
            const params = compact({
                search: filters.search.trim() || undefined,
                boatId: filters.boatId !== 'all' ? filters.boatId : undefined,
                fromDate: filters.fromDate,
                toDate: filters.toDate,
                sortBy: filters.sortBy,
                sortOrder: filters.sortOrder,
                page: filters.page,
                limit: filters.limit,
            });

            const res = await api.get<{ data: MaintenanceListResponse }>(API_URL, { params });
            return res.data.data;
        },
    });
}
