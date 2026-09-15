"use client";

import { useState, useEffect } from 'react';
import { useDebounce } from 'use-debounce';
import { useBoatsListStore } from '@/store/useBoatStore';
import { useTranslations } from 'next-intl';
import { FadeInUp } from '@/components/wrappers/motion-wrappers';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Search } from 'lucide-react';
import type { BoatStatus } from '@/constants/boats.const';
import { SECTORS, type SectorName } from '@/constants/db/app.const';

export function BoatsToolbar() {
  const t = useTranslations('boatsPage');
  const { filters, setSearch, setStatus, setSector } = useBoatsListStore();
  const [localSearch, setLocalSearch] = useState(filters.search || '');

  const [debouncedSearch] = useDebounce(localSearch, 400);

  // Debounce search input
  useEffect(() => {
    if (debouncedSearch !== filters.search) {
      setSearch(debouncedSearch);
    }
  }, [debouncedSearch, filters.search, setSearch]);

  return (
    <FadeInUp delay={0.1}>
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input 
          placeholder={t('searchPlaceholder')}
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          className="pl-9 h-11 bg-card border-border/50 focus-visible:ring-primary/20"
        />
      </div>
      
      <div className="w-full sm:w-48">
        <Select 
          value={filters.sector || 'all'} 
          onValueChange={(val: string) => setSector(val as SectorName | 'all')}
        >
          <SelectTrigger className="h-11 bg-card border-border/50 font-medium">
            <SelectValue placeholder="All Sectors" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sectors</SelectItem>
            <SelectItem value={SECTORS.SAND}>Sand</SelectItem>
            <SelectItem value={SECTORS.LIME_STONE}>Stone</SelectItem>
            <SelectItem value={SECTORS.BRICK}>Brick</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="w-full sm:w-48">
        <Select 
          value={filters.status || 'all'} 
          onValueChange={(val: string) => setStatus(val as BoatStatus | 'all')}
        >
          <SelectTrigger className="h-11 bg-card border-border/50 font-medium">
            <SelectValue placeholder={t('status.all')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('status.all')}</SelectItem>
            <SelectItem value="active">{t('status.active')}</SelectItem>
            <SelectItem value="maintenance">{t('status.maintenance')}</SelectItem>
            <SelectItem value="inactive">{t('status.inactive')}</SelectItem>
          </SelectContent>
        </Select>
      </div>
      </div>
    </FadeInUp>
  );
}
