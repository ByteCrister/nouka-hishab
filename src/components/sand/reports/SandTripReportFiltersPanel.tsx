// src/components/sand/reports/SandTripReportFiltersPanel.tsx
// ─── Report Filters Panel (list-page only) ────────────────────────────────────
// A dialog/sheet that lets the user configure the date range and boat before
// triggering a PDF export from the sand/trips list page.
//
// Live preview of: "X trips found · Y PDFs will be generated"
// once the report data query returns.

'use client';

import React, { useEffect, useCallback } from 'react';
import { useLocale } from 'next-intl';
import {
  Download,
  Eye,
  Loader2,
  Ship,
  Calendar,
  Info,
  FileText,
} from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { useBoatsMeta } from '@/hooks/queries/useBoatsMetaQueries';
import { useSandTripsReport } from '@/hooks/queries/useSandTripReportQueries';
import { useSandTripReportStore } from '@/store/sand/useSandTripReportStore';
import { SandTripReportPreviewModal } from './SandTripReportPreviewModal';
import { exportSandTripReport, DEFAULT_ROWS_PER_PDF } from '@/lib/pdf/report-engine';
import type { AppLocale } from '@/constants/common.const';

export function SandTripReportFiltersPanel() {
  const locale = useLocale() as AppLocale;

  const {
    isFiltersPanelOpen,
    isPreviewOpen,
    isGenerating,
    error,
    reportFilters,
    isFiltersValid,
    closeFiltersPanel,
    openPreview,
    closePreview,
    setReportFilter,
    resetReportFilters,
    setGenerating,
    setError,
    getValidFilters,
  } = useSandTripReportStore();

  const { data: boats } = useBoatsMeta();

  // ── Report data query ──────────────────────────────────────────────────────
  // We enable the query as soon as filters become valid so the summary line
  // can show real trip count without waiting for the user to click a button.
  const validFilters = isFiltersValid ? getValidFilters() : null;
  const {
    data: reportDto,
    isFetching: isReportFetching,
    error: queryError,
  } = useSandTripsReport(validFilters, {
    enabled: !!validFilters,
  });

  // Sync query errors to the store
  useEffect(() => {
    if (queryError) setError(queryError.message);
    else setError(null);
  }, [queryError, setError]);

  // Derived counts
  const totalTrips = reportDto?.meta.totalTrips ?? 0;
  const totalPdfs = reportDto ? Math.ceil(reportDto.rows.length / DEFAULT_ROWS_PER_PDF) : 0;
  const hasData = !!reportDto && reportDto.rows.length > 0;

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handlePreview = useCallback(() => {
    if (!hasData) return;
    openPreview();
  }, [hasData, openPreview]);

  const handleDownload = useCallback(async () => {
    if (!reportDto || !hasData) {
      toast.error('No trips found for the selected period');
      return;
    }
    setGenerating(true);
    try {
      await exportSandTripReport(reportDto, locale);
      toast.success(
        totalPdfs > 1
          ? `ZIP downloaded (${totalPdfs} PDFs)`
          : 'PDF downloaded'
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to generate PDF';
      setError(msg);
      toast.error(msg);
    } finally {
      setGenerating(false);
    }
  }, [reportDto, hasData, locale, totalPdfs, setGenerating, setError]);

  const handleClose = useCallback(() => {
    closeFiltersPanel();
    resetReportFilters();
  }, [closeFiltersPanel, resetReportFilters]);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
      <Dialog open={isFiltersPanelOpen} onOpenChange={(v) => !v && handleClose()}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <FileText className="w-4 h-4 text-primary" />
              </div>
              <div>
                <DialogTitle>Export Trip Report</DialogTitle>
                <DialogDescription className="text-xs">
                  Select a boat and date range to export a PDF report
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="flex flex-col gap-4 pt-2">
            {/* Boat selector */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium flex items-center gap-1.5">
                <Ship className="w-3.5 h-3.5 text-muted-foreground" />
                Boat
              </label>
              <Select
                value={reportFilters.boatPublicId ?? ''}
                onValueChange={(v) => setReportFilter('boatPublicId', v || null)}
              >
                <SelectTrigger className="h-10 rounded-xl">
                  <SelectValue placeholder="Select a boat…" />
                </SelectTrigger>
                <SelectContent>
                  {boats?.map((b) => (
                    <SelectItem key={b.publicId} value={b.publicId}>
                      {b.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date range */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                Date Range
              </label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">From</p>
                  <Input
                    type="date"
                    value={reportFilters.fromDate ?? ''}
                    onChange={(e) =>
                      setReportFilter('fromDate', e.target.value || null)
                    }
                    className="h-10 rounded-xl"
                    max={reportFilters.toDate ?? undefined}
                  />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">To</p>
                  <Input
                    type="date"
                    value={reportFilters.toDate ?? ''}
                    onChange={(e) =>
                      setReportFilter('toDate', e.target.value || null)
                    }
                    className="h-10 rounded-xl"
                    min={reportFilters.fromDate ?? undefined}
                  />
                </div>
              </div>
            </div>

            {/* Live summary */}
            {isFiltersValid && (
              <div className="rounded-xl bg-muted/50 border px-4 py-3 text-sm">
                {isReportFetching ? (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Fetching trip data…</span>
                  </div>
                ) : reportDto ? (
                  totalTrips === 0 ? (
                    <p className="text-muted-foreground flex items-center gap-1.5">
                      <Info className="w-3.5 h-3.5" />
                      No trips found for the selected period.
                    </p>
                  ) : (
                    <div className="flex flex-col gap-1">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Trips found</span>
                        <span className="font-semibold">{totalTrips}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">PDFs to generate</span>
                        <span className="font-semibold">
                          {totalPdfs} {totalPdfs > 1 ? '(will be zipped)' : ''}
                        </span>
                      </div>
                    </div>
                  )
                ) : null}
                {error && (
                  <p className="text-destructive text-xs mt-1">{error}</p>
                )}
              </div>
            )}

            {/* Action buttons */}
            <div className="flex gap-2 pt-1">
              <Button
                variant="outline"
                className="flex-1 gap-2"
                onClick={handlePreview}
                disabled={!hasData || isReportFetching || isGenerating}
              >
                <Eye className="w-4 h-4" />
                Preview
              </Button>
              <Button
                className="flex-1 gap-2"
                onClick={handleDownload}
                disabled={!hasData || isReportFetching || isGenerating}
              >
                {isGenerating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                {totalPdfs > 1 ? `Download ZIP` : 'Download PDF'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Preview modal (opens on top of filters panel) */}
      {isPreviewOpen && reportDto && (
        <SandTripReportPreviewModal
          open={isPreviewOpen}
          onClose={closePreview}
          mode="list"
          dto={reportDto}
        />
      )}
    </>
  );
}
