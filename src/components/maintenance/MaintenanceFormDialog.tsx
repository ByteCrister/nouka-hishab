'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { createMaintenanceSchema, type CreateMaintenanceSchema } from '@/utils/zod/maintenance.schema';
import { useBoatsMeta } from '@/hooks/queries/useBoatsMetaQueries';
import { SECTORS, type SectorName } from '@/constants/db/app.const';
import type { MaintenanceListItem } from '@/types/maintenance.types';

type MaintenanceFormValues = z.input<typeof createMaintenanceSchema>;

interface MaintenanceFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: MaintenanceListItem;
  onSubmit: (data: CreateMaintenanceSchema) => void;
  isSubmitting: boolean;
}

export function MaintenanceFormDialog({ 
  open, 
  onOpenChange, 
  initialData, 
  onSubmit, 
  isSubmitting 
}: MaintenanceFormDialogProps) {
  const t = useTranslations('maintenance.form');
  const sharedT = useTranslations('shared');
  
  const { data: boats } = useBoatsMeta();

  const form = useForm<MaintenanceFormValues, unknown, CreateMaintenanceSchema>({
    resolver: zodResolver(createMaintenanceSchema),
    defaultValues: {
      boatId: undefined,
      maintenanceDate: new Date().toISOString().split('T')[0],
      description: '',
      costTk: '',
      vendorName: '',
      notes: '',
    },
  });

  useEffect(() => {
    if (open) {
      if (initialData) {
        form.reset({
          boatId: initialData.boatId,
          maintenanceDate: new Date(initialData.maintenanceDate).toISOString().split('T')[0],
          description: initialData.description,
          costTk: initialData.costTk ?? '',
          vendorName: initialData.vendorName ?? '',
          notes: initialData.notes ?? '',
        });
      } else {
        form.reset({
          boatId: undefined,
          maintenanceDate: new Date().toISOString().split('T')[0],
          description: '',
          costTk: '',
          vendorName: '',
          notes: '',
        });
      }
    }
  }, [open, initialData, form]);

  const handleSubmit = form.handleSubmit((data) => {
    onSubmit(data);
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {initialData ? t('editTitle') : t('addTitle')}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 col-span-2 sm:col-span-1">
              <Label htmlFor="boatId">{t('boat')} <span className="text-destructive">*</span></Label>
              <Select
                value={form.watch('boatId')?.toString() || ''}
                onValueChange={(val) => form.setValue('boatId', parseInt(val, 10))}
              >
                <SelectTrigger id="boatId" className={form.formState.errors.boatId ? 'border-destructive' : ''}>
                  <SelectValue placeholder={t('selectBoat')} />
                </SelectTrigger>
                <SelectContent>
                  {boats?.map((boat) => (
                    <SelectItem key={boat.id} value={boat.id.toString()}>
                      {boat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.boatId && (
                <p className="text-xs text-destructive">{sharedT('errors.required')}</p>
              )}
            </div>

            <div className="space-y-2 col-span-2">
              <Label htmlFor="maintenanceDate">{t('date')} <span className="text-destructive">*</span></Label>
              <Input
                id="maintenanceDate"
                type="date"
                {...form.register('maintenanceDate')}
                className={form.formState.errors.maintenanceDate ? 'border-destructive' : ''}
              />
              {form.formState.errors.maintenanceDate && (
                <p className="text-xs text-destructive">{sharedT('errors.required')}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">{t('description')} <span className="text-destructive">*</span></Label>
            <Input
              id="description"
              {...form.register('description')}
              placeholder={t('descriptionPlaceholder')}
              className={form.formState.errors.description ? 'border-destructive' : ''}
            />
            {form.formState.errors.description && (
              <p className="text-xs text-destructive">{sharedT('errors.required')}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 col-span-2 sm:col-span-1">
              <Label htmlFor="costTk">{t('costTk')}</Label>
              <Input
                id="costTk"
                type="number"
                step="0.01"
                {...form.register('costTk')}
                placeholder="e.g. 5000"
              />
            </div>

            <div className="space-y-2 col-span-2 sm:col-span-1">
              <Label htmlFor="vendorName">{t('vendorName')}</Label>
              <Input
                id="vendorName"
                {...form.register('vendorName')}
                placeholder={t('vendorPlaceholder')}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">{t('notes')}</Label>
            <textarea
              id="notes"
              {...form.register('notes')}
              placeholder={t('notesPlaceholder')}
              className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none h-24"
            />
          </div>

          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              {sharedT('actions.cancel')}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? sharedT('actions.saving') : sharedT('actions.save')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
