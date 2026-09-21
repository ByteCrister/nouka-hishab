import { useQuery } from '@tanstack/react-query';
import api from '@/utils/axios';
import type { 
    ReportListFilters, 
    ReportListResponse,
    ReportDetailResponse
} from '@/types/reports.types';

// Strip empty values before sending to the API
function compact<T extends object>(obj: T): Partial<T> {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(obj)) {
        if (v === '' || v === null || v === undefined) continue;
        out[k] = v;
    }
    return out as Partial<T>;
}

const API_URL = '/reports';

export const reportKeys = {
    all: ['reports'] as const,
    lists: () => [...reportKeys.all, 'list'] as const,
    list: (filters: ReportListFilters) => [...reportKeys.lists(), filters] as const,
    details: () => [...reportKeys.all, 'detail'] as const,
    detail: (id: string) => [...reportKeys.details(), id] as const,
};

export function useReports(filters: ReportListFilters) {
    return useQuery({
        queryKey: reportKeys.list(filters),
        queryFn: async () => {
            const params = compact({
                search: filters.search.trim() || undefined,
                category: filters.category !== 'all' ? filters.category : undefined,
                status: filters.status !== 'all' ? filters.status : undefined,
                sortBy: filters.sortBy,
                sortOrder: filters.sortOrder,
                page: filters.page,
                limit: filters.limit,
            });

            const { data } = await api.get<{ data: ReportListResponse }>(API_URL, { params });
            return data.data;
        },
    });
}

export function useReportDetail(publicId: string) {
    return useQuery({
        queryKey: reportKeys.detail(publicId),
        queryFn: async () => {
            const { data } = await api.get<{ data: ReportDetailResponse }>(`${API_URL}/${publicId}`);
            return data.data;
        },
        enabled: !!publicId,
    });
}
