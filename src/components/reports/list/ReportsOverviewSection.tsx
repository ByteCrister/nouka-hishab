import { FileText, AlertCircle, Clock, CheckCircle2 } from 'lucide-react';
import type { ReportListKpis } from '@/types/reports.types';
import { FadeInUp } from '@/components/wrappers/motion-wrappers';
import { useTranslations } from 'next-intl';
import { Skeleton } from '@/components/ui/skeleton';

interface ReportsOverviewSectionProps {
  kpis?: ReportListKpis;
  isLoading?: boolean;
}

export function ReportsOverviewSection({ kpis, isLoading }: ReportsOverviewSectionProps) {
  const t = useTranslations('reportsPage.list.overview');

  const listKpiItems = [
    {
      title: t('total'),
      value: kpis?.totalReports ?? 0,
      icon: <FileText className="w-5 h-5 text-primary" />,
      bg: 'bg-primary/10',
      delay: 0.1,
    },
    {
      title: t('open'),
      value: kpis?.openReports ?? 0,
      icon: <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400" />,
      bg: 'bg-rose-100 dark:bg-rose-900/30',
      delay: 0.2,
    },
    {
      title: t('inReview'),
      value: kpis?.inReviewReports ?? 0,
      icon: <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />,
      bg: 'bg-amber-100 dark:bg-amber-900/30',
      delay: 0.3,
    },
    {
      title: t('resolved'),
      value: kpis?.resolvedReports ?? 0,
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />,
      bg: 'bg-emerald-100 dark:bg-emerald-900/30',
      delay: 0.4,
    },
  ];

  return (
    <div className="rounded-3xl border border-border/50 bg-card/20 p-6 sm:p-8 backdrop-blur-md shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">{t('title')}</h2>
          <p className="text-sm text-muted-foreground mt-1">{t('subtitle')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        {listKpiItems.map((item, idx) => (
          <FadeInUp key={idx} delay={item.delay}>
            <div className="rounded-xl border border-border/40 bg-card/40 hover:bg-card/60 backdrop-blur-sm p-4 shadow-sm hover:shadow-md hover:border-primary/20 transition-all flex items-center justify-between group">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${item.bg} group-hover:scale-110 transition-transform duration-300`}>
                  {item.icon}
                </div>
                <h3 className="font-medium text-muted-foreground text-sm leading-tight">
                  {item.title}
                </h3>
              </div>
              {isLoading ? (
                <Skeleton className="h-8 w-12 rounded-md" />
              ) : (
                <p className="text-2xl font-bold tracking-tight text-foreground pl-3 text-right">
                  {item.value}
                </p>
              )}
            </div>
          </FadeInUp>
        ))}
      </div>
    </div>
  );
}
