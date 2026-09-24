import { z } from 'zod';
import { BOAT_STATUSES, BOAT_CAPACITY_UNITS } from '@/constants/boats.const';

export const createBoatSchema = z.object({
  name: z.string().min(1, 'nameRequired').max(255, 'nameTooLong'),
  capacityValue: z.coerce.number({ message: 'capacityMustBePositive' }).positive('capacityMustBePositive'),
  capacityUnit: z.enum([BOAT_CAPACITY_UNITS.CUBIC_FT, BOAT_CAPACITY_UNITS.TON], { message: 'capacityUnitRequired' }),
  status: z.enum([BOAT_STATUSES.ACTIVE, BOAT_STATUSES.MAINTENANCE, BOAT_STATUSES.INACTIVE]).optional().default(BOAT_STATUSES.ACTIVE),
  notes: z.string().max(1000, 'notesTooLong').nullable().optional(),
});

export type CreateBoatSchema = z.infer<typeof createBoatSchema>;

export const updateBoatSchema = z.object({
  name: z.string().min(1, 'nameRequired').max(255, 'nameTooLong').optional(),
  registrationNumber: z.string().max(100, 'registrationNumberTooLong').nullable().optional().or(z.literal('')),
  capacityValue: z.coerce.number().positive('capacityMustBePositive').nullable().optional().or(z.literal('')),
  capacityUnit: z.enum([BOAT_CAPACITY_UNITS.CUBIC_FT, BOAT_CAPACITY_UNITS.TON]).nullable().optional().or(z.literal('')),
  lengthM: z.coerce.number().positive('lengthMustBePositive').nullable().optional().or(z.literal('')),
  widthM: z.coerce.number().positive('widthMustBePositive').nullable().optional().or(z.literal('')),
  draftM: z.coerce.number().positive('draftMustBePositive').nullable().optional().or(z.literal('')),
  engineMake: z.string().max(100, 'engineMakeTooLong').nullable().optional().or(z.literal('')),
  engineHp: z.coerce.number().positive('engineHpMustBePositive').nullable().optional().or(z.literal('')),
  engineNotes: z.string().max(1000, 'engineNotesTooLong').nullable().optional().or(z.literal('')),
  boatValueTk: z.coerce.number().positive('boatValueTkMustBePositive').nullable().optional().or(z.literal('')),
  status: z.enum([BOAT_STATUSES.ACTIVE, BOAT_STATUSES.MAINTENANCE, BOAT_STATUSES.INACTIVE]).optional(),
  notes: z.string().max(1000, 'notesTooLong').nullable().optional().or(z.literal('')),
}).refine(data => {
  const hasCapacityValue = data.capacityValue !== null && data.capacityValue !== undefined && data.capacityValue !== '';
  const hasCapacityUnit = data.capacityUnit !== null && data.capacityUnit !== undefined && data.capacityUnit !== '';
  if (hasCapacityValue && !hasCapacityUnit) return false;
  return true;
}, {
  message: "capacityUnitRequired",
  path: ["capacityUnit"]
}).refine(data => {
  const hasEngineHp = data.engineHp !== null && data.engineHp !== undefined && data.engineHp !== '';
  const hasEngineMake = data.engineMake !== null && data.engineMake !== undefined && data.engineMake !== '';
  if (hasEngineHp && !hasEngineMake) return false;
  return true;
}, {
  message: "engineMakeRequired",
  path: ["engineMake"]
});

export type UpdateBoatSchema = z.infer<typeof updateBoatSchema>;

export const uploadBoatDocumentSchema = z.object({
  fileId: z.number().int().positive(),
  documentType: z.string().min(1, 'documentTypeRequired').max(50, 'documentTypeTooLong'),
  description: z.string().max(500, 'descriptionTooLong').nullable().optional().or(z.literal('')),
  expiryDate: z.string().nullable().optional().or(z.literal('')),
});

export type UploadBoatDocumentSchema = z.infer<typeof uploadBoatDocumentSchema>;


