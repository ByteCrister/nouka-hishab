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
  primaryKey,
  index,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { ulid } from 'ulid';
import { files } from './media';
import { users, sectors } from './app';

// ─── Boats ─────────────────────────────────────────────────────────────────
// Steel boat registry. No owner FK — the logged-in user manages their own
// boats. Ownership/partnership is handled outside the DB for now.
// capacity_value + capacity_unit replaces the old single capacityTon field.
// boat_value_tk is informational (e.g. for insurance / maintenance budgeting).
export const boats = pgTable(
  'boats',
  {
    id: serial('id').primaryKey(),
    publicId: varchar('public_id', { length: 26 })
      .unique()
      .notNull()
      .$defaultFn(() => ulid()), // safe URL param e.g. /boats/01J7K9...
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
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
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
    publicIdIdx: index('idx_boats_public_id').on(t.publicId),
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
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
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
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
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
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  },
  (t) => ({
    boatIdx: index('idx_boat_docs_boat').on(t.boatId),
    expiryIdx: index('idx_boat_docs_expiry').on(t.expiryDate),
  }),
);

// ─── Inferred Types ────────────────────────────────────────────────────────
export type Boat = typeof boats.$inferSelect;
export type NewBoat = typeof boats.$inferInsert;
export type BoatMaintenanceLog = typeof boatMaintenanceLogs.$inferSelect;
export type NewBoatMaintenanceLog = typeof boatMaintenanceLogs.$inferInsert;
