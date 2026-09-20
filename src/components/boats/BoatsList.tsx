"use client";

import { useBoatFiltersStore } from '@/store/useBoatFiltersStore';
import { useBoats } from '@/hooks/queries/useBoatsQueries';
import { BoatCard } from './BoatCard';
import { useTranslations } from 'next-intl';
import { StaggerContainer, StaggerItem } from '@/components/wrappers/motion-wrappers';
import { Anchor, AlertCircle } from 'lucide-react';
import { Link } from '@/i18n/routing';

export function BoatsList() {
  const { listFilters } = useBoatFiltersStore();
  const { data, isLoading, error } = useBoats(listFilters);
  const t = useTranslations('boatsPage');
  const sharedT = useTranslations('shared');
  
  const boats = data?.items ?? [];

  if (isLoading && boats.length === 0) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className="rounded-2xl border border-border/40 bg-card/40 h-[340px] animate-pulse">
            <div className="h-48 w-full bg-muted/30 rounded-t-2xl" />
            <div className="p-6 flex flex-col h-[148px]">
              <div className="h-6 w-2/3 bg-muted/50 rounded-md mb-auto" />
              <div className="space-y-4 pt-6">
                <div className="h-9 w-full bg-muted/40 rounded-xl" />
                <div className="h-9 w-full bg-muted/40 rounded-xl" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-destructive text-center bg-destructive/5 rounded-2xl border border-destructive/20 backdrop-blur-sm">
        <AlertCircle className="w-12 h-12 mb-4 text-destructive/50" />
        <h3 className="text-xl font-semibold mb-2">{sharedT('common.error')}</h3>
        <p className="text-destructive/70">{error.message}</p>
      </div>
    );
  }

  if (boats.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center border rounded-2xl bg-card/30 border-dashed backdrop-blur-sm">
        <div className="bg-muted/50 p-4 rounded-full mb-4">
          <Anchor className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-semibold mb-2 text-foreground">{t('noBoats')}</h3>
      </div>
    );
  }

  return (
    <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {boats.map((boat, index) => (
        <StaggerItem key={boat.id}>
          <Link href={`/boats/${boat.publicId}`} className="block">
            <BoatCard boat={boat} priority={index < 4} />
          </Link>
        </StaggerItem>
      ))}
    </StaggerContainer>
  );
}


