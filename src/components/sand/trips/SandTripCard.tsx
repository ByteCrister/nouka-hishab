'use client';

import { SandTripListItem } from '@/types/sand/trips.types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Clock, Package, TrendingUp, Ship } from 'lucide-react';
import Link from 'next/link';
import { SAND_TRIP_STATUSES } from '@/constants/db/sand.const';

interface Props {
  trip: SandTripListItem;
}

const STATUS_CONFIG: Record<string, { label: string; cls: string }> = {
  [SAND_TRIP_STATUSES.SCHEDULED]: { label: 'Scheduled', cls: 'bg-sky-500/10 text-sky-500' },
  [SAND_TRIP_STATUSES.LOADING]: { label: 'Loading', cls: 'bg-amber-500/10 text-amber-500' },
  [SAND_TRIP_STATUSES.IN_TRANSIT]: { label: 'In Transit', cls: 'bg-blue-500/10 text-blue-500' },
  [SAND_TRIP_STATUSES.COMPLETED]: { label: 'Completed', cls: 'bg-emerald-500/10 text-emerald-500' },
  [SAND_TRIP_STATUSES.CANCELLED]: { label: 'Cancelled', cls: 'bg-rose-500/10 text-rose-500' },
};

function fmt(num: number | null) {
  if (num == null) return '—';
  return `৳ ${num.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function SandTripCard({ trip }: Props) {
  const status = STATUS_CONFIG[trip.status] ?? { label: trip.status, cls: 'bg-muted text-muted-foreground' };
  const profitPositive = (trip.netProfitTk ?? 0) >= 0;

  return (
    <Link href={`/sand/trips/${trip.publicId}`}>
      <Card className="group overflow-hidden border-border/50 bg-card hover:shadow-lg hover:shadow-primary/5 hover:border-primary/20 transition-all duration-300 cursor-pointer h-full">
        <CardContent className="p-5 flex flex-col gap-4">
          {/* Top row: boat + status */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="p-1.5 bg-primary/10 rounded-lg shrink-0">
                <Ship className="w-4 h-4 text-primary" />
              </div>
              <span className="font-semibold text-sm truncate">{trip.boatName}</span>
            </div>
            <Badge variant="outline" className={`border-0 text-xs font-medium shrink-0 ${status.cls}`}>
              {status.label}
            </Badge>
          </div>

          {/* Locations */}
          <div className="flex items-start gap-2 text-sm text-muted-foreground">
            <MapPin className="w-4 h-4 shrink-0 mt-0.5 text-primary/60" />
            <div className="min-w-0">
              <span className="font-medium text-foreground truncate block">{trip.sourceLocation?.name ?? '—'}</span>
              <span className="text-xs">→ {trip.destLocation?.name ?? '—'}</span>
            </div>
          </div>

          {/* Date */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="w-3.5 h-3.5 shrink-0" />
            <span>{fmtDate(trip.departureTime)}</span>
            {trip.arrivalTime && <span>— {fmtDate(trip.arrivalTime)}</span>}
          </div>

          {/* Cargo + financials */}
          <div className="border-t border-border/50 pt-3 flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Package className="w-3.5 h-3.5" />
              <span>{trip.cargoValue != null ? `${trip.cargoValue} ${trip.cargoUnit ?? ''}` : '—'}</span>
            </div>
            <div className="flex items-center gap-1">
              <TrendingUp className={`w-3.5 h-3.5 ${profitPositive ? 'text-emerald-500' : 'text-rose-500'}`} />
              <span className={`text-sm font-bold ${profitPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'}`}>
                {fmt(trip.netProfitTk)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
