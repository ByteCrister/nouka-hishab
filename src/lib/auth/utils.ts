import { auth } from "./auth";
import { ApiError } from "@/lib/helpers/withErrorHandler";

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
