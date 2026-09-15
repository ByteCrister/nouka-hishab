CREATE TABLE "admin_details" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"full_name" varchar(255) NOT NULL,
	"phone" varchar(20),
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "admin_details_user_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"actor_id" integer,
	"actor_role" varchar(10),
	"action" varchar(100) NOT NULL,
	"entity_type" varchar(50),
	"entity_id" integer,
	"old_values" text,
	"new_values" text,
	"ip_address" varchar(45),
	"user_agent" text,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "districts" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" varchar(100) NOT NULL,
	"division_id" integer NOT NULL,
	"name_en" varchar(100) NOT NULL,
	"name_bn" varchar(100),
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "districts_name_division_unique" UNIQUE("name_en","division_id"),
	CONSTRAINT "districts_slug_division_unique" UNIQUE("slug","division_id")
);
--> statement-breakpoint
CREATE TABLE "divisions" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" varchar(100) NOT NULL,
	"name_en" varchar(100) NOT NULL,
	"name_bn" varchar(100),
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "divisions_slug_unique" UNIQUE("slug"),
	CONSTRAINT "divisions_name_en_unique" UNIQUE("name_en")
);
--> statement-breakpoint
CREATE TABLE "ghats" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" varchar(100) NOT NULL,
	"upazila_id" integer,
	"name_en" varchar(255) NOT NULL,
	"name_bn" varchar(255),
	"river_name" varchar(100),
	"lat" numeric(10, 7),
	"lng" numeric(10, 7),
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "ghats_slug_upazila_unique" UNIQUE("slug","upazila_id")
);
--> statement-breakpoint
CREATE TABLE "otps" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"code_hash" text NOT NULL,
	"type" varchar(50) NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"is_used" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "otps_type_check" CHECK ("otps"."type" IN ('user_forgot_password', 'admin_forgot_password', 'user_password_change', 'email_verification'))
);
--> statement-breakpoint
CREATE TABLE "platform_accounts" (
	"id" serial PRIMARY KEY NOT NULL,
	"label" varchar(100) NOT NULL,
	"account_type" varchar(20) NOT NULL,
	"account_number" varchar(50) NOT NULL,
	"account_name" varchar(255),
	"is_active" boolean DEFAULT true NOT NULL,
	"is_primary" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "platform_accounts_type_check" CHECK ("platform_accounts"."account_type" IN ('bkash', 'nagad', 'rocket', 'bank'))
);
--> statement-breakpoint
CREATE TABLE "profiles" (
	"id" serial PRIMARY KEY NOT NULL,
	"public_id" varchar(26) NOT NULL,
	"user_id" integer NOT NULL,
	"full_name" varchar(255) NOT NULL,
	"phone" varchar(20),
	"address" text,
	"company_name" varchar(255),
	"nid_number" varchar(50),
	"is_blocked" boolean DEFAULT false NOT NULL,
	"blocked_by" integer,
	"block_reason" text,
	"blocked_until" timestamp with time zone,
	"unblocked_at" timestamp with time zone,
	"unblock_note" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "profiles_public_id_unique" UNIQUE("public_id"),
	CONSTRAINT "profiles_user_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "report_attachments" (
	"report_id" integer NOT NULL,
	"file_id" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "report_attachments_report_id_file_id_pk" PRIMARY KEY("report_id","file_id")
);
--> statement-breakpoint
CREATE TABLE "reports" (
	"id" serial PRIMARY KEY NOT NULL,
	"public_id" varchar(26) NOT NULL,
	"user_id" integer NOT NULL,
	"category" varchar(50) NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"status" varchar(20) DEFAULT 'open' NOT NULL,
	"admin_reply" text,
	"resolved_by" integer,
	"resolved_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "reports_public_id_unique" UNIQUE("public_id"),
	CONSTRAINT "reports_category_check" CHECK ("reports"."category" IN ('bug', 'billing', 'feature_request', 'other')),
	CONSTRAINT "reports_status_check" CHECK ("reports"."status" IN ('open', 'in_review', 'resolved', 'closed'))
);
--> statement-breakpoint
CREATE TABLE "subscription_plans" (
	"id" serial PRIMARY KEY NOT NULL,
	"sector" varchar(50) NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"price_tk" numeric(10, 2) NOT NULL,
	"billing_period" varchar(20) DEFAULT 'monthly' NOT NULL,
	"max_boats" integer,
	"max_trips_per_month" integer,
	"features" text[],
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	"deleted_at" timestamp with time zone,
	CONSTRAINT "subscription_plans_billing_period_check" CHECK ("subscription_plans"."billing_period" IN ('monthly', 'yearly')),
	CONSTRAINT "subscription_plans_sector_check" CHECK ("subscription_plans"."sector" IN ('sand', 'lime-stone', 'brick'))
);
--> statement-breakpoint
CREATE TABLE "todos" (
	"id" serial PRIMARY KEY NOT NULL,
	"public_id" varchar(26) NOT NULL,
	"user_id" integer NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"is_done" boolean DEFAULT false NOT NULL,
	"due_date" date,
	"priority" varchar(10) DEFAULT 'normal' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "todos_public_id_unique" UNIQUE("public_id"),
	CONSTRAINT "todos_priority_check" CHECK ("todos"."priority" IN ('low', 'normal', 'high'))
);
--> statement-breakpoint
CREATE TABLE "upazilas" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" varchar(100) NOT NULL,
	"district_id" integer NOT NULL,
	"name_en" varchar(100) NOT NULL,
	"name_bn" varchar(100),
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "upazilas_name_district_unique" UNIQUE("name_en","district_id"),
	CONSTRAINT "upazilas_slug_district_unique" UNIQUE("slug","district_id")
);
--> statement-breakpoint
CREATE TABLE "user_subscriptions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"plan_id" integer NOT NULL,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"started_at" timestamp with time zone NOT NULL,
	"ends_at" timestamp with time zone,
	"payment_method" varchar(20),
	"payment_reference" varchar(255),
	"amount_paid_tk" numeric(10, 2),
	"note" text,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "user_subscriptions_status_check" CHECK ("user_subscriptions"."status" IN ('active', 'expired', 'cancelled', 'pending')),
	CONSTRAINT "user_subscriptions_payment_method_check" CHECK ("user_subscriptions"."payment_method" IS NULL OR "user_subscriptions"."payment_method" IN ('bkash', 'nagad', 'rocket', 'manual'))
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"public_id" varchar(26) NOT NULL,
	"email" varchar(255) NOT NULL,
	"password_hash" text NOT NULL,
	"role" varchar(10) DEFAULT 'user' NOT NULL,
	"avatar_file_id" integer,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "users_public_id_unique" UNIQUE("public_id"),
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_role_check" CHECK ("users"."role" IN ('user', 'admin'))
);
--> statement-breakpoint
CREATE TABLE "assets" (
	"id" serial PRIMARY KEY NOT NULL,
	"cloudinary_public_id" varchar(255) NOT NULL,
	"cloudinary_url" text NOT NULL,
	"cloudinary_resource_type" varchar(50),
	"cloudinary_format" varchar(50),
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"asset_type" varchar(20) NOT NULL,
	"mime_type" varchar(100),
	"size_bytes" bigint,
	"width" integer,
	"height" integer,
	"file_hash" char(64) NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now(),
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "assets_cloudinary_public_id_unique" UNIQUE("cloudinary_public_id"),
	CONSTRAINT "assets_hash_type_unique" UNIQUE("file_hash","asset_type"),
	CONSTRAINT "assets_status_check" CHECK ("assets"."status" IN ('pending', 'processing', 'ready', 'failed', 'deleted')),
	CONSTRAINT "assets_type_check" CHECK ("assets"."asset_type" IN ('image', 'video', 'pdf', 'docx', 'other'))
);
--> statement-breakpoint
CREATE TABLE "files" (
	"id" serial PRIMARY KEY NOT NULL,
	"asset_id" integer NOT NULL,
	"uploaded_by" integer NOT NULL,
	"original_file_name" varchar(255) NOT NULL,
	"description" text,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "boat_documents" (
	"id" serial PRIMARY KEY NOT NULL,
	"boat_id" integer NOT NULL,
	"file_id" integer NOT NULL,
	"document_type" varchar(50) NOT NULL,
	"description" text,
	"expiry_date" date,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "boat_images" (
	"boat_id" integer NOT NULL,
	"file_id" integer NOT NULL,
	"is_primary" boolean DEFAULT false,
	"sort_order" integer DEFAULT 0,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "boat_images_boat_id_file_id_pk" PRIMARY KEY("boat_id","file_id")
);
--> statement-breakpoint
CREATE TABLE "boat_maintenance_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"boat_id" integer NOT NULL,
	"maintenance_date" date NOT NULL,
	"description" text NOT NULL,
	"cost_tk" numeric(10, 2),
	"vendor_name" varchar(255),
	"notes" text,
	"created_by" integer NOT NULL,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "boats" (
	"id" serial PRIMARY KEY NOT NULL,
	"public_id" varchar(26) NOT NULL,
	"sector" varchar(50) NOT NULL,
	"name" varchar(255) NOT NULL,
	"registration_number" varchar(100),
	"capacity_value" numeric(10, 2),
	"capacity_unit" varchar(10) DEFAULT 'cubic_ft',
	"length_m" numeric(8, 2),
	"width_m" numeric(8, 2),
	"draft_m" numeric(8, 2),
	"engine_make" varchar(100),
	"engine_hp" numeric(6, 1),
	"engine_notes" text,
	"boat_value_tk" numeric(12, 2),
	"status" varchar(20) DEFAULT 'active' NOT NULL,
	"notes" text,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "boats_public_id_unique" UNIQUE("public_id"),
	CONSTRAINT "boats_registration_number_unique" UNIQUE("registration_number"),
	CONSTRAINT "boats_status_check" CHECK ("boats"."status" IN ('active', 'inactive', 'maintenance', 'decommissioned')),
	CONSTRAINT "boats_capacity_unit_check" CHECK ("boats"."capacity_unit" IS NULL OR "boats"."capacity_unit" IN ('cubic_ft', 'ton', 'cubic_m')),
	CONSTRAINT "boats_sector_check" CHECK ("boats"."sector" IN ('sand', 'lime-stone', 'brick'))
);
--> statement-breakpoint
CREATE TABLE "sand_trip_attachments" (
	"sand_trip_id" integer NOT NULL,
	"file_id" integer NOT NULL,
	"description" text,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "sand_trip_attachments_sand_trip_id_file_id_pk" PRIMARY KEY("sand_trip_id","file_id")
);
--> statement-breakpoint
CREATE TABLE "sand_trip_expenses" (
	"id" serial PRIMARY KEY NOT NULL,
	"public_id" varchar(26) NOT NULL,
	"sand_trip_id" integer NOT NULL,
	"category" varchar(50) NOT NULL,
	"description" text,
	"amount_tk" numeric(10, 2) NOT NULL,
	"expense_date" date,
	"created_by" integer NOT NULL,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "sand_trip_expenses_public_id_unique" UNIQUE("public_id"),
	CONSTRAINT "sand_trip_expenses_category_check" CHECK ("sand_trip_expenses"."category" IN ('fuel', 'labour', 'maintenance', 'toll_payment', 'loading_fee', 'engine_repair', 'other'))
);
--> statement-breakpoint
CREATE TABLE "sand_trips" (
	"id" serial PRIMARY KEY NOT NULL,
	"public_id" varchar(26) NOT NULL,
	"boat_id" integer NOT NULL,
	"source_ghat_id" integer,
	"dest_ghat_id" integer,
	"departure_time" timestamp with time zone NOT NULL,
	"arrival_time" timestamp with time zone,
	"cargo_value" numeric(10, 2),
	"cargo_unit" varchar(10) DEFAULT 'cubic_ft',
	"sale_amount_tk" numeric(12, 2),
	"buyer_name" varchar(255),
	"buyer_phone" varchar(20),
	"purchase_rate_per_unit_tk" numeric(10, 2),
	"purchase_cost_tk" numeric(12, 2),
	"govt_royalty_rate_tk" numeric(10, 2),
	"govt_royalty_tk" numeric(12, 2),
	"local_toll_rate_tk" numeric(10, 2),
	"local_toll_tk" numeric(12, 2),
	"total_operating_cost_tk" numeric(12, 2),
	"net_profit_tk" numeric(12, 2),
	"status" varchar(20) DEFAULT 'scheduled' NOT NULL,
	"notes" text,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "sand_trips_public_id_unique" UNIQUE("public_id"),
	CONSTRAINT "sand_trips_status_check" CHECK ("sand_trips"."status" IN ('scheduled', 'loading', 'in_transit', 'completed', 'cancelled')),
	CONSTRAINT "sand_trips_cargo_unit_check" CHECK ("sand_trips"."cargo_unit" IS NULL OR "sand_trips"."cargo_unit" IN ('cubic_ft', 'ton', 'cubic_m'))
);
--> statement-breakpoint
ALTER TABLE "admin_details" ADD CONSTRAINT "admin_details_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actor_id_users_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "districts" ADD CONSTRAINT "districts_division_id_divisions_id_fk" FOREIGN KEY ("division_id") REFERENCES "public"."divisions"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ghats" ADD CONSTRAINT "ghats_upazila_id_upazilas_id_fk" FOREIGN KEY ("upazila_id") REFERENCES "public"."upazilas"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_blocked_by_users_id_fk" FOREIGN KEY ("blocked_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "report_attachments" ADD CONSTRAINT "report_attachments_report_id_reports_id_fk" FOREIGN KEY ("report_id") REFERENCES "public"."reports"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "report_attachments" ADD CONSTRAINT "report_attachments_file_id_files_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."files"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reports" ADD CONSTRAINT "reports_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reports" ADD CONSTRAINT "reports_resolved_by_users_id_fk" FOREIGN KEY ("resolved_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "todos" ADD CONSTRAINT "todos_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "upazilas" ADD CONSTRAINT "upazilas_district_id_districts_id_fk" FOREIGN KEY ("district_id") REFERENCES "public"."districts"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_subscriptions" ADD CONSTRAINT "user_subscriptions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_subscriptions" ADD CONSTRAINT "user_subscriptions_plan_id_subscription_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."subscription_plans"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_avatar_file_id_files_id_fk" FOREIGN KEY ("avatar_file_id") REFERENCES "public"."files"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "files" ADD CONSTRAINT "files_asset_id_assets_id_fk" FOREIGN KEY ("asset_id") REFERENCES "public"."assets"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "files" ADD CONSTRAINT "files_uploaded_by_users_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "boat_documents" ADD CONSTRAINT "boat_documents_boat_id_boats_id_fk" FOREIGN KEY ("boat_id") REFERENCES "public"."boats"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "boat_documents" ADD CONSTRAINT "boat_documents_file_id_files_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."files"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "boat_images" ADD CONSTRAINT "boat_images_boat_id_boats_id_fk" FOREIGN KEY ("boat_id") REFERENCES "public"."boats"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "boat_images" ADD CONSTRAINT "boat_images_file_id_files_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."files"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "boat_maintenance_logs" ADD CONSTRAINT "boat_maintenance_logs_boat_id_boats_id_fk" FOREIGN KEY ("boat_id") REFERENCES "public"."boats"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "boat_maintenance_logs" ADD CONSTRAINT "boat_maintenance_logs_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sand_trip_attachments" ADD CONSTRAINT "sand_trip_attachments_sand_trip_id_sand_trips_id_fk" FOREIGN KEY ("sand_trip_id") REFERENCES "public"."sand_trips"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sand_trip_attachments" ADD CONSTRAINT "sand_trip_attachments_file_id_files_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."files"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sand_trip_expenses" ADD CONSTRAINT "sand_trip_expenses_sand_trip_id_sand_trips_id_fk" FOREIGN KEY ("sand_trip_id") REFERENCES "public"."sand_trips"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sand_trip_expenses" ADD CONSTRAINT "sand_trip_expenses_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sand_trips" ADD CONSTRAINT "sand_trips_boat_id_boats_id_fk" FOREIGN KEY ("boat_id") REFERENCES "public"."boats"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sand_trips" ADD CONSTRAINT "sand_trips_source_ghat_id_ghats_id_fk" FOREIGN KEY ("source_ghat_id") REFERENCES "public"."ghats"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sand_trips" ADD CONSTRAINT "sand_trips_dest_ghat_id_ghats_id_fk" FOREIGN KEY ("dest_ghat_id") REFERENCES "public"."ghats"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_audit_logs_actor" ON "audit_logs" USING btree ("actor_id");--> statement-breakpoint
CREATE INDEX "idx_audit_logs_action" ON "audit_logs" USING btree ("action");--> statement-breakpoint
CREATE INDEX "idx_audit_logs_entity" ON "audit_logs" USING btree ("entity_type","entity_id");--> statement-breakpoint
CREATE INDEX "idx_audit_logs_created_at" ON "audit_logs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_districts_division" ON "districts" USING btree ("division_id");--> statement-breakpoint
CREATE INDEX "idx_divisions_slug" ON "divisions" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "idx_ghats_upazila" ON "ghats" USING btree ("upazila_id");--> statement-breakpoint
CREATE INDEX "idx_ghats_is_active" ON "ghats" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "idx_otps_email" ON "otps" USING btree ("email");--> statement-breakpoint
CREATE INDEX "idx_otps_expires_at" ON "otps" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "idx_platform_accounts_is_active" ON "platform_accounts" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "idx_profiles_is_blocked" ON "profiles" USING btree ("is_blocked");--> statement-breakpoint
CREATE INDEX "idx_report_attachments_report" ON "report_attachments" USING btree ("report_id");--> statement-breakpoint
CREATE INDEX "idx_reports_public_id" ON "reports" USING btree ("public_id");--> statement-breakpoint
CREATE INDEX "idx_reports_user" ON "reports" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_reports_status" ON "reports" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_reports_category" ON "reports" USING btree ("category");--> statement-breakpoint
CREATE INDEX "idx_subscription_plans_sector" ON "subscription_plans" USING btree ("sector");--> statement-breakpoint
CREATE INDEX "idx_subscription_plans_is_active" ON "subscription_plans" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "idx_subscription_plans_deleted_at" ON "subscription_plans" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX "idx_todos_public_id" ON "todos" USING btree ("public_id");--> statement-breakpoint
CREATE INDEX "idx_todos_user" ON "todos" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_todos_is_done" ON "todos" USING btree ("is_done");--> statement-breakpoint
CREATE INDEX "idx_todos_due_date" ON "todos" USING btree ("due_date");--> statement-breakpoint
CREATE INDEX "idx_upazilas_district" ON "upazilas" USING btree ("district_id");--> statement-breakpoint
CREATE INDEX "idx_user_subscriptions_user" ON "user_subscriptions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_user_subscriptions_status" ON "user_subscriptions" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_user_subscriptions_ends_at" ON "user_subscriptions" USING btree ("ends_at");--> statement-breakpoint
CREATE INDEX "idx_users_public_id" ON "users" USING btree ("public_id");--> statement-breakpoint
CREATE INDEX "idx_users_role" ON "users" USING btree ("role");--> statement-breakpoint
CREATE INDEX "idx_assets_hash" ON "assets" USING btree ("file_hash");--> statement-breakpoint
CREATE INDEX "idx_files_asset" ON "files" USING btree ("asset_id");--> statement-breakpoint
CREATE INDEX "idx_files_user" ON "files" USING btree ("uploaded_by");--> statement-breakpoint
CREATE INDEX "idx_boat_docs_boat" ON "boat_documents" USING btree ("boat_id");--> statement-breakpoint
CREATE INDEX "idx_boat_docs_expiry" ON "boat_documents" USING btree ("expiry_date");--> statement-breakpoint
CREATE INDEX "idx_boat_images_boat" ON "boat_images" USING btree ("boat_id");--> statement-breakpoint
CREATE INDEX "idx_boat_maintenance_boat" ON "boat_maintenance_logs" USING btree ("boat_id");--> statement-breakpoint
CREATE INDEX "idx_boat_maintenance_date" ON "boat_maintenance_logs" USING btree ("maintenance_date");--> statement-breakpoint
CREATE INDEX "idx_boats_public_id" ON "boats" USING btree ("public_id");--> statement-breakpoint
CREATE INDEX "idx_boats_sector" ON "boats" USING btree ("sector");--> statement-breakpoint
CREATE INDEX "idx_boats_status" ON "boats" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_sand_trip_attachments_trip" ON "sand_trip_attachments" USING btree ("sand_trip_id");--> statement-breakpoint
CREATE INDEX "idx_sand_trip_expenses_trip" ON "sand_trip_expenses" USING btree ("sand_trip_id");--> statement-breakpoint
CREATE INDEX "idx_sand_trips_boat" ON "sand_trips" USING btree ("boat_id");--> statement-breakpoint
CREATE INDEX "idx_sand_trips_public_id" ON "sand_trips" USING btree ("public_id");--> statement-breakpoint
CREATE INDEX "idx_sand_trips_status" ON "sand_trips" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_sand_trips_departure" ON "sand_trips" USING btree ("departure_time");--> statement-breakpoint
CREATE INDEX "idx_sand_trips_source_ghat" ON "sand_trips" USING btree ("source_ghat_id");--> statement-breakpoint
CREATE INDEX "idx_sand_trips_dest_ghat" ON "sand_trips" USING btree ("dest_ghat_id");