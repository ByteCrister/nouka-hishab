import { db } from "@/config/db";
import { otps, users } from "@/db";
import { eq, and } from "drizzle-orm";
import { withErrorHandler, ApiError } from "@/lib/helpers/withErrorHandler";
import { mailer } from "@/config/node-mailer";
import { generateOtpHtml } from "@/lib/html/otp-email";
import bcrypt from "bcryptjs";
import { isInCooldown, setCooldown } from "@/lib/services/redis.service";
import { OTP_TYPES } from "@/constants/common.const";

// Generate a random 6-digit OTP
const generateCode = () => Math.floor(100000 + Math.random() * 900000).toString();

export const POST = withErrorHandler(async (req: Request) => {
  const body = await req.json();
  const { email, type } = body;

  if (!email || !type) {
    throw new ApiError("Email and type are required", 400);
  }

  // If this is forgot password, make sure the user actually exists
  if (type === OTP_TYPES.USER_FORGOT_PASSWORD || type === OTP_TYPES.ADMIN_FORGOT_PASSWORD) {
    const userRecord = await db.query.users.findFirst({
      where: eq(users.email, email),
      with: { profile: true },
    });
    if (!userRecord) {
      throw new ApiError("Account not found", 404);
    }
    if (userRecord.profile?.isBlocked) {
      throw new ApiError("Your account has been blocked.", 403);
    }
  }

  // Rate limiting check via Redis (1 minute cooldown per email+type)
  const isBlocked = await isInCooldown(type, email);

  if (isBlocked) {
    throw new ApiError("Please wait 1 minute before requesting another OTP.", 429);
  }

  // Invalidate previous active OTPs for this email and type
  await db.update(otps)
    .set({ isUsed: true })
    .where(and(
      eq(otps.email, email),
      eq(otps.type, type),
      eq(otps.isUsed, false)
    ));

  // Generate raw code (sent to user) and hash (stored in DB)
  const code = generateCode();
  const codeHash = await bcrypt.hash(code, 8); // cost 8: fast enough for OTPs
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  await db.insert(otps).values({
    email,
    codeHash,
    type,
    expiresAt,
  });

  // Send the raw code by email — it is never persisted to DB
  const html = generateOtpHtml(code, type);
  const subject = type === OTP_TYPES.EMAIL_VERIFICATION ? 'Verify your email' : 'Your OTP Code';
  await mailer(email, subject, html);

  // Set the rate limit key to prevent spam (expires in 60 seconds)
  await setCooldown(type, email, 60);

  return { data: { success: true, message: "OTP sent successfully" } };
});


