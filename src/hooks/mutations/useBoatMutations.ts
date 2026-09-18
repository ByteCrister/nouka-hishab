import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/utils/axios';
import { boatKeys } from '../queries/useBoatsQueries';
import type { 
    BoatDetail, 
    BoatDetailResponse,
    CreateBoatPayload, 
    UpdateBoatPayload,
    AddBoatDocumentPayload 
} from '@/types/boats.types';

const API_URL = '/boats';

// Strip empty values before sending to the API
function compact<T extends object>(obj: T): Partial<T> {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(obj)) {
        if (v === '' || v === null || v === undefined) continue;
        out[k] = v;
    }
    return out as Partial<T>;
}

export function useCreateBoat() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (payload: CreateBoatPayload) => {
            const { data } = await api.post<{ data: BoatDetail }>(API_URL, compact(payload));
            return data.data;
        },
        onSuccess: (newBoat) => {
            queryClient.invalidateQueries({ queryKey: boatKeys.lists() });
            // Optionally, prime the detail cache
            queryClient.setQueryData(boatKeys.detail(newBoat.publicId), (old: BoatDetailResponse | undefined) => {
                if (old) {
                    return { ...old, boat: newBoat };
                }
                return { boat: newBoat, kpis: null };
            });
        },
    });
}

export function useUpdateBoat() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ publicId, payload }: { publicId: string; payload: UpdateBoatPayload }) => {
            const { data } = await api.patch<{ data: BoatDetail }>(`${API_URL}/${publicId}`, compact(payload));
            return data.data;
        },
        onSuccess: (updatedBoat, { publicId }) => {
            // Update detail cache immediately
            queryClient.setQueryData(boatKeys.detail(publicId), (old: BoatDetailResponse | undefined) => {
                if (!old) return old;
                return {
                    ...old,
                    boat: updatedBoat,
                };
            });
            // Invalidate lists to fetch fresh data in background
            queryClient.invalidateQueries({ queryKey: boatKeys.lists() });
        },
    });
}

export function useDeleteBoat() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (publicId: string) => {
            await api.delete(`${API_URL}/${publicId}`);
            return publicId;
        },
        onSuccess: (publicId) => {
            queryClient.removeQueries({ queryKey: boatKeys.detail(publicId) });
            queryClient.invalidateQueries({ queryKey: boatKeys.lists() });
        },
    });
}

export function useUploadBoatImage() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ publicId, fileId, isPrimary = false }: { publicId: string; fileId: number; isPrimary?: boolean }) => {
            await api.post(`${API_URL}/${publicId}/images`, { fileId, isPrimary });
            return publicId;
        },
        onSuccess: (publicId) => {
            queryClient.invalidateQueries({ queryKey: boatKeys.detail(publicId) });
            queryClient.invalidateQueries({ queryKey: boatKeys.lists() });
        },
    });
}

export function useDeleteBoatImage() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ publicId, fileId }: { publicId: string; fileId: number }) => {
            await api.delete(`${API_URL}/${publicId}/images/${fileId}`);
            return publicId;
        },
        onSuccess: (publicId) => {
            queryClient.invalidateQueries({ queryKey: boatKeys.detail(publicId) });
            queryClient.invalidateQueries({ queryKey: boatKeys.lists() });
        },
    });
}

export function useUploadBoatDocument() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ publicId, payload }: { publicId: string; payload: AddBoatDocumentPayload }) => {
            await api.post(`${API_URL}/${publicId}/documents`, compact(payload));
            return publicId;
        },
        onSuccess: (publicId) => {
            queryClient.invalidateQueries({ queryKey: boatKeys.detail(publicId) });
        },
    });
}

export function useDeleteBoatDocument() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ publicId, documentId }: { publicId: string; documentId: number }) => {
            await api.delete(`${API_URL}/${publicId}/documents/${documentId}`);
            return publicId;
        },
        onSuccess: (publicId) => {
            queryClient.invalidateQueries({ queryKey: boatKeys.detail(publicId) });
        },
    });
}


