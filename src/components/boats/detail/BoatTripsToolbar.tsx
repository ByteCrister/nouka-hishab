"use client";

import { useTranslations } from 'next-intl';
import { useBoatFiltersStore } from '@/store/useBoatFiltersStore';
import { Search, ListFilter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { FadeInUp } from '@/components/wrappers/motion-wrappers';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SAND_TRIP_STATUSES, type SandTripStatus } from '@/constants/db/sand.const';
import { useDebounce } from 'use-debounce';
import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import Link from 'next/link';

interface BoatTripsToolbarProps {
  publicId: string;
}

export function BoatTripsToolbar({ publicId }: BoatTripsToolbarProps) {
  const t = useTranslations('boatsPage.detail.trips');
  const { tripsFilters, setTripsSearch, setTripsStatus, resetTripsFilters } = useBoatFiltersStore();
  const [localSearch, setLocalSearch] = useState(tripsFilters.search);
  const [debouncedSearch] = useDebounce(localSearch, 500);

  useEffect(() => {
    if (debouncedSearch !== tripsFilters.search) {
      setTripsSearch(debouncedSearch);
    }
  }, [debouncedSearch, tripsFilters.search, setTripsSearch]);

  return (
    <FadeInUp delay={0.2}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="relative w-full sm:max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={t('searchPlaceholder')}
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          className="pl-9 w-full bg-background/50 border-border/50 focus-visible:ring-primary/50"
        />
      </div>

      <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
        <Select 
          value={tripsFilters.status} 
          onValueChange={(val) => setTripsStatus(val as SandTripStatus | 'all')}
        >
          <SelectTrigger className="w-full sm:w-[180px] bg-background/50 border-border/50">
            <div className="flex items-center gap-2">
              <ListFilter className="w-4 h-4 text-muted-foreground" />
              <SelectValue placeholder={t('status.all')} />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('status.all')}</SelectItem>
            {Object.values(SAND_TRIP_STATUSES).map((status) => (
              <SelectItem key={status} value={status}>
                {t(`status.${status}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {(tripsFilters.search || tripsFilters.status !== 'all') && (
          <Button 
            variant="ghost" 
            onClick={() => {
              setLocalSearch('');
              resetTripsFilters();
            }}
            className="text-muted-foreground hover:text-foreground"
          >
            Clear
          </Button>
        )}
        
        <Button asChild className="shrink-0 shadow-sm">
          <Link href={`/trips/sand/new?boatPublicId=${publicId}`}>
            <Plus className="w-4 h-4 mr-2" />
            {t('createTrip')}
          </Link>
        </Button>
        </div>
      </div>
    </FadeInUp>
  );
}


