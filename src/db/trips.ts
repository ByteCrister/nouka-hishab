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
  index,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { ulid } from 'ulid';
import { users } from './app';
import { boats } from './boat';
import { files } from './media';
import { sandTrips } from './sand';
import { TRIP_EXPENSE_CATEGORIES, TripExpenseCategory } from '@/constants/db/trips.const';

export const tripExpenses = pgTable(
  'trip_expenses',
  {
    id: serial('id').primaryKey(),
    publicId: varchar('public_id', { length: 26 })
      .unique()
      .notNull()
      .$defaultFn(() => ulid()),
    boatId: integer('boat_id')
      .notNull()
      .references(() => boats.id, { onDelete: 'cascade' }),
    sandTripId: integer('sand_trip_id')
      .references(() => sandTrips.id, { onDelete: 'cascade' }),
    category: varchar('category', { length: 50 })
      .notNull()
      .$type<TripExpenseCategory>(),
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
      'trip_expenses_category_check',
      sql`${t.category} IN (${sql.raw(Object.values(TRIP_EXPENSE_CATEGORIES).map(s => `'${s}'`).join(', '))})`,
    ),
    boatIdx: index('idx_trip_expenses_boat').on(t.boatId),
    sandTripIdx: index('idx_trip_expenses_sand_trip').on(t.sandTripId),
  }),
);

export const tripAttachments = pgTable(
  'trip_attachments',
  {
    id: serial('id').primaryKey(),
    boatId: integer('boat_id')
      .notNull()
      .references(() => boats.id, { onDelete: 'cascade' }),
    sandTripId: integer('sand_trip_id')
      .references(() => sandTrips.id, { onDelete: 'cascade' }),
    fileId: integer('file_id')
      .notNull()
      .references(() => files.id, { onDelete: 'cascade' }),
    description: text('description'),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  },
  (t) => ({
    boatIdx: index('idx_trip_attachments_boat').on(t.boatId),
    sandTripIdx: index('idx_trip_attachments_sand_trip').on(t.sandTripId),
  }),
);

export type TripExpense = typeof tripExpenses.$inferSelect;
export type NewTripExpense = typeof tripExpenses.$inferInsert;
export type TripAttachment = typeof tripAttachments.$inferSelect;
export type NewTripAttachment = typeof tripAttachments.$inferInsert;
