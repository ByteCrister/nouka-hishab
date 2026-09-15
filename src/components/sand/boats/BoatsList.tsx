"use client";

import { useBoatsListStore } from '@/store/sand/useBoatStore';
import { BoatCard } from './BoatCard';
import { useTranslations } from 'next-intl';
import { StaggerContainer, StaggerItem } from '@/components/wrappers/motion-wrappers';
import { Anchor, AlertCircle } from 'lucide-react';

export function BoatsList() {
  const { boats, isLoading, error } = useBoatsListStore();
  const t = useTranslations('sand.boatsPage');

  if (isLoading && boats.length === 0) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className="rounded-xl border bg-card h-[340px] animate-pulse">
            <div className="h-48 w-full bg-muted/50 rounded-t-xl" />
            <div className="p-5 space-y-4">
              <div className="h-6 w-2/3 bg-muted rounded-md" />
              <div className="space-y-3 mt-4">
                <div className="h-4 w-1/2 bg-muted rounded-md" />
                <div className="h-4 w-full bg-muted rounded-md" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-destructive text-center">
        <AlertCircle className="w-12 h-12 mb-4 text-destructive/50" />
        <h3 className="text-xl font-semibold mb-2">Error Loading Boats</h3>
        <p>{error}</p>
      </div>
    );
  }

  if (boats.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center border rounded-xl bg-card/30 border-dashed">
        <div className="bg-muted/50 p-4 rounded-full mb-4">
          <Anchor className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-semibold mb-2 text-foreground">{t('noBoats')}</h3>
      </div>
    );
  }

  return (
    <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {boats.map((boat) => (
        <StaggerItem key={boat.id}>
          <BoatCard boat={boat} />
        </StaggerItem>
      ))}
    </StaggerContainer>
  );
}
