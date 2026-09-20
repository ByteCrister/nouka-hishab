// src/lib/pdf/report-engine.ts
// ─── PDF Report Engine ────────────────────────────────────────────────────────
// Orchestrates the full generate → chunk → PDF → download/zip pipeline.
// All functions are async and run entirely in the browser.
//
// Architecture:
//   SandTripReportDTO / SingleSandTripReportDTO (from API)
//     └─ generateSandTripPdfs()  → Blob[] + filenames[]
//     └─ generateSingleTripPdf() → Blob + filename
//           └─ downloadSinglePdf()  (1 PDF)
//           └─ downloadAsZip()      (N > 1 PDFs)

import React from 'react';
import { pdf, DocumentProps } from '@react-pdf/renderer';

import type { SandTripReportDTO, SingleSandTripReportDTO } from '@/types/sand-report.types';
import type { AppLocale } from '@/constants/common.const';
import { PDF_STRINGS } from './pdf-i18n';
import { chunk } from './chunk';
import {
  createReportFilename,
  createSingleTripFilename,
  downloadBlob,
} from './pdf-utils';
import { SandTripReportDocument } from './SandTripReportDocument';
import { SingleSandTripReportDocument } from './SingleSandTripReportDocument';
import { MaintenanceReportDocument } from './MaintenanceReportDocument';
import type { MaintenanceListItem, MaintenanceKpis } from '@/types/maintenance.types';

// ─── Constants ────────────────────────────────────────────────────────────────
// Max rows that comfortably fit on a landscape A4 page before overflow.
// A4 landscape usable height ≈ 480pt; table header ≈ 30pt; each row ≈ 18pt.
// 480 - 30 - meta(40) - footer(24) ≈ 386pt / 18pt ≈ 21 rows.
// We use 20 as a safe default so nothing ever clips.
export const DEFAULT_ROWS_PER_PDF = 20;

// ─── Multi-trip generation ────────────────────────────────────────────────────

/**
 * Generates one PDF Blob per chunk of rows.
 *
 * @returns { blobs, filenames } — parallel arrays, same length.
 */
export async function generateSandTripPdf(
  dto: SandTripReportDTO,
  locale: AppLocale = 'en',
  rowsPerPage: number = DEFAULT_ROWS_PER_PDF
): Promise<{ blob: Blob; filename: string }> {
  const strings = PDF_STRINGS[locale];
  const element = React.createElement(SandTripReportDocument, {
    meta: dto.meta,
    rows: dto.rows,
    strings,
    rowsPerPage,
  }) as React.ReactElement<DocumentProps>;
  
  const blob = await pdf(element).toBlob();
  const filename = createReportFilename(
    dto.meta.boatName,
    dto.meta.fromDate,
    dto.meta.toDate
  );
  return { blob, filename };
}

// ─── Single-trip generation ───────────────────────────────────────────────────

/**
 * Generates a single PDF for one trip.
 */
export async function generateSingleTripPdf(
  dto: SingleSandTripReportDTO,
  locale: AppLocale = 'en'
): Promise<{ blob: Blob; filename: string }> {
  const strings = PDF_STRINGS[locale];
  const element = React.createElement(SingleSandTripReportDocument, { dto, strings }) as React.ReactElement<DocumentProps>;
  const blob = await pdf(element).toBlob();
  const filename = createSingleTripFilename(
    dto.meta.boatName,
    dto.meta.tripPublicId,
    dto.meta.departureTime
  );
  return { blob, filename };
}

// ─── Download helpers ─────────────────────────────────────────────────────────

/**
 * Triggers an immediate browser download for a single PDF blob.
 */
export async function downloadSinglePdf(blob: Blob, filename: string): Promise<void> {
  downloadBlob(blob, filename);
}



// ─── High-level convenience: generate + download in one call ──────────────────

/**
 * Full pipeline for the list-page export.
 * Generates all PDFs from the DTO and downloads them (single PDF or ZIP).
 */
export async function exportSandTripReport(
  dto: SandTripReportDTO,
  locale: AppLocale = 'en',
  rowsPerPage: number = DEFAULT_ROWS_PER_PDF
): Promise<void> {
  const { blob, filename } = await generateSandTripPdf(dto, locale, rowsPerPage);
  await downloadSinglePdf(blob, filename);
}

/**
 * Full pipeline for the detail-page export.
 * Generates and downloads the single-trip PDF.
 */
export async function exportSingleSandTripReport(
  dto: SingleSandTripReportDTO,
  locale: AppLocale = 'en'
): Promise<void> {
  const { blob, filename } = await generateSingleTripPdf(dto, locale);
  await downloadSinglePdf(blob, filename);
}

export async function generateMaintenancePdf(
  items: MaintenanceListItem[],
  kpis?: MaintenanceKpis,
  locale: AppLocale = 'en'
): Promise<{ blob: Blob; filename: string }> {
  const strings = PDF_STRINGS[locale];
  const element = React.createElement(MaintenanceReportDocument, { items, kpis, strings }) as React.ReactElement<DocumentProps>;
  const blob = await pdf(element).toBlob();
  const filename = `maintenance-report-${new Date().toISOString().split('T')[0]}.pdf`;
  return { blob, filename };
}

export async function exportMaintenanceReport(
  items: MaintenanceListItem[],
  kpis?: MaintenanceKpis,
  locale: AppLocale = 'en'
): Promise<void> {
  const { blob, filename } = await generateMaintenancePdf(items, kpis, locale);
  await downloadSinglePdf(blob, filename);
}


