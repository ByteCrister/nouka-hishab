'use client';

import { useEffect } from 'react';
import { useSandDashboardStore } from '@/store/sand/useSandDashboardStore';
import { Ship, TrendingUp, Wrench, Map, AlertCircle, RefreshCcw, PlusCircle, Navigation, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslations } from 'next-intl';
import { FadeInUp, StaggerContainer, StaggerItem } from '@/components/wrappers/motion-wrappers';
import { Link } from '@/i18n/routing';
import { RecentTripsList } from './RecentTripsList';
import { RecentMaintenanceList } from './RecentMaintenanceList';

export function SandDashboardClient() {
  const t = useTranslations('sand');
  const { metrics, isLoading, isRefreshing, error, fetchDashboard, invalidateDashboard } = useSandDashboardStore();

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const handleRefresh = () => {
    invalidateDashboard();
    fetchDashboard(true);
  };

  if (isLoading && !metrics) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="flex justify-between items-end">
          <div className="space-y-3">
            <div className="h-10 w-64 bg-muted rounded-md" />
            <div className="h-5 w-48 bg-muted rounded-md" />
          </div>
          <div className="h-9 w-24 bg-muted rounded-md hidden sm:block" />
        </div>
        
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-xl border bg-card p-6 h-[140px] flex flex-col justify-between">
              <div className="flex justify-between items-center">
                <div className="h-5 w-24 bg-muted rounded-md" />
                <div className="h-8 w-8 bg-muted rounded-full" />
              </div>
              <div>
                <div className="h-8 w-32 bg-muted rounded-md mt-4" />
                <div className="h-4 w-40 bg-muted rounded-md mt-3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error && !metrics) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-destructive">
        <AlertCircle className="w-8 h-8 mb-4" />
        <p>{error}</p>
        <Button variant="outline" className="mt-4" onClick={handleRefresh}>
          {t('tryAgain')}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <FadeInUp>
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
              {t('title')}
            </h1>
            <p className="text-muted-foreground mt-2 text-sm md:text-base">
              {t('subtitle')}
            </p>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh} 
            disabled={isRefreshing || isLoading}
            className="hidden sm:flex"
          >
            <RefreshCcw className={`w-4 h-4 mr-2 ${(isRefreshing || isLoading) ? 'animate-spin' : ''}`} />
            {t('refresh')}
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={handleRefresh} 
            disabled={isRefreshing || isLoading}
            className="sm:hidden"
          >
            <RefreshCcw className={`w-4 h-4 ${(isRefreshing || isLoading) ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </FadeInUp>

      <FadeInUp delay={0.1}>
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between bg-card/40 backdrop-blur-sm border border-border/40 rounded-2xl p-6 shadow-sm">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">{t('actions.title')}</h2>
          </div>
          <div className="flex flex-wrap gap-3 w-full sm:w-auto">
            <Link href="/boats/new" className="flex-1 sm:flex-none">
              <Button variant="secondary" className="w-full h-11 rounded-xl bg-orange-100/50 hover:bg-orange-100 dark:bg-orange-900/20 dark:hover:bg-orange-900/40 text-orange-700 dark:text-orange-400 border border-orange-200/50 dark:border-orange-800/30 shadow-sm transition-all">
                <PlusCircle className="w-4 h-4 mr-2" />
                {t('actions.addBoat')}
              </Button>
            </Link>
            <Link href="/sand/trips/new" className="flex-1 sm:flex-none">
              <Button variant="secondary" className="w-full h-11 rounded-xl bg-blue-100/50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/40 text-blue-700 dark:text-blue-400 border border-blue-200/50 dark:border-blue-800/30 shadow-sm transition-all">
                <Navigation className="w-4 h-4 mr-2" />
                {t('actions.addTrip')}
              </Button>
            </Link>
            <Link href="/reports" className="flex-1 sm:flex-none">
              <Button variant="secondary" className="w-full h-11 rounded-xl bg-green-100/50 hover:bg-green-100 dark:bg-green-900/20 dark:hover:bg-green-900/40 text-green-700 dark:text-green-400 border border-green-200/50 dark:border-green-800/30 shadow-sm transition-all">
                <FileText className="w-4 h-4 mr-2" />
                {t('actions.reports')}
              </Button>
            </Link>
          </div>
        </div>
      </FadeInUp>

      <StaggerContainer className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Revenue */}
        <StaggerItem>
          <div className="rounded-2xl border border-border/40 bg-card/60 backdrop-blur-sm text-card-foreground shadow-sm hover:shadow-xl hover:border-green-500/30 transition-all duration-300 p-6 relative overflow-hidden group h-full">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="flex flex-row items-center justify-between pb-2 space-y-0 relative z-10">
              <h3 className="tracking-tight text-sm font-medium">{t('revenue.title')}</h3>
              <div className="h-10 w-10 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <div className="text-3xl font-bold relative z-10 mt-2">
              ৳{metrics?.revenue.total.toLocaleString() || '0'}
            </div>
            <p className="text-xs text-muted-foreground mt-3 font-medium relative z-10 bg-muted/30 inline-flex px-2 py-1 rounded-md">
              {t('revenue.currentMonth')}: ৳{metrics?.revenue.currentMonth.toLocaleString() || '0'}
            </p>
          </div>
        </StaggerItem>

        {/* Trips */}
        <StaggerItem>
          <div className="rounded-2xl border border-border/40 bg-card/60 backdrop-blur-sm text-card-foreground shadow-sm hover:shadow-xl hover:border-blue-500/30 transition-all duration-300 p-6 relative overflow-hidden group h-full">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="flex flex-row items-center justify-between pb-2 space-y-0 relative z-10">
              <h3 className="tracking-tight text-sm font-medium">{t('trips.title')}</h3>
              <div className="h-10 w-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <Map className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div className="text-3xl font-bold relative z-10 mt-2">
              {metrics?.trips.total.toLocaleString() || '0'}
            </div>
            <p className="text-xs text-muted-foreground mt-3 font-medium relative z-10 bg-muted/30 inline-flex px-2 py-1 rounded-md">
              {metrics?.trips.completed || 0} {t('trips.completed')} · {metrics?.trips.ongoing || 0} {t('trips.ongoing')}
            </p>
          </div>
        </StaggerItem>

        {/* Boats */}
        <StaggerItem>
          <div className="rounded-2xl border border-border/40 bg-card/60 backdrop-blur-sm text-card-foreground shadow-sm hover:shadow-xl hover:border-orange-500/30 transition-all duration-300 p-6 relative overflow-hidden group h-full">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="flex flex-row items-center justify-between pb-2 space-y-0 relative z-10">
              <h3 className="tracking-tight text-sm font-medium">{t('boats.title')}</h3>
              <div className="h-10 w-10 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                <Ship className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
            <div className="text-3xl font-bold relative z-10 mt-2">
              {metrics?.boats.active.toLocaleString() || '0'}
            </div>
            <p className="text-xs text-muted-foreground mt-3 font-medium relative z-10 bg-muted/30 inline-flex px-2 py-1 rounded-md">
              {t('boats.outOf', { total: metrics?.boats.total || 0 })}
            </p>
          </div>
        </StaggerItem>

        {/* Maintenance */}
        <StaggerItem>
          <div className="rounded-2xl border border-border/40 bg-card/60 backdrop-blur-sm text-card-foreground shadow-sm hover:shadow-xl hover:border-rose-500/30 transition-all duration-300 p-6 relative overflow-hidden group h-full">
            <div className="absolute inset-0 bg-gradient-to-br from-rose-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="flex flex-row items-center justify-between pb-2 space-y-0 relative z-10">
              <h3 className="tracking-tight text-sm font-medium">{t('maintenance.title')}</h3>
              <div className="h-10 w-10 rounded-xl bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center">
                <Wrench className="h-5 w-5 text-rose-600 dark:text-rose-400" />
              </div>
            </div>
            <div className="text-3xl font-bold relative z-10 mt-2">
              ৳{metrics?.boats.maintenanceCostTotal.toLocaleString() || '0'}
            </div>
            <p className="text-xs text-muted-foreground mt-3 font-medium relative z-10 bg-muted/30 inline-flex px-2 py-1 rounded-md">
              {t('maintenance.subtitle')}
            </p>
          </div>
        </StaggerItem>
      </StaggerContainer>

      <FadeInUp delay={0.3}>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3">
            <RecentTripsList trips={metrics?.recentTrips || []} />
          </div>
          <div className="lg:col-span-2">
            <RecentMaintenanceList maintenance={metrics?.recentMaintenance || []} />
          </div>
        </div>
      </FadeInUp>
    </div>
  );
}
