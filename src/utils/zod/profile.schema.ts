import { z } from "zod";
import { phoneSchema, nidSchema } from "./common.schema";

export const profileSchema = z.object({
  fullName: z
    .string()
    .min(2, "Full name must be at least 2 characters long")
    .max(100, "Full name must be at most 100 characters long"),
  phone: phoneSchema,
  address: z
    .string()
    .max(255, "Address must be at most 255 characters long")
    .nullable()
    .optional()
    .or(z.literal("")),
  companyName: z
    .string()
    .max(100, "Company name must be at most 100 characters long")
    .nullable()
    .optional()
    .or(z.literal("")),
  nidNumber: nidSchema,
});

export type ProfileFormValues = z.infer<typeof profileSchema>;


