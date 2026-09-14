'use client';

import { useTranslations } from 'next-intl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { SandDashboardMetrics } from '@/types/sand.types';
import { SAND_TRIP_STATUSES } from '@/constants/db/sand.const';
import { Link } from '@/i18n/routing';

interface Props {
  trips: SandDashboardMetrics['recentTrips'];
}

export function RecentTripsList({ trips }: Props) {
  const t = useTranslations('sand.recentActivity');

  const getStatusBadge = (status: string) => {
    switch (status) {
      case SAND_TRIP_STATUSES.COMPLETED:
        return <Badge className="bg-green-500 hover:bg-green-600">{status}</Badge>;
      case SAND_TRIP_STATUSES.IN_TRANSIT:
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-300">{status}</Badge>;
      case SAND_TRIP_STATUSES.LOADING:
        return <Badge variant="outline" className="text-orange-600 border-orange-200 bg-orange-50 hover:bg-orange-100 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800">{status}</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Card className="h-full border shadow-sm transition-all hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-lg">{t('tripsTitle')}</CardTitle>
            <CardDescription>{t('tripsDesc')}</CardDescription>
          </div>
          <Link href="/sand/trips" className="text-sm font-medium text-primary hover:underline">
            {t('viewAll')}
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {trips && trips.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('boat')}</TableHead>
                  <TableHead>{t('status')}</TableHead>
                  <TableHead className="text-right">{t('amount')}</TableHead>
                  <TableHead className="text-right">{t('date')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {trips.map((trip) => (
                  <TableRow key={trip.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">{trip.boatName || 'Unknown Boat'}</TableCell>
                    <TableCell>{getStatusBadge(trip.status)}</TableCell>
                    <TableCell className="text-right font-semibold">৳{trip.amount?.toLocaleString() || '0'}</TableCell>
                    <TableCell className="text-right text-muted-foreground text-sm">
                      {trip.date ? new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(trip.date)) : '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground border rounded-md border-dashed">{t('noTrips')}</div>
        )}
      </CardContent>
    </Card>
  );
}
