'use client';

import { useRouter } from 'next/navigation';
import { useSandTripDetail } from '@/hooks/queries/useTripsQueries';
import { useDeleteSandTrip, useUpdateSandTrip } from '@/hooks/mutations/useSandTripsMutations';
import { SandTripExpensesSection } from './SandTripExpensesSection';
import { SandTripAttachmentsSection } from './SandTripAttachmentsSection';
import { SandTripDetailSkeleton } from './SandTripDetailSkeleton';
import { SandTripReportExportButton } from '@/components/sand/reports/SandTripReportExportButton';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FadeInUp } from '@/components/wrappers/motion-wrappers';
import {
  ArrowLeft, Ship, MapPin, Clock, Package, Banknote,
  FileText, TrendingUp, TrendingDown, Trash2, Edit3,
  User, Phone
} from 'lucide-react';
import Link from 'next/link';
import { SAND_TRIP_STATUSES } from '@/constants/db/sand.const';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { SandTripStatus } from '@/constants/db/sand.const';
import { useTranslations } from 'next-intl';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Props { publicId: string; }

const STATUS_CLS: Record<string, string> = {
  [SAND_TRIP_STATUSES.SCHEDULED]: 'bg-sky-500/10 text-sky-500 border-sky-500/20',
  [SAND_TRIP_STATUSES.LOADING]: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  [SAND_TRIP_STATUSES.IN_TRANSIT]: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  [SAND_TRIP_STATUSES.COMPLETED]: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  [SAND_TRIP_STATUSES.CANCELLED]: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
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
  const t = useTranslations('sandTripsDetail');
  const router = useRouter();
  const { data: trip, isLoading, error } = useSandTripDetail(publicId);
  const { mutateAsync: deleteTrip, isPending: isDeleting } = useDeleteSandTrip(() => router.push('/trips'));
  const { mutateAsync: updateTrip, isPending: isUpdating } = useUpdateSandTrip();


  if (isLoading) {
    return <SandTripDetailSkeleton />;
  }

  if (error || !trip) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center mt-6">
        <p className="text-lg font-semibold text-muted-foreground">{t('notFound')}</p>
        <Button variant="outline" className="mt-4" asChild>
          <Link href="/trips"><ArrowLeft className="w-4 h-4 mr-2" />{t('backToTrips')}</Link>
        </Button>
      </div>
    );
  }

  const statusCls = STATUS_CLS[trip.status] ?? 'bg-muted text-muted-foreground';
  const statusLabel = t(`status.${trip.status}` as Parameters<typeof t>[0], { fallback: trip.status });
  const profit = Number(trip.netProfitTk ?? 0);

  const handleStatusChange = async (newStatus: string) => {
    await updateTrip({ publicId, payload: { status: newStatus as SandTripStatus } });
  };

  const handleDelete = async () => {
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
                <Badge variant="outline" className={`${statusCls} border`}>{statusLabel}</Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {trip.source ?? '—'} → {trip.destination ?? '—'}
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
                <SelectItem value={SAND_TRIP_STATUSES.SCHEDULED}>{t('status.scheduled')}</SelectItem>
                <SelectItem value={SAND_TRIP_STATUSES.LOADING}>{t('status.loading')}</SelectItem>
                <SelectItem value={SAND_TRIP_STATUSES.IN_TRANSIT}>{t('status.in_transit')}</SelectItem>
                <SelectItem value={SAND_TRIP_STATUSES.COMPLETED}>{t('status.completed')}</SelectItem>
                <SelectItem value={SAND_TRIP_STATUSES.CANCELLED}>{t('status.cancelled')}</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" asChild className="h-9 px-3 rounded-xl hidden sm:flex">
              <Link href={`/trips/sand/${publicId}/edit`}><Edit3 className="w-4 h-4 mr-2" />{t('edit', { fallback: 'Edit' })}</Link>
            </Button>
            <SandTripReportExportButton mode="single" tripPublicId={publicId} />
            <Button variant="ghost" asChild className="h-9 px-3 rounded-xl hidden sm:flex">
              <Link href="/trips"><ArrowLeft className="w-4 h-4 mr-2" />{t('back')}</Link>
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" className="h-9 rounded-xl hover:bg-destructive hover:text-destructive-foreground">
                  <Trash2 className="w-4 h-4 mr-1" />{t('delete')}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{t('deleteConfirm.title')}</AlertDialogTitle>
                  <AlertDialogDescription>
                    {t('deleteConfirm.tripDescription')}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{t('deleteConfirm.cancel')}</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={(e) => {
                      e.preventDefault();
                      handleDelete();
                    }}
                    disabled={isDeleting}
                    className="bg-destructive hover:bg-destructive/90"
                  >
                    {isDeleting ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      t('deleteConfirm.delete')
                    )}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </FadeInUp>

      {/* Profit banner */}
      <FadeInUp delay={0.1}>
        <div className={`rounded-2xl border p-5 flex flex-wrap items-center justify-between gap-4 ${profit >= 0 ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-rose-500/5 border-rose-500/20'}`}>
          <div className="flex items-center gap-3">
            {profit >= 0 ? <TrendingUp className="w-5 h-5 text-emerald-500" /> : <TrendingDown className="w-5 h-5 text-rose-500" />}
            <div>
              <p className="text-xs text-muted-foreground font-medium">{t('profit.netProfit')}</p>
              <p className={`text-2xl font-bold ${profit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'}`}>{fmt(profit)}</p>
            </div>
          </div>
          <div className="flex gap-6 text-right">
            <div>
              <p className="text-xs text-muted-foreground">{t('profit.sale')}</p>
              <p className="font-semibold">{fmt(trip.saleAmountTk)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{t('profit.totalCost')}</p>
              <p className="font-semibold">{fmt(trip.totalOperatingCostTk)}</p>
            </div>
          </div>
        </div>
      </FadeInUp>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Details, Expenses, Attachments */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Location & Timing */}
        <FadeInUp delay={0.15}>
          <div className="rounded-2xl border border-border/50 bg-card/60 p-6 h-full">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-4 h-4 text-primary" />
              <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">{t('sections.routeTiming')}</h3>
            </div>
            
            <div className="flex items-start justify-between py-2.5 border-b border-border/40 gap-4">
              <span className="text-sm text-muted-foreground shrink-0">{t('labels.source')}</span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-right">{trip.source ?? '—'}</span>
              </div>
            </div>
            
            <div className="flex items-start justify-between py-2.5 border-b border-border/40 gap-4">
              <span className="text-sm text-muted-foreground shrink-0">{t('labels.destination')}</span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-right">{trip.destination ?? '—'}</span>
              </div>
            </div>

            <InfoRow label={t('labels.departure')} value={<span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-muted-foreground" />{fmtDate(trip.departureTime)}</span>} />
            <InfoRow label={t('labels.arrival')} value={fmtDate(trip.arrivalTime)} />
          </div>
        </FadeInUp>

        {/* Cargo */}
        <FadeInUp delay={0.2}>
          <div className="rounded-2xl border border-border/50 bg-card/60 p-6 h-full">
            <div className="flex items-center gap-2 mb-4">
              <Package className="w-4 h-4 text-primary" />
              <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">{t('sections.cargo')}</h3>
            </div>
            <InfoRow label={t('labels.volume')} value={trip.cargoValue != null ? `${trip.cargoValue} ${trip.cargoUnit ?? ''}` : null} />
            <InfoRow label={t('labels.buyerName')} value={<span className="flex items-center gap-1.5"><User className="w-3.5 h-3.5 text-muted-foreground" />{trip.buyerName}</span>} />
            <InfoRow label={t('labels.buyerPhone')} value={<span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-muted-foreground" />{trip.buyerPhone}</span>} />
          </div>
        </FadeInUp>
      </div>

      {/* Notes */}
      {trip.notes && (
        <FadeInUp delay={0.3}>
          <div className="rounded-2xl border border-border/50 bg-card/60 p-6">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-4 h-4 text-primary" />
              <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">{t('sections.notes')}</h3>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">{trip.notes}</p>
          </div>
        </FadeInUp>
      )}

      {/* Expenses */}
      <FadeInUp delay={0.35}>
        <SandTripExpensesSection tripPublicId={publicId} expenses={trip.expenses} operatingCostTk={trip.operatingCostTk} />
      </FadeInUp>

      {/* Attachments */}
      <FadeInUp delay={0.4}>
        <SandTripAttachmentsSection tripPublicId={publicId} attachments={trip.attachments} />
      </FadeInUp>
    </div>

    {/* Right Column: Financials Sidebar */}
    <div className="lg:col-span-1 space-y-6">

        {/* Financials */}
        <FadeInUp delay={0.25}>
          <div className="rounded-2xl border border-border/50 bg-card/60 p-6 sticky top-6">
            <div className="flex items-center gap-2 mb-4">
              <Banknote className="w-4 h-4 text-primary" />
              <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">{t('sections.financials')}</h3>
            </div>
            
            <div className="space-y-4 font-mono text-sm mt-6">
              <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Cost Breakdown</div>

              <div className="flex justify-between items-start">
                <div>
                  <div className="text-muted-foreground">{t('labels.purchaseCost')}</div>
                  {trip.purchaseRatePerUnitTk && trip.cargoValue && (
                    <div className="text-xs text-muted-foreground/70 mt-0.5">{trip.cargoValue} {trip.cargoUnit} @ {fmt(trip.purchaseRatePerUnitTk)}</div>
                  )}
                </div>
                <div className="text-muted-foreground">{fmt(trip.purchaseCostTk)}</div>
              </div>

              <div className="flex justify-between items-start">
                <div>
                  <div className="text-muted-foreground">{t('labels.govtRoyalty')}</div>
                  {trip.govtRoyaltyRateTk && trip.cargoValue && (
                    <div className="text-xs text-muted-foreground/70 mt-0.5">{trip.cargoValue} {trip.cargoUnit} @ {fmt(trip.govtRoyaltyRateTk)}</div>
                  )}
                </div>
                <div className="text-muted-foreground">{fmt(trip.govtRoyaltyTk)}</div>
              </div>

              <div className="flex justify-between items-start">
                <div>
                  <div className="text-muted-foreground">{t('labels.localToll')}</div>
                  {trip.localTollRateTk && trip.cargoValue && (
                    <div className="text-xs text-muted-foreground/70 mt-0.5">{trip.cargoValue} {trip.cargoUnit} @ {fmt(trip.localTollRateTk)}</div>
                  )}
                </div>
                <div className="text-muted-foreground">{fmt(trip.localTollTk)}</div>
              </div>

              <div className="flex justify-between items-start">
                <div>
                  <div className="text-muted-foreground">{t('labels.upfrontOperatingCost')}</div>
                  {trip.operatingCostRatePerUnitTk && trip.cargoValue && (
                    <div className="text-xs text-muted-foreground/70 mt-0.5">{trip.cargoValue} {trip.cargoUnit} @ {fmt(trip.operatingCostRatePerUnitTk)}</div>
                  )}
                </div>
                <div className="text-muted-foreground">{fmt(trip.operatingCostTk)}</div>
              </div>

              {/* Dashed Separator */}
              <div className="my-2 pt-2 border-t-2 border-dashed border-border/60"></div>

              <div className="flex justify-between items-center">
                <span className="font-medium text-foreground">Total Costs</span>
                <span className="font-medium text-foreground">{fmt(trip.totalOperatingCostTk)}</span>
              </div>

              {/* Final Calculation Block */}
              <div className="mt-8 pt-4 border-t border-border/40 space-y-3">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="font-medium text-foreground">{t('labels.saleAmount')} (Revenue)</span>
                    {trip.saleRatePerUnitTk && trip.cargoValue && (
                      <div className="text-xs font-normal text-muted-foreground mt-0.5">{trip.cargoValue} {trip.cargoUnit} @ {fmt(trip.saleRatePerUnitTk)}</div>
                    )}
                  </div>
                  <span className="font-medium text-emerald-600 dark:text-emerald-400">+{fmt(trip.saleAmountTk)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium text-foreground">Total Costs</span>
                  <span className="font-medium text-rose-500">-{fmt(trip.totalOperatingCostTk)}</span>
                </div>
              </div>

              {/* Total Costs */}
              <div className="flex justify-between items-center pt-2 border-t border-dashed border-border/60 text-muted-foreground">
                <span className="font-semibold">{t('labels.totalOperatingCosts')}</span>
                <span className="font-semibold">{fmt(trip.totalOperatingCostTk)}</span>
              </div>

              {/* Net Profit */}
              <div className="flex justify-between items-center pt-2 mt-2 border-t-2 border-border/60">
                <span className="font-bold text-base text-foreground">{t('profit.netProfit')}</span>
                <span className={`font-bold text-lg ${profit >= 0 ? 'text-primary' : 'text-destructive'}`}>
                  {fmt(profit)}
                </span>
              </div>
            </div>
          </div>
        </FadeInUp>
      </div>
      </div>
    </div>
  );
}


