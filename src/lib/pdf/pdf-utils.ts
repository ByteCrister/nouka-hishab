// src/lib/pdf/pdf-utils.ts
// ─── Shared PDF formatting helpers ───────────────────────────────────────────
// All helpers are pure functions (no side-effects) so they can be imported by
// both the PDF document components and the report engine.

import type { AppLocale } from '@/constants/common.const';

// ── Currency formatting ───────────────────────────────────────────────────────

/**
 * Formats a number as Bangladeshi Taka.
 *
 * @example
 *   formatCurrency(123456, 'en') → "৳ 1,23,456"
 *   formatCurrency(null, 'bn') → "—"
 */
export function formatCurrency(
  value: number | null | undefined,
  locale: AppLocale = 'en'
): string {
  if (value == null) return '—';
  const symbol = '৳';
  // en-IN gives the South Asian grouping (1,23,456) which Bangladesh uses too.
  const formatted = Math.abs(value).toLocaleString('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
  const sign = value < 0 ? '-' : '';
  void locale; // locale reserved for future Bangla numeral rendering
  return `${sign}${symbol} ${formatted}`;
}

// ── Date formatting ───────────────────────────────────────────────────────────

/**
 * Formats an ISO date/datetime string into DD/MM/YY.
 *
 * @example formatDate("2026-08-01T10:00:00Z") → "01/08/26"
 */
export function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  try {
    const d = new Date(iso);
    const dd = String(d.getUTCDate()).padStart(2, '0');
    const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
    const yy = String(d.getUTCFullYear()).slice(-2);
    return `${dd}/${mm}/${yy}`;
  } catch {
    return iso;
  }
}

/**
 * Returns a human-readable period string.
 *
 * @example formatPeriod("2026-08-01", "2026-08-31", 'en') → "01/08/26 – 31/08/26"
 */
export function formatPeriod(
  from: string,
  to: string
): string {
  return `${formatDate(from)} – ${formatDate(to)}`;
}

// ── Filename helpers ──────────────────────────────────────────────────────────

/**
 * Creates a safe filename slug from a boat name.
 * "MV Rahman Bhai" → "MV-Rahman-Bhai"
 */
function slugifyBoatName(name: string): string {
  return name
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-zA-Z0-9\u0980-\u09FF\-_]/g, '');
}

/**
 * Builds a report filename for a multi-trip PDF part.
 *
 * @example
 *   createReportFilename("MV Rahman", "2026-08-01", "2026-08-31", 1, 2)
 *   → "MV-Rahman-01-08-26-to-31-08-26-Part-1-of-2.pdf"
 */
export function createReportFilename(
  boatName: string,
  fromDate: string,
  toDate: string,
  partNumber: number,
  totalParts: number
): string {
  const slug = slugifyBoatName(boatName);
  const from = formatDate(fromDate).replace(/\//g, '-');
  const to = formatDate(toDate).replace(/\//g, '-');
  return `${slug}-${from}-to-${to}-Part-${partNumber}-of-${totalParts}.pdf`;
}

/**
 * Builds a filename for a single-trip PDF.
 *
 * @example
 *   createSingleTripFilename("MV Rahman", "01JXXX", "2026-08-01T10:00:00Z")
 *   → "MV-Rahman-Trip-01JXXX-01-08-26.pdf"
 */
export function createSingleTripFilename(
  boatName: string,
  tripPublicId: string,
  departureTime: string
): string {
  const slug = slugifyBoatName(boatName);
  const date = formatDate(departureTime).replace(/\//g, '-');
  return `${slug}-Trip-${tripPublicId}-${date}.pdf`;
}

/**
 * Builds a ZIP filename for multi-PDF exports.
 *
 * @example
 *   createZipFilename("MV Rahman", "2026-08-01", "2026-08-31")
 *   → "MV-Rahman-01-08-26-to-31-08-26-Reports.zip"
 */
export function createZipFilename(
  boatName: string,
  fromDate: string,
  toDate: string
): string {
  const slug = slugifyBoatName(boatName);
  const from = formatDate(fromDate).replace(/\//g, '-');
  const to = formatDate(toDate).replace(/\//g, '-');
  return `${slug}-${from}-to-${to}-Reports.zip`;
}

// ── Browser download trigger ──────────────────────────────────────────────────

/**
 * Triggers a browser download for a Blob.
 * Works in all modern browsers.
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}
