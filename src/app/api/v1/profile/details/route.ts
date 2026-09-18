import { requireAuthPublicId } from "@/lib/auth/utils";
import { db } from "@/config/db";
import { profiles, users } from "@/db/app";
import { eq } from "drizzle-orm";
import { withErrorHandler, ApiError } from "@/lib/helpers/withErrorHandler";
import { UpdateProfilePayload, UserProfileData } from "@/types/profile.types";
import { withTransaction } from "@/lib/helpers/withTransaction";

export const PATCH = withErrorHandler<UserProfileData, [Request]>(async (req: Request) => {
  const publicId = await requireAuthPublicId();
  const payload: UpdateProfilePayload = await req.json();

  if (!payload.fullName) throw new ApiError("Full name is required", 400);

  const currentUser = await db.query.users.findFirst({
    where: (users, { eq }) => eq(users.publicId, publicId)
  });

  if (!currentUser) throw new ApiError("User not found", 404);
  const userId = currentUser.id;

  // Use transaction for update
  await withTransaction(async (tx) => {
    // Check if profile exists
    const profile = await tx.query.profiles.findFirst({
      where: eq(profiles.userId, userId)
    });

    if (profile) {
      await tx.update(profiles).set({
        fullName: payload.fullName,
        phone: payload.phone || null,
        address: payload.address || null,
        companyName: payload.companyName || null,
        nidNumber: payload.nidNumber || null,
        updatedAt: new Date(),
      }).where(eq(profiles.userId, userId));
    } else {
      await tx.insert(profiles).values({
        userId,
        fullName: payload.fullName,
        phone: payload.phone || null,
        address: payload.address || null,
        companyName: payload.companyName || null,
        nidNumber: payload.nidNumber || null,
      });
    }
  });

  // Fetch updated user to return
  const user = await db.query.users.findFirst({
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

  if (!user) throw new ApiError("User not found", 404);

  return {
    data: {
      id: user.id,
      publicId: user.publicId,
      email: user.email,
      role: user.role,
      avatarFileId: user.avatarFileId,
      avatarUrl: user.avatarFile?.asset?.cloudinaryUrl || null,
      profile: user.profile || null,
    },
  };
});


