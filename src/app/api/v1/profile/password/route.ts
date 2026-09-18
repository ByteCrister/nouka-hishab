import { requireAuthPublicId } from "@/lib/auth/utils";
import { db } from "@/config/db";
import { users } from "@/db/app";
import { eq } from "drizzle-orm";
import { withErrorHandler, ApiError } from "@/lib/helpers/withErrorHandler";
import { UpdatePasswordPayload } from "@/types/profile.types";
import bcrypt from "bcryptjs";

export const PATCH = withErrorHandler<null, [Request]>(async (req: Request) => {
  const publicId = await requireAuthPublicId();
  const payload: UpdatePasswordPayload = await req.json();

  if (!payload.currentPassword || !payload.newPassword) {
    throw new ApiError("Current password and new password are required", 400);
  }

  // Use transaction to ensure consistency
  await db.transaction(async (tx) => {
    const user = await tx.query.users.findFirst({
      where: eq(users.publicId, publicId)
    });

    if (!user) throw new ApiError("User not found", 404);

    const isMatch = await bcrypt.compare(payload.currentPassword!, user.passwordHash);
    if (!isMatch) throw new ApiError("Incorrect current password", 400);

    const newPasswordHash = await bcrypt.hash(payload.newPassword, 10);

    await tx.update(users).set({
      passwordHash: newPasswordHash,
      updatedAt: new Date(),
    }).where(eq(users.publicId, publicId));
  });

  return {
    data: null,
  };
});


