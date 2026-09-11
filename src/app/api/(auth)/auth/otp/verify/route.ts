import { db } from "@/config/db";
import { otps } from "@/db";
import { eq, and, gt } from "drizzle-orm";
import { withErrorHandler, ApiError } from "@/lib/helpers/withErrorHandler";
import bcrypt from "bcryptjs";

export const POST = withErrorHandler(async (req: Request) => {
  const body = await req.json();
  const { email, code, type } = body;

  if (!email || !code || !type) {
    throw new ApiError("Email, code, and type are required", 400);
  }

  // Fetch the most recent active, non-expired OTP for this email+type.
  // We cannot filter by code directly since it is stored as a bcrypt hash.
  const activeOtp = await db.query.otps.findFirst({
    where: and(
      eq(otps.email, email),
      eq(otps.type, type),
      eq(otps.isUsed, false),
      gt(otps.expiresAt, new Date()) // only fetch non-expired rows
    ),
    orderBy: (otps, { desc }) => [desc(otps.createdAt)],
  });

  if (!activeOtp) {
    throw new ApiError("Invalid or expired OTP", 400);
  }

  // Constant-time comparison — bcrypt.compare handles timing-safe check
  const isValid = await bcrypt.compare(code, activeOtp.codeHash);
  if (!isValid) {
    throw new ApiError("Invalid or expired OTP", 400);
  }

  // Mark as used so it cannot be replayed
  await db.update(otps)
    .set({ isUsed: true })
    .where(eq(otps.id, activeOtp.id));

  return { data: { success: true, message: "OTP verified successfully" } };
});
