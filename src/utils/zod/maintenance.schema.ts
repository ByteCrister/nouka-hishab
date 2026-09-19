import { z } from 'zod';

export const createMaintenanceSchema = z.object({
  boatId: z.coerce.number().int().positive('boatRequired'),
  maintenanceDate: z.string().min(1, 'maintenanceDateRequired'),
  description: z.string().min(1, 'descriptionRequired').max(500, 'descriptionTooLong'),
  costTk: z.preprocess((val) => (val === '' ? null : val), z.coerce.number().nonnegative('costMustBePositive').nullable().optional()),
  vendorName: z.preprocess((val) => (val === '' ? null : val), z.string().max(255, 'vendorNameTooLong').nullable().optional()),
  notes: z.preprocess((val) => (val === '' ? null : val), z.string().max(1000, 'notesTooLong').nullable().optional()),
});

export type CreateMaintenanceSchema = z.infer<typeof createMaintenanceSchema>;

export const updateMaintenanceSchema = z.object({
  boatId: z.coerce.number().int().positive('boatRequired').optional(),
  maintenanceDate: z.string().min(1, 'maintenanceDateRequired').optional(),
  description: z.string().min(1, 'descriptionRequired').max(500, 'descriptionTooLong').optional(),
  costTk: z.preprocess((val) => (val === '' ? null : val), z.coerce.number().nonnegative('costMustBePositive').nullable().optional()),
  vendorName: z.preprocess((val) => (val === '' ? null : val), z.string().max(255, 'vendorNameTooLong').nullable().optional()),
  notes: z.preprocess((val) => (val === '' ? null : val), z.string().max(1000, 'notesTooLong').nullable().optional()),
});

export type UpdateMaintenanceSchema = z.infer<typeof updateMaintenanceSchema>;
