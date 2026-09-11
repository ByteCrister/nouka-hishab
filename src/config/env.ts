import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NEXT_PUBLIC_DOMAIN: z.string().url().min(1),
  DATABASE_URL: z.string().url().min(1),
  UPSTASH_REDIS_REST_URL: z.string().url().min(1),
  UPSTASH_REDIS_REST_TOKEN: z.string().min(1),
  CLOUDINARY_URL: z.string().min(1),
  CLOUDINARY_CLOUD_NAME: z.string().min(1),
  CLOUDINARY_API_KEY: z.string().min(1),
  CLOUDINARY_API_SECRET: z.string().min(1),
  CLOUDINARY_FOLDER: z.string().min(1),
  JWT_SECRET: z.string().min(1),
  NEXT_TOKEN: z.string().min(1),
  AUTH_SECRET: z.string().min(32),  // Required by NextAuth v5 for JWT signing
  AUTH_EMAIL: z.string().email().min(1),
  AUTH_PASSWORD: z.string().min(1),
  GOOGLE_CLIENT_ID: z.string().min(1),
  GOOGLE_CLIENT_SECRET: z.string().min(1),
});

export const env = envSchema.parse(process.env);