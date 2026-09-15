'use client';

import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Edit2, Trash2 } from 'lucide-react';
import { FadeInUp } from '@/components/wrappers/motion-wrappers';
import { Breadcrumbs } from '@/components/shared/Breadcrumbs';
import { Badge } from '@/components/ui/badge';
import type { BoatDetail } from '@/types/sand/boats.types';
import { useBoatStore } from '@/store/sand/useBoatStore';
import { useRouter } from 'next/navigation';

interface BoatDetailHeaderProps {
  boat: BoatDetail;
}

export function BoatDetailHeader({ boat }: BoatDetailHeaderProps) {
  const t = useTranslations('sand.boatsPage.detail');
  const tSand = useTranslations('sand');
  const tBoats = useTranslations('sand.boatsPage');
  const router = useRouter();
  const { deleteBoat, isDeleting } = useBoatStore();

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
    if (confirm('Are you sure you want to delete this boat?')) {
      const success = await deleteBoat(boat.publicId);
      if (success) {
        router.push('/sand/boats');
      }
    }
  };

  const breadcrumbItems = [
    { label: tSand('home'), href: '/', isHome: true },
    { label: tBoats('title'), href: '/sand/boats' },
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
              {boat.sectorName && (
                <div className="flex items-center gap-1">
                  <span className="font-medium text-foreground">Sector:</span>
                  <span>{boat.sectorName}</span>
                </div>
              )}
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
            >
              <Edit2 className="w-4 h-4 mr-2" />
              {t('edit')}
            </Button>
            
            <Button 
              variant="destructive"
              className="flex-1 md:flex-none h-10"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              {t('delete')}
            </Button>
          </div>
        </div>
      </FadeInUp>
    </div>
  );
}
