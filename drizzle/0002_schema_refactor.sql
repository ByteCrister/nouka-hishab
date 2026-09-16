-- Migration 0002: Schema refactor
-- 1. Create locations table
-- 2. Add location_id to divisions, districts, upazilas (dropping old lat/lng)
-- 3. Update sand_trips: replace source/dest ghat with location + upazila FKs
-- 4. Drop ghats table
-- 5. Drop sector from subscription_plans

--> statement-breakpoint
CREATE TABLE "locations" (
	"id" serial PRIMARY KEY NOT NULL,
	"public_id" varchar(26) NOT NULL,
	"name" varchar(255) NOT NULL,
	"lat" numeric(10, 7),
	"lng" numeric(10, 7),
	"is_active" boolean NOT NULL DEFAULT true,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "locations_public_id_unique" UNIQUE("public_id")
);
--> statement-breakpoint
CREATE INDEX "idx_locations_public_id" ON "locations" USING btree ("public_id");
--> statement-breakpoint
CREATE INDEX "idx_locations_is_active" ON "locations" USING btree ("is_active");

--> statement-breakpoint
ALTER TABLE "divisions" ADD COLUMN "location_id" integer;
--> statement-breakpoint
ALTER TABLE "districts" ADD COLUMN "location_id" integer;
--> statement-breakpoint
ALTER TABLE "upazilas" ADD COLUMN "location_id" integer;

--> statement-breakpoint
ALTER TABLE "divisions" ADD CONSTRAINT "divisions_location_id_locations_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."locations"("id") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "districts" ADD CONSTRAINT "districts_location_id_locations_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."locations"("id") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "upazilas" ADD CONSTRAINT "upazilas_location_id_locations_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."locations"("id") ON DELETE set null ON UPDATE no action;

--> statement-breakpoint
-- Drop old ghat FKs from sand_trips before dropping ghats table
ALTER TABLE "sand_trips" DROP CONSTRAINT IF EXISTS "sand_trips_source_ghat_id_ghats_id_fk";
--> statement-breakpoint
ALTER TABLE "sand_trips" DROP CONSTRAINT IF EXISTS "sand_trips_dest_ghat_id_ghats_id_fk";
--> statement-breakpoint
-- Drop old indexes
DROP INDEX IF EXISTS "idx_sand_trips_source_ghat";
--> statement-breakpoint
DROP INDEX IF EXISTS "idx_sand_trips_dest_ghat";

--> statement-breakpoint
ALTER TABLE "sand_trips" DROP COLUMN "source_ghat_id";
--> statement-breakpoint
ALTER TABLE "sand_trips" DROP COLUMN "dest_ghat_id";

--> statement-breakpoint
ALTER TABLE "sand_trips" ADD COLUMN "source_location_id" integer;
--> statement-breakpoint
ALTER TABLE "sand_trips" ADD COLUMN "source_upazila_id" integer;
--> statement-breakpoint
ALTER TABLE "sand_trips" ADD COLUMN "dest_location_id" integer;
--> statement-breakpoint
ALTER TABLE "sand_trips" ADD COLUMN "dest_upazila_id" integer;

--> statement-breakpoint
ALTER TABLE "sand_trips" ADD CONSTRAINT "sand_trips_source_location_id_locations_id_fk" FOREIGN KEY ("source_location_id") REFERENCES "public"."locations"("id") ON DELETE restrict ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "sand_trips" ADD CONSTRAINT "sand_trips_source_upazila_id_upazilas_id_fk" FOREIGN KEY ("source_upazila_id") REFERENCES "public"."upazilas"("id") ON DELETE restrict ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "sand_trips" ADD CONSTRAINT "sand_trips_dest_location_id_locations_id_fk" FOREIGN KEY ("dest_location_id") REFERENCES "public"."locations"("id") ON DELETE restrict ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "sand_trips" ADD CONSTRAINT "sand_trips_dest_upazila_id_upazilas_id_fk" FOREIGN KEY ("dest_upazila_id") REFERENCES "public"."upazilas"("id") ON DELETE restrict ON UPDATE no action;

--> statement-breakpoint
CREATE INDEX "idx_sand_trips_source_location" ON "sand_trips" USING btree ("source_location_id");
--> statement-breakpoint
CREATE INDEX "idx_sand_trips_source_upazila" ON "sand_trips" USING btree ("source_upazila_id");
--> statement-breakpoint
CREATE INDEX "idx_sand_trips_dest_location" ON "sand_trips" USING btree ("dest_location_id");
--> statement-breakpoint
CREATE INDEX "idx_sand_trips_dest_upazila" ON "sand_trips" USING btree ("dest_upazila_id");

--> statement-breakpoint
-- Drop subscription_plans.sector
ALTER TABLE "subscription_plans" DROP COLUMN "sector";

--> statement-breakpoint
-- Drop ghats table (no more references)
DROP TABLE "ghats";
