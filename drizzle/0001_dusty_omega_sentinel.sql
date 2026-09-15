ALTER TABLE "subscription_plans" ALTER COLUMN "sector" SET DEFAULT 'sand';--> statement-breakpoint
ALTER TABLE "subscription_plans" ALTER COLUMN "sector" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "boats" ALTER COLUMN "sector" SET DEFAULT 'sand';--> statement-breakpoint
ALTER TABLE "boats" ALTER COLUMN "sector" DROP NOT NULL;