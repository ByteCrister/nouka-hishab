import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api, extractErrorMessage } from '@/utils/axios';
import { 
  CreateSandTripPayload, 
  UpdateSandTripPayload,
  CreateSandTripExpensePayload,
  UpdateSandTripExpensePayload,
  CreateSandTripAttachmentPayload
} from '@/types/sand/trips.types';
import { sandTripKeys } from '@/hooks/queries/useSandTripsQueries';
import { toast } from 'sonner';

// ─── Create ───────────────────────────────────────────────────────────────────

async function createSandTrip(payload: CreateSandTripPayload): Promise<{ success: boolean; publicId: string }> {
  const { data } = await api.post<{ data: { success: boolean; publicId: string } }>('/sand/trips', payload);
  return data.data;
}

export function useCreateSandTrip(onSuccessCallback?: (publicId: string) => void) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createSandTrip,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: sandTripKeys.lists() });
      toast.success('Trip created successfully');
      onSuccessCallback?.(data.publicId);
    },
    onError: (err: unknown) => {
      toast.error(extractErrorMessage(err, 'Failed to create trip'));
    },
  });
}

// ─── Update ───────────────────────────────────────────────────────────────────

async function updateSandTrip({
  publicId,
  payload,
}: {
  publicId: string;
  payload: UpdateSandTripPayload;
}): Promise<{ success: boolean; publicId: string }> {
  const { data } = await api.patch<{ data: { success: boolean; publicId: string } }>(
    `/sand/trips/${publicId}`,
    payload
  );
  return data.data;
}

export function useUpdateSandTrip(onSuccessCallback?: () => void) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateSandTrip,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: sandTripKeys.detail(variables.publicId) });
      queryClient.invalidateQueries({ queryKey: sandTripKeys.lists() });
      toast.success('Trip updated successfully');
      onSuccessCallback?.();
    },
    onError: (err: unknown) => {
      toast.error(extractErrorMessage(err, 'Failed to update trip'));
    },
  });
}

// ─── Delete ───────────────────────────────────────────────────────────────────

async function deleteSandTrip(publicId: string): Promise<{ success: boolean }> {
  const { data } = await api.delete<{ data: { success: boolean } }>(`/sand/trips/${publicId}`);
  return data.data;
}

export function useDeleteSandTrip(onSuccessCallback?: () => void) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteSandTrip,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sandTripKeys.lists() });
      toast.success('Trip deleted successfully');
      onSuccessCallback?.();
    },
    onError: (err: unknown) => {
      toast.error(extractErrorMessage(err, 'Failed to delete trip'));
    },
  });
}

// ─── Expenses ─────────────────────────────────────────────────────────────────

async function createSandTripExpense({
  tripPublicId,
  payload,
}: {
  tripPublicId: string;
  payload: CreateSandTripExpensePayload;
}): Promise<{ success: boolean; publicId: string }> {
  const { data } = await api.post<{ data: { success: boolean; publicId: string } }>(
    `/sand/trips/${tripPublicId}/expenses`,
    payload
  );
  return data.data;
}

export function useCreateSandTripExpense(onSuccessCallback?: () => void) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createSandTripExpense,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: sandTripKeys.detail(variables.tripPublicId) });
      toast.success('Expense added successfully');
      onSuccessCallback?.();
    },
    onError: (err: unknown) => {
      toast.error(extractErrorMessage(err, 'Failed to add expense'));
    },
  });
}

async function updateSandTripExpense({
  tripPublicId,
  expensePublicId,
  payload,
}: {
  tripPublicId: string;
  expensePublicId: string;
  payload: UpdateSandTripExpensePayload;
}): Promise<{ success: boolean }> {
  const { data } = await api.patch<{ data: { success: boolean } }>(
    `/sand/trips/${tripPublicId}/expenses/${expensePublicId}`,
    payload
  );
  return data.data;
}

export function useUpdateSandTripExpense(onSuccessCallback?: () => void) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateSandTripExpense,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: sandTripKeys.detail(variables.tripPublicId) });
      toast.success('Expense updated successfully');
      onSuccessCallback?.();
    },
    onError: (err: unknown) => {
      toast.error(extractErrorMessage(err, 'Failed to update expense'));
    },
  });
}

async function deleteSandTripExpense({
  tripPublicId,
  expensePublicId,
}: {
  tripPublicId: string;
  expensePublicId: string;
}): Promise<{ success: boolean }> {
  const { data } = await api.delete<{ data: { success: boolean } }>(
    `/sand/trips/${tripPublicId}/expenses/${expensePublicId}`
  );
  return data.data;
}

export function useDeleteSandTripExpense(onSuccessCallback?: () => void) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteSandTripExpense,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: sandTripKeys.detail(variables.tripPublicId) });
      toast.success('Expense deleted successfully');
      onSuccessCallback?.();
    },
    onError: (err: unknown) => {
      toast.error(extractErrorMessage(err, 'Failed to delete expense'));
    },
  });
}

// ─── Attachments ──────────────────────────────────────────────────────────────

async function createSandTripAttachment({
  tripPublicId,
  payload,
}: {
  tripPublicId: string;
  payload: CreateSandTripAttachmentPayload;
}): Promise<{ success: boolean }> {
  const { data } = await api.post<{ data: { success: boolean } }>(
    `/sand/trips/${tripPublicId}/attachments`,
    payload
  );
  return data.data;
}

export function useCreateSandTripAttachment(onSuccessCallback?: () => void) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createSandTripAttachment,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: sandTripKeys.detail(variables.tripPublicId) });
      toast.success('Attachment added successfully');
      onSuccessCallback?.();
    },
    onError: (err: unknown) => {
      toast.error(extractErrorMessage(err, 'Failed to add attachment'));
    },
  });
}

async function deleteSandTripAttachment({
  tripPublicId,
  fileId,
}: {
  tripPublicId: string;
  fileId: number;
}): Promise<{ success: boolean }> {
  const { data } = await api.delete<{ data: { success: boolean } }>(
    `/sand/trips/${tripPublicId}/attachments/${fileId}`
  );
  return data.data;
}

export function useDeleteSandTripAttachment(onSuccessCallback?: () => void) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteSandTripAttachment,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: sandTripKeys.detail(variables.tripPublicId) });
      toast.success('Attachment removed successfully');
      onSuccessCallback?.();
    },
    onError: (err: unknown) => {
      toast.error(extractErrorMessage(err, 'Failed to remove attachment'));
    },
  });
}
