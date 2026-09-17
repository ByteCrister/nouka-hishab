// src/types/sand/boats.ts
import type { PaginationMeta, SortOrder } from '@/types/api.types';
import type { BoatCapacityUnit, BoatStatus } from '@/constants/boats.const';
import type { SandCargoUnit, SandTripStatus } from '@/constants/db/sand.const';
import type { SectorName } from '@/constants/db/app.const';


// ─── Nested resources ──────────────────────────────────────────────────────
export interface BoatImage {
  fileId: number;
  url: string;
  isPrimary: boolean;
  sortOrder: number;
}

export interface BoatDocument {
  id: number;
  fileId: number;
  documentType: string;
  description: string | null;
  expiryDate: string | null;
  url: string;
  format: string | null;
  createdAt: string;
  updatedAt: string;
}


// ─── List item (kept lean for the boats table) ─────────────────────────────
export interface BoatListItem {
  id: number;
  publicId: string;
  sector: SectorName;
  name: string;
  capacityValue: number | null;
  capacityUnit: BoatCapacityUnit | null;
  status: BoatStatus;
  primaryImageUrl: string | null;
  totalTrips: number;
  lastTripAt: string | null;
}

// ─── Full detail (detail page) ─────────────────────────────────────────────
export interface BoatDetail extends BoatListItem {
  registrationNumber: string | null;
  lengthM: number | null;
  widthM: number | null;
  draftM: number | null;
  engineMake: string | null;
  engineHp: number | null;
  engineNotes: string | null;
  boatValueTk: number | null;
  notes: string | null;
  images: BoatImage[];
  documents: BoatDocument[];
  updatedAt: string;
}

// ─── KPIs ──────────────────────────────────────────────────────────────────
export interface BoatListKpis {
  totalBoats: number;
  activeBoats: number;
  maintenanceBoats: number;
  inactiveBoats: number;
  totalFleetCapacity: number;
  totalFleetValueTk: number;
}

export interface BoatDetailKpis {
  totalTrips: number;
  completedTrips: number;
  ongoingTrips: number;
  totalCargoMoved: number;
  totalRevenueTk: number;
  totalOperatingCostTk: number;
  netProfitTk: number;
  totalMaintenanceCostTk: number;
  avgProfitPerTripTk: number;
  lastTripAt: string | null;
}

// ─── Filters / sorting ─────────────────────────────────────────────────────
export type BoatSortField =
  | 'name'
  | 'createdAt'
  | 'capacityValue'
  | 'boatValueTk'
  | 'status';

export interface BoatListFilters {
  sector: SectorName | 'all';
  search: string;
  status: BoatStatus | 'all';
  sortBy: BoatSortField;
  sortOrder: SortOrder;
  page: number;
  limit: number;
}

export type BoatTripSortField =
  | 'departureTime'
  | 'netProfitTk'
  | 'saleAmountTk';

export interface BoatTripsFilters {
  status: SandTripStatus | 'all';
  search: string;
  fromDate: string | null; // ISO yyyy-mm-dd
  toDate: string | null;
  sortBy: BoatTripSortField;
  sortOrder: SortOrder;
  page: number;
  limit: number;
}

// ─── Trip row shown on boat detail page ────────────────────────────────────
export interface BoatTripListItem {
  id: number;
  publicId: string;
  boatId: number;
  source: string | null;
  destination: string | null;
  departureTime: string;
  arrivalTime: string | null;
  cargoValue: number | null;
  cargoUnit: SandCargoUnit | null;
  saleAmountTk: number | null;
  netProfitTk: number | null;
  status: SandTripStatus;
}

// ─── Request payloads ──────────────────────────────────────────────────────
export interface CreateBoatPayload {
  name: string;
  sector: SectorName;
  registrationNumber?: string | null;
  lengthM?: number | null;
  widthM?: number | null;
  draftM?: number | null;
  engineMake?: string | null;
  engineHp?: number | null;
  engineNotes?: string | null;
  boatValueTk?: number | null;
  capacityValue?: number | null;
  capacityUnit?: BoatCapacityUnit | null;
  status?: BoatStatus;
  notes?: string | null;
}

export type UpdateBoatPayload = Partial<CreateBoatPayload>;

export interface AddBoatImagePayload {
  fileId: number;
  isPrimary?: boolean;
}

export interface AddBoatDocumentPayload {
  fileId: number;
  documentType: string;
  description?: string;
  expiryDate?: string;
}

// ─── API response contracts ────────────────────────────────────────────────
export interface BoatListResponse {
  items: BoatListItem[];
  meta: PaginationMeta;
  kpis: BoatListKpis;
}

export interface BoatDetailResponse {
  boat: BoatDetail;
  kpis: BoatDetailKpis;
}

export interface BoatTripsResponse {
  items: BoatTripListItem[];
  meta: PaginationMeta;
}