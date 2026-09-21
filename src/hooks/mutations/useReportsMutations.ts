import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/utils/axios';
import { reportKeys } from '../queries/useReportsQueries';
import type { 
    ReportDetail, 
    ReportDetailResponse,
    CreateReportPayload, 
    UpdateReportPayload,
    AddReportAttachmentPayload 
} from '@/types/reports.types';

const API_URL = '/reports';

// Strip empty values before sending to the API
function compact<T extends object>(obj: T): Partial<T> {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(obj)) {
        if (v === '' || v === null || v === undefined) continue;
        out[k] = v;
    }
    return out as Partial<T>;
}

export function useCreateReport() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (payload: CreateReportPayload) => {
            const { data } = await api.post<{ data: ReportDetail }>(API_URL, compact(payload));
            return data.data;
        },
        onSuccess: (newReport) => {
            queryClient.invalidateQueries({ queryKey: reportKeys.lists() });
            queryClient.setQueryData(reportKeys.detail(newReport.publicId), (old: ReportDetailResponse | undefined) => {
                if (old) {
                    return { ...old, report: newReport };
                }
                return { report: newReport };
            });
        },
    });
}

export function useUpdateReport() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ publicId, payload }: { publicId: string; payload: UpdateReportPayload }) => {
            const { data } = await api.patch<{ data: ReportDetail }>(`${API_URL}/${publicId}`, compact(payload));
            return data.data;
        },
        onSuccess: (updatedReport, { publicId }) => {
            queryClient.setQueryData(reportKeys.detail(publicId), (old: ReportDetailResponse | undefined) => {
                if (!old) return old;
                return {
                    ...old,
                    report: updatedReport,
                };
            });
            queryClient.invalidateQueries({ queryKey: reportKeys.lists() });
        },
    });
}

export function useAddReportAttachment() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ publicId, payload }: { publicId: string; payload: AddReportAttachmentPayload }) => {
            await api.post(`${API_URL}/${publicId}/attachments`, compact(payload));
            return publicId;
        },
        onSuccess: (publicId) => {
            queryClient.invalidateQueries({ queryKey: reportKeys.detail(publicId) });
        },
    });
}

export function useDeleteReportAttachment() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ publicId, fileId }: { publicId: string; fileId: number }) => {
            await api.delete(`${API_URL}/${publicId}/attachments/${fileId}`);
            return publicId;
        },
        onSuccess: (publicId) => {
            queryClient.invalidateQueries({ queryKey: reportKeys.detail(publicId) });
        },
    });
}
