'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useDebounce } from '@/hooks/useDebounce';
import { useMaintenanceFiltersStore } from '@/store/useMaintenanceFiltersStore';
import { useBoatsMeta } from '@/hooks/queries/useBoatsMetaQueries';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Ship, FileDown, Plus, Eye, Download, ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface MaintenanceToolbarProps {
  onAdd: () => void;
  onExport: () => void;
  onPreview: () => void;
}

export function MaintenanceToolbar({ onAdd, onExport, onPreview }: MaintenanceToolbarProps) {
  const t = useTranslations('maintenance.toolbar');
  const sharedT = useTranslations('shared');
  
  const { filters, setSearch, setBoat, setFilter } = useMaintenanceFiltersStore();
  const { data: boats } = useBoatsMeta();
  
  const [localSearch, setLocalSearch] = useState(filters.search || '');
  const debouncedSearch = useDebounce(localSearch, 400);

  useEffect(() => {
    if (debouncedSearch !== filters.search) {
      setSearch(debouncedSearch);
    }
  }, [debouncedSearch, filters.search, setSearch]);

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
      <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto flex-1">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder={t('searchPlaceholder')}
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="pl-9 h-11 bg-card/50 backdrop-blur-sm border-border/50 rounded-xl"
          />
        </div>

        <Select
          value={filters.boatId}
          onValueChange={(v) => setBoat(v)}
        >
          <SelectTrigger className="w-full sm:w-[180px] h-11 bg-card/50 rounded-xl border-border/50">
            <Ship className="w-4 h-4 mr-2 text-muted-foreground" />
            <SelectValue placeholder={t('allBoats')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('allBoats')}</SelectItem>
            {boats?.map((boat) => (
              <SelectItem key={boat.id} value={boat.id.toString()}>
                {boat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          type="date"
          value={filters.fromDate ?? ''}
          onChange={(e) => setFilter('fromDate', e.target.value || null)}
          className="w-full sm:w-[150px] h-11 bg-card/50 rounded-xl border-border/50"
          title="From date"
        />
        <Input
          type="date"
          value={filters.toDate ?? ''}
          onChange={(e) => setFilter('toDate', e.target.value || null)}
          className="w-full sm:w-[150px] h-11 bg-card/50 rounded-xl border-border/50"
          title="To date"
        />
      </div>

      <div className="flex items-center gap-3 w-full sm:w-auto flex-wrap sm:flex-nowrap">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="h-11 rounded-xl w-full sm:w-auto">
              <FileDown className="w-4 h-4 mr-2" />
              {t('exportPdf')}
              <ChevronDown className="w-4 h-4 ml-2 opacity-60" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem className="gap-2 cursor-pointer" onClick={onPreview}>
              <Eye className="w-4 h-4 text-muted-foreground" />
              Preview PDF
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2 cursor-pointer" onClick={onExport}>
              <Download className="w-4 h-4 text-muted-foreground" />
              Download PDF
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button className="h-11 rounded-xl w-full sm:w-auto shadow-md" onClick={onAdd}>
          <Plus className="w-4 h-4 mr-2" />
          {t('addMaintenance')}
        </Button>
      </div>
    </div>
  );
}
