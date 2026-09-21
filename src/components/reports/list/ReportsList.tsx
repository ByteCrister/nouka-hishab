"use client";

import { useReportsFiltersStore } from '@/store/useReportsFiltersStore';
import { useReports } from '@/hooks/queries/useReportsQueries';
import { StaggerContainer, StaggerItem } from '@/components/wrappers/motion-wrappers';
import { FileText, AlertCircle, Clock, CheckCircle2 } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import type { ReportStatus } from '@/constants/db/app.const';
import { useTranslations } from 'next-intl';

export function ReportsList() {
  const t = useTranslations('reportsPage.list.list');
  const tStatus = useTranslations('reportsPage.list.status');
  const tCategory = useTranslations('reportsPage.list.category');
  
  function getStatusBadgeProps(status: ReportStatus) {
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

  const { listFilters } = useReportsFiltersStore();
  const { data, isLoading, error } = useReports(listFilters);
  
  const reports = data?.items ?? [];

  if (isLoading && reports.length === 0) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="rounded-2xl border border-border/40 bg-card/40 h-[180px] animate-pulse p-6 flex flex-col">
            <div className="h-6 w-1/3 bg-muted/50 rounded-md mb-4" />
            <div className="h-6 w-3/4 bg-muted/50 rounded-md mb-auto" />
            <div className="flex justify-between items-center mt-4 pt-4 border-t border-border/40">
               <div className="h-4 w-1/4 bg-muted/40 rounded-md" />
               <div className="h-6 w-1/4 bg-muted/40 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-destructive text-center bg-destructive/5 rounded-2xl border border-destructive/20 backdrop-blur-sm">
        <AlertCircle className="w-12 h-12 mb-4 text-destructive/50" />
        <h3 className="text-xl font-semibold mb-2">{t('errorLoading')}</h3>
        <p className="text-destructive/70">{error.message}</p>
      </div>
    );
  }

  if (reports.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center border rounded-2xl bg-card/30 border-dashed backdrop-blur-sm">
        <div className="bg-muted/50 p-4 rounded-full mb-4">
          <FileText className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-semibold mb-2 text-foreground">{t('noReports')}</h3>
      </div>
    );
  }

  return (
    <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {reports.map((report) => {
        const { variant, icon: Icon, label } = getStatusBadgeProps(report.status);
        
        return (
          <StaggerItem key={report.id}>
            <Link href={`/reports/${report.publicId}`} className="block group">
              <div className="rounded-2xl border border-border/50 bg-card hover:bg-muted/30 transition-all p-6 shadow-sm hover:shadow-md flex flex-col h-full">
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant="outline" className="capitalize px-2 py-0.5 font-medium text-xs">
                    {tCategory(report.category as Parameters<typeof tCategory>[0])}
                  </Badge>
                  <div className="ml-auto text-xs text-muted-foreground font-medium flex items-center">
                    {format(new Date(report.createdAt), 'MMM d, yyyy')}
                  </div>
                </div>
                
                <h3 className="font-semibold text-lg line-clamp-2 text-foreground mb-auto group-hover:text-primary transition-colors">
                  {report.title}
                </h3>
                
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-border/40">
                  <span className="text-xs text-muted-foreground">#{report.publicId.slice(0, 8)}</span>
                  <Badge variant={variant} className="flex items-center gap-1.5 px-2.5 py-0.5">
                    <Icon className="w-3.5 h-3.5" />
                    {label}
                  </Badge>
                </div>
              </div>
            </Link>
          </StaggerItem>
        );
      })}
    </StaggerContainer>
  );
}
