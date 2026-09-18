export const APP_LOCALES = {
  EN: "en",
  BN: "bn",
} as const;

export type AppLocale = typeof APP_LOCALES[keyof typeof APP_LOCALES];

export const OTP_TYPES = {
  EMAIL_VERIFICATION: 'email_verification',
  USER_FORGOT_PASSWORD: 'user_forgot_password',
  ADMIN_FORGOT_PASSWORD: 'admin_forgot_password',
  USER_PASSWORD_CHANGE: 'user_password_change',
} as const;

export type OtpType = typeof OTP_TYPES[keyof typeof OTP_TYPES];


