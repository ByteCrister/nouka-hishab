'use client';

import { useState } from 'react';
import { z } from 'zod';
import {
  useCreateSandTripExpense,
  useUpdateSandTripExpense,
  useDeleteSandTripExpense,
} from '@/hooks/mutations/useSandTripsMutations';
import { createSandTripExpenseSchema } from '@/utils/zod/sand-trips.schema';
import { SandTripExpenseItem } from '@/types/trips.types';
import { SAND_TRIP_EXPENSE_CATEGORIES } from '@/constants/db/sand.const';
import type { SandTripExpenseCategory } from '@/constants/db/sand.const';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
import { Plus, Trash2, Edit3, CheckCircle2, X, Receipt, AlertCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';
interface Props {
  tripPublicId: string;
  expenses: SandTripExpenseItem[];
  operatingCostTk: string | number | null;
}

const CATEGORY_COLORS: Record<SandTripExpenseCategory, string> = {
  [SAND_TRIP_EXPENSE_CATEGORIES.FUEL]: 'bg-orange-500/10 text-orange-500',
  [SAND_TRIP_EXPENSE_CATEGORIES.LABOUR]: 'bg-blue-500/10 text-blue-500',
  [SAND_TRIP_EXPENSE_CATEGORIES.MAINTENANCE]: 'bg-amber-500/10 text-amber-500',
  [SAND_TRIP_EXPENSE_CATEGORIES.TOLL_PAYMENT]: 'bg-purple-500/10 text-purple-500',
  [SAND_TRIP_EXPENSE_CATEGORIES.LOADING_FEE]: 'bg-teal-500/10 text-teal-500',
  [SAND_TRIP_EXPENSE_CATEGORIES.ENGINE_REPAIR]: 'bg-rose-500/10 text-rose-500',
  [SAND_TRIP_EXPENSE_CATEGORIES.OTHER]: 'bg-muted text-muted-foreground',
};

type ExpenseForm = {
  category: string;
  description: string;
  amountTk: string;
  expenseDate: string;
};

const emptyForm: ExpenseForm = { category: SAND_TRIP_EXPENSE_CATEGORIES.FUEL, description: '', amountTk: '', expenseDate: '' };

export function SandTripExpensesSection({ tripPublicId, expenses, operatingCostTk }: Props) {
  const t = useTranslations('sandTripsDetail');
  const [showAdd, setShowAdd] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<ExpenseForm>(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const { mutateAsync: createExpense, isPending: isCreating } = useCreateSandTripExpense(() => { setShowAdd(false); setForm(emptyForm); });
  const { mutateAsync: updateExpense, isPending: isUpdating } = useUpdateSandTripExpense(() => { setEditId(null); setForm(emptyForm); });
  const { mutateAsync: deleteExpense, isPending: isDeleting } = useDeleteSandTripExpense();

  const set = (k: keyof ExpenseForm, v: string) => {
    setForm(p => ({ ...p, [k]: v }));
    setErrors(p => { const n = { ...p }; delete n[k]; return n; });
  };

  const renderError = (field: string) => errors[field] ? (
    <span className="flex items-center text-xs text-destructive mt-1 font-medium">
      <AlertCircle className="w-3 h-3 mr-1" />{errors[field]}
    </span>
  ) : null;

  const handleSubmit = async () => {
    setErrors({});
    try {
      const payload = createSandTripExpenseSchema.parse({
        category: form.category as SandTripExpenseCategory,
        description: form.description || null,
        amountTk: parseFloat(form.amountTk),
        expenseDate: form.expenseDate || null,
      });
      if (editId) {
        await updateExpense({ tripPublicId, expensePublicId: editId, payload });
      } else {
        await createExpense({ tripPublicId, payload });
      }
    } catch (err) {
      if (err instanceof z.ZodError) {
        const fe: Record<string, string> = {};
        err.issues.forEach(i => { if (i.path[0]) fe[i.path[0] as string] = i.message; });
        setErrors(fe);
      }
    }
  };

  const startEdit = (exp: SandTripExpenseItem) => {
    setEditId(exp.publicId);
    setForm({
      category: exp.category,
      description: exp.description ?? '',
      amountTk: String(exp.amountTk),
      expenseDate: exp.expenseDate ?? '',
    });
    setShowAdd(true);
  };

  const cancelForm = () => { setShowAdd(false); setEditId(null); setForm(emptyForm); setErrors({}); };

  const handleDelete = async (expPublicId: string) => {
    if (deleteConfirm !== expPublicId) { setDeleteConfirm(expPublicId); return; }
    await deleteExpense({ tripPublicId, expensePublicId: expPublicId });
    setDeleteConfirm(null);
  };

  const total = expenses.reduce((s, e) => s + Number(e.amountTk), 0);

  // Category keys map DB values (e.g. 'toll_payment') → translation path
  const getCategoryLabel = (cat: string) =>
    t(`expenses.categories.${cat}` as Parameters<typeof t>[0], { fallback: cat });

  return (
    <div className="rounded-2xl border border-border/50 bg-card/60 p-6">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Receipt className="w-4 h-4 text-primary" />
          <h3 className="font-semibold">{t('expenses.title')}</h3>
          {expenses.length > 0 && (
            <Badge variant="outline" className="text-xs">{expenses.length}</Badge>
          )}
        </div>
        <div className="flex items-center gap-3">
          {expenses.length > 0 && (
            <span className="text-sm font-semibold text-foreground">
              {t('expenses.total')} ৳ {total.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </span>
          )}
          {!showAdd && (
            <Button size="sm" onClick={() => setShowAdd(true)} className="h-8 px-3 rounded-lg text-xs">
              <Plus className="w-3.5 h-3.5 mr-1" />{t('expenses.addExpense')}
            </Button>
          )}
        </div>
      </div>

      {/* Add/Edit Form */}
      {showAdd && (
        <div className="mb-5 p-4 rounded-xl border border-primary/20 bg-primary/5 space-y-3">
          <p className="text-sm font-medium">{editId ? t('expenses.editExpense') : t('expenses.newExpense')}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Category */}
            <div className="space-y-1">
              <Label className="text-xs">{t('expenses.category')} *</Label>
              <Select value={form.category} onValueChange={(v) => set('category', v)}>
                <SelectTrigger className="h-9 rounded-lg text-sm bg-background/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(SAND_TRIP_EXPENSE_CATEGORIES).map((k) => (
                    <SelectItem key={k} value={k}>{getCategoryLabel(k)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {renderError('category')}
            </div>

            {/* Amount */}
            <div className="space-y-1">
              <Label className="text-xs">{t('expenses.amount')} *</Label>
              <Input
                type="number"
                step="any"
                value={form.amountTk}
                onChange={(e) => set('amountTk', e.target.value)}
                placeholder={t('expenses.amountPlaceholder')}
                className={`h-9 rounded-lg text-sm bg-background/50 ${errors.amountTk ? 'border-destructive' : ''}`}
              />
              {renderError('amountTk')}
            </div>

            {/* Date */}
            <div className="space-y-1">
              <Label className="text-xs">{t('expenses.date')}</Label>
              <Input
                type="date"
                value={form.expenseDate}
                onChange={(e) => set('expenseDate', e.target.value)}
                className="h-9 rounded-lg text-sm bg-background/50"
              />
            </div>

            {/* Description */}
            <div className="space-y-1">
              <Label className="text-xs">{t('expenses.description')}</Label>
              <Input
                value={form.description}
                onChange={(e) => set('description', e.target.value)}
                placeholder={t('expenses.descriptionPlaceholder')}
                className="h-9 rounded-lg text-sm bg-background/50"
              />
            </div>
          </div>

          <div className="flex gap-2 justify-end pt-1">
            <Button variant="ghost" size="sm" onClick={cancelForm} className="h-8 rounded-lg">
              <X className="w-3.5 h-3.5 mr-1" />{t('expenses.cancel')}
            </Button>
            <Button size="sm" onClick={handleSubmit} disabled={isCreating || isUpdating} className="h-8 rounded-lg">
              {(isCreating || isUpdating) ? (
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <><CheckCircle2 className="w-3.5 h-3.5 mr-1" />{editId ? t('expenses.update') : t('expenses.save')}</>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* List */}
      {expenses.length === 0 ? (
        <div className="text-center py-10 text-muted-foreground">
          <Receipt className="w-8 h-8 mx-auto mb-2 opacity-30" />
          <p className="text-sm">{t('expenses.noExpenses')}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {expenses.map((exp) => (
            <div key={exp.publicId} className="flex items-center justify-between gap-3 p-3 rounded-xl border border-border/40 bg-background/40 hover:bg-background/70 transition-colors">
              <div className="flex items-center gap-3 min-w-0">
                <Badge variant="outline" className={`border-0 text-xs shrink-0 ${CATEGORY_COLORS[exp.category]}`}>
                  {getCategoryLabel(exp.category)}
                </Badge>
                <div className="min-w-0">
                  {exp.description && <p className="text-xs text-muted-foreground truncate">{exp.description}</p>}
                  {exp.expenseDate && <p className="text-xs text-muted-foreground/60">{new Date(exp.expenseDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</p>}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-sm font-bold text-foreground">
                  ৳ {Number(exp.amountTk).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </span>
                <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg" onClick={() => startEdit(exp)}>
                  <Edit3 className="w-3.5 h-3.5" />
                </Button>
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 rounded-lg hover:bg-destructive hover:text-destructive-foreground"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>{t('deleteConfirm.expenseTitle')}</AlertDialogTitle>
                      <AlertDialogDescription>
                        {t('deleteConfirm.expenseDescription')}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>{t('deleteConfirm.cancel')}</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={(e) => {
                          e.preventDefault();
                          handleDelete(exp.publicId);
                        }}
                        disabled={isDeleting}
                        className="bg-destructive hover:bg-destructive/90"
                      >
                        {isDeleting && deleteConfirm === exp.publicId ? (
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
          ))}
        </div>
      )}

      {/* NEW: Totals section with dashed borders */}
      <div className="mt-6 pt-4 border-t-2 border-dashed border-border/60 space-y-3 font-mono text-sm">
        <div className="flex justify-between items-center text-muted-foreground">
          <span>{t('expenses.totalWithoutOperating', { fallback: 'Itemized Expenses Total' })}</span>
          <span>৳ {total.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
        </div>
        
        <div className="flex justify-between items-center text-muted-foreground">
          <span>{t('expenses.upfrontOperating', { fallback: 'Boat Operating Cost' })}</span>
          <span>৳ {Number(operatingCostTk || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
        </div>
        
        <div className="pt-2 border-t-2 border-dashed border-border/60 flex justify-between items-center">
          <span className="font-bold text-foreground">{t('expenses.totalWithOperating', { fallback: 'Total Expenses' })}</span>
          <span className="font-bold text-foreground">৳ {(total + Number(operatingCostTk || 0)).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
        </div>
      </div>
    </div>
  );
}

