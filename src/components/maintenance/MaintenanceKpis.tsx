'use client';

import { useTranslations } from 'next-intl';
import { Card, CardContent } from '@/components/ui/card';
import { Settings, CalendarCheck } from 'lucide-react';
import type { MaintenanceKpis as MaintenanceKpisType } from '@/types/maintenance.types';

interface MaintenanceKpisProps {
  kpis: MaintenanceKpisType | undefined;
  isLoading: boolean;
}

export function MaintenanceKpis({ kpis, isLoading }: MaintenanceKpisProps) {
  const t = useTranslations('maintenance.kpis');

  const formattedTotalCost = kpis?.totalCostTk 
    ? `৳ ${kpis.totalCostTk.toLocaleString()}` 
    : '৳ 0';
    
  const formattedMonthCost = kpis?.currentMonthCostTk 
    ? `৳ ${kpis.currentMonthCostTk.toLocaleString()}` 
    : '৳ 0';

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <Card className="bg-card">
        <CardContent className="p-6 flex items-center space-x-4">
          <div className="p-3 bg-primary/10 text-primary rounded-full">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">{t('totalRecords')}</p>
            {isLoading ? (
              <div className="h-7 w-20 bg-muted rounded animate-pulse mt-1" />
            ) : (
              <h3 className="text-2xl font-bold">{kpis?.totalRecords || 0}</h3>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card">
        <CardContent className="p-6 flex items-center space-x-4">
          <div className="p-3 bg-primary/10 text-primary rounded-full">
            <span className="w-6 h-6 flex items-center justify-center font-bold text-xl">৳</span>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">{t('totalCost')}</p>
            {isLoading ? (
              <div className="h-7 w-24 bg-muted rounded animate-pulse mt-1" />
            ) : (
              <h3 className="text-2xl font-bold">{formattedTotalCost}</h3>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card">
        <CardContent className="p-6 flex items-center space-x-4">
          <div className="p-3 bg-primary/10 text-primary rounded-full">
            <CalendarCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">{t('monthCost')}</p>
            {isLoading ? (
              <div className="h-7 w-24 bg-muted rounded animate-pulse mt-1" />
            ) : (
              <h3 className="text-2xl font-bold">{formattedMonthCost}</h3>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
