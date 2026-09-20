'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useBoatsMeta } from '@/hooks/queries/useBoatsMetaQueries';
import { useCreateSandTrip, useUpdateSandTrip } from '@/hooks/mutations/useSandTripsMutations';
import { createSandTripSchema } from '@/utils/zod/sand-trips.schema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle, ArrowLeft, CheckCircle2, MapPin, Ship, Package, Banknote, FileText } from 'lucide-react';
import { FadeInUp } from '@/components/wrappers/motion-wrappers';
import { SAND_TRIP_STATUSES, SAND_CARGO_UNITS } from '@/constants/db/sand.const';
import { useTranslations } from 'next-intl';
import { SandTripDetail, CreateSandTripPayload } from '@/types/trips.types';

type FormData = {
  boatPublicId: string;
  source: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  cargoValue: string;
  cargoUnit: string;
  saleRatePerUnitTk: string;
  saleAmountTk: string;
  buyerName: string;
  buyerPhone: string;
  purchaseRatePerUnitTk: string;
  purchaseCostTk: string;
  govtRoyaltyRateTk: string;
  govtRoyaltyTk: string;
  localTollRateTk: string;
  localTollTk: string;
  operatingCostRatePerUnitTk: string;
  operatingCostTk: string;
  status: string;
  notes: string;
};

const initialForm: FormData = {
  boatPublicId: '', source: '', destination: '',
  departureTime: '', arrivalTime: '',
  cargoValue: '', cargoUnit: SAND_CARGO_UNITS.CUBIC_FT,
  saleRatePerUnitTk: '', saleAmountTk: '', buyerName: '', buyerPhone: '',
  purchaseRatePerUnitTk: '', purchaseCostTk: '',
  govtRoyaltyRateTk: '', govtRoyaltyTk: '',
  localTollRateTk: '', localTollTk: '',
  operatingCostRatePerUnitTk: '', operatingCostTk: '',
  status: SAND_TRIP_STATUSES.SCHEDULED, notes: '',
};

function numOrNull(v: string) { const n = parseFloat(v); return isNaN(n) ? null : n; }
function toDatetimeLocal(isoStr?: string | null) {
  if (!isoStr) return '';
  const date = new Date(isoStr);
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
}

export function SandTripForm({ initialData }: { initialData?: SandTripDetail }) {
  const t = useTranslations('sandTripsNew');
  const router = useRouter();
  
  const [form, setForm] = useState<FormData>(() => {
    if (initialData) {
      return {
        boatPublicId: initialData.boatPublicId,
        source: initialData.source || '',
        destination: initialData.destination || '',
        departureTime: toDatetimeLocal(initialData.departureTime),
        arrivalTime: toDatetimeLocal(initialData.arrivalTime),
        cargoValue: initialData.cargoValue?.toString() || '',
        cargoUnit: initialData.cargoUnit || SAND_CARGO_UNITS.CUBIC_FT,
        saleRatePerUnitTk: initialData.saleRatePerUnitTk?.toString() || '',
        saleAmountTk: initialData.saleAmountTk?.toString() || '',
        buyerName: initialData.buyerName || '',
        buyerPhone: initialData.buyerPhone || '',
        purchaseRatePerUnitTk: initialData.purchaseRatePerUnitTk?.toString() || '',
        purchaseCostTk: initialData.purchaseCostTk?.toString() || '',
        govtRoyaltyRateTk: initialData.govtRoyaltyRateTk?.toString() || '',
        govtRoyaltyTk: initialData.govtRoyaltyTk?.toString() || '',
        localTollRateTk: initialData.localTollRateTk?.toString() || '',
        localTollTk: initialData.localTollTk?.toString() || '',
        operatingCostRatePerUnitTk: initialData.operatingCostRatePerUnitTk?.toString() || '',
        operatingCostTk: initialData.operatingCostTk?.toString() || '',
        status: initialData.status,
        notes: initialData.notes || '',
      };
    }
    return initialForm;
  });
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const { data: boats, isLoading: boatsLoading } = useBoatsMeta('sand');
  
  const isEdit = !!initialData;
  const { mutateAsync: createTrip, isPending: isCreating } = useCreateSandTrip((publicId) => {
    router.push(`/trips/sand/${publicId}`);
  });
  const { mutateAsync: updateTrip, isPending: isUpdating } = useUpdateSandTrip(() => {
    router.push(`/trips/sand/${initialData?.publicId}`);
  });

  const isPending = isCreating || isUpdating;

  const payload = useMemo(() => ({
    boatPublicId: form.boatPublicId,
    source: form.source || null,
    destination: form.destination || null,
    departureTime: form.departureTime || null,
    arrivalTime: form.arrivalTime || null,
    cargoValue: numOrNull(form.cargoValue),
    cargoUnit: form.cargoUnit || null,
    saleRatePerUnitTk: numOrNull(form.saleRatePerUnitTk),
    saleAmountTk: numOrNull(form.saleAmountTk),
    buyerName: form.buyerName || null,
    buyerPhone: form.buyerPhone || null,
    purchaseRatePerUnitTk: numOrNull(form.purchaseRatePerUnitTk),
    purchaseCostTk: numOrNull(form.purchaseCostTk),
    govtRoyaltyRateTk: numOrNull(form.govtRoyaltyRateTk),
    govtRoyaltyTk: numOrNull(form.govtRoyaltyTk),
    localTollRateTk: numOrNull(form.localTollRateTk),
    localTollTk: numOrNull(form.localTollTk),
    operatingCostRatePerUnitTk: numOrNull(form.operatingCostRatePerUnitTk),
    operatingCostTk: numOrNull(form.operatingCostTk),
    status: form.status,
    notes: form.notes || null,
  }), [form]);

  // Derive validation errors during render instead of inside an effect
  const { success, errors, data: parsedData } = useMemo(() => {
    const result = createSandTripSchema.safeParse(payload);
    if (!result.success) {
      const fe: Record<string, string> = {};
      result.error.issues.forEach(i => { if (i.path[0]) fe[i.path[0] as string] = i.message; });
      return { success: false, errors: fe, data: null };
    }
    return { success: true, errors: {} as Record<string, string>, data: result.data };
  }, [payload]);

  const set = (k: keyof FormData, v: string) => {
    setForm(p => {
      const next = { ...p, [k]: v };
      
      if (k === 'boatPublicId' && boats) {
        const boat = boats.find(b => b.publicId === v);
        if (boat?.capacityValue && !next.cargoValue) {
          next.cargoValue = boat.capacityValue.toString();
          if (boat.capacityUnit) next.cargoUnit = boat.capacityUnit;
        }
      }

      const calcTotalOrRate = (rateKey: keyof FormData, totalKey: keyof FormData) => {
        const c = parseFloat(next.cargoValue);
        if (k === 'cargoValue' || k === 'boatPublicId' || k === rateKey) {
          const r = parseFloat(next[rateKey]);
          if (!isNaN(c) && !isNaN(r)) next[totalKey] = (c * r).toFixed(0);
        } else if (k === totalKey) {
          const total = parseFloat(next[totalKey]);
          if (!isNaN(c) && c > 0 && !isNaN(total)) next[rateKey] = (total / c).toFixed(2);
        }
      };

      calcTotalOrRate('saleRatePerUnitTk', 'saleAmountTk');
      calcTotalOrRate('purchaseRatePerUnitTk', 'purchaseCostTk');
      calcTotalOrRate('govtRoyaltyRateTk', 'govtRoyaltyTk');
      calcTotalOrRate('localTollRateTk', 'localTollTk');
      calcTotalOrRate('operatingCostRatePerUnitTk', 'operatingCostTk');

      return next;
    });
  };

  const renderError = (field: string) => errors[field] && (hasSubmitted || form[field as keyof FormData] !== '') ? (
    <span className="flex items-center text-xs text-destructive mt-1.5 font-medium animate-in fade-in slide-in-from-top-1">
      <AlertCircle className="w-3.5 h-3.5 mr-1" />{errors[field]}
    </span>
  ) : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setHasSubmitted(true);
    
    if (!success || !parsedData) {
      return;
    }

    try {
      if (isEdit && initialData) {
        await updateTrip({ publicId: initialData.publicId, payload: parsedData });
      } else {
        await createTrip(parsedData as CreateSandTripPayload); // Type cast due to strict schema
      }
    } catch (err) {
      // Error handled by mutation
    }
  };

  const field = (label: string, key: keyof FormData, type = 'text', placeholder = '', required = true) => (
    <div className="space-y-2 group">
      <Label className="text-sm font-medium text-foreground/80 group-focus-within:text-primary transition-colors">{label}{required && <span className="text-destructive ml-1">*</span>}</Label>
      <Input
        type={type}
        value={form[key]}
        onChange={(e) => set(key, e.target.value)}
        placeholder={placeholder}
        disabled={isPending || (!form.boatPublicId && key !== 'boatPublicId')}
        step={type === 'number' ? 'any' : undefined}
        className={`h-11 bg-background/50 backdrop-blur-sm rounded-xl border-border/50 hover:border-border transition-all duration-300 focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary/50 placeholder:text-muted-foreground/40 ${errors[key] && form[key] !== '' ? 'border-destructive focus-visible:ring-destructive/20' : ''}`}
      />
      {renderError(key)}
    </div>
  );

  // Sum the already-saved expense entries (only available on the edit form).
  // Using the expenses array keeps the live preview consistent with the server-side
  // recalculateTripFinancials formula:
  //   totalOperatingCostTk = purchase + royalty + toll + operating + SUM(expenses)
  const savedExpensesTotal = initialData
    ? (initialData.expenses ?? []).reduce((acc, e) => acc + Number(e.amountTk ?? 0), 0)
    : 0;

  const totalCost = (numOrNull(form.purchaseCostTk) || 0) +
                    (numOrNull(form.govtRoyaltyTk) || 0) +
                    (numOrNull(form.localTollTk) || 0) +
                    (numOrNull(form.operatingCostTk) || 0) +
                    savedExpensesTotal;
  const netProfit = (numOrNull(form.saleAmountTk) || 0) - totalCost;

  return (
    <FadeInUp>
      <div className="relative overflow-hidden bg-card/60 backdrop-blur-2xl p-6 sm:p-8 rounded-3xl border border-border/40 shadow-xl max-w-5xl mx-auto mt-6">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-72 h-72 bg-river-500/10 rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-72 h-72 bg-primary/5 rounded-full blur-[80px] pointer-events-none" />
        
        <div className="relative z-10">
          {/* Header */}
          <div className="flex items-center justify-between mb-10 pb-6 border-b border-border/40">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-river-500/10 to-primary/10 text-river-600 dark:text-river-400 rounded-2xl shadow-sm border border-river-500/10">
                <Ship className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70 tracking-tight">
                  {isEdit ? t('meta.editTitle') : t('header.title')}
                </h2>
                <p className="text-sm text-muted-foreground mt-1">{t('header.subtitle')}</p>
              </div>
            </div>
            <Button variant="outline" onClick={() => router.back()} className="h-10 px-5 hidden sm:flex rounded-xl bg-background/50 hover:bg-background/80 border-border/50 shadow-sm transition-all">
              <ArrowLeft className="w-4 h-4 mr-2" />{t('back')}
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-10">
            {/* Section: Trip Info */}
            <section className="space-y-5">
              <div className="flex items-center gap-3 pb-2 border-b border-border/40">
                <div className="p-1.5 bg-primary/10 rounded-lg">
                  <Ship className="w-4 h-4 text-primary" />
                </div>
                <h3 className="font-semibold text-sm uppercase tracking-wider text-foreground/90">{t('sections.tripInfo')}</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {/* Boat */}
                <div className="space-y-2 group">
                  <Label className="text-sm font-medium text-foreground/80 group-focus-within:text-primary transition-colors">{t('fields.boat')} <span className="text-destructive">*</span></Label>
                  <Select value={form.boatPublicId} onValueChange={(v) => set('boatPublicId', v)} disabled={isPending || boatsLoading}>
                    <SelectTrigger className={`h-11 bg-background/50 backdrop-blur-sm rounded-xl border-border/50 hover:border-border transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:border-primary/50 ${errors.boatPublicId && form.boatPublicId !== '' ? 'border-destructive' : ''}`}>
                      <SelectValue placeholder={t('fields.boatPlaceholder')} />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-border/50 shadow-xl">
                      {boats?.map((b) => (
                        <SelectItem key={b.publicId} value={b.publicId} className="rounded-lg">
                          {b.name}{b.capacityValue ? ` (${b.capacityValue} ${b.capacityUnit})` : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {renderError('boatPublicId')}
                </div>

                {/* Status */}
                <div className="space-y-2 group">
                  <Label className="text-sm font-medium text-foreground/80 group-focus-within:text-primary transition-colors">{t('fields.status')}</Label>
                  <Select value={form.status} onValueChange={(v) => set('status', v)} disabled={isPending || !form.boatPublicId}>
                    <SelectTrigger className="h-11 bg-background/50 backdrop-blur-sm rounded-xl border-border/50 hover:border-border transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:border-primary/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-border/50 shadow-xl">
                      <SelectItem value={SAND_TRIP_STATUSES.SCHEDULED} className="rounded-lg">{t('status.scheduled')}</SelectItem>
                      <SelectItem value={SAND_TRIP_STATUSES.LOADING} className="rounded-lg">{t('status.loading')}</SelectItem>
                      <SelectItem value={SAND_TRIP_STATUSES.IN_TRANSIT} className="rounded-lg">{t('status.in_transit')}</SelectItem>
                      <SelectItem value={SAND_TRIP_STATUSES.COMPLETED} className="rounded-lg">{t('status.completed')}</SelectItem>
                      <SelectItem value={SAND_TRIP_STATUSES.CANCELLED} className="rounded-lg">{t('status.cancelled')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {field(t('fields.departureTime'), 'departureTime', 'datetime-local', '', true)}
                {field(t('fields.arrivalTime'), 'arrivalTime', 'datetime-local', '', true)}
              </div>
            </section>

            {/* Section: Locations */}
            <section className="space-y-5">
              <div className="flex items-center gap-3 pb-2 border-b border-border/40">
                <div className="p-1.5 bg-primary/10 rounded-lg">
                  <MapPin className="w-4 h-4 text-primary" />
                </div>
                <h3 className="font-semibold text-sm uppercase tracking-wider text-foreground/90">{t('sections.locations')}</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {field(t('fields.source'), 'source', 'text', 'e.g. Bholaganj, Companiganj, Sylhet')}
                {field(t('fields.destination'), 'destination', 'text', 'e.g. Ashuganj, Brahmanbaria')}
              </div>
            </section>

            {/* Section: Cargo */}
            <section className="space-y-5">
              <div className="flex items-center gap-3 pb-2 border-b border-border/40">
                <div className="p-1.5 bg-primary/10 rounded-lg">
                  <Package className="w-4 h-4 text-primary" />
                </div>
                <h3 className="font-semibold text-sm uppercase tracking-wider text-foreground/90">{t('sections.cargo')}</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {field(t('fields.cargoValue'), 'cargoValue', 'number', 'e.g. 5000')}
                <div className="space-y-2 group">
                  <Label className="text-sm font-medium text-foreground/80 group-focus-within:text-primary transition-colors">{t('fields.cargoUnit')} <span className="text-destructive">*</span></Label>
                  <Select value={form.cargoUnit} onValueChange={(v) => set('cargoUnit', v)} disabled={isPending || !form.boatPublicId}>
                    <SelectTrigger className="h-11 bg-background/50 backdrop-blur-sm rounded-xl border-border/50 hover:border-border transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:border-primary/50"><SelectValue /></SelectTrigger>
                    <SelectContent className="rounded-xl border-border/50 shadow-xl">
                      <SelectItem value={SAND_CARGO_UNITS.CUBIC_FT} className="rounded-lg">{t('cargoUnit.cubic_ft')}</SelectItem>
                      <SelectItem value={SAND_CARGO_UNITS.TON} className="rounded-lg">{t('cargoUnit.ton')}</SelectItem>
                      <SelectItem value={SAND_CARGO_UNITS.CUBIC_M} className="rounded-lg">{t('cargoUnit.cubic_m')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </section>

            {/* Section: Financials */}
            <section className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/40">
                <div className="flex items-center gap-3">
                  <div className="p-1.5 bg-primary/10 rounded-lg">
                    <Banknote className="w-4 h-4 text-primary" />
                  </div>
                  <h3 className="font-semibold text-sm uppercase tracking-wider text-foreground/90">{t('sections.financials')}</h3>
                </div>
                
                {form.boatPublicId && (
                  <div className={`px-4 py-1.5 rounded-full text-sm font-semibold border shadow-sm transition-colors ${netProfit >= 0 ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400' : 'bg-red-500/10 text-red-600 border-red-500/20 dark:text-red-400'}`}>
                    {t('sections.netProfit')}: ৳ {netProfit.toLocaleString('en-IN')}
                  </div>
                )}
              </div>
              
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                  <div className="md:col-span-2 p-5 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 grid grid-cols-1 sm:grid-cols-2 gap-5 relative overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                    <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-emerald-500"></div>
                    {field(t('fields.saleRate'), 'saleRatePerUnitTk', 'number', '100', false)}
                    {field(t('fields.saleAmount'), 'saleAmountTk', 'number', '480000')}
                  </div>
                  {field(t('fields.buyerName'), 'buyerName', 'text', t('fields.buyerNamePlaceholder'))}
                  {field(t('fields.buyerPhone'), 'buyerPhone', 'tel', '017XXXXXXXX')}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="p-5 rounded-2xl bg-card border border-border/50 grid grid-cols-1 sm:grid-cols-2 gap-5 relative overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 hover:border-blue-500/30">
                    <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-blue-500/80"></div>
                    {field(t('fields.purchaseRate'), 'purchaseRatePerUnitTk', 'number', '51')}
                    {field(t('fields.purchaseCost'), 'purchaseCostTk', 'number', '255000')}
                  </div>

                  <div className="p-5 rounded-2xl bg-card border border-border/50 grid grid-cols-1 sm:grid-cols-2 gap-5 relative overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 hover:border-amber-500/30">
                    <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-amber-500/80"></div>
                    {field(t('fields.operatingCostRate'), 'operatingCostRatePerUnitTk', 'number', '25', false)}
                    {field(t('fields.operatingCost'), 'operatingCostTk', 'number', '120000')}
                  </div>
                  
                  <div className="p-5 rounded-2xl bg-card border border-border/50 grid grid-cols-1 sm:grid-cols-2 gap-5 relative overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 hover:border-purple-500/30">
                    <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-purple-500/80"></div>
                    {field(t('fields.govtRoyaltyRate'), 'govtRoyaltyRateTk', 'number', '20')}
                    {field(t('fields.govtRoyaltyTotal'), 'govtRoyaltyTk', 'number', '100000')}
                  </div>
                  
                  <div className="p-5 rounded-2xl bg-card border border-border/50 grid grid-cols-1 sm:grid-cols-2 gap-5 relative overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 hover:border-rose-500/30">
                    <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-rose-500/80"></div>
                    {field(t('fields.localTollRate'), 'localTollRateTk', 'number', '3')}
                    {field(t('fields.localTollTotal'), 'localTollTk', 'number', '15000')}
                  </div>
                </div>
              </div>
            </section>

            {/* Notes */}
            <section className="space-y-5">
              <div className="flex items-center gap-3 pb-2 border-b border-border/40">
                <div className="p-1.5 bg-primary/10 rounded-lg">
                  <FileText className="w-4 h-4 text-primary" />
                </div>
                <h3 className="font-semibold text-sm uppercase tracking-wider text-foreground/90">{t('sections.notes')}</h3>
              </div>
              <textarea
                value={form.notes}
                onChange={(e) => set('notes', e.target.value)}
                placeholder={t('fields.notesPlaceholder')}
                disabled={isPending || !form.boatPublicId}
                className="w-full p-4 min-h-[120px] text-sm bg-background/50 backdrop-blur-sm border border-border/50 rounded-2xl placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all duration-300 resize-y disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              />
            </section>

            {/* Submit */}
            <div className="pt-6 border-t border-border/40 flex items-center justify-between">
              <Button type="button" variant="ghost" onClick={() => router.back()} disabled={isPending} className="h-12 px-6 rounded-xl sm:hidden">
                {t('cancel')}
              </Button>
              <Button
                type="submit"
                disabled={isPending || !form.boatPublicId || Object.keys(errors).length > 0}
                className="h-12 px-8 rounded-xl bg-gradient-to-r from-river-500 to-river-600 hover:from-river-600 hover:to-river-700 text-white shadow-lg shadow-river-500/25 ml-auto transition-all duration-300 active:scale-[0.98]"
              >
                {isPending ? (
                  <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />{t('saving')}</>
                ) : (
                  <><CheckCircle2 className="w-5 h-5 mr-2" />{t('saveTrip')}</>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </FadeInUp>
  );
}



