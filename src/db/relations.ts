import { relations } from 'drizzle-orm';
import {
  users,
  profiles,
  adminDetails,
  userBlocks,
  subscriptionPlans,
  userSubscriptions,
  sectors,
  divisions,
  districts,
  upazilas,
  ghats,
  boats,
  boatMaintenanceLogs,
  boatImages,
  boatDocuments,
  sandTrips,
  sandTripExpenses,
  sandTripAttachments,
  auditLogs,
  reports,
  reportAttachments,
  todos,
  otps,
} from './app';
import { assets, files } from './media';

// ─── Users ─────────────────────────────────────────────────────────────────
export const usersRelations = relations(users, ({ one, many }) => ({
  profile: one(profiles, {
    fields: [users.id],
    references: [profiles.userId],
  }),
  adminDetail: one(adminDetails, {
    fields: [users.id],
    references: [adminDetails.userId],
  }),
  blocks: many(userBlocks, { relationName: 'blockedUser' }),
  blocksIssued: many(userBlocks, { relationName: 'blockingAdmin' }),
  subscriptions: many(userSubscriptions),
  maintenanceLogsCreated: many(boatMaintenanceLogs),
  sandTripExpensesCreated: many(sandTripExpenses),
  auditLogsAsActor: many(auditLogs),
  reports: many(reports, { relationName: 'reportFiler' }),
  reportsResolved: many(reports, { relationName: 'reportResolver' }),
  todos: many(todos),
  otps: many(otps),
  uploadedFiles: many(files),
}));

// ─── Profiles ──────────────────────────────────────────────────────────────
export const profilesRelations = relations(profiles, ({ one }) => ({
  user: one(users, {
    fields: [profiles.userId],
    references: [users.id],
  }),
}));

// ─── Admin Details ─────────────────────────────────────────────────────────
export const adminDetailsRelations = relations(adminDetails, ({ one }) => ({
  user: one(users, {
    fields: [adminDetails.userId],
    references: [users.id],
  }),
}));

// ─── User Blocks ───────────────────────────────────────────────────────────
export const userBlocksRelations = relations(userBlocks, ({ one }) => ({
  user: one(users, {
    fields: [userBlocks.userId],
    references: [users.id],
    relationName: 'blockedUser',
  }),
  admin: one(users, {
    fields: [userBlocks.blockedBy],
    references: [users.id],
    relationName: 'blockingAdmin',
  }),
}));

// ─── OTPs ──────────────────────────────────────────────────────────────────
export const otpsRelations = relations(otps, ({ one }) => ({
  user: one(users, {
    fields: [otps.email],
    references: [users.email],
  }),
}));

// ─── Subscription Plans ────────────────────────────────────────────────────
export const subscriptionPlansRelations = relations(subscriptionPlans, ({ one, many }) => ({
  sector: one(sectors, {
    fields: [subscriptionPlans.sectorId],
    references: [sectors.id],
  }),
  userSubscriptions: many(userSubscriptions),
}));

// ─── User Subscriptions ────────────────────────────────────────────────────
export const userSubscriptionsRelations = relations(userSubscriptions, ({ one }) => ({
  user: one(users, {
    fields: [userSubscriptions.userId],
    references: [users.id],
  }),
  plan: one(subscriptionPlans, {
    fields: [userSubscriptions.planId],
    references: [subscriptionPlans.id],
  }),
}));

// ─── Sectors ───────────────────────────────────────────────────────────────
export const sectorsRelations = relations(sectors, ({ many }) => ({
  boats: many(boats),
  subscriptionPlans: many(subscriptionPlans),
}));

// ─── Divisions ───────────────────────────────────────────────────────────────
export const divisionsRelations = relations(divisions, ({ many }) => ({
  districts: many(districts),
}));

// ─── Districts ───────────────────────────────────────────────────────────────
export const districtsRelations = relations(districts, ({ one, many }) => ({
  division: one(divisions, {
    fields: [districts.divisionId],
    references: [divisions.id],
  }),
  upazilas: many(upazilas),
}));

// ─── Upazilas ───────────────────────────────────────────────────────────────
export const upazilasRelations = relations(upazilas, ({ one, many }) => ({
  district: one(districts, {
    fields: [upazilas.districtId],
    references: [districts.id],
  }),
  ghats: many(ghats),
}));

// ─── Ghats ─────────────────────────────────────────────────────────────────
export const ghatsRelations = relations(ghats, ({ one, many }) => ({
  upazila: one(upazilas, {
    fields: [ghats.upazilaId],
    references: [upazilas.id],
  }),
  sandTripsAsSource: many(sandTrips, { relationName: 'sandTripSourceGhat' }),
  sandTripsAsDest: many(sandTrips, { relationName: 'sandTripDestGhat' }),
}));

// ─── Boats ─────────────────────────────────────────────────────────────────
export const boatsRelations = relations(boats, ({ one, many }) => ({
  sector: one(sectors, {
    fields: [boats.sectorId],
    references: [sectors.id],
  }),
  maintenanceLogs: many(boatMaintenanceLogs),
  images: many(boatImages),
  documents: many(boatDocuments),
  sandTrips: many(sandTrips),
  todos: many(todos),
}));

// ─── Boat Maintenance Logs ─────────────────────────────────────────────────
export const boatMaintenanceLogsRelations = relations(boatMaintenanceLogs, ({ one }) => ({
  boat: one(boats, {
    fields: [boatMaintenanceLogs.boatId],
    references: [boats.id],
  }),
  createdBy: one(users, {
    fields: [boatMaintenanceLogs.createdBy],
    references: [users.id],
  }),
}));

// ─── Boat Images ───────────────────────────────────────────────────────────
export const boatImagesRelations = relations(boatImages, ({ one }) => ({
  boat: one(boats, {
    fields: [boatImages.boatId],
    references: [boats.id],
  }),
  file: one(files, {
    fields: [boatImages.fileId],
    references: [files.id],
  }),
}));

// ─── Boat Documents ────────────────────────────────────────────────────────
export const boatDocumentsRelations = relations(boatDocuments, ({ one }) => ({
  boat: one(boats, {
    fields: [boatDocuments.boatId],
    references: [boats.id],
  }),
  file: one(files, {
    fields: [boatDocuments.fileId],
    references: [files.id],
  }),
}));

// ─── Sand Trips ────────────────────────────────────────────────────────────
export const sandTripsRelations = relations(sandTrips, ({ one, many }) => ({
  boat: one(boats, {
    fields: [sandTrips.boatId],
    references: [boats.id],
  }),
  sourceGhat: one(ghats, {
    fields: [sandTrips.sourceGhatId],
    references: [ghats.id],
    relationName: 'sandTripSourceGhat',
  }),
  destGhat: one(ghats, {
    fields: [sandTrips.destGhatId],
    references: [ghats.id],
    relationName: 'sandTripDestGhat',
  }),
  expenses: many(sandTripExpenses),
  attachments: many(sandTripAttachments),
  todos: many(todos),
}));

// ─── Sand Trip Expenses ────────────────────────────────────────────────────
export const sandTripExpensesRelations = relations(sandTripExpenses, ({ one }) => ({
  sandTrip: one(sandTrips, {
    fields: [sandTripExpenses.sandTripId],
    references: [sandTrips.id],
  }),
  createdBy: one(users, {
    fields: [sandTripExpenses.createdBy],
    references: [users.id],
  }),
}));

// ─── Sand Trip Attachments ─────────────────────────────────────────────────
export const sandTripAttachmentsRelations = relations(sandTripAttachments, ({ one }) => ({
  sandTrip: one(sandTrips, {
    fields: [sandTripAttachments.sandTripId],
    references: [sandTrips.id],
  }),
  file: one(files, {
    fields: [sandTripAttachments.fileId],
    references: [files.id],
  }),
}));

// ─── Audit Logs ────────────────────────────────────────────────────────────
export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  actor: one(users, {
    fields: [auditLogs.actorId],
    references: [users.id],
  }),
}));

// ─── Reports ───────────────────────────────────────────────────────────────
export const reportsRelations = relations(reports, ({ one, many }) => ({
  user: one(users, {
    fields: [reports.userId],
    references: [users.id],
    relationName: 'reportFiler',
  }),
  resolvedByAdmin: one(users, {
    fields: [reports.resolvedBy],
    references: [users.id],
    relationName: 'reportResolver',
  }),
  attachments: many(reportAttachments),
}));

// ─── Report Attachments ────────────────────────────────────────────────────
export const reportAttachmentsRelations = relations(reportAttachments, ({ one }) => ({
  report: one(reports, {
    fields: [reportAttachments.reportId],
    references: [reports.id],
  }),
  file: one(files, {
    fields: [reportAttachments.fileId],
    references: [files.id],
  }),
}));

// ─── Todos ─────────────────────────────────────────────────────────────────
export const todosRelations = relations(todos, ({ one }) => ({
  user: one(users, {
    fields: [todos.userId],
    references: [users.id],
  }),
  boat: one(boats, {
    fields: [todos.boatId],
    references: [boats.id],
  }),
  sandTrip: one(sandTrips, {
    fields: [todos.sandTripId],
    references: [sandTrips.id],
  }),
}));

// ─── Assets & Files (media.ts) ─────────────────────────────────────────────
export const assetsRelations = relations(assets, ({ many }) => ({
  files: many(files),
}));

export const filesRelations = relations(files, ({ one, many }) => ({
  asset: one(assets, {
    fields: [files.assetId],
    references: [assets.id],
  }),
  uploader: one(users, {
    fields: [files.uploadedBy],
    references: [users.id],
  }),
  boatImages: many(boatImages),
  boatDocuments: many(boatDocuments),
  sandTripAttachments: many(sandTripAttachments),
  reportAttachments: many(reportAttachments),
}));