'use client';

import { useState } from 'react';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { useBoatsMeta } from '@/hooks/queries/useBoatsMetaQueries';
import { useCreateSandTrip } from '@/hooks/mutations/useSandTripsMutations';
import { createSandTripSchema } from '@/utils/zod/sand-trips.schema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle, ArrowLeft, CheckCircle2, MapPin, Ship, Package, Banknote, FileText } from 'lucide-react';
import { FadeInUp } from '@/components/wrappers/motion-wrappers';
import { SAND_TRIP_STATUSES, SAND_CARGO_UNITS } from '@/constants/db/sand.const';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { MapPickerDialog } from '@/components/shared/MapPickerDialog';
import { isWithinBangladesh } from '@/utils/geo';

type FormData = {
  boatPublicId: string;
  sourceName: string;
  sourceLat: string;
  sourceLng: string;
  destName: string;
  destLat: string;
  destLng: string;
  departureTime: string;
  arrivalTime: string;
  cargoValue: string;
  cargoUnit: string;
  saleAmountTk: string;
  buyerName: string;
  buyerPhone: string;
  purchaseRatePerUnitTk: string;
  purchaseCostTk: string;
  govtRoyaltyRateTk: string;
  govtRoyaltyTk: string;
  localTollRateTk: string;
  localTollTk: string;
  status: string;
  notes: string;
};

const initialForm: FormData = {
  boatPublicId: '', sourceName: '', sourceLat: '', sourceLng: '',
  destName: '', destLat: '', destLng: '',
  departureTime: '', arrivalTime: '',
  cargoValue: '', cargoUnit: SAND_CARGO_UNITS.CUBIC_FT,
  saleAmountTk: '', buyerName: '', buyerPhone: '',
  purchaseRatePerUnitTk: '', purchaseCostTk: '',
  govtRoyaltyRateTk: '', govtRoyaltyTk: '',
  localTollRateTk: '', localTollTk: '',
  status: SAND_TRIP_STATUSES.SCHEDULED, notes: '',
};

function numOrNull(v: string) { const n = parseFloat(v); return isNaN(n) ? null : n; }

export function NewSandTripForm() {
  const t = useTranslations('sandTripsNew');
  const router = useRouter();
  const [form, setForm] = useState<FormData>(initialForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [mapPickerTarget, setMapPickerTarget] = useState<'source' | 'dest' | null>(null);
  const { data: boats, isLoading: boatsLoading } = useBoatsMeta('sand');
  const { mutateAsync: createTrip, isPending } = useCreateSandTrip((publicId) => {
    router.push(`/sand/trips/${publicId}`);
  });

  const set = (k: keyof FormData, v: string) => {
    setForm(p => ({ ...p, [k]: v }));
    setErrors(p => { const n = { ...p }; delete n[k]; return n; });
  };

  const renderError = (field: string) => errors[field] ? (
    <span className="flex items-center text-xs text-destructive mt-1.5 font-medium animate-in fade-in slide-in-from-top-1">
      <AlertCircle className="w-3.5 h-3.5 mr-1" />{errors[field]}
    </span>
  ) : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    // Check manual coordinates fall within Bangladesh
    const fe: Record<string, string> = {};
    const sLat = numOrNull(form.sourceLat);
    const sLng = numOrNull(form.sourceLng);
    if (sLat !== null && sLng !== null && !isWithinBangladesh(sLat, sLng)) {
      fe.sourceLat = "Must be in Bangladesh";
      fe.sourceLng = "Must be in Bangladesh";
    }
    const dLat = numOrNull(form.destLat);
    const dLng = numOrNull(form.destLng);
    if (dLat !== null && dLng !== null && !isWithinBangladesh(dLat, dLng)) {
      fe.destLat = "Must be in Bangladesh";
      fe.destLng = "Must be in Bangladesh";
    }
    if (Object.keys(fe).length > 0) {
      setErrors(fe);
      return;
    }

    try {
      const payload = createSandTripSchema.parse({
        boatPublicId: form.boatPublicId,
        sourceLocation: form.sourceName ? { name: form.sourceName, lat: numOrNull(form.sourceLat), lng: numOrNull(form.sourceLng) } : null,
        destLocation: form.destName ? { name: form.destName, lat: numOrNull(form.destLat), lng: numOrNull(form.destLng) } : null,
        departureTime: form.departureTime,
        arrivalTime: form.arrivalTime || null,
        cargoValue: numOrNull(form.cargoValue),
        cargoUnit: form.cargoUnit || null,
        saleAmountTk: numOrNull(form.saleAmountTk),
        buyerName: form.buyerName || null,
        buyerPhone: form.buyerPhone || null,
        purchaseRatePerUnitTk: numOrNull(form.purchaseRatePerUnitTk),
        purchaseCostTk: numOrNull(form.purchaseCostTk),
        govtRoyaltyRateTk: numOrNull(form.govtRoyaltyRateTk),
        govtRoyaltyTk: numOrNull(form.govtRoyaltyTk),
        localTollRateTk: numOrNull(form.localTollRateTk),
        localTollTk: numOrNull(form.localTollTk),
        status: form.status as typeof SAND_TRIP_STATUSES[keyof typeof SAND_TRIP_STATUSES],
        notes: form.notes || null,
      });
      await createTrip(payload);
    } catch (err) {
      if (err instanceof z.ZodError) {
        const fe: Record<string, string> = {};
        err.issues.forEach(i => { if (i.path[0]) fe[i.path[0] as string] = i.message; });
        setErrors(fe);
      }
    }
  };

  const field = (label: string, key: keyof FormData, type = 'text', placeholder = '', required = false) => (
    <div className="space-y-2 group">
      <Label className="text-sm font-medium">{label}{required && <span className="text-destructive ml-1">*</span>}</Label>
      <Input
        type={type}
        value={form[key]}
        onChange={(e) => set(key, e.target.value)}
        placeholder={placeholder}
        disabled={isPending}
        step={type === 'number' ? 'any' : undefined}
        className={`h-11 bg-background/50 rounded-xl ${errors[key] ? 'border-destructive' : ''}`}
      />
      {renderError(key)}
    </div>
  );

  return (
    <FadeInUp>
      <div className="relative overflow-hidden bg-card/70 backdrop-blur-xl p-8 rounded-2xl border border-border/50 shadow-lg max-w-4xl mx-auto mt-6">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-river-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-river-50 dark:bg-river-500/10 text-river-600 dark:text-river-400 rounded-xl">
                <Ship className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
                  {t('header.title')}
                </h2>
                <p className="text-sm text-muted-foreground">{t('header.subtitle')}</p>
              </div>
            </div>
            <Button variant="ghost" asChild className="h-9 px-4 hidden sm:flex">
              <Link href="/sand/trips"><ArrowLeft className="w-4 h-4 mr-2" />{t('back')}</Link>
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Section: Trip Info */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Ship className="w-4 h-4 text-primary" />
                <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">{t('sections.tripInfo')}</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Boat */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">{t('fields.boat')} <span className="text-destructive">*</span></Label>
                  <Select value={form.boatPublicId} onValueChange={(v) => set('boatPublicId', v)} disabled={isPending || boatsLoading}>
                    <SelectTrigger className={`h-11 bg-background/50 rounded-xl ${errors.boatPublicId ? 'border-destructive' : ''}`}>
                      <SelectValue placeholder={t('fields.boatPlaceholder')} />
                    </SelectTrigger>
                    <SelectContent>
                      {boats?.map((b) => (
                        <SelectItem key={b.publicId} value={b.publicId}>
                          {b.name}{b.capacityValue ? ` (${b.capacityValue} ${b.capacityUnit})` : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {renderError('boatPublicId')}
                </div>

                {/* Status */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">{t('fields.status')}</Label>
                  <Select value={form.status} onValueChange={(v) => set('status', v)} disabled={isPending}>
                    <SelectTrigger className="h-11 bg-background/50 rounded-xl">
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
                </div>

                {field(t('fields.departureTime'), 'departureTime', 'datetime-local', '', true)}
                {field(t('fields.arrivalTime'), 'arrivalTime', 'datetime-local')}
              </div>
            </section>

            {/* Section: Locations */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="w-4 h-4 text-primary" />
                <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">{t('sections.locations')}</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4 p-4 rounded-xl border border-border/50 bg-muted/20 relative">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t('sections.source')}</p>
                    <Button type="button" variant="outline" size="sm" className="h-7 text-xs bg-background" onClick={() => setMapPickerTarget('source')}>
                      <MapPin className="w-3 h-3 mr-1" /> Pick on Map
                    </Button>
                  </div>
                  {field(t('fields.locationName'), 'sourceName', 'text', t('fields.sourcePlaceholder'))}
                  <div className="grid grid-cols-2 gap-3">
                    {field(t('fields.latitude'), 'sourceLat', 'number', '24.123')}
                    {field(t('fields.longitude'), 'sourceLng', 'number', '91.456')}
                  </div>
                </div>
                <div className="space-y-4 p-4 rounded-xl border border-border/50 bg-muted/20 relative">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t('sections.destination')}</p>
                    <Button type="button" variant="outline" size="sm" className="h-7 text-xs bg-background" onClick={() => setMapPickerTarget('dest')}>
                      <MapPin className="w-3 h-3 mr-1" /> Pick on Map
                    </Button>
                  </div>
                  {field(t('fields.locationName'), 'destName', 'text', t('fields.destPlaceholder'))}
                  <div className="grid grid-cols-2 gap-3">
                    {field(t('fields.latitude'), 'destLat', 'number', '23.789')}
                    {field(t('fields.longitude'), 'destLng', 'number', '90.321')}
                  </div>
                </div>
              </div>
            </section>

            {/* Section: Cargo */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Package className="w-4 h-4 text-primary" />
                <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">{t('sections.cargo')}</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {field(t('fields.cargoValue'), 'cargoValue', 'number', 'e.g. 5000')}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">{t('fields.cargoUnit')}</Label>
                  <Select value={form.cargoUnit} onValueChange={(v) => set('cargoUnit', v)} disabled={isPending}>
                    <SelectTrigger className="h-11 bg-background/50 rounded-xl"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value={SAND_CARGO_UNITS.CUBIC_FT}>{t('cargoUnit.cubic_ft')}</SelectItem>
                      <SelectItem value={SAND_CARGO_UNITS.TON}>{t('cargoUnit.ton')}</SelectItem>
                      <SelectItem value={SAND_CARGO_UNITS.CUBIC_M}>{t('cargoUnit.cubic_m')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </section>

            {/* Section: Financials */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Banknote className="w-4 h-4 text-primary" />
                <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">{t('sections.financials')}</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {field(t('fields.saleAmount'), 'saleAmountTk', 'number', '480000')}
                {field(t('fields.buyerName'), 'buyerName', 'text', t('fields.buyerNamePlaceholder'))}
                {field(t('fields.buyerPhone'), 'buyerPhone', 'tel', '017XXXXXXXX')}
                {field(t('fields.purchaseRate'), 'purchaseRatePerUnitTk', 'number', '51')}
                {field(t('fields.purchaseCost'), 'purchaseCostTk', 'number', '255000')}
                {field(t('fields.govtRoyaltyRate'), 'govtRoyaltyRateTk', 'number', '20')}
                {field(t('fields.govtRoyaltyTotal'), 'govtRoyaltyTk', 'number', '100000')}
                {field(t('fields.localTollRate'), 'localTollRateTk', 'number', '3')}
                {field(t('fields.localTollTotal'), 'localTollTk', 'number', '15000')}
              </div>
            </section>

            {/* Notes */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <FileText className="w-4 h-4 text-primary" />
                <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">{t('sections.notes')}</h3>
              </div>
              <textarea
                value={form.notes}
                onChange={(e) => set('notes', e.target.value)}
                placeholder={t('fields.notesPlaceholder')}
                disabled={isPending}
                className="w-full px-3 py-2.5 min-h-[100px] text-sm bg-background/50 border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-river-500/20 resize-y"
              />
            </section>

            {/* Submit */}
            <div className="pt-4 border-t border-border flex items-center justify-between">
              <Button type="button" variant="ghost" onClick={() => router.push('/sand/trips')} disabled={isPending} className="h-11 px-6 rounded-xl sm:hidden">
                {t('cancel')}
              </Button>
              <Button
                type="submit"
                disabled={isPending}
                className="h-11 px-8 rounded-xl bg-gradient-to-r from-river-500 to-river-600 hover:from-river-600 hover:to-river-700 text-white shadow-md shadow-river-500/20 ml-auto"
              >
                {isPending ? (
                  <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />{t('saving')}</>
                ) : (
                  <><CheckCircle2 className="w-4 h-4 mr-2" />{t('saveTrip')}</>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
      <MapPickerDialog
        open={!!mapPickerTarget}
        onClose={() => setMapPickerTarget(null)}
        initialPosition={mapPickerTarget && numOrNull(form[`${mapPickerTarget}Lat` as keyof FormData]) && numOrNull(form[`${mapPickerTarget}Lng` as keyof FormData]) 
          ? [numOrNull(form[`${mapPickerTarget}Lat` as keyof FormData])!, numOrNull(form[`${mapPickerTarget}Lng` as keyof FormData])!] as [number, number] 
          : undefined}
        onSelect={(lat, lng) => {
          if (mapPickerTarget) {
            set(`${mapPickerTarget}Lat` as keyof FormData, lat.toString());
            set(`${mapPickerTarget}Lng` as keyof FormData, lng.toString());
          }
        }}
      />
    </FadeInUp>
  );
}
