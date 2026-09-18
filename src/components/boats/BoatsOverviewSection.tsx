"use client";

import { useEffect } from 'react';
import { useBoatFiltersStore } from '@/store/useBoatFiltersStore';
import { useBoats } from '@/hooks/queries/useBoatsQueries';
import { useBoatsDashboardStore } from '@/store/useBoatsDashboardStore';
import { useTranslations } from 'next-intl';
import { 
  Ship, CheckCircle2, Wrench, PauseCircle, Package, Banknote, 
  TrendingUp, Map, Navigation, FileText 
} from 'lucide-react';
import { FadeInUp, StaggerContainer, StaggerItem } from '@/components/wrappers/motion-wrappers';
import { Button } from '@/components/ui/button';
import { Link } from '@/i18n/routing';

export function BoatsOverviewSection() {
  // Global dashboard metrics
  const tSand = useTranslations('sand');
  const { metrics, fetchDashboard } = useBoatsDashboardStore();
  
  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  // Filter-specific KPIs
  const { listFilters } = useBoatFiltersStore();
  const { data: listData, isLoading: isListLoading } = useBoats(listFilters);
  const kpis = listData?.kpis;
  const tBoats = useTranslations('boatsPage');
  const tKpis = useTranslations('boatsPage.kpis');

  const globalCards = [
    {
      label: tSand('revenue.title'),
      value: `৳${metrics?.revenue.total.toLocaleString() || '0'}`,
      sub: `${tSand('revenue.currentMonth')}: ৳${metrics?.revenue.currentMonth.toLocaleString() || '0'}`,
      icon: <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />,
      iconBg: 'bg-green-100 dark:bg-green-900/30',
      hover: 'hover:border-green-500/30',
      gradient: 'from-green-500/5',
    },
    {
      label: tSand('trips.title'),
      value: metrics?.trips.total.toLocaleString() || '0',
      sub: `${metrics?.trips.completed || 0} ${tSand('trips.completed')} · ${metrics?.trips.ongoing || 0} ${tSand('trips.ongoing')}`,
      icon: <Map className="h-5 w-5 text-blue-600 dark:text-blue-400" />,
      iconBg: 'bg-blue-100 dark:bg-blue-900/30',
      hover: 'hover:border-blue-500/30',
      gradient: 'from-blue-500/5',
    },
    {
      label: tSand('maintenance.title'),
      value: `৳${metrics?.boats.maintenanceCostTotal.toLocaleString() || '0'}`,
      sub: tSand('maintenance.subtitle'),
      icon: <Wrench className="h-5 w-5 text-rose-600 dark:text-rose-400" />,
      iconBg: 'bg-rose-100 dark:bg-rose-900/30',
      hover: 'hover:border-rose-500/30',
      gradient: 'from-rose-500/5',
    },
  ];

  const listKpiItems = [
    {
      title: tKpis('totalBoats'),
      value: kpis?.totalBoats || 0,
      icon: <Ship className="w-5 h-5 text-primary" />,
      bg: 'bg-primary/10',
      delay: 0.1,
    },
    {
      title: tKpis('activeBoats'),
      value: kpis?.activeBoats || 0,
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />,
      bg: 'bg-emerald-100 dark:bg-emerald-900/30',
      delay: 0.2,
    },
    {
      title: tKpis('maintenanceBoats'),
      value: kpis?.maintenanceBoats || 0,
      icon: <Wrench className="w-5 h-5 text-amber-600 dark:text-amber-400" />,
      bg: 'bg-amber-100 dark:bg-amber-900/30',
      delay: 0.3,
    },
    {
      title: tKpis('inactiveBoats'),
      value: kpis?.inactiveBoats || 0,
      icon: <PauseCircle className="w-5 h-5 text-rose-600 dark:text-rose-400" />,
      bg: 'bg-rose-100 dark:bg-rose-900/30',
      delay: 0.4,
    },
    {
      title: tKpis('totalFleetCapacity'),
      value: (kpis?.totalFleetCapacity || 0).toLocaleString(),
      icon: <Package className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />,
      bg: 'bg-indigo-100 dark:bg-indigo-900/30',
      delay: 0.5,
    },
    {
      title: tKpis('totalFleetValue'),
      value: `৳ ${(kpis?.totalFleetValueTk || 0).toLocaleString()}`,
      icon: <Banknote className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />,
      bg: 'bg-cyan-100 dark:bg-cyan-900/30',
      delay: 0.6,
    },
  ];

  return (
    <div className="rounded-3xl border border-border/50 bg-card/20 p-6 sm:p-8 backdrop-blur-md shadow-sm space-y-8">
      
      {/* Header & Quick Actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">{tBoats('overview.title')}</h2>
          <p className="text-sm text-muted-foreground mt-1">{tBoats('overview.subtitle')}</p>
        </div>
        <div className="flex flex-wrap gap-3 w-full sm:w-auto">
          <Link href="/trips/sand/new" className="flex-1 sm:flex-none">
            <Button variant="secondary" className="w-full h-10 rounded-xl bg-blue-100/50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/40 text-blue-700 dark:text-blue-400 border border-blue-200/50 dark:border-blue-800/30 shadow-sm transition-all">
              <Navigation className="w-4 h-4 mr-2" />
              {tSand('actions.addTrip')}
            </Button>
          </Link>
          <Link href="/reports" className="flex-1 sm:flex-none">
            <Button variant="secondary" className="w-full h-10 rounded-xl bg-green-100/50 hover:bg-green-100 dark:bg-green-900/20 dark:hover:bg-green-900/40 text-green-700 dark:text-green-400 border border-green-200/50 dark:border-green-800/30 shadow-sm transition-all">
              <FileText className="w-4 h-4 mr-2" />
              {tSand('actions.reports')}
            </Button>
          </Link>
        </div>
      </div>

      {/* Global Metrics Row */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold tracking-wider text-muted-foreground uppercase">{tBoats('overview.globalMetrics')}</h3>
        <StaggerContainer className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {globalCards.map((card) => (
            <StaggerItem key={card.label}>
              <div className={`rounded-2xl border border-border/40 bg-card/60 backdrop-blur-sm text-card-foreground shadow-sm ${card.hover} hover:shadow-md transition-all duration-300 p-5 relative overflow-hidden group h-full`}>
                <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                <div className="flex flex-row items-center justify-between pb-2 space-y-0 relative z-10">
                  <h3 className="tracking-tight text-sm font-medium">{card.label}</h3>
                  <div className={`h-10 w-10 rounded-xl ${card.iconBg} flex items-center justify-center`}>
                    {card.icon}
                  </div>
                </div>
                <div className="text-2xl font-bold relative z-10 mt-1">{card.value}</div>
                <p className="text-xs text-muted-foreground mt-2 font-medium relative z-10 bg-muted/40 inline-flex px-2 py-1 rounded-md">
                  {card.sub}
                </p>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>

      {/* Filtered KPIs Row */}
      <div className="space-y-3 pt-2">
        <h3 className="text-sm font-semibold tracking-wider text-muted-foreground uppercase">{tBoats('overview.filteredMetrics')}</h3>
        
        {isListLoading && !kpis ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="rounded-xl border border-border/40 bg-card/40 p-3.5 h-[72px] animate-pulse flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="h-9 w-9 bg-muted rounded-lg" />
                  <div className="h-4 w-20 bg-muted rounded-md" />
                </div>
                <div className="h-6 w-12 bg-muted rounded-md" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {listKpiItems.map((item, idx) => (
              <FadeInUp key={idx} delay={item.delay}>
                <div className="rounded-xl border border-border/40 bg-card/40 hover:bg-card/60 backdrop-blur-sm p-3.5 shadow-sm hover:shadow-md hover:border-primary/20 transition-all flex items-center justify-between group">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${item.bg} group-hover:scale-110 transition-transform duration-300`}>
                      {item.icon}
                    </div>
                    <h3 className="font-medium text-muted-foreground text-xs sm:text-sm leading-tight">
                      {item.title}
                    </h3>
                  </div>
                  <p className="text-xl font-bold tracking-tight text-foreground pl-3 text-right" title={String(item.value)}>
                    {item.value}
                  </p>
                </div>
              </FadeInUp>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}


