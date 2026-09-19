'use client';

import React, { useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { X, Download, FileText, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

import { exportMaintenanceReport } from '@/lib/pdf/report-engine';
import type { MaintenanceListItem, MaintenanceKpis } from '@/types/maintenance.types';

const PDFViewer = dynamic(
  () => import('@react-pdf/renderer').then((m) => m.PDFViewer),
  { ssr: false, loading: () => <PdfViewerSkeleton /> }
);
import { MaintenanceReportDocument } from '@/lib/pdf/MaintenanceReportDocument';

function PdfViewerSkeleton() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-3 text-muted-foreground">
      <Loader2 className="w-8 h-8 animate-spin" />
      <span className="text-sm">Loading preview…</span>
    </div>
  );
}

interface Props {
  open: boolean;
  onClose: () => void;
  items: MaintenanceListItem[];
  kpis?: MaintenanceKpis;
}

export function MaintenanceReportPreviewModal({ open, onClose, items, kpis }: Props) {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = useCallback(async () => {
    setIsDownloading(true);
    try {
      await exportMaintenanceReport(items, kpis);
      toast.success('PDF downloaded');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to generate PDF');
    } finally {
      setIsDownloading(false);
    }
  }, [items, kpis]);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="w-full max-w-5xl h-[90vh] flex flex-col p-0 gap-0 overflow-hidden">
        <DialogHeader className="flex flex-row items-center justify-between px-4 py-3 border-b shrink-0">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-primary" />
            <DialogTitle className="text-sm font-semibold">
              Maintenance Report Preview
            </DialogTitle>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={handleDownload} disabled={isDownloading} className="h-7 text-xs gap-1.5">
              {isDownloading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Download className="w-3 h-3" />}
              Download PDF
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 min-h-0 relative">
          <div className="hidden sm:flex w-full h-full">
            <PDFViewer width="100%" height="100%" showToolbar={false}>
              <MaintenanceReportDocument items={items} kpis={kpis} />
            </PDFViewer>
          </div>
          <div className="flex sm:hidden w-full h-full flex-col items-center justify-center gap-6 p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <FileText className="w-8 h-8 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-base">Maintenance Report</p>
              <p className="text-xs text-muted-foreground mt-3">
                PDF preview is best viewed on a larger screen.<br />
                Tap the button below to download directly.
              </p>
            </div>
            <Button size="lg" onClick={handleDownload} disabled={isDownloading} className="gap-2 w-full max-w-xs">
              {isDownloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              Download PDF
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
