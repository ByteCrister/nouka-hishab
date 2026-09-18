import { auth } from "./auth";
import { ApiError } from "@/lib/helpers/withErrorHandler";
import { db } from "@/config/db";
import { users } from "@/db/app";
import { eq } from "drizzle-orm";

/**
 * Ensures the user is authenticated and returns their public ID.
 * Throws a 401 ApiError if the user is not authenticated.
 */
export async function requireAuthPublicId(): Promise<string> {
  const session = await auth();
  if (!session?.user?.id) {
    throw new ApiError("Unauthorized", 401);
  }
  return session.user.id;
}

/**
 * Ensures the user is authenticated and returns the numeric DB user id.
 * Throws a 401 ApiError if the user is not authenticated or not found.
 */
export async function requireAuthUserId(): Promise<number> {
  const publicId = await requireAuthPublicId();
  const [user] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.publicId, publicId))
    .limit(1);
  if (!user) throw new ApiError("User not found", 401);
  return user.id;
}

/**
 * Ensures the user is authenticated and returns the session user object.
 * Throws a 401 ApiError if the user is not authenticated.
 */
export async function requireAuthUser() {
  const session = await auth();
  if (!session?.user) {
    throw new ApiError("Unauthorized", 401);
  }
  return session.user;
}


