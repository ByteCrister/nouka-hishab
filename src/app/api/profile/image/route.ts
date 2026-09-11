import { auth } from "@/lib/auth/auth";
import { db } from "@/config/db";
import { users } from "@/db/app";
import { eq } from "drizzle-orm";
import { withErrorHandler, ApiError } from "@/lib/helpers/withErrorHandler";
import { UpdateProfileImagePayload, UserProfileData } from "@/types/profile";

export const PATCH = withErrorHandler<UserProfileData, [Request]>(async (req: Request) => {
  const session = await auth();
  if (!session?.user?.id) throw new ApiError("Unauthorized", 401);

  const userId = parseInt(session.user.id);
  const payload: UpdateProfileImagePayload = await req.json();

  if (payload.avatarFileId === undefined) {
    throw new ApiError("avatarFileId is required", 400);
  }

  // Use transaction to ensure consistency
  await db.transaction(async (tx) => {
    // Optionally check if the file belongs to the user, if required by business logic
    if (payload.avatarFileId !== null) {
      const file = await tx.query.files.findFirst({
        where: (files, { eq }) => eq(files.id, payload.avatarFileId!),
      });
      if (!file) {
         throw new ApiError("File not found", 404);
      }
    }

    await tx.update(users).set({
      avatarFileId: payload.avatarFileId,
      updatedAt: new Date(),
    }).where(eq(users.id, userId));
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
