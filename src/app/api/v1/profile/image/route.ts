import { requireAuthPublicId } from "@/lib/auth/utils";
import { db } from "@/config/db";
import { users } from "@/db/app";
import { files } from "@/db/media";
import { eq } from "drizzle-orm";
import { withErrorHandler, ApiError } from "@/lib/helpers/withErrorHandler";
import { UpdateProfileImagePayload, UserProfileData } from "@/types/profile.types";
import { withTransaction } from "@/lib/helpers/withTransaction";
import { rateLimit } from "@/lib/services/redis.service";

export const PATCH = withErrorHandler<UserProfileData, [Request]>(async (req: Request) => {
  const publicId = await requireAuthPublicId();
  const payload: UpdateProfileImagePayload = await req.json();

  const currentUser = await db.query.users.findFirst({
    where: eq(users.publicId, publicId)
  });

  if (!currentUser) throw new ApiError("User not found", 404);
  const userId = currentUser.id;

  const isAllowed = await rateLimit(`profile:image:${userId}`, 3, 3600); // 3 uploads per hour
  
  if (!isAllowed) {
    throw new ApiError("Too many profile image updates. Please try again later.", 429);
  }

  if (payload.avatarFileId === undefined) {
    throw new ApiError("avatarFileId is required", 400);
  }

  // Use transaction to ensure consistency
  await withTransaction(async (tx) => {
    // Optionally check if the file belongs to the user, if required by business logic
    if (payload.avatarFileId !== null) {
      const file = await tx.query.files.findFirst({
        where: (files, { eq }) => eq(files.id, payload.avatarFileId!),
      });
      if (!file) {
        throw new ApiError("File not found", 404);
      }
    }

    const currentAvatarFileId = currentUser.avatarFileId;

    await tx.update(users).set({
      avatarFileId: payload.avatarFileId,
      updatedAt: new Date(),
    }).where(eq(users.id, userId));

    // Soft delete the old avatar if it exists and is different from the new one
    if (currentAvatarFileId && currentAvatarFileId !== payload.avatarFileId) {
      await tx.update(files).set({
        deletedAt: new Date(),
      }).where(eq(files.id, currentAvatarFileId));
    }
  });
  const updatedUser = await db.query.users.findFirst({
    where: eq(users.id, userId),
    with: {
      profile: true,
      avatarFile: {
        with: {
          asset: true
        }
      }
    },
  });

  if (!updatedUser) throw new ApiError("User not found after update", 404);

  return {
    data: {
      id: updatedUser.id,
      publicId: updatedUser.publicId,
      email: updatedUser.email,
      role: updatedUser.role,
      avatarFileId: updatedUser.avatarFileId,
      avatarUrl: updatedUser.avatarFile?.asset?.cloudinaryUrl || null,
      profile: updatedUser.profile || null,
    },
  };
});
