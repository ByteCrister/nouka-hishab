import { rateLimit } from "@/lib/services/redis.service";
import { db } from "@/config/db";
import { users } from "@/db";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { withErrorHandler, ApiError } from "@/lib/helpers/withErrorHandler";

export const POST = withErrorHandler(async (req: Request) => {
  const ip = req.headers.get("x-forwarded-for") || "unknown-ip";
  const body = await req.json();
  const { email, password, provider } = body;

  // Rate limit per IP to prevent brute force or spam
  const allowed = await rateLimit(`auth-verify:${ip}`, 5, 60); // 5 requests per minute per IP
  if (!allowed) {
    throw new ApiError("Too many attempts. Please try again later.", 429);
  }

  if (!email && provider === "credentials") {
    throw new ApiError("Email is required", 400);
  }

  if (provider === "google") {
    // We might not have email on the client before Google sign in, but if we do we can check.
    // However, usually we just rate limit the intent to start google auth.
    return { data: { success: true } };
  }

  if (provider === "credentials") {
    if (!password) {
      throw new ApiError("Password is required", 400);
    }

    const userRecord = await db.query.users.findFirst({
      where: eq(users.email, email),
      with: { profile: true },
    });

    if (!userRecord || !userRecord.passwordHash) {
      throw new ApiError("Invalid credentials", 401);
    }

    if (userRecord.profile?.isBlocked) {
      throw new ApiError("Your account has been blocked.", 403);
    }

    const isValid = await bcrypt.compare(password, userRecord.passwordHash as string);
    if (!isValid) {
      throw new ApiError("Invalid credentials", 401);
    }

    return { data: { success: true } };
  }

  throw new ApiError("Invalid provider", 400);
});
