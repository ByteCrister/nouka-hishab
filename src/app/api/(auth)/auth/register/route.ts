import { rateLimit } from "@/lib/services/redis";
import { db } from "@/config/db";
import { users, profiles } from "@/db";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { withErrorHandler, ApiError } from "@/lib/helpers/withErrorHandler";

export const POST = withErrorHandler(async (req: Request) => {
  const ip = req.headers.get("x-forwarded-for") || "unknown-ip";
  const { email, password, fullName } = await req.json();

  if (!email || !password || !fullName) {
    throw new ApiError("Email, password, and full name are required", 400);
  }

  // Rate limit registration attempts
  const allowed = await rateLimit(`register:${ip}`, 5, 60); 
  if (!allowed) {
    throw new ApiError("Too many attempts. Please try again later.", 429);
  }

  const existingUser = await db.query.users.findFirst({
    where: eq(users.email, email),
  });

  if (existingUser) {
    throw new ApiError("Email is already registered", 409);
  }

  const passwordHash = await bcrypt.hash(password, 10);

  // Insert user and profile inside a transaction
  await db.transaction(async (tx) => {
    const [newUser] = await tx.insert(users).values({
      email,
      passwordHash,
    }).returning({ id: users.id });

    await tx.insert(profiles).values({
      userId: newUser.id,
      fullName,
    });
  });

  return { data: { success: true } };
});
