'use client';

import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Edit2, Trash2 } from 'lucide-react';
import { FadeInUp } from '@/components/wrappers/motion-wrappers';
import { Breadcrumbs } from '@/components/shared/Breadcrumbs';
import { Badge } from '@/components/ui/badge';
import type { BoatDetail } from '@/types/boats.types';
import { useDeleteBoat } from '@/hooks/mutations/useBoatMutations';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { EditBoatSheet } from './EditBoatSheet';
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

interface BoatDetailHeaderProps {
  boat: BoatDetail;
}

export function BoatDetailHeader({ boat }: BoatDetailHeaderProps) {
  const t = useTranslations('boatsPage.detail');
  const tSand = useTranslations('sand');
  const tBoats = useTranslations('boatsPage');
  const router = useRouter();
  const { mutateAsync: deleteBoat, isPending: isDeleting } = useDeleteBoat();
  const [isEditOpen, setIsEditOpen] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'maintenance':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const handleDelete = async () => {
    try {
      await deleteBoat(boat.publicId);
      router.push('/boats');
    } catch {
      // error handled by mutation
    }
  };

  const breadcrumbItems = [
    { label: tSand('home'), href: '/', isHome: true },
    { label: tBoats('title'), href: '/boats' },
    { label: boat.name }
  ];

  return (
    <div className="space-y-4 mb-8">
      <Breadcrumbs items={breadcrumbItems} />
      
      <FadeInUp>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 p-6 bg-card rounded-2xl shadow-sm border border-border/50">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
                {boat.name}
              </h1>
              <Badge variant="secondary" className={`capitalize ${getStatusColor(boat.status)}`}>
                {tBoats(`status.${boat.status}`)}
              </Badge>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">

              {boat.capacityValue && (
                <div className="flex items-center gap-1">
                  <span className="font-medium text-foreground">{tBoats('capacity')}:</span>
                  <span>{boat.capacityValue} {boat.capacityUnit}</span>
                </div>
              )}
            </div>
            {boat.notes && (
              <p className="text-sm text-muted-foreground max-w-2xl mt-2 italic">
                {boat.notes}
              </p>
            )}
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto mt-4 md:mt-0">
            <Button 
              variant="outline" 
              className="flex-1 md:flex-none h-10 border-amber-200 hover:bg-amber-50 hover:text-amber-700 text-amber-600 dark:border-amber-900 dark:hover:bg-amber-900/30"
              onClick={() => setIsEditOpen(true)}
            >
              <Edit2 className="w-4 h-4 mr-2" />
              {t('edit')}
            </Button>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="destructive"
                  className="flex-1 md:flex-none h-10"
                  disabled={isDeleting}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  {t('delete')}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{t('deleteConfirmTitle') || "Delete Boat"}</AlertDialogTitle>
                  <AlertDialogDescription>
                    {t('deleteConfirmDesc') || "Are you sure you want to delete this boat? This action cannot be undone."}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel disabled={isDeleting}>{t('cancel')}</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    onClick={handleDelete}
                    disabled={isDeleting}
                  >
                    {isDeleting ? "Deleting..." : t('delete')}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </FadeInUp>

      <EditBoatSheet
        boat={boat}
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
      />
    </div>
  );
}
