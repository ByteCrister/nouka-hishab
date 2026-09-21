import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FadeInUp } from '@/components/wrappers/motion-wrappers';
import type { ReportDetail } from '@/types/reports.types';
import { format } from 'date-fns';
import { ArrowLeft, Clock, AlertCircle, CheckCircle2, FileText } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { EditReportSheet } from './EditReportSheet';
import type { ReportStatus } from '@/constants/db/app.const';

function getStatusBadgeProps(status: ReportStatus, tStatus: (key: ReportStatus) => string) {
  switch (status) {
    case 'open':
      return { variant: 'destructive' as const, icon: AlertCircle, label: tStatus('open') };
    case 'in_review':
      return { variant: 'default' as const, icon: Clock, label: tStatus('in_review') };
    case 'resolved':
      return { variant: 'secondary' as const, icon: CheckCircle2, label: tStatus('resolved') };
    case 'closed':
      return { variant: 'outline' as const, icon: CheckCircle2, label: tStatus('closed') };
    default:
      return { variant: 'outline' as const, icon: FileText, label: status };
  }
}

interface ReportDetailHeaderProps {
  report: ReportDetail;
}

import { useTranslations } from 'next-intl';
import { Breadcrumbs } from '@/components/shared/Breadcrumbs';

export function ReportDetailHeader({ report }: ReportDetailHeaderProps) {
  const t = useTranslations('reportsPage.detail');
  const tSand = useTranslations('sand');
  const tReportsList = useTranslations('reportsPage.list.header');
  const tCategory = useTranslations('reportsPage.list.category');
  const tStatus = useTranslations('reportsPage.list.status');
  
  const { variant, icon: Icon, label } = getStatusBadgeProps(report.status, tStatus);

  const breadcrumbItems = [
    { label: tSand('home'), href: '/', isHome: true },
    { label: tReportsList('title'), href: '/reports' },
    { label: report.title }
  ];

  return (
    <div className="space-y-4">
      <Breadcrumbs items={breadcrumbItems} />
      <FadeInUp>
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 pt-4">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" asChild className="rounded-full shrink-0">
              <Link href="/reports">
                <ArrowLeft className="w-5 h-5" />
              </Link>
            </Button>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="capitalize">
                {tCategory(report.category as Parameters<typeof tCategory>[0])}
              </Badge>
              <Badge variant={variant} className="flex items-center gap-1.5">
                <Icon className="w-3.5 h-3.5" />
                {label}
              </Badge>
            </div>
          </div>
          
          <div className="pl-12">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              {report.title}
            </h1>
            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground font-medium">
              <span>#{report.publicId}</span>
              <span>•</span>
              <span>{t('header.created')} {format(new Date(report.createdAt), 'MMMM d, yyyy h:mm a')}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 md:pl-0 pl-12">
          {/* Admin only action conceptually */}
          <EditReportSheet report={report} />
        </div>
      </div>
    </FadeInUp>
    </div>
  );
}
