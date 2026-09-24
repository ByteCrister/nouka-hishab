-- Custom SQL migration file, put your code below! --
-- 1. Rename the tables to keep existing data
-- ALTER TABLE "sand_trip_expenses" RENAME TO "trip_expenses";
-- ALTER TABLE "sand_trip_attachments" RENAME TO "trip_attachments";

-- 2. Add the boat_id column (nullable at first)
-- ALTER TABLE "trip_expenses" ADD COLUMN "boat_id" integer;
-- ALTER TABLE "trip_attachments" ADD COLUMN "boat_id" integer;

-- 3. Data Backfill: Populate the new boat_id column using the linked sand trip
-- UPDATE "trip_expenses" 
-- SET "boat_id" = (SELECT "boat_id" FROM "sand_trips" WHERE "sand_trips"."id" = "trip_expenses"."sand_trip_id");

-- UPDATE "trip_attachments" 
-- SET "boat_id" = (SELECT "boat_id" FROM "sand_trips" WHERE "sand_trips"."id" = "trip_attachments"."sand_trip_id");

-- 4. Delete orphan rows that didn't get a boat_id (just in case)
-- DELETE FROM "trip_expenses" WHERE "boat_id" IS NULL;
-- DELETE FROM "trip_attachments" WHERE "boat_id" IS NULL;

-- 5. Make the boat_id column NOT NULL
-- ALTER TABLE "trip_expenses" ALTER COLUMN "boat_id" SET NOT NULL;
-- ALTER TABLE "trip_attachments" ALTER COLUMN "boat_id" SET NOT NULL;

-- 6. Add foreign keys for boat_id
-- ALTER TABLE "trip_expenses" ADD CONSTRAINT "trip_expenses_boat_id_boats_id_fk" FOREIGN KEY ("boat_id") REFERENCES "public"."boats"("id") ON DELETE cascade ON UPDATE no action;
-- ALTER TABLE "trip_attachments" ADD CONSTRAINT "trip_attachments_boat_id_boats_id_fk" FOREIGN KEY ("boat_id") REFERENCES "public"."boats"("id") ON DELETE cascade ON UPDATE no action;

-- 7. Add trip_attachments ID (since it used to be a composite PK, we need an ID now)
ALTER TABLE "trip_attachments" DROP CONSTRAINT IF EXISTS "sand_trip_attachments_pkey";
ALTER TABLE "trip_attachments" ADD COLUMN "id" serial PRIMARY KEY;

-- 8. Make sand_trip_id nullable
ALTER TABLE "trip_expenses" ALTER COLUMN "sand_trip_id" DROP NOT NULL;
ALTER TABLE "trip_attachments" ALTER COLUMN "sand_trip_id" DROP NOT NULL;