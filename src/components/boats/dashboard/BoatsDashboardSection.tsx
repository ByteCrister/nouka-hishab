'use client';

import { useEffect } from 'react';
import { useBoatsDashboardStore } from '@/store/useBoatsDashboardStore';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslations } from 'next-intl';
import { RecentTripsList } from './RecentTripsList';
import { RecentMaintenanceList } from './RecentMaintenanceList';
import { BoatsDashboardSkeleton } from './BoatsDashboardSkeleton';

export function BoatsDashboardSection() {
  const t = useTranslations('sand');
  const { metrics, isLoading, isRefreshing, error, fetchDashboard, invalidateDashboard } = useBoatsDashboardStore();

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const handleRefresh = () => {
    invalidateDashboard();
    fetchDashboard(true);
  };

  if (isLoading && !metrics) {
    return <BoatsDashboardSkeleton />;
  }

  if (error && !metrics) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] text-destructive pb-8 border-b border-border/40">
        <AlertCircle className="w-8 h-8 mb-4" />
        <p>{error}</p>
        <Button variant="outline" className="mt-4" onClick={handleRefresh}>
          {t('tryAgain')}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3">
          <RecentTripsList trips={metrics?.recentTrips || []} />
        </div>
        <div className="lg:col-span-2">
          <RecentMaintenanceList maintenance={metrics?.recentMaintenance || []} />
        </div>
      </div>
    </div>
  );
}


