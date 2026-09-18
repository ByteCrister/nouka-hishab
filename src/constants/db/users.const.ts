export const USER_ROLES = {
  USER: 'user',
  ADMIN: 'admin'
} as const;
export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];

export const OTP_TYPES = {
  USER_FORGOT_PASSWORD: 'user_forgot_password',
  ADMIN_FORGOT_PASSWORD: 'admin_forgot_password',
  USER_PASSWORD_CHANGE: 'user_password_change',
  EMAIL_VERIFICATION: 'email_verification'
} as const;
export type OtpType = typeof OTP_TYPES[keyof typeof OTP_TYPES];



