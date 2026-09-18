import {
  pgTable,
  serial,
  varchar,
  text,
  bigint,
  char,
  timestamp,
  integer,
  unique,
  index,
  AnyPgColumn,
  check,
} from 'drizzle-orm/pg-core';
import { users } from './app';
import { AssetStatus, AssetType, ASSET_STATUSES, ASSET_TYPES } from '@/constants/db/media.const';
import { sql } from 'drizzle-orm';

// ─── Assets: deduplicated by (file_hash, asset_type) ──────────────────────
export const assets = pgTable(
  'assets',
  {
    id: serial('id').primaryKey(),
    cloudinaryPublicId: varchar('cloudinary_public_id', { length: 255 })
      .unique()
      .notNull(),
    cloudinaryUrl: text('cloudinary_url').notNull(),
    cloudinaryResourceType: varchar('cloudinary_resource_type', { length: 50 }),
    cloudinaryFormat: varchar('cloudinary_format', { length: 50 }),
    status: varchar('status', { length: 20 })
      .notNull()
      .default(ASSET_STATUSES.PENDING)
      .$type<AssetStatus>(),
    assetType: varchar('asset_type', { length: 20 })
      .notNull()
      .$type<AssetType>(),
    mimeType: varchar('mime_type', { length: 100 }),
    sizeBytes: bigint('size_bytes', { mode: 'number' }),
    width: integer('width'),
    height: integer('height'),
    fileHash: char('file_hash', { length: 64 }).notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  },
  (table) => ({
    hashTypeUnique: unique('assets_hash_type_unique').on(
      table.fileHash,
      table.assetType,
    ),
    hashIdx: index('idx_assets_hash').on(table.fileHash),
    statusCheck: check(
      'assets_status_check',
      sql`${table.status} IN (${sql.raw(Object.values(ASSET_STATUSES).map((s) => `'${s}'`).join(', '))})`,
    ),
    typeCheck: check(
      'assets_type_check',
      sql`${table.assetType} IN (${sql.raw(Object.values(ASSET_TYPES).map((s) => `'${s}'`).join(', '))})`,
    ),
  }),
);

// ─── Files: per‑usage copies referencing an asset ─────────────────────────
export const files = pgTable(
  'files',
  {
    id: serial('id').primaryKey(),
    assetId: integer('asset_id')
      .notNull()
      .references(() => assets.id, { onDelete: 'restrict' }),
    uploadedBy: integer('uploaded_by')
      .notNull()
      .references((): AnyPgColumn => users.id, { onDelete: 'cascade' }),
    originalFileName: varchar('original_file_name', { length: 255 }).notNull(),
    description: text('description'),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  },
  (table) => ({
    assetIdx: index('idx_files_asset').on(table.assetId),
    userIdx: index('idx_files_user').on(table.uploadedBy),
  }),
);

export type Asset = typeof assets.$inferSelect;
export type NewAsset = typeof assets.$inferInsert;
export type FileRecord = typeof files.$inferSelect;
export type NewFileRecord = typeof files.$inferInsert;

