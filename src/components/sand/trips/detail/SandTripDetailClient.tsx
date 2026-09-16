'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSandTripDetail } from '@/hooks/queries/useSandTripsQueries';
import { useDeleteSandTrip, useUpdateSandTrip } from '@/hooks/mutations/useSandTripsMutations';
import { SandTripExpensesSection } from './SandTripExpensesSection';
import { SandTripAttachmentsSection } from './SandTripAttachmentsSection';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FadeInUp } from '@/components/wrappers/motion-wrappers';
import {
  ArrowLeft, Ship, MapPin, Clock, Package, Banknote,
  FileText, TrendingUp, TrendingDown, Trash2, Edit3,
  CheckCircle2, User, Phone
} from 'lucide-react';
import Link from 'next/link';
import { SAND_TRIP_STATUSES } from '@/constants/db/sand.const';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { SandTripStatus } from '@/constants/db/sand.const';

interface Props { publicId: string; }

const STATUS_CONFIG: Record<string, { label: string; cls: string }> = {
  [SAND_TRIP_STATUSES.SCHEDULED]: { label: 'Scheduled', cls: 'bg-sky-500/10 text-sky-500 border-sky-500/20' },
  [SAND_TRIP_STATUSES.LOADING]: { label: 'Loading', cls: 'bg-amber-500/10 text-amber-500 border-amber-500/20' },
  [SAND_TRIP_STATUSES.IN_TRANSIT]: { label: 'In Transit', cls: 'bg-blue-500/10 text-blue-500 border-blue-500/20' },
  [SAND_TRIP_STATUSES.COMPLETED]: { label: 'Completed', cls: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' },
  [SAND_TRIP_STATUSES.CANCELLED]: { label: 'Cancelled', cls: 'bg-rose-500/10 text-rose-500 border-rose-500/20' },
};

function fmt(num: string | number | null) {
  if (num == null) return '—';
  return `৳ ${Number(num).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
}

function fmtDate(iso: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between py-2.5 border-b border-border/40 last:border-0 gap-4">
      <span className="text-sm text-muted-foreground shrink-0">{label}</span>
      <span className="text-sm font-medium text-right">{value ?? '—'}</span>
    </div>
  );
}

export function SandTripDetailClient({ publicId }: Props) {
  const router = useRouter();
  const { data, isLoading, error } = useSandTripDetail(publicId);
  const trip = data?.trip;
  const { mutateAsync: deleteTrip, isPending: isDeleting } = useDeleteSandTrip(() => router.push('/sand/trips'));
  const { mutateAsync: updateTrip, isPending: isUpdating } = useUpdateSandTrip();
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (isLoading) {
    return (
      <div className="space-y-4 mt-6">
        {[...Array(3)].map((_, i) => <div key={i} className="h-32 rounded-2xl border bg-card animate-pulse" />)}
      </div>
    );
  }

  if (error || !trip) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center mt-6">
        <p className="text-lg font-semibold text-muted-foreground">Trip not found.</p>
        <Button variant="outline" className="mt-4" asChild>
          <Link href="/sand/trips"><ArrowLeft className="w-4 h-4 mr-2" />Back to Trips</Link>
        </Button>
      </div>
    );
  }

  const status = STATUS_CONFIG[trip.status] ?? { label: trip.status, cls: 'bg-muted text-muted-foreground' };
  const profit = Number(trip.netProfitTk ?? 0);

  const handleStatusChange = async (newStatus: string) => {
    await updateTrip({ publicId, payload: { status: newStatus as SandTripStatus } });
  };

  const handleDelete = async () => {
    if (!confirmDelete) { setConfirmDelete(true); return; }
    await deleteTrip(publicId);
  };

  return (
    <div className="space-y-6 pb-12 mt-6">
      {/* Header */}
      <FadeInUp delay={0.05}>
        <div className="flex flex-wrap items-start justify-between gap-4 rounded-2xl border border-border/50 bg-card/60 backdrop-blur-xl p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-primary/10 rounded-xl">
              <Ship className="w-6 h-6 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-bold">{trip.boatName}</h1>
                <Badge variant="outline" className={`${status.cls} border`}>{status.label}</Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {trip.sourceLocation?.name ?? '—'} → {trip.destLocation?.name ?? '—'}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">{fmtDate(trip.departureTime)}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Status update */}
            <Select value={trip.status} onValueChange={handleStatusChange} disabled={isUpdating}>
              <SelectTrigger className="h-9 rounded-xl w-[140px] bg-background/50 text-sm">
                <Edit3 className="w-3.5 h-3.5 mr-2 text-muted-foreground" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={SAND_TRIP_STATUSES.SCHEDULED}>Scheduled</SelectItem>
                <SelectItem value={SAND_TRIP_STATUSES.LOADING}>Loading</SelectItem>
                <SelectItem value={SAND_TRIP_STATUSES.IN_TRANSIT}>In Transit</SelectItem>
                <SelectItem value={SAND_TRIP_STATUSES.COMPLETED}>Completed</SelectItem>
                <SelectItem value={SAND_TRIP_STATUSES.CANCELLED}>Cancelled</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="ghost" asChild className="h-9 px-3 rounded-xl hidden sm:flex">
              <Link href="/sand/trips"><ArrowLeft className="w-4 h-4 mr-2" />Back</Link>
            </Button>

            <Button
              variant={confirmDelete ? 'destructive' : 'outline'}
              size="sm"
              className="h-9 rounded-xl"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : confirmDelete ? (
                <><CheckCircle2 className="w-4 h-4 mr-1" />Confirm</>
              ) : (
                <><Trash2 className="w-4 h-4 mr-1" />Delete</>
              )}
            </Button>
          </div>
        </div>
      </FadeInUp>

      {/* Profit banner */}
      <FadeInUp delay={0.1}>
        <div className={`rounded-2xl border p-5 flex items-center justify-between ${profit >= 0 ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-rose-500/5 border-rose-500/20'}`}>
          <div className="flex items-center gap-3">
            {profit >= 0 ? <TrendingUp className="w-5 h-5 text-emerald-500" /> : <TrendingDown className="w-5 h-5 text-rose-500" />}
            <div>
              <p className="text-xs text-muted-foreground font-medium">Net Profit</p>
              <p className={`text-2xl font-bold ${profit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'}`}>{fmt(profit)}</p>
            </div>
          </div>
          <div className="flex gap-6 text-right">
            <div>
              <p className="text-xs text-muted-foreground">Sale</p>
              <p className="font-semibold">{fmt(trip.saleAmountTk)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Cost</p>
              <p className="font-semibold">{fmt(trip.totalOperatingCostTk)}</p>
            </div>
          </div>
        </div>
      </FadeInUp>

      {/* Detail Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Location & Timing */}
        <FadeInUp delay={0.15}>
          <div className="rounded-2xl border border-border/50 bg-card/60 p-6">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-4 h-4 text-primary" />
              <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">Route & Timing</h3>
            </div>
            <InfoRow label="Source" value={trip.sourceLocation ? `${trip.sourceLocation.name}${trip.sourceLocation.lat ? ` (${trip.sourceLocation.lat}, ${trip.sourceLocation.lng})` : ''}` : null} />
            <InfoRow label="Destination" value={trip.destLocation ? `${trip.destLocation.name}${trip.destLocation.lat ? ` (${trip.destLocation.lat}, ${trip.destLocation.lng})` : ''}` : null} />
            <InfoRow label="Departure" value={<span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-muted-foreground" />{fmtDate(trip.departureTime)}</span>} />
            <InfoRow label="Arrival" value={fmtDate(trip.arrivalTime)} />
          </div>
        </FadeInUp>

        {/* Cargo */}
        <FadeInUp delay={0.2}>
          <div className="rounded-2xl border border-border/50 bg-card/60 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Package className="w-4 h-4 text-primary" />
              <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">Cargo</h3>
            </div>
            <InfoRow label="Volume" value={trip.cargoValue != null ? `${trip.cargoValue} ${trip.cargoUnit ?? ''}` : null} />
            <InfoRow label="Buyer Name" value={<span className="flex items-center gap-1.5"><User className="w-3.5 h-3.5 text-muted-foreground" />{trip.buyerName}</span>} />
            <InfoRow label="Buyer Phone" value={<span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-muted-foreground" />{trip.buyerPhone}</span>} />
          </div>
        </FadeInUp>

        {/* Financials */}
        <FadeInUp delay={0.25}>
          <div className="rounded-2xl border border-border/50 bg-card/60 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Banknote className="w-4 h-4 text-primary" />
              <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">Financials</h3>
            </div>
            <InfoRow label="Sale Amount" value={fmt(trip.saleAmountTk)} />
            <InfoRow label="Purchase Cost" value={fmt(trip.purchaseCostTk)} />
            <InfoRow label="Purchase Rate / Unit" value={fmt(trip.purchaseRatePerUnitTk)} />
            <InfoRow label="Govt Royalty" value={fmt(trip.govtRoyaltyTk)} />
            <InfoRow label="Royalty Rate / Unit" value={fmt(trip.govtRoyaltyRateTk)} />
            <InfoRow label="Local Toll" value={fmt(trip.localTollTk)} />
            <InfoRow label="Toll Rate / Unit" value={fmt(trip.localTollRateTk)} />
            <InfoRow label="Operating Costs" value={fmt(trip.totalOperatingCostTk)} />
          </div>
        </FadeInUp>

        {/* Notes */}
        {trip.notes && (
          <FadeInUp delay={0.3}>
            <div className="rounded-2xl border border-border/50 bg-card/60 p-6">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="w-4 h-4 text-primary" />
                <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">Notes</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">{trip.notes}</p>
            </div>
          </FadeInUp>
        )}
      </div>

      {/* Expenses */}
      <FadeInUp delay={0.35}>
        <SandTripExpensesSection tripPublicId={publicId} expenses={trip.expenses} />
      </FadeInUp>

      {/* Attachments */}
      <FadeInUp delay={0.4}>
        <SandTripAttachmentsSection tripPublicId={publicId} attachments={trip.attachments} />
      </FadeInUp>
    </div>
  );
}
