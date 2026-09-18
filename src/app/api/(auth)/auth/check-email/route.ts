import { rateLimit } from "@/lib/services/redis.service";
import { db } from "@/config/db";
import { users } from "@/db";
import { eq } from "drizzle-orm";
import { withErrorHandler, ApiError } from "@/lib/helpers/withErrorHandler";

export const POST = withErrorHandler(async (req: Request) => {
  const ip = req.headers.get("x-forwarded-for") || "unknown-ip";
  const { email } = await req.json();

  if (!email) {
    throw new ApiError("Email is required", 400);
  }

  // Rate limit to prevent email enumeration attacks
  const allowed = await rateLimit(`check-email:${ip}`, 10, 60);
  if (!allowed) {
    throw new ApiError("Too many attempts. Please try again later.", 429);
  }

  const userRecord = await db.query.users.findFirst({
    where: eq(users.email, email),
  });

  return { data: { exists: !!userRecord } };
});


