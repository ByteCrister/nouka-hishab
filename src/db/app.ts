import {
  pgTable,
  serial,
  varchar,
  text,
  timestamp,
  integer,
  numeric,
  boolean,
  date,
  check,
  unique,
  primaryKey,
  index,
  AnyPgColumn,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { ulid } from 'ulid';
import { files } from './media';
import { UserRole, USER_ROLES, OtpType, OTP_TYPES, AuditLogActorRole, ReportCategory, REPORT_CATEGORIES, ReportStatus, REPORT_STATUSES, TodoPriority, TODO_PRIORITIES } from '@/constants/db/users.const';
import { BillingPeriod, BILLING_PERIODS, SubscriptionStatus, SUBSCRIPTION_STATUSES, PaymentMethod, PAYMENT_METHODS, PlatformAccountType, PLATFORM_ACCOUNT_TYPES } from '@/constants/db/subscriptions.const';
import { SECTORS, type SectorName } from '@/constants/db/app.const';

// ─── Users ─────────────────────────────────────────────────────────────────
// Core auth table. role='user' for boat operators, role='admin' for platform
// staff. is_active is the master on/off switch; granular blocking lives in
// user_blocks.
export const users = pgTable(
  'users',
  {
    id: serial('id').primaryKey(),
    publicId: varchar('public_id', { length: 26 })
      .unique()
      .notNull()
      .$defaultFn(() => ulid()), // safe URL param — never expose raw id
    email: varchar('email', { length: 255 }).unique().notNull(),
    passwordHash: text('password_hash').notNull(),
    role: varchar('role', { length: 10 })
      .notNull()
      .default('user')
      .$type<UserRole>(),
    avatarFileId: integer('avatar_file_id').references((): AnyPgColumn => files.id, { onDelete: 'set null' }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  },
  (t) => ({
    roleCheck: check('users_role_check', sql`${t.role} IN (${sql.raw(Object.values(USER_ROLES).map(s => `'${s}'`).join(', '))})`),
    publicIdIdx: index('idx_users_public_id').on(t.publicId),
    roleIdx: index('idx_users_role').on(t.role),
  }),
);

// ─── Profiles ──────────────────────────────────────────────────────────────
// Extended info for regular users (role = 'user').
export const profiles = pgTable(
  'profiles',
  {
    id: serial('id').primaryKey(),
    publicId: varchar('public_id', { length: 26 })
      .unique()
      .notNull()
      .$defaultFn(() => ulid()), // safe URL param for profile pages
    userId: integer('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    fullName: varchar('full_name', { length: 255 }).notNull(),
    phone: varchar('phone', { length: 20 }),
    address: text('address'),
    companyName: varchar('company_name', { length: 255 }),
    nidNumber: varchar('nid_number', { length: 50 }),
    isBlocked: boolean('is_blocked').notNull().default(false),
    blockedBy: integer('blocked_by').references(() => users.id, { onDelete: 'set null' }),
    blockReason: text('block_reason'),
    blockedUntil: timestamp('blocked_until', { withTimezone: true }),
    unblockedAt: timestamp('unblocked_at', { withTimezone: true }),
    unblockNote: text('unblock_note'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  },
  (t) => ({
    userUnique: unique('profiles_user_unique').on(t.userId),
    isBlockedIdx: index('idx_profiles_is_blocked').on(t.isBlocked),
  }),
);

// ─── Admin Details ─────────────────────────────────────────────────────────
// Extended info for platform admins (role = 'admin').
// Permissions are enforced at the application layer, not stored here.
export const adminDetails = pgTable(
  'admin_details',
  {
    id: serial('id').primaryKey(),
    userId: integer('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    fullName: varchar('full_name', { length: 255 }).notNull(),
    phone: varchar('phone', { length: 20 }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  },
  (t) => ({
    userUnique: unique('admin_details_user_unique').on(t.userId),
  }),
);



// ─── OTPs (One Time Passwords) ─────────────────────────────────────────────
// Short-lived codes for auth flows (password reset, email verification, etc).
export const otps = pgTable(
  'otps',
  {
    id: serial('id').primaryKey(),
    email: varchar('email', { length: 255 }).notNull(),
    codeHash: text('code_hash').notNull(), // bcrypt hash of the raw OTP — raw code is never stored
    type: varchar('type', { length: 50 })
      .notNull()
      .$type<OtpType>(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    isUsed: boolean('is_used').notNull().default(false),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  },
  (t) => ({
    typeCheck: check(
      'otps_type_check',
      sql`${t.type} IN (${sql.raw(Object.values(OTP_TYPES).map(s => `'${s}'`).join(', '))})`,
    ),
    emailIdx: index('idx_otps_email').on(t.email),
    expiresAtIdx: index('idx_otps_expires_at').on(t.expiresAt),
  }),
);

// ─── Subscription Plans ────────────────────────────────────────────────────
// Admin-managed catalogue of plans. Soft-deleted via deleted_at so existing
// subscriptions referencing old plans are never broken.
export const subscriptionPlans = pgTable(
  'subscription_plans',
  {
    id: serial('id').primaryKey(),
    sector: varchar('sector', { length: 50 })
      .notNull()
      .default(SECTORS.SAND)
      .$type<SectorName>(),
    name: varchar('name', { length: 100 }).notNull(),
    description: text('description'),
    priceTk: numeric('price_tk', { precision: 10, scale: 2 }).notNull(),
    billingPeriod: varchar('billing_period', { length: 20 })
      .notNull()
      .default('monthly')
      .$type<BillingPeriod>(),
    maxBoats: integer('max_boats'), // null = unlimited
    maxTripsPerMonth: integer('max_trips_per_month'), // null = unlimited
    features: text('features').array().$type<string[]>(),
    isActive: boolean('is_active').notNull().default(true),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
    deletedAt: timestamp('deleted_at', { withTimezone: true }), // soft-delete
  },
  (t) => ({
    billingPeriodCheck: check(
      'subscription_plans_billing_period_check',
      sql`${t.billingPeriod} IN (${sql.raw(Object.values(BILLING_PERIODS).map(s => `'${s}'`).join(', '))})`,
    ),
    sectorCheck: check(
      'subscription_plans_sector_check',
      sql`${t.sector} IN (${sql.raw(Object.values(SECTORS).map(s => `'${s}'`).join(', '))})`,
    ),
    sectorIdx: index('idx_subscription_plans_sector').on(t.sector),
    isActiveIdx: index('idx_subscription_plans_is_active').on(t.isActive),
    deletedAtIdx: index('idx_subscription_plans_deleted_at').on(t.deletedAt),
  }),
);

// ─── User Subscriptions ────────────────────────────────────────────────────
// Full history of every subscription activation per user.
// Payment flows: bKash / Nagad / Rocket → your bank account.
export const userSubscriptions = pgTable(
  'user_subscriptions',
  {
    id: serial('id').primaryKey(),
    userId: integer('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'restrict' }),
    planId: integer('plan_id')
      .notNull()
      .references(() => subscriptionPlans.id, { onDelete: 'restrict' }),
    status: varchar('status', { length: 20 })
      .notNull()
      .default('pending')
      .$type<SubscriptionStatus>(),
    startedAt: timestamp('started_at', { withTimezone: true }).notNull(),
    endsAt: timestamp('ends_at', { withTimezone: true }), // null = no fixed expiry
    paymentMethod: varchar('payment_method', { length: 20 }).$type<PaymentMethod>(),
    paymentReference: varchar('payment_reference', { length: 255 }), // mobile-money txn ID
    amountPaidTk: numeric('amount_paid_tk', { precision: 10, scale: 2 }),
    note: text('note'), // admin notes for manual payments
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  },
  (t) => ({
    statusCheck: check(
      'user_subscriptions_status_check',
      sql`${t.status} IN (${sql.raw(Object.values(SUBSCRIPTION_STATUSES).map(s => `'${s}'`).join(', '))})`,
    ),
    paymentMethodCheck: check(
      'user_subscriptions_payment_method_check',
      sql`${t.paymentMethod} IS NULL OR ${t.paymentMethod} IN (${sql.raw(Object.values(PAYMENT_METHODS).map(s => `'${s}'`).join(', '))})`,
    ),
    userIdx: index('idx_user_subscriptions_user').on(t.userId),
    statusIdx: index('idx_user_subscriptions_status').on(t.status),
    endsAtIdx: index('idx_user_subscriptions_ends_at').on(t.endsAt),
  }),
);

// ─── Platform Accounts ─────────────────────────────────────────────────────
// Your money-receiving accounts shown to users when they pay for a subscription.
// is_primary flags the account to display first.
export const platformAccounts = pgTable(
  'platform_accounts',
  {
    id: serial('id').primaryKey(),
    label: varchar('label', { length: 100 }).notNull(), // e.g. "Main bKash"
    accountType: varchar('account_type', { length: 20 })
      .notNull()
      .$type<PlatformAccountType>(),
    accountNumber: varchar('account_number', { length: 50 }).notNull(),
    accountName: varchar('account_name', { length: 255 }),
    isActive: boolean('is_active').notNull().default(true),
    isPrimary: boolean('is_primary').notNull().default(false),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  },
  (t) => ({
    accountTypeCheck: check(
      'platform_accounts_type_check',
      sql`${t.accountType} IN (${sql.raw(Object.values(PLATFORM_ACCOUNT_TYPES).map(s => `'${s}'`).join(', '))})`,
    ),
    isActiveIdx: index('idx_platform_accounts_is_active').on(t.isActive),
  }),
);

// ─── Divisions ─────────────────────────────────────────────────────────────
// Top-level Bangladesh administrative division (বিভাগ).
// e.g. Sylhet, Dhaka, Chattogram. Admin-managed seed data.
export const divisions = pgTable(
  'divisions',
  {
    id: serial('id').primaryKey(),
    slug: varchar('slug', { length: 100 }).unique().notNull(), // e.g. 'sylhet'
    nameEn: varchar('name_en', { length: 100 }).unique().notNull(),
    nameBn: varchar('name_bn', { length: 100 }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  },
  (t) => ({
    slugIdx: index('idx_divisions_slug').on(t.slug),
  }),
);

// ─── Districts ─────────────────────────────────────────────────────────────
// Bangladesh district (জেলা), child of a division.
// e.g. Sunamganj → Sylhet division. Admin-managed seed data.
export const districts = pgTable(
  'districts',
  {
    id: serial('id').primaryKey(),
    slug: varchar('slug', { length: 100 }).notNull(), // e.g. 'sunamganj', unique within division
    divisionId: integer('division_id')
      .notNull()
      .references(() => divisions.id, { onDelete: 'restrict' }),
    nameEn: varchar('name_en', { length: 100 }).notNull(),
    nameBn: varchar('name_bn', { length: 100 }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  },
  (t) => ({
    divisionIdx: index('idx_districts_division').on(t.divisionId),
    nameUnique: unique('districts_name_division_unique').on(t.nameEn, t.divisionId),
    slugUnique: unique('districts_slug_division_unique').on(t.slug, t.divisionId),
  }),
);

// ─── Upazilas ──────────────────────────────────────────────────────────────
// Bangladesh upazila (উপজেলা), child of a district.
// e.g. Sunamganj Sadar, Doarabazar. Admin-managed seed data.
export const upazilas = pgTable(
  'upazilas',
  {
    id: serial('id').primaryKey(),
    slug: varchar('slug', { length: 100 }).notNull(), // e.g. 'sunamganj-sadar', unique within district
    districtId: integer('district_id')
      .notNull()
      .references(() => districts.id, { onDelete: 'restrict' }),
    nameEn: varchar('name_en', { length: 100 }).notNull(),
    nameBn: varchar('name_bn', { length: 100 }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  },
  (t) => ({
    districtIdx: index('idx_upazilas_district').on(t.districtId),
    nameUnique: unique('upazilas_name_district_unique').on(t.nameEn, t.districtId),
    slugUnique: unique('upazilas_slug_district_unique').on(t.slug, t.districtId),
  }),
);

// ─── Ghats ─────────────────────────────────────────────────────────────────
// Physical river loading / unloading points. Admin inputs, user selects.
// Linked to upazila (which gives district → division chain via JOIN).
// lat/lng stored with 7 decimal places ≈ 1 cm precision.
export const ghats = pgTable(
  'ghats',
  {
    id: serial('id').primaryKey(),
    slug: varchar('slug', { length: 100 }).notNull(), // e.g. 'sunamganj-ghat', unique within upazila
    upazilaId: integer('upazila_id').references(() => upazilas.id, { onDelete: 'restrict' }),
    nameEn: varchar('name_en', { length: 255 }).notNull(),
    nameBn: varchar('name_bn', { length: 255 }),
    riverName: varchar('river_name', { length: 100 }),
    lat: numeric('lat', { precision: 10, scale: 7 }),
    lng: numeric('lng', { precision: 10, scale: 7 }),
    isActive: boolean('is_active').notNull().default(true),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  },
  (t) => ({
    upazilaIdx: index('idx_ghats_upazila').on(t.upazilaId),
    isActiveIdx: index('idx_ghats_is_active').on(t.isActive),
    slugUnique: unique('ghats_slug_upazila_unique').on(t.slug, t.upazilaId),
  }),
);

// ─── Audit Logs ────────────────────────────────────────────────────────────
// Immutable append-only log of significant actions by users, admins, or the
// system. Rows are NEVER updated or deleted.
// actor_id uses SET NULL so logs survive if a user account is deleted.
export const auditLogs = pgTable(
  'audit_logs',
  {
    id: serial('id').primaryKey(),
    actorId: integer('actor_id').references(() => users.id, { onDelete: 'set null' }),
    actorRole: varchar('actor_role', { length: 10 }).$type<AuditLogActorRole>(),
    action: varchar('action', { length: 100 }).notNull(), // e.g. 'user.blocked'
    entityType: varchar('entity_type', { length: 50 }), // e.g. 'user', 'boat', 'sand_trip'
    entityId: integer('entity_id'),
    oldValues: text('old_values'), // JSON snapshot before change
    newValues: text('new_values'), // JSON snapshot after change
    ipAddress: varchar('ip_address', { length: 45 }),
    userAgent: text('user_agent'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  },
  (t) => ({
    actorIdx: index('idx_audit_logs_actor').on(t.actorId),
    actionIdx: index('idx_audit_logs_action').on(t.action),
    entityIdx: index('idx_audit_logs_entity').on(t.entityType, t.entityId),
    createdAtIdx: index('idx_audit_logs_created_at').on(t.createdAt),
  }),
);

// ─── Reports ───────────────────────────────────────────────────────────────
// User-submitted platform reports / support issues.
// Attachments (images, docs) live in report_attachments → files → assets.
export const reports = pgTable(
  'reports',
  {
    id: serial('id').primaryKey(),
    publicId: varchar('public_id', { length: 26 })
      .unique()
      .notNull()
      .$defaultFn(() => ulid()), // safe URL param e.g. /reports/01J7K9...
    userId: integer('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'restrict' }),
    category: varchar('category', { length: 50 })
      .notNull()
      .$type<ReportCategory>(),
    title: varchar('title', { length: 255 }).notNull(),
    description: text('description'),
    status: varchar('status', { length: 20 })
      .notNull()
      .default(REPORT_STATUSES.OPEN)
      .$type<ReportStatus>(),
    adminReply: text('admin_reply'),
    resolvedBy: integer('resolved_by').references(() => users.id, { onDelete: 'set null' }),
    resolvedAt: timestamp('resolved_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  },
  (t) => ({
    categoryCheck: check(
      'reports_category_check',
      sql`${t.category} IN (${sql.raw(Object.values(REPORT_CATEGORIES).map(s => `'${s}'`).join(', '))})`,
    ),
    statusCheck: check(
      'reports_status_check',
      sql`${t.status} IN (${sql.raw(Object.values(REPORT_STATUSES).map(s => `'${s}'`).join(', '))})`,
    ),
    publicIdIdx: index('idx_reports_public_id').on(t.publicId),
    userIdx: index('idx_reports_user').on(t.userId),
    statusIdx: index('idx_reports_status').on(t.status),
    categoryIdx: index('idx_reports_category').on(t.category),
  }),
);

// ─── Report Attachments ────────────────────────────────────────────────────
// Optional images / documents attached to a report.
export const reportAttachments = pgTable(
  'report_attachments',
  {
    reportId: integer('report_id')
      .notNull()
      .references(() => reports.id, { onDelete: 'cascade' }),
    fileId: integer('file_id')
      .notNull()
      .references(() => files.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.reportId, t.fileId] }),
    reportIdx: index('idx_report_attachments_report').on(t.reportId),
  }),
);

// ─── Todos ─────────────────────────────────────────────────────────────────
// User task tracking. Always owned by a user. Not scoped to any specific
// business entity — todos are general-purpose across all sectors.
export const todos = pgTable(
  'todos',
  {
    id: serial('id').primaryKey(),
    publicId: varchar('public_id', { length: 26 })
      .unique()
      .notNull()
      .$defaultFn(() => ulid()), // safe URL param e.g. /todos/01J7K9...
    userId: integer('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    title: varchar('title', { length: 255 }).notNull(),
    description: text('description'),
    isDone: boolean('is_done').notNull().default(false),
    dueDate: date('due_date'),
    priority: varchar('priority', { length: 10 })
      .notNull()
      .default(TODO_PRIORITIES.NORMAL)
      .$type<TodoPriority>(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  },
  (t) => ({
    priorityCheck: check(
      'todos_priority_check',
      sql`${t.priority} IN (${sql.raw(Object.values(TODO_PRIORITIES).map(s => `'${s}'`).join(', '))})`,
    ),
    publicIdIdx: index('idx_todos_public_id').on(t.publicId),
    userIdx: index('idx_todos_user').on(t.userId),
    isDoneIdx: index('idx_todos_is_done').on(t.isDone),
    dueDateIdx: index('idx_todos_due_date').on(t.dueDate),
  }),
);

// ─── Inferred Types ────────────────────────────────────────────────────────
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Profile = typeof profiles.$inferSelect;
export type NewProfile = typeof profiles.$inferInsert;
export type AdminDetail = typeof adminDetails.$inferSelect;
export type Otp = typeof otps.$inferSelect;
export type NewOtp = typeof otps.$inferInsert;
export type SubscriptionPlan = typeof subscriptionPlans.$inferSelect;
export type NewSubscriptionPlan = typeof subscriptionPlans.$inferInsert;
export type UserSubscription = typeof userSubscriptions.$inferSelect;
export type NewUserSubscription = typeof userSubscriptions.$inferInsert;
export type PlatformAccount = typeof platformAccounts.$inferSelect;

export type Division = typeof divisions.$inferSelect;
export type NewDivision = typeof divisions.$inferInsert;
export type District = typeof districts.$inferSelect;
export type NewDistrict = typeof districts.$inferInsert;
export type Upazila = typeof upazilas.$inferSelect;
export type NewUpazila = typeof upazilas.$inferInsert;
export type Ghat = typeof ghats.$inferSelect;
export type NewGhat = typeof ghats.$inferInsert;
export type AuditLog = typeof auditLogs.$inferSelect;
export type Report = typeof reports.$inferSelect;
export type NewReport = typeof reports.$inferInsert;
export type Todo = typeof todos.$inferSelect;
export type NewTodo = typeof todos.$inferInsert;