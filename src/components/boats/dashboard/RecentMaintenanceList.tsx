'use client';

import { useTranslations } from 'next-intl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BoatsDashboardMetrics } from '@/types/boats.types';
import { Link } from '@/i18n/routing';

interface Props {
  maintenance: BoatsDashboardMetrics['recentMaintenance'];
}

export function RecentMaintenanceList({ maintenance }: Props) {
  const t = useTranslations('sand.recentActivity');

  return (
    <Card className="h-full border shadow-sm transition-all hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-lg">{t('maintenanceTitle')}</CardTitle>
            <CardDescription>{t('maintenanceDesc')}</CardDescription>
          </div>
          <Link href="/reports" className="text-sm font-medium text-primary hover:underline">
            {t('viewAll')}
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {maintenance && maintenance.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('boat')}</TableHead>
                  <TableHead>{t('description')}</TableHead>
                  <TableHead className="text-right">{t('cost')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {maintenance.map((item) => (
                  <TableRow key={item.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium whitespace-nowrap">{item.boatName || 'Unknown Boat'}</TableCell>
                    <TableCell className="truncate max-w-[150px] text-sm text-muted-foreground" title={item.description}>
                      {item.description}
                    </TableCell>
                    <TableCell className="text-right font-semibold text-rose-600 dark:text-rose-400">
                      -৳{item.cost?.toLocaleString() || '0'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground border rounded-md border-dashed">{t('noMaintenance')}</div>
        )}
      </CardContent>
    </Card>
  );
}


