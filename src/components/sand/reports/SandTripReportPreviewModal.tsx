// src/components/sand/reports/SandTripReportPreviewModal.tsx
// ─── PDF Preview Modal ────────────────────────────────────────────────────────
// Desktop: renders PDFViewer from @react-pdf/renderer in a full-screen dialog.
// Mobile: because PDFViewer is not ergonomic on small screens, we render a
// clean info panel with a Download button instead.
//
// For multi-PDF (list-page) exports the user can browse parts with ◀ ▶ arrows.

'use client';

import React, { useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { useLocale } from 'next-intl';
import { X, Download, ChevronLeft, ChevronRight, FileText, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

import type { SandTripReportRow, SandTripReportDTO, SingleSandTripReportDTO } from '@/types/sand-report.types';
import type { AppLocale } from '@/constants/common.const';
import { PDF_STRINGS } from '@/lib/pdf/pdf-i18n';
import {
  exportSandTripReport,
  exportSingleSandTripReport,
  DEFAULT_ROWS_PER_PDF,
} from '@/lib/pdf/report-engine';


// ── Lazy-load heavy @react-pdf/renderer components ───────────────────────────
// PDFViewer is only needed on desktop — we SSR-skip it to avoid bundle bloat.
const PDFViewer = dynamic(
  () => import('@react-pdf/renderer').then((m) => m.PDFViewer),
  { ssr: false, loading: () => <PdfViewerSkeleton /> }
);
import { SandTripReportDocument } from '@/lib/pdf/SandTripReportDocument';
import { SingleSandTripReportDocument } from '@/lib/pdf/SingleSandTripReportDocument';

// ── Helpers ───────────────────────────────────────────────────────────────────

function PdfViewerSkeleton() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-3 text-muted-foreground">
      <Loader2 className="w-8 h-8 animate-spin" />
      <span className="text-sm">Loading preview…</span>
    </div>
  );
}

// ── Props ─────────────────────────────────────────────────────────────────────

interface BaseProps {
  open: boolean;
  onClose: () => void;
}

interface ListModeProps extends BaseProps {
  mode: 'list';
  dto: SandTripReportDTO;
}

interface SingleModeProps extends BaseProps {
  mode: 'single';
  dto: SingleSandTripReportDTO;
}

type Props = ListModeProps | SingleModeProps;

// ── Component ─────────────────────────────────────────────────────────────────

export function SandTripReportPreviewModal(props: Props) {
  const { open, onClose, mode, dto } = props;
  const locale = useLocale() as AppLocale;
  const strings = PDF_STRINGS[locale];

  const [isDownloading, setIsDownloading] = useState(false);

  const totalPages =
    mode === 'list'
      ? Math.ceil((dto as SandTripReportDTO).rows.length / DEFAULT_ROWS_PER_PDF)
      : 1;

  const handleDownload = useCallback(async () => {
    setIsDownloading(true);
    try {
      if (mode === 'list') {
        await exportSandTripReport(dto as SandTripReportDTO, locale);
      } else {
        await exportSingleSandTripReport(dto as SingleSandTripReportDTO, locale);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to generate PDF');
    } finally {
      setIsDownloading(false);
    }
  }, [dto, locale, mode]);

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        className="
          w-full max-w-5xl h-[90vh]
          flex flex-col p-0 gap-0
          overflow-hidden
        "
      >
        {/* Header */}
        <DialogHeader className="flex flex-row items-center justify-between px-4 py-3 border-b shrink-0">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-primary" />
            <DialogTitle className="text-sm font-semibold">
              {strings.header.reportTitle}

            </DialogTitle>
          </div>
          <div className="flex items-center gap-2">

            <Button
              size="sm"
              onClick={handleDownload}
              disabled={isDownloading}
              className="h-7 text-xs gap-1.5"
            >
              {isDownloading ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <Download className="w-3 h-3" />
              )}
              {totalPages > 1 ? `Download PDF (${totalPages} pages)` : 'Download PDF'}
            </Button>
          </div>
        </DialogHeader>

        {/* PDF Viewer area */}
        <div className="flex-1 min-h-0 relative">
          {/* Desktop: PDFViewer */}
          <div className="hidden sm:flex w-full h-full">
            {mode === 'list' && (
              <PDFViewer width="100%" height="100%" showToolbar={false}>
                <SandTripReportDocument
                  meta={(dto as SandTripReportDTO).meta}
                  rows={(dto as SandTripReportDTO).rows}
                  strings={strings}
                />
              </PDFViewer>
            )}
            {mode === 'single' && (
              <PDFViewer width="100%" height="100%" showToolbar={false}>
                <SingleSandTripReportDocument
                  dto={dto as SingleSandTripReportDTO}
                  strings={strings}
                />
              </PDFViewer>
            )}
          </div>

          {/* Mobile: fallback download panel */}
          <div className="flex sm:hidden w-full h-full flex-col items-center justify-center gap-6 p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <FileText className="w-8 h-8 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-base">{strings.header.reportTitle}</p>
              {mode === 'list' && (
                <p className="text-sm text-muted-foreground mt-1">
                  {(dto as SandTripReportDTO).meta.totalTrips} trips ·{' '}
                  {totalPages} page{totalPages > 1 ? 's' : ''}
                </p>
              )}
              <p className="text-xs text-muted-foreground mt-3">
                PDF preview is best viewed on a larger screen.
                <br />
                Tap the button below to download directly.
              </p>
            </div>
            <Button
              size="lg"
              onClick={handleDownload}
              disabled={isDownloading}
              className="gap-2 w-full max-w-xs"
            >
              {isDownloading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              {totalPages > 1 ? `Download PDF (${totalPages} pages)` : 'Download PDF'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
