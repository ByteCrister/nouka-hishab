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
} from 'drizzle-orm/pg-core';
import { users } from './app';

// ─── Assets: deduplicated by (file_hash, asset_type) ──────────────────────
export const assets = pgTable(
  'assets',
  {
    id: serial('id').primaryKey(),
    cloudinaryPublicId: varchar('cloudinary_public_id', { length: 255 })
      .unique()
      .notNull(),
    cloudinaryUrl: text('cloudinary_url').notNull(),
    assetType: varchar('asset_type', { length: 20 })
      .notNull()
      .$type<'image' | 'pdf' | 'docx' | 'other'>(),
    mimeType: varchar('mime_type', { length: 100 }),
    sizeBytes: bigint('size_bytes', { mode: 'number' }),
    fileHash: char('file_hash', { length: 64 }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  },
  (table) => ({
    hashTypeUnique: unique('assets_hash_type_unique').on(
      table.fileHash,
      table.assetType,
    ),
    hashIdx: index('idx_assets_hash').on(table.fileHash),
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
      .references(() => users.id, { onDelete: 'cascade' }),
    originalFileName: varchar('original_file_name', { length: 255 }).notNull(),
    description: text('description'),
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