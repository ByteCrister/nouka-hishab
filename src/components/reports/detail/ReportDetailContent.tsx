import { FadeInUp } from '@/components/wrappers/motion-wrappers';
import type { ReportDetail } from '@/types/reports.types';
import { format } from 'date-fns';
import { UserCircle2, ShieldCheck } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface ReportDetailContentProps {
  report: ReportDetail;
}

export function ReportDetailContent({ report }: ReportDetailContentProps) {
  const t = useTranslations('reportsPage.detail.content');

  return (
    <FadeInUp delay={0.1}>
      <div className="grid grid-cols-1 gap-6">
        {/* User Description */}
        <div className="rounded-2xl border border-border/50 bg-card p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4 text-muted-foreground pb-4 border-b border-border/40">
            <div className="p-2 bg-muted rounded-full">
              <UserCircle2 className="w-5 h-5" />
            </div>
            <div>
              <div className="font-medium text-foreground">{t('userDescription')}</div>
              <div className="text-xs">{t('reportedOn')} {format(new Date(report.createdAt), 'MMM d, yyyy h:mm a')}</div>
            </div>
          </div>
          <div className="prose prose-sm dark:prose-invert max-w-none text-foreground/90 whitespace-pre-wrap">
            {report.description || <span className="text-muted-foreground italic">{t('noDescription')}</span>}
          </div>
        </div>

        {/* Admin Reply */}
        {report.adminReply && (
          <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4 text-muted-foreground pb-4 border-b border-primary/10">
              <div className="p-2 bg-primary/20 text-primary rounded-full">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="font-medium text-primary">{t('adminReply')}</div>
                {report.resolvedAt && (
                  <div className="text-xs opacity-80">{t('resolvedOn')} {format(new Date(report.resolvedAt), 'MMM d, yyyy h:mm a')}</div>
                )}
              </div>
            </div>
            <div className="prose prose-sm dark:prose-invert max-w-none text-foreground/90 whitespace-pre-wrap font-medium">
              {report.adminReply}
            </div>
          </div>
        )}
      </div>
    </FadeInUp>
  );
}
