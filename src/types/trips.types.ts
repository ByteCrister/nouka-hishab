import type { PaginationMeta, SortOrder } from '@/types/api.types';
import type { SandTripStatus, SandCargoUnit, SandTripExpenseCategory } from '@/constants/db/sand.const';

export interface BoatMeta {
  publicId: string;
  name: string;
  sector: string;
  capacityValue: number | null;
  capacityUnit: string | null;
}

export interface TripListItem {
  publicId: string;
  boatName: string;
  boatPublicId: string;
  sector: 'sand' | 'brick' | 'limestone';
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
}

export interface SandTripDetail extends Omit<TripListItem, 'cargoUnit' | 'status'> {
  cargoUnit: SandCargoUnit | null;
  status: SandTripStatus;
  buyerName: string | null;
  buyerPhone: string | null;
  purchaseRatePerUnitTk: number | null;
  purchaseCostTk: number | null;
  govtRoyaltyRateTk: number | null;
  govtRoyaltyTk: number | null;
  localTollRateTk: number | null;
  localTollTk: number | null;
  operatingCostTk: number | null;
  totalOperatingCostTk: number | null;
  notes: string | null;
  expenses: SandTripExpenseItem[];
  attachments: SandTripAttachmentItem[];
  updatedAt: string;
}

export type TripSortField =
  | 'departureTime'
  | 'createdAt'
  | 'netProfitTk'
  | 'saleAmountTk';

export interface TripsFilters {
  sector: 'all' | 'sand' | 'brick' | 'limestone';
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
  saleAmountTk?: number | null;
  buyerName?: string | null;
  buyerPhone?: string | null;
  purchaseRatePerUnitTk?: number | null;
  purchaseCostTk?: number | null;
  govtRoyaltyRateTk?: number | null;
  govtRoyaltyTk?: number | null;
  localTollRateTk?: number | null;
  localTollTk?: number | null;
  operatingCostTk?: number | null;
  status?: SandTripStatus;
  notes?: string | null;
}

export type UpdateSandTripPayload = Partial<CreateSandTripPayload>;

export interface SandTripExpenseItem {
  publicId: string;
  category: SandTripExpenseCategory;
  description: string | null;
  amountTk: number;
  expenseDate: string | null;
  createdAt: string;
}

export interface CreateSandTripExpensePayload {
  category: SandTripExpenseCategory;
  description?: string | null;
  amountTk: number;
  expenseDate?: string | null;
}

export type UpdateSandTripExpensePayload = Partial<CreateSandTripExpensePayload>;

export interface SandTripAttachmentItem {
  fileId: number;
  description: string | null;
  createdAt: string;
  url: string;
  originalFileName: string;
}

export interface CreateSandTripAttachmentPayload {
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




