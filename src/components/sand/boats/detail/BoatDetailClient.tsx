'use client';

import { useEffect } from 'react';
import { useBoatStore } from '@/store/sand/useBoatStore';
import { useTranslations } from 'next-intl';
import { BoatDetailHeader } from './BoatDetailHeader';
import { BoatDetailKpis } from './BoatDetailKpis';
import { BoatImageGallery } from './BoatImageGallery';
import { BoatTripsToolbar } from './BoatTripsToolbar';
import { BoatTripsList } from './BoatTripsList';
import { FadeInUp } from '@/components/wrappers/motion-wrappers';
import { AlertCircle, Loader2 } from 'lucide-react';

interface BoatDetailClientProps {
  publicId: string;
}

export function BoatDetailClient({ publicId }: BoatDetailClientProps) {
  const { 
    boat, 
    kpis, 
    isLoading, 
    error, 
    fetchBoat, 
    fetchTrips, 
    reset,
    tripsFilters
  } = useBoatStore();

  const t = useTranslations('sand.boatsPage.detail');

  // Load initial data
  useEffect(() => {
    fetchBoat(publicId);
    return () => reset();
  }, [publicId, fetchBoat, reset]);

  // Load trips when filters change
  useEffect(() => {
    fetchTrips(publicId);
  }, [publicId, fetchTrips, tripsFilters]);

  if (isLoading && !boat) {
    return (
      <div className="flex flex-col items-center justify-center py-20 min-h-[50vh]">
        <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
        <p className="text-muted-foreground font-medium">Loading boat details...</p>
      </div>
    );
  }

  if (error || !boat) {
    return (
      <FadeInUp>
        <div className="max-w-xl mx-auto mt-8 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-lg p-4 flex gap-3 text-red-800 dark:text-red-400">
          <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-semibold mb-1">Error</h3>
            <p className="text-sm">
              {error || 'Failed to load boat details. The boat may not exist.'}
            </p>
          </div>
        </div>
      </FadeInUp>
    );
  }

  return (
    <div className="pb-12">
      <BoatDetailHeader boat={boat} />
      <BoatDetailKpis kpis={kpis} />
      <BoatImageGallery boat={boat} />
      
      <div className="mt-12 bg-card rounded-2xl shadow-sm border border-border/50 p-6">
        <h2 className="text-2xl font-bold tracking-tight text-foreground mb-6">
          {t('trips.title')}
        </h2>
        <BoatTripsToolbar />
        <BoatTripsList />
      </div>
    </div>
  );
}
