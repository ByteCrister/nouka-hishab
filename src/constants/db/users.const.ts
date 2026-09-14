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

export const AUDIT_LOG_ACTOR_ROLES = {
  USER: 'user',
  ADMIN: 'admin',
  SYSTEM: 'system'
} as const;
export type AuditLogActorRole = typeof AUDIT_LOG_ACTOR_ROLES[keyof typeof AUDIT_LOG_ACTOR_ROLES];

export const REPORT_CATEGORIES = {
  BUG: 'bug',
  BILLING: 'billing',
  FEATURE_REQUEST: 'feature_request',
  OTHER: 'other'
} as const;
export type ReportCategory = typeof REPORT_CATEGORIES[keyof typeof REPORT_CATEGORIES];

export const REPORT_STATUSES = {
  OPEN: 'open',
  IN_REVIEW: 'in_review',
  RESOLVED: 'resolved',
  CLOSED: 'closed'
} as const;
export type ReportStatus = typeof REPORT_STATUSES[keyof typeof REPORT_STATUSES];

export const TODO_PRIORITIES = {
  LOW: 'low',
  NORMAL: 'normal',
  HIGH: 'high'
} as const;
export type TodoPriority = typeof TODO_PRIORITIES[keyof typeof TODO_PRIORITIES];

