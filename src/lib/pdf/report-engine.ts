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
import JSZip from 'jszip';

import type { SandTripReportDTO, SingleSandTripReportDTO } from '@/types/sand-report.types';
import type { AppLocale } from '@/constants/common.const';
import { PDF_STRINGS } from './pdf-i18n';
import { chunk } from './chunk';
import {
  createReportFilename,
  createSingleTripFilename,
  createZipFilename,
  downloadBlob,
} from './pdf-utils';
import { SandTripReportDocument } from './SandTripReportDocument';
import { SingleSandTripReportDocument } from './SingleSandTripReportDocument';

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
export async function generateSandTripPdfs(
  dto: SandTripReportDTO,
  locale: AppLocale = 'en',
  rowsPerPdf: number = DEFAULT_ROWS_PER_PDF
): Promise<{ blobs: Blob[]; filenames: string[] }> {
  const strings = PDF_STRINGS[locale];
  const chunks = chunk(dto.rows, rowsPerPdf);
  const totalParts = chunks.length;

  const results = await Promise.all(
    chunks.map(async (rowChunk, idx) => {
      const partNumber = idx + 1;
      const element = React.createElement(SandTripReportDocument, {
        meta: dto.meta,
        rows: rowChunk,
        partNumber,
        totalParts,
        strings,
      }) as React.ReactElement<DocumentProps>;
      const blob = await pdf(element).toBlob();
      const filename = createReportFilename(
        dto.meta.boatName,
        dto.meta.fromDate,
        dto.meta.toDate,
        partNumber,
        totalParts
      );
      return { blob, filename };
    })
  );

  return {
    blobs: results.map((r) => r.blob),
    filenames: results.map((r) => r.filename),
  };
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

/**
 * Packages multiple PDF blobs into a ZIP and triggers download.
 *
 * @param blobs      - Array of PDF blobs (same order as filenames)
 * @param filenames  - Parallel array of per-file names
 * @param zipName    - Name for the resulting .zip file
 */
export async function downloadAsZip(
  blobs: Blob[],
  filenames: string[],
  zipName: string
): Promise<void> {
  const zip = new JSZip();
  blobs.forEach((blob, idx) => {
    zip.file(filenames[idx], blob);
  });
  const zipBlob = await zip.generateAsync({ type: 'blob' });
  downloadBlob(zipBlob, zipName);
}

// ─── High-level convenience: generate + download in one call ──────────────────

/**
 * Full pipeline for the list-page export.
 * Generates all PDFs from the DTO and downloads them (single PDF or ZIP).
 */
export async function exportSandTripReport(
  dto: SandTripReportDTO,
  locale: AppLocale = 'en',
  rowsPerPdf: number = DEFAULT_ROWS_PER_PDF
): Promise<void> {
  const { blobs, filenames } = await generateSandTripPdfs(dto, locale, rowsPerPdf);

  if (blobs.length === 1) {
    await downloadSinglePdf(blobs[0], filenames[0]);
  } else {
    const zipName = createZipFilename(
      dto.meta.boatName,
      dto.meta.fromDate,
      dto.meta.toDate
    );
    await downloadAsZip(blobs, filenames, zipName);
  }
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


