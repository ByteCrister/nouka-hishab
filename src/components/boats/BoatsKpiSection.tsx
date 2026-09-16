"use client";

import { useBoatFiltersStore } from '@/store/useBoatFiltersStore';
import { useBoats } from '@/hooks/queries/useBoatsQueries';
import { useTranslations } from 'next-intl';
import { Ship, CheckCircle2, Wrench, PauseCircle, Package, Banknote } from 'lucide-react';
import { FadeInUp } from '@/components/wrappers/motion-wrappers';

export function BoatsKpiSection() {
  const { listFilters } = useBoatFiltersStore();
  const { data, isLoading } = useBoats(listFilters);
  const kpis = data?.kpis;
  const t = useTranslations('boatsPage.kpis');

  if (isLoading && !kpis) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="rounded-xl border bg-card p-5 h-[110px] animate-pulse">
            <div className="flex items-center space-x-3 mb-3">
              <div className="h-9 w-9 bg-muted rounded-lg" />
              <div className="h-4 w-20 bg-muted rounded-md" />
            </div>
            <div className="h-8 w-16 bg-muted rounded-md" />
          </div>
        ))}
      </div>
    );
  }

  const kpiItems = [
    {
      title: t('totalBoats'),
      value: kpis?.totalBoats || 0,
      icon: <Ship className="w-5 h-5 text-primary" />,
      bg: 'bg-primary/10',
      delay: 0.1,
    },
    {
      title: t('activeBoats'),
      value: kpis?.activeBoats || 0,
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />,
      bg: 'bg-emerald-100 dark:bg-emerald-900/30',
      delay: 0.2,
    },
    {
      title: t('maintenanceBoats'),
      value: kpis?.maintenanceBoats || 0,
      icon: <Wrench className="w-5 h-5 text-amber-600 dark:text-amber-400" />,
      bg: 'bg-amber-100 dark:bg-amber-900/30',
      delay: 0.3,
    },
    {
      title: t('inactiveBoats'),
      value: kpis?.inactiveBoats || 0,
      icon: <PauseCircle className="w-5 h-5 text-rose-600 dark:text-rose-400" />,
      bg: 'bg-rose-100 dark:bg-rose-900/30',
      delay: 0.4,
    },
    {
      title: t('totalFleetCapacity'),
      value: (kpis?.totalFleetCapacity || 0).toLocaleString(),
      icon: <Package className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />,
      bg: 'bg-indigo-100 dark:bg-indigo-900/30',
      delay: 0.5,
    },
    {
      title: t('totalFleetValue'),
      value: `৳ ${(kpis?.totalFleetValueTk || 0).toLocaleString()}`,
      icon: <Banknote className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />,
      bg: 'bg-cyan-100 dark:bg-cyan-900/30',
      delay: 0.6,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
      {kpiItems.map((item, idx) => (
        <FadeInUp key={idx} delay={item.delay}>
          <div className="rounded-2xl border border-border/40 bg-card/60 backdrop-blur-sm p-5 shadow-sm hover:shadow-md hover:border-primary/20 transition-all relative overflow-hidden group">
            <div className="flex items-center space-x-3 mb-3">
              <div className={`p-2 rounded-xl ${item.bg}`}>
                {item.icon}
              </div>
              <h3 className="font-medium text-muted-foreground text-sm leading-tight">
                {item.title}
              </h3>
            </div>
            <p className="text-2xl font-bold tracking-tight text-foreground truncate" title={String(item.value)}>
              {item.value}
            </p>
          </div>
        </FadeInUp>
      ))}
    </div>
  );
}
