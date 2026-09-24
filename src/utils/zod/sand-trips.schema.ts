import { z } from 'zod';
import { SAND_TRIP_STATUSES, SAND_CARGO_UNITS } from '@/constants/db/sand.const';
import { TRIP_EXPENSE_CATEGORIES } from '@/constants/db/trips.const';

import { bdPhoneRegex } from './common.schema';

const baseSandTripSchema = z.object({
  boatPublicId: z.string().min(1, "Boat is required"),
  source: z.string().min(1, "Source is required"),
  destination: z.string().min(1, "Destination is required"),
  departureTime: z.string().min(1, "Departure time is required"),
  arrivalTime: z.string().min(1, "Arrival time is required"),
  cargoValue: z.number().min(0, "Cannot be negative"),
  cargoUnit: z.nativeEnum(SAND_CARGO_UNITS),
  saleRatePerUnitTk: z.number().min(0, "Cannot be negative").optional().nullable(),
  saleAmountTk: z.number().min(0, "Cannot be negative"),
  buyerName: z.string().min(1, "Buyer name is required").max(255),
  buyerPhone: z.string().regex(bdPhoneRegex, "Invalid Bangladesh phone number"),
  purchaseRatePerUnitTk: z.number().min(0, "Cannot be negative"),
  purchaseCostTk: z.number().min(0, "Cannot be negative"),
  govtRoyaltyRateTk: z.number().min(0, "Cannot be negative"),
  govtRoyaltyTk: z.number().min(0, "Cannot be negative"),
  localTollRateTk: z.number().min(0, "Cannot be negative"),
  localTollTk: z.number().min(0, "Cannot be negative"),
  operatingCostRatePerUnitTk: z.number().min(0, "Cannot be negative").optional().nullable(),
  operatingCostTk: z.number().min(0, "Cannot be negative"),
  status: z.nativeEnum(SAND_TRIP_STATUSES).optional().default(SAND_TRIP_STATUSES.SCHEDULED),
  notes: z.string().nullable().optional(),
});

const timeRefinement = (data: { departureTime?: string | null; arrivalTime?: string | null }) => {
  if (data.departureTime && data.arrivalTime) {
    return new Date(data.arrivalTime) >= new Date(data.departureTime);
  }
  return true;
};

export const createSandTripSchema = baseSandTripSchema.refine(timeRefinement, {
  message: "Arrival time cannot be before departure time",
  path: ["arrivalTime"],
});

export const updateSandTripSchema = baseSandTripSchema.partial().refine(timeRefinement, {
  message: "Arrival time cannot be before departure time",
  path: ["arrivalTime"],
});

export const createTripExpenseSchema = z.object({
  boatPublicId: z.string().min(1, "Boat is required"),
  sandTripId: z.number().int().positive().nullable().optional(),
  category: z.nativeEnum(TRIP_EXPENSE_CATEGORIES),
  description: z.string().nullable().optional(),
  amountTk: z.number().min(0, "Amount must be positive"),
  expenseDate: z.string().nullable().optional(),
});

export const updateTripExpenseSchema = createTripExpenseSchema.partial();

export const createTripAttachmentSchema = z.object({
  boatPublicId: z.string().min(1, "Boat is required"),
  sandTripId: z.number().int().positive().nullable().optional(),
  fileId: z.number().int().positive("Invalid file ID"),
  description: z.string().nullable().optional(),
});


