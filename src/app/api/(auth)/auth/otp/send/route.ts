import { db } from "@/config/db";
import { otps, users } from "@/db";
import { eq, and } from "drizzle-orm";
import { withErrorHandler, ApiError } from "@/lib/helpers/withErrorHandler";
import { mailer } from "@/config/node-mailer";
import { generateOtpHtml } from "@/lib/html/otp-email";

// Generate a random 6-digit OTP
const generateCode = () => Math.floor(100000 + Math.random() * 900000).toString();

export const POST = withErrorHandler(async (req: Request) => {
  const body = await req.json();
  const { email, type } = body;

  if (!email || !type) {
    throw new ApiError("Email and type are required", 400);
  }

  // If this is forgot password, make sure the user actually exists
  if (type === 'user_forgot_password' || type === 'admin_forgot_password') {
    const userRecord = await db.query.users.findFirst({
      where: eq(users.email, email),
    });
    if (!userRecord) {
      throw new ApiError("Account not found", 404);
    }
  }

  // Invalidate previous active OTPs for this email and type
  await db.update(otps)
    .set({ isUsed: true })
    .where(and(
      eq(otps.email, email),
      eq(otps.type, type),
      eq(otps.isUsed, false)
    ));

  // Create new OTP
  const code = generateCode();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  await db.insert(otps).values({
    email,
    code,
    type,
    expiresAt,
  });

  // Send the email
  const html = generateOtpHtml(code, type);
  const subject = type === 'email_verification' ? 'Verify your email' : 'Your OTP Code';
  await mailer(email, subject, html);

  return { data: { success: true, message: "OTP sent successfully" } };
});
