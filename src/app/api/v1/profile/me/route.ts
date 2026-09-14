import { requireAuthPublicId } from "@/lib/auth/utils";
import { db } from "@/config/db";
import { users } from "@/db/app";
import { eq } from "drizzle-orm";
import { withErrorHandler, ApiError } from "@/lib/helpers/withErrorHandler";
import { UserProfileData } from "@/types/profile.types";

export const GET = withErrorHandler<UserProfileData, [Request]>(async () => {
  const publicId = await requireAuthPublicId();

  const user = await db.query.users.findFirst({
    where: eq(users.publicId, publicId),
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
