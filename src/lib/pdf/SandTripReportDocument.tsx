// src/lib/pdf/SandTripReportDocument.tsx
// ─── Multi-trip PDF document component ───────────────────────────────────────
// Rendered by @react-pdf/renderer.  One instance = one PDF part (chunk of rows).
// This component is intentionally self-contained — it accepts only serialisable
// props so it can be used in both BlobProvider (preview) and pdf().toBlob()
// (download) without modification.

import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from '@react-pdf/renderer';

import type { SandTripReportMeta, SandTripReportRow } from '@/types/sand-report.types';
import type { PdfStrings } from './pdf-i18n';
import { formatCurrency, formatDate } from './pdf-utils';
import { chunk } from './chunk';

import { Font } from '@react-pdf/renderer';

// ─── Font registration ────────────────────────────────────────────────────────
Font.register({
  family: 'HindSiliguri',
  fonts: [
    { src: '/fonts/HindSiliguri-Regular.ttf', fontWeight: 400 },
    { src: '/fonts/HindSiliguri-Bold.ttf', fontWeight: 700 },
  ],
});

// ─── Styles ───────────────────────────────────────────────────────────────────

const BRAND_PRIMARY = '#000000';
const TEXT_PRIMARY = '#000000';
const TEXT_SECONDARY = '#333333';
const BORDER = '#aaaaaa';
const SECTION_BG = '#f9f9f9';

const styles = StyleSheet.create({
  page: {
    fontFamily: 'HindSiliguri',
    fontSize: 8,
    color: TEXT_PRIMARY,
    paddingTop: 36,
    paddingBottom: 48,
    paddingHorizontal: 36,
    backgroundColor: '#ffffff',
  },

  // ── Header ──
  header: {
    marginBottom: 12,
    paddingBottom: 10,
    borderBottom: `2px solid ${BRAND_PRIMARY}`,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerLeft: {
    flexDirection: 'column',
    gap: 4,
  },
  appTitle: {
    fontSize: 20,
    fontWeight: 700,
    color: BRAND_PRIMARY,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  reportTitle: {
    fontSize: 10,
    color: TEXT_SECONDARY,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  headerRight: {
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: 4,
  },
  partBadge: {
    fontSize: 9,
    color: BRAND_PRIMARY,
    fontWeight: 700,
  },
  generatedText: {
    fontSize: 8,
    color: TEXT_SECONDARY,
  },

  // ── Meta info ──
  metaRow: {
    flexDirection: 'row',
    marginBottom: 12,
    paddingBottom: 10,
    borderBottom: `1px solid ${BORDER}`,
    gap: 24,
  },
  metaItem: {
    flexDirection: 'column',
    flex: 1,
  },
  metaLabel: {
    fontSize: 8,
    color: TEXT_SECONDARY,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  metaValue: {
    fontSize: 10,
    fontWeight: 700,
    color: BRAND_PRIMARY,
  },

  // ── Summary Box (Moved to top) ──
  summaryBox: {
    marginBottom: 16,
    backgroundColor: SECTION_BG,
    border: `1px solid ${BRAND_PRIMARY}`,
    padding: 12,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  summaryItem: {
    flexDirection: 'column',
    minWidth: '22%',
  },
  summaryLabel: {
    fontSize: 8,
    color: TEXT_SECONDARY,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  summaryValue: {
    fontSize: 11,
    fontWeight: 700,
    color: BRAND_PRIMARY,
  },

  // ── Table ──
  table: {
    width: '100%',
    marginBottom: 12,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: BRAND_PRIMARY,
    color: '#ffffff',
    paddingVertical: 6,
    marginBottom: 2,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 6,
    borderBottom: `1px solid ${BORDER}`,
  },
  tableRowAlt: {
    backgroundColor: SECTION_BG,
  },

  // Column widths (must sum to 100%)
  colSerial: { width: '4%', textAlign: 'center' },
  colDate: { width: '8%' },
  colRoute: { width: '15%' },
  colCargo: { width: '9%', textAlign: 'right' },
  colSale: { width: '10%', textAlign: 'right' },
  colPurchase: { width: '11%', textAlign: 'right' },
  colRoyalty: { width: '10%', textAlign: 'right' },
  colToll: { width: '9%', textAlign: 'right' },
  colOperating: { width: '11%', textAlign: 'right' },
  colProfit: { width: '13%', textAlign: 'right', paddingRight: 4 },

  headerCell: {
    fontSize: 8,
    fontWeight: 700,
    textTransform: 'uppercase',
  },
  cell: {
    fontSize: 8,
    color: TEXT_PRIMARY,
  },
  cellMuted: {
    color: TEXT_SECONDARY,
  },

  // ── Totals ──
  totalsRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderTop: `1px solid ${BRAND_PRIMARY}`,
    borderBottom: `2px solid ${BRAND_PRIMARY}`,
    marginTop: 4,
    backgroundColor: SECTION_BG,
  },
  totalsCell: {
    fontSize: 9,
    fontWeight: 700,
    color: BRAND_PRIMARY,
  },

  // ── Footer ──
  footer: {
    position: 'absolute',
    bottom: 24,
    left: 36,
    right: 36,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTop: `1px solid ${BORDER}`,
    paddingTop: 8,
  },
  footerText: {
    fontSize: 7,
    color: TEXT_SECONDARY,
  },
});

// ─── Types ───────────────────────────────────────────────────────────────────

interface Props {
  meta: SandTripReportMeta;
  rows: SandTripReportRow[];
  strings: PdfStrings;
  rowsPerPage?: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function routeLabel(row: SandTripReportRow): string {
  if (row.source && row.destination) return `${row.source} → ${row.destination}`;
  if (row.source) return row.source;
  if (row.destination) return row.destination;
  return '—';
}

function cargoLabel(row: SandTripReportRow): string {
  if (!row.cargoValue) return '—';
  return `${row.cargoValue.toLocaleString('en-IN')} ${row.cargoUnit ?? ''}`.trim();
}

// ─── Document ─────────────────────────────────────────────────────────────────

export function SandTripReportDocument({
  meta,
  rows,
  strings,
  rowsPerPage = 20,
}: Props) {
  const chunks = chunk(rows, rowsPerPage);
  const totalParts = chunks.length;

  const generatedDate = new Date(meta.generatedAt);
  const generatedStr = `${generatedDate.getUTCDate().toString().padStart(2, '0')}/${
    (generatedDate.getUTCMonth() + 1).toString().padStart(2, '0')}/${generatedDate.getUTCFullYear()}`;

  return (
    <Document>
      {chunks.map((chunkRows, idx) => {
        const partNumber = idx + 1;
        const chunkTotals = {
          sale: chunkRows.reduce((s, r) => s + (r.saleAmountTk ?? 0), 0),
          purchase: chunkRows.reduce((s, r) => s + (r.purchaseCostTk ?? 0), 0),
          royalty: chunkRows.reduce((s, r) => s + (r.govtRoyaltyTk ?? 0), 0),
          toll: chunkRows.reduce((s, r) => s + (r.localTollTk ?? 0), 0),
          operating: chunkRows.reduce((s, r) => s + (r.operatingCostTk ?? 0), 0),
          profit: chunkRows.reduce((s, r) => s + (r.netProfitTk ?? 0), 0),
        };

        return (
          <Page key={partNumber} size="A4" orientation="landscape" style={styles.page}>
            {/* ── Header ── */}
        <View style={styles.header} fixed>
          <View style={styles.headerLeft}>
            <Text style={styles.appTitle}>{strings.header.title}</Text>
            <Text style={styles.reportTitle}>{strings.header.reportTitle}</Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.partBadge}>
              {strings.meta.part} {partNumber} {strings.meta.of} {totalParts}
            </Text>
            <Text style={styles.generatedText}>
              {strings.meta.generated}: {generatedStr}
            </Text>
          </View>
        </View>

        {/* ── Meta ── */}
        <View style={styles.metaRow} fixed>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>{strings.meta.boat}</Text>
            <Text style={styles.metaValue}>{meta.boatName}</Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>{strings.meta.period}</Text>
            <Text style={styles.metaValue}>
              {formatDate(meta.fromDate)} – {formatDate(meta.toDate)}
            </Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>{strings.summary.totalTrips} ({strings.meta.part} {partNumber})</Text>
            <Text style={styles.metaValue}>{chunkRows.length}</Text>
          </View>
        </View>

        {/* ── Full-report summary (Moved to top, only on first part ideally, but we show it if requested or on all parts if desired. Actually, usually it was only on last part. Let's put it on the first part so it's top of the report) ── */}
        {partNumber === 1 && (
          <View style={styles.summaryBox}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>{strings.summary.totalTrips}</Text>
              <Text style={styles.summaryValue}>{meta.totalTrips}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>{strings.summary.totalSale}</Text>
              <Text style={styles.summaryValue}>{formatCurrency(meta.totalSaleAmountTk)}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>{strings.summary.totalPurchase}</Text>
              <Text style={styles.summaryValue}>{formatCurrency(meta.totalPurchaseCostTk)}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>{strings.summary.totalRoyalty}</Text>
              <Text style={styles.summaryValue}>{formatCurrency(meta.totalGovtRoyaltyTk)}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>{strings.summary.totalToll}</Text>
              <Text style={styles.summaryValue}>{formatCurrency(meta.totalLocalTollTk)}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>{strings.summary.totalOperating}</Text>
              <Text style={styles.summaryValue}>{formatCurrency(meta.totalOperatingCostTk)}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>{strings.summary.netProfit}</Text>
              <Text style={styles.summaryValue}>{formatCurrency(meta.totalNetProfitTk)}</Text>
            </View>
          </View>
        )}

        {/* ── Table ── */}
        <View style={styles.table}>
          {/* Header row */}
          <View style={styles.tableHeader} fixed>
            <Text style={[styles.headerCell, styles.colSerial]}>{strings.table.serial}</Text>
            <Text style={[styles.headerCell, styles.colDate]}>{strings.table.date}</Text>
            <Text style={[styles.headerCell, styles.colRoute]}>{strings.table.route}</Text>
            <Text style={[styles.headerCell, styles.colCargo]}>{strings.table.cargo}</Text>
            <Text style={[styles.headerCell, styles.colSale]}>{strings.table.sale}</Text>
            <Text style={[styles.headerCell, styles.colPurchase]}>{strings.table.purchase}</Text>
            <Text style={[styles.headerCell, styles.colRoyalty]}>{strings.table.royalty}</Text>
            <Text style={[styles.headerCell, styles.colToll]}>{strings.table.toll}</Text>
            <Text style={[styles.headerCell, styles.colOperating]}>{strings.table.operating}</Text>
            <Text style={[styles.headerCell, styles.colProfit]}>{strings.table.profit}</Text>
          </View>

          {/* Data rows */}
          {chunkRows.map((row, idx) => {
            const isAlt = idx % 2 === 1;
            const profit = row.netProfitTk ?? 0;
            return (
              <View
                key={row.publicId}
                style={[styles.tableRow, isAlt ? styles.tableRowAlt : {}]}
                wrap={false}
              >
                <Text style={[styles.cell, styles.colSerial, styles.cellMuted]}>
                  {row.serial}
                </Text>
                <Text style={[styles.cell, styles.colDate]}>
                  {formatDate(row.date)}
                </Text>
                <Text style={[styles.cell, styles.colRoute]}>
                  {routeLabel(row)}
                </Text>
                <Text style={[styles.cell, styles.colCargo, styles.cellMuted]}>
                  {cargoLabel(row)}
                </Text>
                <Text style={[styles.cell, styles.colSale]}>
                  {row.saleAmountTk != null ? row.saleAmountTk.toLocaleString('en-IN') : '—'}
                </Text>
                <Text style={[styles.cell, styles.colPurchase]}>
                  {row.purchaseCostTk != null ? row.purchaseCostTk.toLocaleString('en-IN') : '—'}
                </Text>
                <Text style={[styles.cell, styles.colRoyalty]}>
                  {row.govtRoyaltyTk != null ? row.govtRoyaltyTk.toLocaleString('en-IN') : '—'}
                </Text>
                <Text style={[styles.cell, styles.colToll]}>
                  {row.localTollTk != null ? row.localTollTk.toLocaleString('en-IN') : '—'}
                </Text>
                <Text style={[styles.cell, styles.colOperating]}>
                  {row.operatingCostTk != null ? row.operatingCostTk.toLocaleString('en-IN') : '—'}
                </Text>
                <Text style={[
                  styles.cell,
                  styles.colProfit,
                  { fontWeight: 700 }
                ]}>
                  {profit.toLocaleString('en-IN')}
                </Text>
              </View>
            );
          })}

          {/* Totals row */}
          <View style={styles.totalsRow}>
            <Text style={[styles.totalsCell, styles.colSerial]}></Text>
            <Text style={[styles.totalsCell, styles.colDate]}></Text>
            <Text style={[styles.totalsCell, styles.colRoute]}>Total</Text>
            <Text style={[styles.totalsCell, styles.colCargo]}></Text>
            <Text style={[styles.totalsCell, styles.colSale]}>
              {chunkTotals.sale.toLocaleString('en-IN')}
            </Text>
            <Text style={[styles.totalsCell, styles.colPurchase]}>
              {chunkTotals.purchase.toLocaleString('en-IN')}
            </Text>
            <Text style={[styles.totalsCell, styles.colRoyalty]}>
              {chunkTotals.royalty.toLocaleString('en-IN')}
            </Text>
            <Text style={[styles.totalsCell, styles.colToll]}>
              {chunkTotals.toll.toLocaleString('en-IN')}
            </Text>
            <Text style={[styles.totalsCell, styles.colOperating]}>
              {chunkTotals.operating.toLocaleString('en-IN')}
            </Text>
            <Text style={[
              styles.totalsCell,
              styles.colProfit,
            ]}>
              {chunkTotals.profit.toLocaleString('en-IN')}
            </Text>
          </View>
        </View>

        {/* ── Footer ── */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>{strings.misc.confidential}</Text>
          <Text
            style={styles.footerText}
            render={({ pageNumber, totalPages }) =>
              strings.misc.pageOf
                .replace('{page}', String(pageNumber))
                .replace('{total}', String(totalPages))
            }
          />
        </View>
      </Page>
        );
      })}
    </Document>
  );
}


