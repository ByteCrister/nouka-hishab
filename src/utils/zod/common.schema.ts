import { z } from "zod";

// Bangladesh Phone Number Validation
// Matches: 01xxxxxxxxx, 8801xxxxxxxxx, +8801xxxxxxxxx
export const bdPhoneRegex = /^(?:\+?88)?01[3-9]\d{8}$/;

export const phoneSchema = z
  .string()
  .regex(bdPhoneRegex, "Invalid Bangladesh phone number")
  .nullable()
  .optional()
  .or(z.literal(""));

// Bangladesh NID Number Validation
// NID must be exactly 10, 13, or 17 digits
export const nidRegex = /^(\d{10}|\d{13}|\d{17})$/;

export const nidSchema = z
  .string()
  .regex(nidRegex, "NID must be 10, 13, or 17 digits long")
  .nullable()
  .optional()
  .or(z.literal(""));
