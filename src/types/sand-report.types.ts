// src/types/sand-report.types.ts
// ─── Report DTOs ─────────────────────────────────────────────────────────────
// These types represent the clean, typed data shapes passed from the API to the
// PDF engine.  They are intentionally separate from the database entity types
// so that PDF layout code never depends on raw Drizzle schema details.

// ── Expense breakdown row (embedded inside a trip row) ──────────────────────
export interface SandTripExpenseReportRow {
  category: string;
  description: string | null;
  amountTk: number;
}

// ── Single trip row inside a report ─────────────────────────────────────────
export interface SandTripReportRow {
  serial: number;
  publicId: string;
  /** ISO date string of departure (formatted by pdf-utils before rendering) */
  date: string;
  source: string | null;
  destination: string | null;
  cargoValue: number | null;
  cargoUnit: string | null;
  saleAmountTk: number | null;
  purchaseCostTk: number | null;
  govtRoyaltyTk: number | null;
  localTollTk: number | null;
  totalOperatingCostTk: number | null;
  netProfitTk: number | null;
  status: string;
  buyerName?: string | null;
  buyerPhone?: string | null;
  purchaseRatePerUnitTk?: number | null;
  govtRoyaltyRateTk?: number | null;
  localTollRateTk?: number | null;
  expenses: SandTripExpenseReportRow[];
}

// ── Report metadata rendered in the PDF header ───────────────────────────────
export interface SandTripReportMeta {
  boatName: string;
  boatPublicId: string;
  fromDate: string;
  toDate: string;
  generatedAt: string; // ISO timestamp
  totalTrips: number;
  totalSaleAmountTk: number;
  totalPurchaseCostTk: number;
  totalGovtRoyaltyTk: number;
  totalLocalTollTk: number;
  totalOperatingCostTk: number;
  totalNetProfitTk: number;
}

// ── Full report DTO — returned by the list-report API ───────────────────────
export interface SandTripReportDTO {
  meta: SandTripReportMeta;
  rows: SandTripReportRow[];
}

// ── Single-trip report DTO — returned by the detail-report API ───────────────
export interface SingleSandTripReportDTO {
  meta: Omit<SandTripReportMeta, 'fromDate' | 'toDate'> & {
    tripPublicId: string;
    departureTime: string; // ISO timestamp
    arrivalTime: string | null; // ISO timestamp
  };
  row: SandTripReportRow;
}

// ── Filters sent from the UI to trigger the list-report query ────────────────
export interface SandTripsReportFilters {
  boatPublicId: string;
  fromDate: string; // "YYYY-MM-DD"
  toDate: string;   // "YYYY-MM-DD"
}

