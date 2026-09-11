import {
  pgTable,
  serial,
  varchar,
  text,
  timestamp,
  integer,
  numeric,
  date,
  check,
  primaryKey,
  index,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { ulid } from 'ulid';
import { files } from './media';
import { users, ghats } from './app';
import { boats } from './boat';

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
    publicId: varchar('public_id', { length: 26 })
      .unique()
      .notNull()
      .$defaultFn(() => ulid()), // safe URL param e.g. /sand-trips/01J7K9...
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
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
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
    publicIdIdx: index('idx_sand_trips_public_id').on(t.publicId),
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
    publicId: varchar('public_id', { length: 26 })
      .unique()
      .notNull()
      .$defaultFn(() => ulid()), // safe URL param e.g. /expenses/01J7K9...
    sandTripId: integer('sand_trip_id')
      .notNull()
      .references(() => sandTrips.id, { onDelete: 'cascade' }),
    category: varchar('category', { length: 50 })
      .notNull()
      .$type<'fuel' | 'labour' | 'maintenance' | 'toll_payment' | 'loading_fee' | 'engine_repair' | 'other'>(),
    description: text('description'),
    amountTk: numeric('amount_tk', { precision: 10, scale: 2 }).notNull(),
    expenseDate: date('expense_date'),
    createdBy: integer('created_by')
      .notNull()
      .references(() => users.id, { onDelete: 'restrict' }),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
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
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.sandTripId, t.fileId] }),
    tripIdx: index('idx_sand_trip_attachments_trip').on(t.sandTripId),
  }),
);

// ─── Inferred Types ────────────────────────────────────────────────────────
export type SandTrip = typeof sandTrips.$inferSelect;
export type NewSandTrip = typeof sandTrips.$inferInsert;
export type SandTripExpense = typeof sandTripExpenses.$inferSelect;
export type NewSandTripExpense = typeof sandTripExpenses.$inferInsert;
