import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/utils/axios';
import { maintenanceKeys } from '../queries/useMaintenanceQueries';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import type { CreateMaintenanceSchema, UpdateMaintenanceSchema } from '@/utils/zod/maintenance.schema';
import type { ApiResponse } from '@/types/api.types';

const API_URL = '/maintenance';

export function useCreateMaintenance() {
    const queryClient = useQueryClient();
    const t = useTranslations('maintenance');

    return useMutation({
        mutationFn: async (data: CreateMaintenanceSchema) => {
            const res = await api.post<ApiResponse<{ id: number }>>(API_URL, data);
            return res.data.data;
        },
        onSuccess: () => {
            toast.success(t('messages.createSuccess'));
            queryClient.invalidateQueries({ queryKey: maintenanceKeys.lists() });
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.error || t('messages.createError'));
        },
    });
}

export function useUpdateMaintenance() {
    const queryClient = useQueryClient();
    const t = useTranslations('maintenance');

    return useMutation({
        mutationFn: async ({ id, data }: { id: number; data: UpdateMaintenanceSchema }) => {
            const res = await api.put<ApiResponse<{ success: boolean }>>(`${API_URL}/${id}`, data);
            return res.data.data;
        },
        onSuccess: () => {
            toast.success(t('messages.updateSuccess'));
            queryClient.invalidateQueries({ queryKey: maintenanceKeys.lists() });
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.error || t('messages.updateError'));
        },
    });
}

export function useDeleteMaintenance() {
    const queryClient = useQueryClient();
    const t = useTranslations('maintenance');

    return useMutation({
        mutationFn: async (id: number) => {
            const res = await api.delete<ApiResponse<{ success: boolean }>>(`${API_URL}/${id}`);
            return res.data.data;
        },
        onSuccess: () => {
            toast.success(t('messages.deleteSuccess'));
            queryClient.invalidateQueries({ queryKey: maintenanceKeys.lists() });
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.error || t('messages.deleteError'));
        },
    });
}
