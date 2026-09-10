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
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { files } from './media';

// ─── Users ─────────────────────────────────────────────────────────────────
// Core auth table. role='user' for boat operators, role='admin' for platform
// staff. is_active is the master on/off switch; granular blocking lives in
// user_blocks.
export const users = pgTable(
  'users',
  {
    id: serial('id').primaryKey(),
    email: varchar('email', { length: 255 }).unique().notNull(),
    passwordHash: text('password_hash').notNull(),
    role: varchar('role', { length: 10 })
      .notNull()
      .default('user')
      .$type<'user' | 'admin'>(),
    isActive: boolean('is_active').notNull().default(true),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  },
  (t) => ({
    roleCheck: check('users_role_check', sql`${t.role} IN ('user', 'admin')`),
    roleIdx: index('idx_users_role').on(t.role),
    isActiveIdx: index('idx_users_is_active').on(t.isActive),
  }),
);

// ─── Profiles ──────────────────────────────────────────────────────────────
// Extended info for regular users (role = 'user').
export const profiles = pgTable(
  'profiles',
  {
    id: serial('id').primaryKey(),
    userId: integer('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    fullName: varchar('full_name', { length: 255 }).notNull(),
    phone: varchar('phone', { length: 20 }),
    address: text('address'),
    companyName: varchar('company_name', { length: 255 }),
    nidNumber: varchar('nid_number', { length: 50 }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  },
  (t) => ({
    userUnique: unique('profiles_user_unique').on(t.userId),
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

// ─── User Blocks ───────────────────────────────────────────────────────────
// Admin-imposed blocks on user accounts.
// A user is currently blocked when: unblocked_at IS NULL
//   AND (blocked_until IS NULL OR blocked_until > NOW())
// blocked_until = NULL  → permanent block
// blocked_until = date  → timed block (e.g. 10, 20 days)
// Admin can always override by setting unblocked_at.
export const userBlocks = pgTable(
  'user_blocks',
  {
    id: serial('id').primaryKey(),
    userId: integer('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'restrict' }),
    blockedBy: integer('blocked_by')
      .notNull()
      .references(() => users.id, { onDelete: 'restrict' }),
    reason: text('reason').notNull(),
    blockedUntil: timestamp('blocked_until', { withTimezone: true }), // null = permanent
    unblockedAt: timestamp('unblocked_at', { withTimezone: true }), // null = still blocked
    unblockNote: text('unblock_note'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  },
  (t) => ({
    userIdx: index('idx_user_blocks_user').on(t.userId),
    blockedUntilIdx: index('idx_user_blocks_blocked_until').on(t.blockedUntil),
    unblockedAtIdx: index('idx_user_blocks_unblocked_at').on(t.unblockedAt),
  }),
);

// ─── OTPs (One Time Passwords) ─────────────────────────────────────────────
// Short-lived codes for auth flows (password reset, email verification, etc).
export const otps = pgTable(
  'otps',
  {
    id: serial('id').primaryKey(),
    email: varchar('email', { length: 255 }).notNull(),
    code: varchar('code', { length: 10 }).notNull(),
    type: varchar('type', { length: 50 })
      .notNull()
      .$type<'user_forgot_password' | 'admin_forgot_password' | 'user_password_change' | 'email_verification'>(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    isUsed: boolean('is_used').notNull().default(false),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  },
  (t) => ({
    typeCheck: check(
      'otps_type_check',
      sql`${t.type} IN ('user_forgot_password', 'admin_forgot_password', 'user_password_change', 'email_verification')`,
    ),
    emailIdx: index('idx_otps_email').on(t.email),
    codeIdx: index('idx_otps_code').on(t.code),
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
    sectorId: integer('sector_id')
      .notNull()
      .references(() => sectors.id, { onDelete: 'restrict' }),
    name: varchar('name', { length: 100 }).notNull(),
    description: text('description'),
    priceTk: numeric('price_tk', { precision: 10, scale: 2 }).notNull(),
    billingPeriod: varchar('billing_period', { length: 20 })
      .notNull()
      .default('monthly')
      .$type<'monthly' | 'yearly'>(),
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
      sql`${t.billingPeriod} IN ('monthly', 'yearly')`,
    ),
    sectorIdx: index('idx_subscription_plans_sector').on(t.sectorId),
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
      .$type<'active' | 'expired' | 'cancelled' | 'pending'>(),
    startedAt: timestamp('started_at', { withTimezone: true }).notNull(),
    endsAt: timestamp('ends_at', { withTimezone: true }), // null = no fixed expiry
    paymentMethod: varchar('payment_method', { length: 20 }).$type<
      'bkash' | 'nagad' | 'rocket' | 'manual'
    >(),
    paymentReference: varchar('payment_reference', { length: 255 }), // mobile-money txn ID
    amountPaidTk: numeric('amount_paid_tk', { precision: 10, scale: 2 }),
    note: text('note'), // admin notes for manual payments
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  },
  (t) => ({
    statusCheck: check(
      'user_subscriptions_status_check',
      sql`${t.status} IN ('active', 'expired', 'cancelled', 'pending')`,
    ),
    paymentMethodCheck: check(
      'user_subscriptions_payment_method_check',
      sql`${t.paymentMethod} IS NULL OR ${t.paymentMethod} IN ('bkash', 'nagad', 'rocket', 'manual')`,
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
      .$type<'bkash' | 'nagad' | 'rocket' | 'bank'>(),
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
      sql`${t.accountType} IN ('bkash', 'nagad', 'rocket', 'bank')`,
    ),
    isActiveIdx: index('idx_platform_accounts_is_active').on(t.isActive),
  }),
);

// ─── Sectors ───────────────────────────────────────────────────────────────
// Business categories. Admin adds them as the platform grows.
// e.g. "Sand", "Limestone", "Package Cargo".
// Each sector will eventually have its own trip table (sand_trips, etc.).
export const sectors = pgTable(
  'sectors',
  {
    id: serial('id').primaryKey(),
    name: varchar('name', { length: 100 }).unique().notNull(),
    slug: varchar('slug', { length: 100 }).unique().notNull(), // url-safe key e.g. 'sand'
    description: text('description'),
    isActive: boolean('is_active').notNull().default(true),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  },
  (t) => ({
    isActiveIdx: index('idx_sectors_is_active').on(t.isActive),
  }),
);

// ─── Divisions ─────────────────────────────────────────────────────────────
// Top-level Bangladesh administrative division (বিভাগ).
// e.g. Sylhet, Dhaka, Chattogram. Admin-managed seed data.
export const divisions = pgTable('divisions', {
  id: serial('id').primaryKey(),
  nameEn: varchar('name_en', { length: 100 }).unique().notNull(),
  nameBn: varchar('name_bn', { length: 100 }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

// ─── Districts ─────────────────────────────────────────────────────────────
// Bangladesh district (জেলা), child of a division.
// e.g. Sunamganj → Sylhet division. Admin-managed seed data.
export const districts = pgTable(
  'districts',
  {
    id: serial('id').primaryKey(),
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
  }),
);

// ─── Upazilas ──────────────────────────────────────────────────────────────
// Bangladesh upazila (উপজেলা), child of a district.
// e.g. Sunamganj Sadar, Doarabazar. Admin-managed seed data.
export const upazilas = pgTable(
  'upazilas',
  {
    id: serial('id').primaryKey(),
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
    upazilaId: integer('upazila_id')
      .references(() => upazilas.id, { onDelete: 'restrict' }),
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
  }),
);

// ─── Boats ─────────────────────────────────────────────────────────────────
// Steel boat registry. No owner FK — the logged-in user manages their own
// boats. Ownership/partnership is handled outside the DB for now.
// capacity_value + capacity_unit replaces the old single capacityTon field.
// boat_value_tk is informational (e.g. for insurance / maintenance budgeting).
export const boats = pgTable(
  'boats',
  {
    id: serial('id').primaryKey(),
    sectorId: integer('sector_id')
      .notNull()
      .references(() => sectors.id, { onDelete: 'restrict' }),
    name: varchar('name', { length: 255 }).notNull(),
    registrationNumber: varchar('registration_number', { length: 100 }).unique(),
    capacityValue: numeric('capacity_value', { precision: 10, scale: 2 }),
    capacityUnit: varchar('capacity_unit', { length: 10 })
      .default('cubic_ft')
      .$type<'cubic_ft' | 'ton' | 'cubic_m'>(),
    lengthM: numeric('length_m', { precision: 8, scale: 2 }),
    widthM: numeric('width_m', { precision: 8, scale: 2 }),
    draftM: numeric('draft_m', { precision: 8, scale: 2 }),
    engineMake: varchar('engine_make', { length: 100 }),
    engineHp: numeric('engine_hp', { precision: 6, scale: 1 }),
    engineNotes: text('engine_notes'),
    boatValueTk: numeric('boat_value_tk', { precision: 12, scale: 2 }),
    status: varchar('status', { length: 20 })
      .notNull()
      .default('active')
      .$type<'active' | 'inactive' | 'maintenance' | 'decommissioned'>(),
    notes: text('notes'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  },
  (t) => ({
    statusCheck: check(
      'boats_status_check',
      sql`${t.status} IN ('active', 'inactive', 'maintenance', 'decommissioned')`,
    ),
    capacityUnitCheck: check(
      'boats_capacity_unit_check',
      sql`${t.capacityUnit} IS NULL OR ${t.capacityUnit} IN ('cubic_ft', 'ton', 'cubic_m')`,
    ),
    sectorIdx: index('idx_boats_sector').on(t.sectorId),
    statusIdx: index('idx_boats_status').on(t.status),
  }),
);

// ─── Boat Maintenance Logs ─────────────────────────────────────────────────
// Records of each maintenance event: what was done, cost, vendor, notes.
export const boatMaintenanceLogs = pgTable(
  'boat_maintenance_logs',
  {
    id: serial('id').primaryKey(),
    boatId: integer('boat_id')
      .notNull()
      .references(() => boats.id, { onDelete: 'cascade' }),
    maintenanceDate: date('maintenance_date').notNull(),
    description: text('description').notNull(),
    costTk: numeric('cost_tk', { precision: 10, scale: 2 }),
    vendorName: varchar('vendor_name', { length: 255 }),
    notes: text('notes'),
    createdBy: integer('created_by')
      .notNull()
      .references(() => users.id, { onDelete: 'restrict' }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  },
  (t) => ({
    boatIdx: index('idx_boat_maintenance_boat').on(t.boatId),
    dateIdx: index('idx_boat_maintenance_date').on(t.maintenanceDate),
  }),
);

// ─── Boat Images ───────────────────────────────────────────────────────────
export const boatImages = pgTable(
  'boat_images',
  {
    boatId: integer('boat_id')
      .notNull()
      .references(() => boats.id, { onDelete: 'cascade' }),
    fileId: integer('file_id')
      .notNull()
      .references(() => files.id, { onDelete: 'cascade' }),
    isPrimary: boolean('is_primary').default(false),
    sortOrder: integer('sort_order').default(0),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.boatId, t.fileId] }),
    boatIdx: index('idx_boat_images_boat').on(t.boatId),
  }),
);

// ─── Boat Documents ────────────────────────────────────────────────────────
export const boatDocuments = pgTable(
  'boat_documents',
  {
    id: serial('id').primaryKey(),
    boatId: integer('boat_id')
      .notNull()
      .references(() => boats.id, { onDelete: 'cascade' }),
    fileId: integer('file_id')
      .notNull()
      .references(() => files.id, { onDelete: 'cascade' }),
    documentType: varchar('document_type', { length: 50 }).notNull(),
    description: text('description'),
    expiryDate: date('expiry_date'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  },
  (t) => ({
    boatIdx: index('idx_boat_docs_boat').on(t.boatId),
    expiryIdx: index('idx_boat_docs_expiry').on(t.expiryDate),
  }),
);

// ─── Sand Trips ────────────────────────────────────────────────────────────
// One record = one sand cargo run. Fully models the Bangladesh sand business
// cost structure as described by the operator:
//
//   Revenue                  = sale_amount_tk            (e.g. 480,000 tk)
//   Sand purchase (barki)    = cargo_value × purchase_rate_per_unit_tk
//                                                         (e.g. 5000 × 51 = 255,000)
//   Govt. royalty (ইজারা)    = cargo_value × govt_royalty_rate_tk
//                                                         (e.g. 5000 × 20 = 100,000)
//   Local toll (টোল)         = cargo_value × local_toll_rate_tk
//                                                         (e.g. 5000 × 3  =  15,000)
//   Operating costs          = sum of sand_trip_expenses  (e.g. 60,000)
//   Net profit               = sale − purchase − royalty − toll − operating
//
// Source / destination store only the ghat FK. Name, lat/lng, and the full
// administrative chain (upazila → district → division) are fetched via JOIN
// on the ghats table — no duplication.
export const sandTrips = pgTable(
  'sand_trips',
  {
    id: serial('id').primaryKey(),
    boatId: integer('boat_id')
      .notNull()
      .references(() => boats.id, { onDelete: 'restrict' }),

    // ── Source location ──────────────────────────────────────────────────
    sourceGhatId: integer('source_ghat_id').references(() => ghats.id, {
      onDelete: 'restrict',
    }),

    // ── Destination location ─────────────────────────────────────────────
    destGhatId: integer('dest_ghat_id').references(() => ghats.id, {
      onDelete: 'restrict',
    }),

    // ── Timing ───────────────────────────────────────────────────────────
    departureTime: timestamp('departure_time', { withTimezone: true }).notNull(),
    arrivalTime: timestamp('arrival_time', { withTimezone: true }),

    // ── Cargo ────────────────────────────────────────────────────────────
    cargoValue: numeric('cargo_value', { precision: 10, scale: 2 }), // e.g. 5000
    cargoUnit: varchar('cargo_unit', { length: 10 })
      .default('cubic_ft')
      .$type<'cubic_ft' | 'ton' | 'cubic_m'>(),

    // ── Revenue ──────────────────────────────────────────────────────────
    saleAmountTk: numeric('sale_amount_tk', { precision: 12, scale: 2 }), // 480,000 tk
    buyerName: varchar('buyer_name', { length: 255 }),
    buyerPhone: varchar('buyer_phone', { length: 20 }),

    // ── Sand purchase cost — barki নৌকা ──────────────────────────────────
    // Rate paid per unit to small barki boats for loading sand.
    purchaseRatePerUnitTk: numeric('purchase_rate_per_unit_tk', { precision: 10, scale: 2 }),
    purchaseCostTk: numeric('purchase_cost_tk', { precision: 12, scale: 2 }),

    // ── Govt royalty — সরকারি ইজারা রাজস্ব ──────────────────────────────
    // Official lease royalty paid to the DC office / Balumahal authority.
    govtRoyaltyRateTk: numeric('govt_royalty_rate_tk', { precision: 10, scale: 2 }),
    govtRoyaltyTk: numeric('govt_royalty_tk', { precision: 12, scale: 2 }),

    // ── Local toll — স্থানীয় টোল ────────────────────────────────────────
    // BIWTA / union parishad / transport toll collected at river points.
    localTollRateTk: numeric('local_toll_rate_tk', { precision: 10, scale: 2 }),
    localTollTk: numeric('local_toll_tk', { precision: 12, scale: 2 }),

    // ── Profit summary ───────────────────────────────────────────────────
    // total_operating_cost_tk is updated by the app whenever a trip expense
    // is added/edited/deleted. net_profit_tk is recalculated at the same time.
    totalOperatingCostTk: numeric('total_operating_cost_tk', { precision: 12, scale: 2 }),
    netProfitTk: numeric('net_profit_tk', { precision: 12, scale: 2 }),

    // ── Status ───────────────────────────────────────────────────────────
    // 'loading' covers the barki-boat sand-loading phase before departure.
    status: varchar('status', { length: 20 })
      .notNull()
      .default('scheduled')
      .$type<'scheduled' | 'loading' | 'in_transit' | 'completed' | 'cancelled'>(),

    notes: text('notes'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  },
  (t) => ({
    statusCheck: check(
      'sand_trips_status_check',
      sql`${t.status} IN ('scheduled', 'loading', 'in_transit', 'completed', 'cancelled')`,
    ),
    cargoUnitCheck: check(
      'sand_trips_cargo_unit_check',
      sql`${t.cargoUnit} IS NULL OR ${t.cargoUnit} IN ('cubic_ft', 'ton', 'cubic_m')`,
    ),
    boatIdx: index('idx_sand_trips_boat').on(t.boatId),
    statusIdx: index('idx_sand_trips_status').on(t.status),
    departureIdx: index('idx_sand_trips_departure').on(t.departureTime),
    sourceGhatIdx: index('idx_sand_trips_source_ghat').on(t.sourceGhatId),
    destGhatIdx: index('idx_sand_trips_dest_ghat').on(t.destGhatId),
  }),
);

// ─── Sand Trip Expenses ────────────────────────────────────────────────────
// Itemised operating costs for a sand trip: fuel, labour, maintenance, etc.
// The sum of these rows populates sand_trips.total_operating_cost_tk.
export const sandTripExpenses = pgTable(
  'sand_trip_expenses',
  {
    id: serial('id').primaryKey(),
    sandTripId: integer('sand_trip_id')
      .notNull()
      .references(() => sandTrips.id, { onDelete: 'cascade' }),
    category: varchar('category', { length: 50 })
      .notNull()
      .$type<'fuel' | 'labour' | 'maintenance' | 'toll_payment' | 'loading_fee' | 'other'>(),
    description: text('description'),
    amountTk: numeric('amount_tk', { precision: 10, scale: 2 }).notNull(),
    expenseDate: date('expense_date'),
    createdBy: integer('created_by')
      .notNull()
      .references(() => users.id, { onDelete: 'restrict' }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  },
  (t) => ({
    categoryCheck: check(
      'sand_trip_expenses_category_check',
      sql`${t.category} IN ('fuel', 'labour', 'maintenance', 'toll_payment', 'loading_fee', 'other')`,
    ),
    tripIdx: index('idx_sand_trip_expenses_trip').on(t.sandTripId),
  }),
);

// ─── Sand Trip Attachments ─────────────────────────────────────────────────
// Photos / documents attached to a sand trip (e.g. loading receipts, permits).
export const sandTripAttachments = pgTable(
  'sand_trip_attachments',
  {
    sandTripId: integer('sand_trip_id')
      .notNull()
      .references(() => sandTrips.id, { onDelete: 'cascade' }),
    fileId: integer('file_id')
      .notNull()
      .references(() => files.id, { onDelete: 'cascade' }),
    description: text('description'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.sandTripId, t.fileId] }),
    tripIdx: index('idx_sand_trip_attachments_trip').on(t.sandTripId),
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
    actorRole: varchar('actor_role', { length: 10 }).$type<'user' | 'admin' | 'system'>(),
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
    userId: integer('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'restrict' }),
    category: varchar('category', { length: 50 })
      .notNull()
      .$type<'bug' | 'billing' | 'feature_request' | 'other'>(),
    title: varchar('title', { length: 255 }).notNull(),
    description: text('description'),
    status: varchar('status', { length: 20 })
      .notNull()
      .default('open')
      .$type<'open' | 'in_review' | 'resolved' | 'closed'>(),
    adminReply: text('admin_reply'),
    resolvedBy: integer('resolved_by').references(() => users.id, { onDelete: 'set null' }),
    resolvedAt: timestamp('resolved_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  },
  (t) => ({
    categoryCheck: check(
      'reports_category_check',
      sql`${t.category} IN ('bug', 'billing', 'feature_request', 'other')`,
    ),
    statusCheck: check(
      'reports_status_check',
      sql`${t.status} IN ('open', 'in_review', 'resolved', 'closed')`,
    ),
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
// User task tracking. Always owned by a user. Optionally scoped to a boat
// or sand trip for context.
export const todos = pgTable(
  'todos',
  {
    id: serial('id').primaryKey(),
    userId: integer('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    boatId: integer('boat_id').references(() => boats.id, { onDelete: 'set null' }),
    sandTripId: integer('sand_trip_id').references(() => sandTrips.id, {
      onDelete: 'set null',
    }),
    title: varchar('title', { length: 255 }).notNull(),
    description: text('description'),
    isDone: boolean('is_done').notNull().default(false),
    dueDate: date('due_date'),
    priority: varchar('priority', { length: 10 })
      .notNull()
      .default('normal')
      .$type<'low' | 'normal' | 'high'>(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  },
  (t) => ({
    priorityCheck: check(
      'todos_priority_check',
      sql`${t.priority} IN ('low', 'normal', 'high')`,
    ),
    userIdx: index('idx_todos_user').on(t.userId),
    isDoneIdx: index('idx_todos_is_done').on(t.isDone),
    dueDateIdx: index('idx_todos_due_date').on(t.dueDate),
    boatIdx: index('idx_todos_boat').on(t.boatId),
    sandTripIdx: index('idx_todos_sand_trip').on(t.sandTripId),
  }),
);

// ─── Inferred Types ────────────────────────────────────────────────────────
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Profile = typeof profiles.$inferSelect;
export type NewProfile = typeof profiles.$inferInsert;
export type AdminDetail = typeof adminDetails.$inferSelect;
export type UserBlock = typeof userBlocks.$inferSelect;
export type NewUserBlock = typeof userBlocks.$inferInsert;
export type Otp = typeof otps.$inferSelect;
export type NewOtp = typeof otps.$inferInsert;
export type SubscriptionPlan = typeof subscriptionPlans.$inferSelect;
export type NewSubscriptionPlan = typeof subscriptionPlans.$inferInsert;
export type UserSubscription = typeof userSubscriptions.$inferSelect;
export type NewUserSubscription = typeof userSubscriptions.$inferInsert;
export type PlatformAccount = typeof platformAccounts.$inferSelect;
export type Sector = typeof sectors.$inferSelect;
export type Division = typeof divisions.$inferSelect;
export type NewDivision = typeof divisions.$inferInsert;
export type District = typeof districts.$inferSelect;
export type NewDistrict = typeof districts.$inferInsert;
export type Upazila = typeof upazilas.$inferSelect;
export type NewUpazila = typeof upazilas.$inferInsert;
export type Ghat = typeof ghats.$inferSelect;
export type NewGhat = typeof ghats.$inferInsert;
export type Boat = typeof boats.$inferSelect;
export type NewBoat = typeof boats.$inferInsert;
export type BoatMaintenanceLog = typeof boatMaintenanceLogs.$inferSelect;
export type NewBoatMaintenanceLog = typeof boatMaintenanceLogs.$inferInsert;
export type SandTrip = typeof sandTrips.$inferSelect;
export type NewSandTrip = typeof sandTrips.$inferInsert;
export type SandTripExpense = typeof sandTripExpenses.$inferSelect;
export type NewSandTripExpense = typeof sandTripExpenses.$inferInsert;
export type AuditLog = typeof auditLogs.$inferSelect;
export type Report = typeof reports.$inferSelect;
export type NewReport = typeof reports.$inferInsert;
export type Todo = typeof todos.$inferSelect;
export type NewTodo = typeof todos.$inferInsert;