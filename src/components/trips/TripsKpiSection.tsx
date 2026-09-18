'use client';

import { useTripsFiltersStore } from '@/store/useTripsFiltersStore';
import { useTrips } from '@/hooks/queries/useTripsQueries';
import { TrendingUp, TrendingDown, Navigation } from 'lucide-react';
import { FadeInUp } from '@/components/wrappers/motion-wrappers';
import { useTranslations } from 'next-intl';

export function TripsKpiSection() {
  const t = useTranslations('trips');
  const { filters } = useTripsFiltersStore();
  const { data, isLoading } = useTrips(filters);
  const kpis = data?.kpis;

  if (isLoading && !kpis) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-xl border bg-card p-5 h-[110px] animate-pulse">
            <div className="flex items-center space-x-3 mb-3">
              <div className="h-9 w-9 bg-muted rounded-lg" />
              <div className="h-4 w-24 bg-muted rounded-md" />
            </div>
            <div className="h-8 w-20 bg-muted rounded-md" />
          </div>
        ))}
      </div>
    );
  }

  const items = [
    {
      title: t('kpi.totalTrips'),
      value: kpis?.totalTrips ?? 0,
      icon: <Navigation className="w-5 h-5 text-primary" />,
      bg: 'bg-primary/10',
      delay: 0.1,
    },
    {
      title: t('kpi.totalRevenue'),
      value: `৳ ${(kpis?.totalProfitTk ?? 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`,
      icon: <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />,
      bg: 'bg-emerald-100 dark:bg-emerald-900/30',
      delay: 0.2,
    },
    {
      title: t('kpi.totalCosts'),
      value: `৳ ${(kpis?.totalCostTk ?? 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`,
      icon: <TrendingDown className="w-5 h-5 text-rose-500 dark:text-rose-400" />,
      bg: 'bg-rose-100 dark:bg-rose-900/30',
      delay: 0.3,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {items.map((item, idx) => (
        <FadeInUp key={idx} delay={item.delay}>
          <div className="rounded-xl border border-border/50 bg-card p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center space-x-3 mb-3">
              <div className={`p-2 rounded-lg ${item.bg}`}>{item.icon}</div>
              <h3 className="font-medium text-muted-foreground text-sm">{item.title}</h3>
            </div>
            <p className="text-2xl font-bold tracking-tight text-foreground">{item.value}</p>
          </div>
        </FadeInUp>
      ))}
    </div>
  );
}


