export const SECTORS = {
  SAND: 'sand',
  LIME_STONE: 'lime-stone',
  BRICK: 'brick',
} as const;
export type SectorName = typeof SECTORS[keyof typeof SECTORS];

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


