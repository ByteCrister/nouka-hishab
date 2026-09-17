// src/components/sand/reports/SandTripReportExportButton.tsx
// ─── Reusable Export Button ───────────────────────────────────────────────────
// Used on TWO pages:
//   mode="list"   → sand/trips list page (opens FiltersPanel)
//   mode="single" → sand/trips/[publicId] detail page (direct export)
//
// The button renders a dropdown with:
//   - Preview PDF
//   - Download PDF
//
// For mode="single" both actions trigger immediately (no filters panel needed).
// For mode="list"   both actions open the FiltersPanel where the user configures
//                   boat + date range first.

'use client';

import React, { useState, useCallback } from 'react';
import { useLocale } from 'next-intl';
import {
  FileDown,
  Eye,
  Download,
  Loader2,
  ChevronDown,
} from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { useSandTripReportStore } from '@/store/sand/useSandTripReportStore';
import { useSingleSandTripReport } from '@/hooks/queries/useSandTripReportQueries';
import { SandTripReportFiltersPanel } from './SandTripReportFiltersPanel';
import { SandTripReportPreviewModal } from './SandTripReportPreviewModal';
import { exportSingleSandTripReport } from '@/lib/pdf/report-engine';
import type { AppLocale } from '@/constants/common.const';

// ── Props ─────────────────────────────────────────────────────────────────────

interface ListModeProps {
  mode: 'list';
  tripPublicId?: never;
}

interface SingleModeProps {
  mode: 'single';
  tripPublicId: string;
}

type Props = ListModeProps | SingleModeProps;

// ── Component ─────────────────────────────────────────────────────────────────

export function SandTripReportExportButton({ mode, tripPublicId }: Props) {
  const locale = useLocale() as AppLocale;
  const { openFiltersPanel } = useSandTripReportStore();

  // Single-mode state
  const [singlePreviewOpen, setSinglePreviewOpen] = useState(false);
  const [singleEnabled, setSingleEnabled] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  // Single-mode query — fires only when enabled
  const {
    data: singleDto,
    isFetching: singleFetching,
    error: singleError,
    refetch: refetchSingle,
  } = useSingleSandTripReport(tripPublicId ?? '', {
    enabled: mode === 'single' && singleEnabled,
  });

  // ── Single mode: handle preview ────────────────────────────────────────────
  const handleSinglePreview = useCallback(async () => {
    setSingleEnabled(true);
    setSinglePreviewOpen(true);
    if (singleEnabled) {
      await refetchSingle();
    }
  }, [singleEnabled, refetchSingle]);

  // ── Single mode: handle download ───────────────────────────────────────────
  const handleSingleDownload = useCallback(async () => {
    setIsDownloading(true);
    setSingleEnabled(true);
    try {
      // Force a refetch if already enabled to ensure data is fresh
      let freshDto = singleDto;
      if (singleEnabled) {
        const { data } = await refetchSingle();
        if (data) freshDto = data;
      }
      
      // If DTO already cached, use it directly
      if (freshDto) {
        await exportSingleSandTripReport(freshDto, locale);
        toast.success('PDF downloaded');
        return;
      }
      // Otherwise wait for query — we'll trigger via useEffect below
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to generate PDF');
    } finally {
      setIsDownloading(false);
    }
  }, [singleDto, locale, singleEnabled, refetchSingle]);

  // When DTO becomes available and we're in download mode, trigger download
  React.useEffect(() => {
    if (!isDownloading || !singleDto || singlePreviewOpen) return;
    (async () => {
      try {
        await exportSingleSandTripReport(singleDto, locale);
        toast.success('PDF downloaded');
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Failed to generate PDF');
      } finally {
        setIsDownloading(false);
      }
    })();
  }, [isDownloading, singleDto, singlePreviewOpen, locale]);

  React.useEffect(() => {
    if (singleError) {
      toast.error(singleError.message ?? 'Failed to load trip report data');
    }
  }, [singleError]);

  // ── Render ─────────────────────────────────────────────────────────────────
  const isBusy = singleFetching || isDownloading;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="h-9 gap-1.5 rounded-xl"
            disabled={isBusy}
          >
            {isBusy ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <FileDown className="w-3.5 h-3.5" />
            )}
            Export PDF
            <ChevronDown className="w-3 h-3 opacity-60" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-44">
          {/* Preview */}
          <DropdownMenuItem
            className="gap-2 cursor-pointer"
            onClick={mode === 'list' ? openFiltersPanel : handleSinglePreview}
          >
            <Eye className="w-4 h-4 text-muted-foreground" />
            Preview PDF
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          {/* Download */}
          <DropdownMenuItem
            className="gap-2 cursor-pointer"
            onClick={mode === 'list' ? openFiltersPanel : handleSingleDownload}
          >
            <Download className="w-4 h-4 text-muted-foreground" />
            Download PDF
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* List-mode: filters panel (manages its own sub-modals) */}
      {mode === 'list' && <SandTripReportFiltersPanel />}

      {/* Single-mode: preview modal */}
      {mode === 'single' && singleDto && (
        <SandTripReportPreviewModal
          open={singlePreviewOpen}
          onClose={() => setSinglePreviewOpen(false)}
          mode="single"
          dto={singleDto}
        />
      )}
    </>
  );
}
