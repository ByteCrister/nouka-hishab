import type { PaginationMeta, SortOrder } from '@/types/api.types';
import type { SandTripStatus, SandCargoUnit, SandTripExpenseCategory } from '@/constants/db/sand.const';

export interface BoatMeta {
  publicId: string;
  name: string;
  sector: string;
  capacityValue: number | null;
  capacityUnit: string | null;
}

export interface SandTripListItem {
  publicId: string;
  boatName: string;
  boatPublicId: string;
  sourceLocation: LocationPayload | null;
  destLocation: LocationPayload | null;
  departureTime: string;
  arrivalTime: string | null;
  cargoValue: number | null;
  cargoUnit: SandCargoUnit | null;
  saleAmountTk: number | null;
  netProfitTk: number | null;
  status: SandTripStatus;
  createdAt: string;
}

export interface SandTripDetail extends SandTripListItem {
  buyerName: string | null;
  buyerPhone: string | null;
  purchaseRatePerUnitTk: number | null;
  purchaseCostTk: number | null;
  govtRoyaltyRateTk: number | null;
  govtRoyaltyTk: number | null;
  localTollRateTk: number | null;
  localTollTk: number | null;
  totalOperatingCostTk: number | null;
  notes: string | null;
  expenses: SandTripExpenseItem[];
  attachments: SandTripAttachmentItem[];
  updatedAt: string;
}

export type SandTripSortField =
  | 'departureTime'
  | 'createdAt'
  | 'netProfitTk'
  | 'saleAmountTk';

export interface SandTripsFilters {
  status: SandTripStatus | 'all';
  boatPublicId: string | null;
  search: string;
  fromDate: string | null;
  toDate: string | null;
  sortBy: SandTripSortField;
  sortOrder: SortOrder;
  page: number;
  limit: number;
}

export interface LocationPayload {
  name: string;
  lat?: number | null;
  lng?: number | null;
}

export interface CreateSandTripPayload {
  boatPublicId: string;
  sourceLocation?: LocationPayload | null;
  destLocation?: LocationPayload | null;
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

export interface SandTripKpis {
  totalTrips: number;
  totalProfitTk: number;
  totalCostTk: number;
}

export interface SandTripListResponse {
  items: SandTripListItem[];
  meta: PaginationMeta;
  kpis: SandTripKpis;
}

export interface SandTripDetailResponse {
  trip: SandTripDetail;
}
