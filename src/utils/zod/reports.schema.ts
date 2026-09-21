import { z } from 'zod';
import { REPORT_CATEGORIES, REPORT_STATUSES } from '@/constants/db/app.const';

export const createReportSchema = z.object({
  title: z.string().min(1, 'titleRequired').max(255, 'titleTooLong'),
  category: z.nativeEnum(REPORT_CATEGORIES, { message: 'categoryRequired' }),
  description: z.string().max(2000, 'descriptionTooLong').nullable().optional().or(z.literal('')),
  attachmentIds: z.array(z.number()).max(3).optional(),
});

export type CreateReportSchema = z.infer<typeof createReportSchema>;

export const updateReportSchema = z.object({
  status: z.nativeEnum(REPORT_STATUSES).optional(),
  adminReply: z.string().max(2000, 'replyTooLong').nullable().optional().or(z.literal('')),
});

export type UpdateReportSchema = z.infer<typeof updateReportSchema>;

export const uploadReportAttachmentSchema = z.object({
  fileId: z.number().int().positive(),
});

export type UploadReportAttachmentSchema = z.infer<typeof uploadReportAttachmentSchema>;
