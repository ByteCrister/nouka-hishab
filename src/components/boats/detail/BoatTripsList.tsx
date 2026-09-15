"use client";

import { useTranslations, useFormatter } from 'next-intl';
import { useBoatStore } from '@/store/useBoatStore';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Inbox } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { FadeInUp } from '@/components/wrappers/motion-wrappers';
import type { SandTripStatus } from '@/constants/db/sand.const';

export function BoatTripsList() {
  const t = useTranslations('boatsPage.detail.trips');
  const format = useFormatter();
  const router = useRouter();
  const { trips, tripsMeta, isTripsLoading, setTripsPage } = useBoatStore();

  const getStatusBadge = (status: SandTripStatus) => {
    switch (status) {
      case 'completed':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400';
      case 'in_transit':
      case 'loading':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'cancelled':
        return 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const handleRowClick = (publicId: string) => {
    router.push(`/sand/trips/${publicId}`);
  };

  if (isTripsLoading && trips.length === 0) {
    return (
      <div className="rounded-xl border bg-card p-8 flex justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="h-8 w-8 rounded-full bg-muted" />
          <div className="h-4 w-32 bg-muted rounded" />
        </div>
      </div>
    );
  }

  if (trips.length === 0) {
    return (
      <div className="rounded-xl border border-dashed bg-card/50 p-12 flex flex-col items-center justify-center text-center">
        <div className="p-4 bg-muted/50 rounded-full mb-4">
          <Inbox className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium text-foreground mb-1">
          {t('noTrips')}
        </h3>
      </div>
    );
  }

  return (
    <FadeInUp delay={0.3}>
      <div className="space-y-4">
        <div className="rounded-xl border border-border/50 bg-card overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead>{t('columns.route')}</TableHead>
                <TableHead>{t('columns.departure')}</TableHead>
                <TableHead>{t('columns.cargo')}</TableHead>
                <TableHead className="text-right">{t('columns.saleAmount')}</TableHead>
                <TableHead className="text-right">{t('columns.profit')}</TableHead>
                <TableHead>{t('columns.status')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {trips.map((trip) => (
                <TableRow 
                  key={trip.id}
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => handleRowClick(trip.publicId)}
                >
                  <TableCell>
                    <div className="font-medium text-foreground">
                      {trip.sourceGhatName || '-'} → {trip.destGhatName || '-'}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground whitespace-nowrap">
                    {format.dateTime(new Date(trip.departureTime), {
                      year: 'numeric', month: 'short', day: 'numeric',
                    })}
                  </TableCell>
                  <TableCell>
                    {trip.cargoValue ? `${trip.cargoValue} ${trip.cargoUnit}` : '-'}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {trip.saleAmountTk ? `৳ ${trip.saleAmountTk.toLocaleString()}` : '-'}
                  </TableCell>
                  <TableCell className="text-right font-medium text-emerald-600 dark:text-emerald-400">
                    {trip.netProfitTk ? `৳ ${trip.netProfitTk.toLocaleString()}` : '-'}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={`capitalize ${getStatusBadge(trip.status)}`}>
                      {t(`status.${trip.status}`)}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {tripsMeta && tripsMeta.totalPages > 1 && (
        <div className="flex items-center justify-between px-2">
          <div className="text-sm text-muted-foreground">
            Page {tripsMeta.page} of {tripsMeta.totalPages}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setTripsPage(tripsMeta.page - 1)}
              disabled={tripsMeta.page === 1 || isTripsLoading}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setTripsPage(tripsMeta.page + 1)}
              disabled={tripsMeta.page === tripsMeta.totalPages || isTripsLoading}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
        )}
      </div>
    </FadeInUp>
  );
}
