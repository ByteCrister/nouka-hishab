-- Custom SQL migration file, put your code below! --
ALTER TABLE "sand_trips" ADD COLUMN "sale_rate_per_unit_tk" numeric(10, 2);
ALTER TABLE "sand_trips" ADD COLUMN "operating_cost_rate_per_unit_tk" numeric(10, 2);

-- Update existing records with calculated per unit rates
UPDATE "sand_trips"
SET "sale_rate_per_unit_tk" = ROUND("sale_amount_tk" / "cargo_value", 2)
WHERE "sale_amount_tk" IS NOT NULL AND "cargo_value" IS NOT NULL AND "cargo_value" > 0;

UPDATE "sand_trips"
SET "operating_cost_rate_per_unit_tk" = ROUND("operating_cost_tk" / "cargo_value", 2)
WHERE "operating_cost_tk" IS NOT NULL AND "cargo_value" IS NOT NULL AND "cargo_value" > 0;