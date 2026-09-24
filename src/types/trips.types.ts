import type { PaginationMeta, SortOrder } from '@/types/api.types';
import type { SectorName } from '@/constants/db/app.const';
import type { SandTripStatus, SandCargoUnit } from '@/constants/db/sand.const';
import type { TripExpenseCategory } from '@/constants/db/trips.const';

export interface BoatMeta {
  id: number;
  publicId: string;
  name: string;
  capacityValue: number | null;
  capacityUnit: string | null;
}

export interface TripListItem {
  publicId: string;
  boatName: string;
  boatPublicId: string;
  source: string | null;
  destination: string | null;
  departureTime: string;
  arrivalTime: string | null;
  cargoValue: number | null;
  cargoUnit: string | null;
  saleAmountTk: number | null;
  netProfitTk: number | null;
  status: string;
  createdAt: string;
  sector: SectorName;
}

export interface SandTripDetail extends Omit<TripListItem, 'cargoUnit' | 'status'> {
  cargoUnit: SandCargoUnit | null;
  status: SandTripStatus;
  buyerName: string | null;
  buyerPhone: string | null;
  saleRatePerUnitTk: number | null;
  purchaseRatePerUnitTk: number | null;
  purchaseCostTk: number | null;
  govtRoyaltyRateTk: number | null;
  govtRoyaltyTk: number | null;
  localTollRateTk: number | null;
  localTollTk: number | null;
  operatingCostRatePerUnitTk: number | null;
  operatingCostTk: number | null;
  totalOperatingCostTk: number | null;
  notes: string | null;
  expenses: TripExpenseItem[];
  attachments: TripAttachmentItem[];
  updatedAt: string;
}

export type TripSortField =
  | 'departureTime'
  | 'createdAt'
  | 'netProfitTk'
  | 'saleAmountTk';

export interface TripsFilters {
  status: string | 'all';
  boatPublicId: string | null;
  search: string;
  fromDate: string | null;
  toDate: string | null;
  sortBy: TripSortField;
  sortOrder: SortOrder;
  page: number;
  limit: number;
}

export interface CreateSandTripPayload {
  boatPublicId: string;
  source?: string | null;
  destination?: string | null;
  departureTime: string;
  arrivalTime?: string | null;
  cargoValue?: number | null;
  cargoUnit?: SandCargoUnit | null;
  saleRatePerUnitTk?: number | null;
  saleAmountTk?: number | null;
  buyerName?: string | null;
  buyerPhone?: string | null;
  purchaseRatePerUnitTk?: number | null;
  purchaseCostTk?: number | null;
  govtRoyaltyRateTk?: number | null;
  govtRoyaltyTk?: number | null;
  localTollRateTk?: number | null;
  localTollTk?: number | null;
  operatingCostRatePerUnitTk?: number | null;
  operatingCostTk?: number | null;
  status?: SandTripStatus;
  notes?: string | null;
}

export type UpdateSandTripPayload = Partial<CreateSandTripPayload>;

export interface TripExpenseItem {
  publicId: string;
  category: TripExpenseCategory;
  description: string | null;
  amountTk: number;
  expenseDate: string | null;
  createdAt: string;
}

export interface CreateTripExpensePayload {
  boatPublicId: string;
  sandTripId?: number | null;
  category: TripExpenseCategory;
  description?: string | null;
  amountTk: number;
  expenseDate?: string | null;
}

export type UpdateTripExpensePayload = Partial<CreateTripExpensePayload>;

export interface TripAttachmentItem {
  id: number;
  fileId: number;
  description: string | null;
  createdAt: string;
  url: string;
  originalFileName: string;
}

export interface CreateTripAttachmentPayload {
  boatPublicId: string;
  sandTripId?: number | null;
  fileId: number;
  description?: string | null;
}

export interface TripKpis {
  totalTrips: number;
  totalProfitTk: number;
  totalCostTk: number;
}

export interface TripListResponse {
  items: TripListItem[];
  meta: PaginationMeta;
  kpis: TripKpis;
}




