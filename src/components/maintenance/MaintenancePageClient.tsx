'use client';

import { useState } from 'react';
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
} from '@/components/ui/alert-dialog';
import { MaintenanceTable } from './MaintenanceTable';
import { MaintenanceKpis } from './MaintenanceKpis';
import { MaintenanceToolbar } from './MaintenanceToolbar';
import { MaintenanceFormDialog } from './MaintenanceFormDialog';
import { MaintenanceReportPreviewModal } from './MaintenanceReportPreviewModal';
import { MaintenancePageSkeleton } from './MaintenancePageSkeleton';
import { useMaintenanceList } from '@/hooks/queries/useMaintenanceQueries';
import { 
  useCreateMaintenance, 
  useUpdateMaintenance, 
  useDeleteMaintenance 
} from '@/hooks/mutations/useMaintenanceMutations';
import { useMaintenanceFiltersStore } from '@/store/useMaintenanceFiltersStore';
import { FadeInUp } from '@/components/wrappers/motion-wrappers';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { exportMaintenanceReport } from '@/lib/pdf/report-engine';
import type { MaintenanceListItem } from '@/types/maintenance.types';
import type { CreateMaintenanceSchema } from '@/utils/zod/maintenance.schema';

export function MaintenancePageClient() {
  const t = useTranslations('maintenance');
  const sharedT = useTranslations('shared');

  const { filters, setPage } = useMaintenanceFiltersStore();
  const { data, isLoading } = useMaintenanceList(filters);
  const items = data?.items || [];
  const meta = data?.meta;
  const kpis = data?.kpis;

  const createMutation = useCreateMaintenance();
  const updateMutation = useUpdateMaintenance();
  const deleteMutation = useDeleteMaintenance();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MaintenanceListItem | undefined>(undefined);

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<MaintenanceListItem | undefined>(undefined);
  
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  if (isLoading && !data) {
    return <MaintenancePageSkeleton />;
  }

  const handleAdd = () => {
    setEditingItem(undefined);
    setIsFormOpen(true);
  };

  const handleEdit = (item: MaintenanceListItem) => {
    setEditingItem(item);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (item: MaintenanceListItem) => {
    setItemToDelete(item);
    setDeleteConfirmOpen(true);
  };

  const handleFormSubmit = async (formData: CreateMaintenanceSchema) => {
    if (editingItem) {
      updateMutation.mutateAsync({ id: editingItem.id, data: formData }, {
        onSuccess: () => {
          setIsFormOpen(false);
        }
      });
    } else {
      createMutation.mutateAsync(formData, {
        onSuccess: () => {
          setIsFormOpen(false);
        }
      });
    }
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    deleteMutation.mutateAsync(itemToDelete.id, {
      onSuccess: () => {
        setDeleteConfirmOpen(false);
      }
    });
  };

  const handleExport = async () => {
    try {
      await exportMaintenanceReport(items, kpis);
    } catch (error) {
      console.error('Failed to export PDF:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
        <p className="text-muted-foreground">{t('description')}</p>
      </div>

      <FadeInUp>
        <MaintenanceKpis kpis={kpis} isLoading={isLoading} />
        
        <MaintenanceToolbar 
          onAdd={handleAdd} 
          onExport={handleExport}
          onPreview={() => setIsPreviewOpen(true)}
        />
        
        <MaintenanceTable 
          items={items} 
          isLoading={isLoading} 
          onEdit={handleEdit} 
          onDelete={handleDeleteClick}
        />

        {meta && meta.totalPages > 1 && (
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-border/50">
            <div className="text-sm text-muted-foreground">
              {sharedT('pagination.showing', {
                from: (meta.page - 1) * meta.limit + 1,
                to: Math.min(meta.page * meta.limit, meta.total),
                total: meta.total,
              })}
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setPage(meta.page - 1)} disabled={meta.page === 1}>
                <ChevronLeft className="w-4 h-4 mr-1" /> {sharedT('pagination.previous')}
              </Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: meta.totalPages }).map((_, i) => (
                  <Button
                    key={i + 1}
                    variant={meta.page === i + 1 ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setPage(i + 1)}
                    className="w-8 h-8 p-0"
                  >
                    {i + 1}
                  </Button>
                ))}
              </div>
              <Button variant="outline" size="sm" onClick={() => setPage(meta.page + 1)} disabled={meta.page === meta.totalPages}>
                {sharedT('pagination.next')} <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </FadeInUp>

      <MaintenanceFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        initialData={editingItem}
        onSubmit={handleFormSubmit}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
      />

      <MaintenanceReportPreviewModal
        open={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        items={items}
        kpis={kpis}
      />

      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('deleteConfirmTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('deleteConfirmDescription')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>
              {sharedT('actions.cancel')}
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              disabled={deleteMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? sharedT('actions.deleting') : sharedT('actions.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
