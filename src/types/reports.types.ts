import type { PaginationMeta, SortOrder } from '@/types/api.types';
import type { ReportCategory, ReportStatus } from '@/constants/db/app.const';

// ─── Nested resources ──────────────────────────────────────────────────────
export interface ReportAttachment {
  fileId: number;
  reportId: number;
  url: string;
  createdAt: string;
}

// ─── List item (kept lean for the reports table) ───────────────────────────
export interface ReportListItem {
  id: number;
  publicId: string;
  category: ReportCategory;
  title: string;
  status: ReportStatus;
  createdAt: string;
}

// ─── Full detail (detail page) ─────────────────────────────────────────────
export interface ReportDetail extends ReportListItem {
  description: string | null;
  adminReply: string | null;
  resolvedAt: string | null;
  attachments: ReportAttachment[];
  updatedAt: string;
}

// ─── KPIs ──────────────────────────────────────────────────────────────────
export interface ReportListKpis {
  totalReports: number;
  openReports: number;
  inReviewReports: number;
  resolvedReports: number;
}

// ─── Filters / sorting ─────────────────────────────────────────────────────
export type ReportSortField =
  | 'createdAt'
  | 'status'
  | 'category';

export interface ReportListFilters {
  search: string;
  category: ReportCategory | 'all';
  status: ReportStatus | 'all';
  sortBy: ReportSortField;
  sortOrder: SortOrder;
  page: number;
  limit: number;
}

// ─── Request payloads ──────────────────────────────────────────────────────
export interface CreateReportPayload {
  title: string;
  category: ReportCategory;
  description?: string | null;
  attachmentIds?: number[];
}

export interface UpdateReportPayload {
  status?: ReportStatus;
  adminReply?: string | null;
}

export interface AddReportAttachmentPayload {
  fileId: number;
}

// ─── API response contracts ────────────────────────────────────────────────
export interface ReportListResponse {
  items: ReportListItem[];
  meta: PaginationMeta;
  kpis: ReportListKpis;
}

export interface ReportDetailResponse {
  report: ReportDetail;
}
