// src/lib/pdf/MaintenanceReportDocument.tsx

import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font
} from '@react-pdf/renderer';

import type { MaintenanceListItem, MaintenanceKpis } from '@/types/maintenance.types';
import { formatCurrency, formatDate } from './pdf-utils';
import { chunk } from './chunk';

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
    fontSize: 9,
    color: TEXT_PRIMARY,
    paddingTop: 36,
    paddingBottom: 48,
    paddingHorizontal: 36,
    backgroundColor: '#ffffff',
  },
  header: {
    marginBottom: 12,
    paddingBottom: 10,
    borderBottom: `2px solid ${BRAND_PRIMARY}`,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 9,
    color: TEXT_SECONDARY,
    marginBottom: 2,
  },
  // Table
  table: {
    width: '100%',
    flexDirection: 'column',
    borderTop: `1px solid ${BRAND_PRIMARY}`,
    borderBottom: `1px solid ${BRAND_PRIMARY}`,
    marginTop: 10,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: SECTION_BG,
    borderBottom: `1px solid ${BORDER}`,
    paddingVertical: 6,
    paddingHorizontal: 4,
    fontWeight: 'bold',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottom: `1px dashed ${BORDER}`,
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  tableRowLast: {
    borderBottom: 'none',
  },
  tableCellDate: { width: '15%' },
  tableCellBoat: { width: '20%' },
  tableCellDesc: { width: '35%' },
  tableCellVendor: { width: '15%' },
  tableCellCost: { width: '15%', textAlign: 'right' },
  // Summary
  summaryBox: {
    marginTop: 20,
    padding: 12,
    backgroundColor: SECTION_BG,
    borderRadius: 4,
    border: `1px solid ${BORDER}`,
  },
  summaryTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  // Footer
  pageNumber: {
    position: 'absolute',
    bottom: 24,
    left: 36,
    right: 36,
    textAlign: 'center',
    color: TEXT_SECONDARY,
    fontSize: 8,
  },
  generatedDate: {
    position: 'absolute',
    bottom: 24,
    right: 36,
    textAlign: 'right',
    color: TEXT_SECONDARY,
    fontSize: 8,
  },
});

import type { PdfStrings } from './pdf-i18n';

interface MaintenanceReportDocumentProps {
  items: MaintenanceListItem[];
  kpis?: MaintenanceKpis;
  strings: PdfStrings;
}

export function MaintenanceReportDocument({
  items,
  kpis,
  strings,
}: MaintenanceReportDocumentProps) {
  const t = strings.maintenance;
  // Use 25 rows per page for chunking
  const rowsPerPage = 25;
  const itemChunks = chunk(items, rowsPerPage);

  // If items list is empty, render a single blank page with headers
  if (items.length === 0) {
    return (
      <Document>
        <Page size="A4" style={styles.page}>
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>{t.reportTitle}</Text>
            </View>
          </View>
          <Text style={{ textAlign: 'center', marginTop: 40, color: TEXT_SECONDARY }}>
            {t.noRecords}
          </Text>
        </Page>
      </Document>
    );
  }

  return (
    <Document>
      {itemChunks.map((chunkItems, chunkIndex) => {
        const isFirstPage = chunkIndex === 0;
        const isLastPage = chunkIndex === itemChunks.length - 1;

        return (
          <Page key={chunkIndex} size="A4" style={styles.page} wrap={false}>
            {/* Header only on first page */}
            {isFirstPage && (
              <View style={styles.header}>
                <View>
                  <Text style={styles.title}>{t.reportTitle}</Text>
                  <Text style={styles.subtitle}>
                    {t.totalRecords} {kpis?.totalRecords || items.length}
                  </Text>
                </View>
              </View>
            )}

            {/* Table Header */}
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={styles.tableCellDate}>{t.table.date}</Text>
                <Text style={styles.tableCellBoat}>{t.table.boat}</Text>
                <Text style={styles.tableCellDesc}>{t.table.description}</Text>
                <Text style={styles.tableCellVendor}>{t.table.vendor}</Text>
                <Text style={styles.tableCellCost}>{t.table.cost}</Text>
              </View>

              {/* Table Rows */}
              {chunkItems.map((item, rowIndex) => {
                const isLast = rowIndex === chunkItems.length - 1;
                return (
                  <View
                    key={item.id}
                    style={[styles.tableRow, isLast ? styles.tableRowLast : {}]}
                    wrap={false}
                  >
                    <Text style={styles.tableCellDate}>
                      {formatDate(item.maintenanceDate)}
                    </Text>
                    <Text style={styles.tableCellBoat}>{item.boatName}</Text>
                    <Text style={styles.tableCellDesc}>{item.description}</Text>
                    <Text style={styles.tableCellVendor}>{item.vendorName || '-'}</Text>
                    <Text style={styles.tableCellCost}>
                      {item.costTk != null ? formatCurrency(item.costTk) : '-'}
                    </Text>
                  </View>
                );
              })}
            </View>

            {/* Summary only on last page */}
            {isLastPage && kpis && (
              <View style={styles.summaryBox} wrap={false}>
                <Text style={styles.summaryTitle}>{t.summary.title}</Text>
                <View style={styles.summaryRow}>
                  <Text>{t.summary.totalCost}</Text>
                  <Text style={{ fontWeight: 'bold' }}>
                    {formatCurrency(kpis.totalCostTk)}
                  </Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text>{t.summary.currentMonthCost}</Text>
                  <Text>{formatCurrency(kpis.currentMonthCostTk)}</Text>
                </View>
              </View>
            )}

            {/* Footer */}
            <Text
              style={styles.pageNumber}
              render={({ pageNumber, totalPages }) =>
                strings.misc.pageOf
                  .replace('{page}', String(pageNumber))
                  .replace('{total}', String(totalPages))
              }
              fixed
            />
            <Text style={styles.generatedDate} fixed>
              {strings.meta.generated} {new Date().toLocaleDateString()}
            </Text>
          </Page>
        );
      })}
    </Document>
  );
}
