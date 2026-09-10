import { db } from "@/config/db";
import { otps } from "@/db";
import { eq, and } from "drizzle-orm";
import { withErrorHandler, ApiError } from "@/lib/helpers/withErrorHandler";

export const POST = withErrorHandler(async (req: Request) => {
  const body = await req.json();
  const { email, code, type } = body;

  if (!email || !code || !type) {
    throw new ApiError("Email, code, and type are required", 400);
  }

  const activeOtp = await db.query.otps.findFirst({
    where: and(
      eq(otps.email, email),
      eq(otps.code, code),
      eq(otps.type, type),
      eq(otps.isUsed, false)
    ),
    orderBy: (otps, { desc }) => [desc(otps.createdAt)],
  });

  if (!activeOtp) {
    throw new ApiError("Invalid or expired OTP", 400);
  }

  if (activeOtp.expiresAt < new Date()) {
    throw new ApiError("OTP has expired", 400);
  }

  // Mark as used
  await db.update(otps)
    .set({ isUsed: true })
    .where(eq(otps.id, activeOtp.id));

  return { data: { success: true, message: "OTP verified successfully" } };
});
