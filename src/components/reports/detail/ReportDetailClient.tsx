'use client';

import { useReportDetail } from '@/hooks/queries/useReportsQueries';
import { ReportDetailHeader } from './ReportDetailHeader';
import { ReportDetailContent } from './ReportDetailContent';
import { ReportAttachmentsSection } from './ReportAttachmentsSection';
import { FadeInUp } from '@/components/wrappers/motion-wrappers';
import { AlertCircle, Loader2 } from 'lucide-react';

interface ReportDetailClientProps {
  publicId: string;
}

import { useTranslations } from 'next-intl';

export function ReportDetailClient({ publicId }: ReportDetailClientProps) {
  const { data, isLoading, error } = useReportDetail(publicId);
  const t = useTranslations('reportsPage.detail');

  const report = data?.report ?? null;

  if (isLoading && !report) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !report) {
    return (
      <FadeInUp>
        <div className="max-w-xl mx-auto mt-8 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-lg p-4 flex gap-3 text-red-800 dark:text-red-400">
          <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-semibold mb-1">{t('error.title')}</h3>
            <p className="text-sm">
              {error?.message ?? t('error.notFound')}
            </p>
          </div>
        </div>
      </FadeInUp>
    );
  }

  return (
    <div className="pb-12 space-y-8">
      <ReportDetailHeader report={report} />
      <ReportDetailContent report={report} />
      <ReportAttachmentsSection report={report} />
    </div>
  );
}
