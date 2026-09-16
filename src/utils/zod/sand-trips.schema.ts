import { z } from 'zod';
import { SAND_TRIP_STATUSES, SAND_CARGO_UNITS, SAND_TRIP_EXPENSE_CATEGORIES } from '@/constants/db/sand.const';

const locationSchema = z.object({
  name: z.string().min(1, "Name is required"),
  lat: z.number().nullable().optional(),
  lng: z.number().nullable().optional(),
});

export const createSandTripSchema = z.object({
  boatPublicId: z.string().min(1, "Boat is required"),
  sourceLocation: locationSchema.nullable().optional(),
  destLocation: locationSchema.nullable().optional(),
  departureTime: z.string().min(1, "Departure time is required"),
  arrivalTime: z.string().nullable().optional(),
  cargoValue: z.number().nullable().optional(),
  cargoUnit: z.nativeEnum(SAND_CARGO_UNITS).nullable().optional(),
  saleAmountTk: z.number().nullable().optional(),
  buyerName: z.string().max(255).nullable().optional(),
  buyerPhone: z.string().max(20).nullable().optional(),
  purchaseRatePerUnitTk: z.number().nullable().optional(),
  purchaseCostTk: z.number().nullable().optional(),
  govtRoyaltyRateTk: z.number().nullable().optional(),
  govtRoyaltyTk: z.number().nullable().optional(),
  localTollRateTk: z.number().nullable().optional(),
  localTollTk: z.number().nullable().optional(),
  status: z.nativeEnum(SAND_TRIP_STATUSES).optional().default(SAND_TRIP_STATUSES.SCHEDULED),
  notes: z.string().nullable().optional(),
});

export const updateSandTripSchema = createSandTripSchema.partial();

export const createSandTripExpenseSchema = z.object({
  category: z.nativeEnum(SAND_TRIP_EXPENSE_CATEGORIES),
  description: z.string().nullable().optional(),
  amountTk: z.number().min(0, "Amount must be positive"),
  expenseDate: z.string().nullable().optional(),
});

export const updateSandTripExpenseSchema = createSandTripExpenseSchema.partial();

export const createSandTripAttachmentSchema = z.object({
  fileId: z.number().int().positive("Invalid file ID"),
  description: z.string().nullable().optional(),
});
