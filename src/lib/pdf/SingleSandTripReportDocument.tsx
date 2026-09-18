// src/lib/pdf/SingleSandTripReportDocument.tsx
// ─── Single-trip PDF document component ──────────────────────────────────────
// Used by the sand/trips/[publicId] detail page.
// Contains: trip header info, full financial breakdown, expense sub-table.

import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from '@react-pdf/renderer';

import type { SingleSandTripReportDTO } from '@/types/sand-report.types';
import type { PdfStrings } from './pdf-i18n';
import { formatCurrency, formatDate } from './pdf-utils';
import { getExpenseCategoryLabel } from './pdf-i18n';

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
const BORDER = '#dddddd';
const TEXT_PRIMARY = '#000000';
const TEXT_SECONDARY = '#333333';
const SECTION_BG = '#f9f9f9';

const styles = StyleSheet.create({
  page: {
    fontFamily: 'HindSiliguri',
    fontSize: 10,
    color: TEXT_PRIMARY,
    paddingTop: 40,
    paddingBottom: 50,
    paddingHorizontal: 40,
    backgroundColor: '#ffffff',
  },
  // ── Header ──
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottom: `2px solid ${BRAND_PRIMARY}`,
    paddingBottom: 10,
    marginBottom: 20,
  },
  headerLeft: {
    flexDirection: 'column',
  },
  headerRight: {
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  appTitle: {
    fontSize: 24,
    fontWeight: 700,
    color: BRAND_PRIMARY,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  invoiceLabel: {
    fontSize: 14,
    color: TEXT_SECONDARY,
    textTransform: 'uppercase',
    letterSpacing: 4,
    marginTop: 4,
  },
  metaText: {
    fontSize: 9,
    color: TEXT_SECONDARY,
    marginTop: 4,
  },
  metaValue: {
    color: BRAND_PRIMARY,
    fontWeight: 700,
  },

  // ── Trip Info ──
  infoSection: {
    marginBottom: 20,
    border: `1px solid ${BORDER}`,
    padding: 12,
    backgroundColor: SECTION_BG,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  infoCol: {
    flexDirection: 'row',
    width: '48%',
  },
  infoLabelBox: {
    width: 60,
  },
  infoLabel: {
    fontSize: 9,
    color: TEXT_SECONDARY,
    textTransform: 'uppercase',
  },
  infoValueBox: {
    flex: 1,
  },
  infoData: {
    fontSize: 10,
    fontWeight: 700,
    color: BRAND_PRIMARY,
  },

  // ── Table ──
  sectionTitle: {
    fontSize: 12,
    fontWeight: 700,
    color: BRAND_PRIMARY,
    textTransform: 'uppercase',
    marginBottom: 8,
    borderBottom: `1px solid ${BRAND_PRIMARY}`,
    paddingBottom: 4,
  },
  table: {
    marginBottom: 20,
  },
  tableHeaderRow: {
    flexDirection: 'row',
    backgroundColor: BRAND_PRIMARY,
    color: '#ffffff',
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  tableHeaderCell: {
    fontSize: 9,
    fontWeight: 700,
    textTransform: 'uppercase',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderBottom: `1px solid ${BORDER}`,
  },
  tableRowAlt: {
    backgroundColor: SECTION_BG,
  },
  colCategory: { width: '30%' },
  colDesc: { width: '50%' },
  colAmount: { width: '20%', textAlign: 'right' },
  cell: {
    fontSize: 9,
  },
  
  // ── Summary Total Block (Bottom Right) ──
  summaryBlock: {
    alignSelf: 'flex-end',
    width: '50%',
    paddingTop: 8,
    marginTop: 10,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3,
  },
  summaryLabel: {
    fontSize: 10,
    color: TEXT_SECONDARY,
  },
  summaryValue: {
    fontSize: 10,
    fontWeight: 700,
    color: BRAND_PRIMARY,
    textAlign: 'right',
  },
  summaryTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    marginTop: 4,
    borderTop: `1px solid ${BRAND_PRIMARY}`,
    borderBottom: `2px solid ${BRAND_PRIMARY}`,
    backgroundColor: SECTION_BG,
    paddingHorizontal: 4,
  },
  summaryTotalLabel: {
    fontSize: 12,
    fontWeight: 700,
    color: BRAND_PRIMARY,
    textTransform: 'uppercase',
  },
  summaryTotalValue: {
    fontSize: 12,
    fontWeight: 700,
    color: BRAND_PRIMARY,
    textAlign: 'right',
  },

  // ── Footer ──
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTop: `1px solid ${BORDER}`,
    paddingTop: 8,
  },
  footerText: {
    fontSize: 8,
    color: TEXT_SECONDARY,
  },
});

// ─── Props ───────────────────────────────────────────────────────────────────

interface Props {
  dto: SingleSandTripReportDTO;
  strings: PdfStrings;
}

// ─── Document ─────────────────────────────────────────────────────────────────

export function SingleSandTripReportDocument({ dto, strings }: Props) {
  const { meta, row } = dto;

  const profit = row.netProfitTk ?? 0;
  
  const generatedDate = new Date(meta.generatedAt);
  const generatedStr = `${generatedDate.getUTCDate().toString().padStart(2, '0')}/${
    (generatedDate.getUTCMonth() + 1).toString().padStart(2, '0')}/${generatedDate.getUTCFullYear()}`;

  const routeStr = [row.source, row.destination].filter(Boolean).join(' → ') || '—';
  const cargoStr = row.cargoValue
    ? `${row.cargoValue.toLocaleString('en-IN')} ${row.cargoUnit ?? ''}`.trim()
    : '—';

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* ── Header ── */}
        <View style={styles.header} fixed>
          <View style={styles.headerLeft}>
            <Text style={styles.appTitle}>{strings.header.title}</Text>
            <Text style={styles.invoiceLabel}>{strings.header.reportTitle}</Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.metaText}>
              Invoice Date: <Text style={styles.metaValue}>{generatedStr}</Text>
            </Text>
            <Text style={styles.metaText}>
              Trip ID: <Text style={styles.metaValue}>{meta.tripPublicId}</Text>
            </Text>
          </View>
        </View>

        {/* ── Trip Info ── */}
        <View style={styles.infoSection}>
          <View style={styles.infoRow}>
            <View style={styles.infoCol}>
              <View style={styles.infoLabelBox}><Text style={styles.infoLabel}>{strings.meta.boat}</Text></View>
              <View style={styles.infoValueBox}><Text style={styles.infoData}>{meta.boatName}</Text></View>
            </View>
            <View style={styles.infoCol}>
              <View style={styles.infoLabelBox}><Text style={styles.infoLabel}>{strings.meta.departure}</Text></View>
              <View style={styles.infoValueBox}><Text style={styles.infoData}>{formatDate(meta.departureTime)}</Text></View>
            </View>
          </View>
          <View style={styles.infoRow}>
            <View style={styles.infoCol}>
              <View style={styles.infoLabelBox}><Text style={styles.infoLabel}>{strings.table.route}</Text></View>
              <View style={styles.infoValueBox}><Text style={styles.infoData}>{routeStr}</Text></View>
            </View>
            <View style={styles.infoCol}>
              <View style={styles.infoLabelBox}><Text style={styles.infoLabel}>{strings.meta.arrival}</Text></View>
              <View style={styles.infoValueBox}><Text style={styles.infoData}>{meta.arrivalTime ? formatDate(meta.arrivalTime) : '—'}</Text></View>
            </View>
          </View>
          <View style={styles.infoRow}>
            <View style={styles.infoCol}>
              <View style={styles.infoLabelBox}><Text style={styles.infoLabel}>{strings.table.cargo}</Text></View>
              <View style={styles.infoValueBox}><Text style={styles.infoData}>{cargoStr}</Text></View>
            </View>
            <View style={styles.infoCol}>
              <View style={styles.infoLabelBox}><Text style={styles.infoLabel}>Buyer</Text></View>
              <View style={styles.infoValueBox}>
                <Text style={styles.infoData}>
                  {row.buyerName ? `${row.buyerName} ${row.buyerPhone ? `(${row.buyerPhone})` : ''}` : '—'}
                </Text>
              </View>
            </View>
          </View>
          <View style={[styles.infoRow, { borderBottom: 'none', marginBottom: 0 }]}>
            <View style={styles.infoCol}>
              <View style={styles.infoLabelBox}><Text style={styles.infoLabel}>Status</Text></View>
              <View style={styles.infoValueBox}>
                <Text style={[styles.infoData, { textTransform: 'capitalize' }]}>{row.status}</Text>
              </View>
            </View>
            <View style={styles.infoCol}>
            </View>
          </View>
        </View>

        {/* ── Expenses breakdown ── */}
        {row.expenses.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>{strings.expenses.title}</Text>
            <View style={styles.table}>
              <View style={styles.tableHeaderRow}>
                <Text style={[styles.tableHeaderCell, styles.colCategory]}>
                  {strings.expenses.category}
                </Text>
                <Text style={[styles.tableHeaderCell, styles.colDesc]}>
                  {strings.expenses.description}
                </Text>
                <Text style={[styles.tableHeaderCell, styles.colAmount]}>
                  {strings.expenses.amount}
                </Text>
              </View>
              {row.expenses.map((expense, idx) => (
                <View
                  key={idx}
                  style={[styles.tableRow, idx % 2 === 1 ? styles.tableRowAlt : {}]}
                  wrap={false}
                >
                  <Text style={[styles.cell, styles.colCategory]}>
                    {getExpenseCategoryLabel(expense.category, strings)}
                  </Text>
                  <Text style={[styles.cell, styles.colDesc, { color: TEXT_SECONDARY }]}>
                    {expense.description || '—'}
                  </Text>
                  <Text style={[styles.cell, styles.colAmount]}>
                    {expense.amountTk.toLocaleString('en-IN')}
                  </Text>
                </View>
              ))}
            </View>
          </>
        )}

        {/* ── Financial Summary (Invoice Total Style) ── */}
        <View style={styles.summaryBlock} wrap={false}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>{strings.summary.totalSale}</Text>
            <Text style={styles.summaryValue}>{formatCurrency(row.saleAmountTk)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>
              {strings.summary.totalPurchase}
              {row.purchaseRatePerUnitTk ? ` (@ ${row.purchaseRatePerUnitTk})` : ''}
            </Text>
            <Text style={styles.summaryValue}>{formatCurrency(row.purchaseCostTk)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>
              {strings.summary.totalRoyalty}
              {row.govtRoyaltyRateTk ? ` (@ ${row.govtRoyaltyRateTk})` : ''}
            </Text>
            <Text style={styles.summaryValue}>{formatCurrency(row.govtRoyaltyTk)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>
              {strings.summary.totalToll}
              {row.localTollRateTk ? ` (@ ${row.localTollRateTk})` : ''}
            </Text>
            <Text style={styles.summaryValue}>{formatCurrency(row.localTollTk)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>{strings.summary.totalOperating}</Text>
            <Text style={styles.summaryValue}>{formatCurrency(row.totalOperatingCostTk)}</Text>
          </View>

          <View style={styles.summaryTotalRow}>
            <Text style={styles.summaryTotalLabel}>{strings.summary.netProfit}</Text>
            <Text style={styles.summaryTotalValue}>{formatCurrency(profit)}</Text>
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
    </Document>
  );
}


