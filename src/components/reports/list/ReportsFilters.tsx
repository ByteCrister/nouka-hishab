"use client";

import { useState, useEffect } from 'react';
import { useDebounce } from '@/hooks/useDebounce';
import { useReportsFiltersStore } from '@/store/useReportsFiltersStore';
import { FadeInUp } from '@/components/wrappers/motion-wrappers';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Search, Plus } from 'lucide-react';
import { REPORT_CATEGORIES, REPORT_STATUSES, type ReportCategory, type ReportStatus } from '@/constants/db/app.const';
import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';

export function ReportsFilters() {
  const t = useTranslations('reportsPage.list.filters');
  const tCategory = useTranslations('reportsPage.list.category');
  const tStatus = useTranslations('reportsPage.list.status');
  
  const { listFilters: filters, setSearch, setStatus, setCategory } = useReportsFiltersStore();
  const [localSearch, setLocalSearch] = useState(filters.search || '');

  const debouncedSearch = useDebounce(localSearch, 400);

  // Debounce search input
  useEffect(() => {
    if (debouncedSearch !== filters.search) {
      setSearch(debouncedSearch);
    }
  }, [debouncedSearch, filters.search, setSearch]);

  return (
    <FadeInUp delay={0.1}>
      <div className="flex flex-col sm:flex-row gap-4 mb-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder={t('search')}
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="pl-9 h-11 bg-card/50 backdrop-blur-sm border-border/50 focus-visible:ring-primary/20 rounded-xl transition-all shadow-sm focus:shadow-md"
          />
        </div>
        
        <div className="w-full sm:w-48">
          <Select 
            value={filters.category || 'all'} 
            onValueChange={(val: string) => setCategory(val as ReportCategory | 'all')}
          >
            <SelectTrigger className="h-11 bg-card/50 backdrop-blur-sm border-border/50 font-medium rounded-xl shadow-sm hover:border-primary/30 transition-all">
              <SelectValue placeholder={t('allCategories')} />
            </SelectTrigger>
            <SelectContent className="rounded-xl shadow-lg border-border/50">
              <SelectItem value="all" className="rounded-lg">{t('allCategories')}</SelectItem>
              {Object.values(REPORT_CATEGORIES).map((cat) => (
                <SelectItem key={cat} value={cat} className="rounded-lg capitalize">{tCategory(cat as Parameters<typeof tCategory>[0])}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="w-full sm:w-48">
          <Select 
            value={filters.status || 'all'} 
            onValueChange={(val: string) => setStatus(val as ReportStatus | 'all')}
          >
            <SelectTrigger className="h-11 bg-card/50 backdrop-blur-sm border-border/50 font-medium rounded-xl shadow-sm hover:border-primary/30 transition-all">
              <SelectValue placeholder={t('allStatuses')} />
            </SelectTrigger>
            <SelectContent className="rounded-xl shadow-lg border-border/50">
              <SelectItem value="all" className="rounded-lg">{t('allStatuses')}</SelectItem>
              {Object.values(REPORT_STATUSES).map((status) => (
                <SelectItem key={status} value={status} className="rounded-lg capitalize">{tStatus(status as Parameters<typeof tStatus>[0])}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Link href="/reports/new">
          <Button className="h-11 rounded-xl w-full sm:w-auto shadow-sm">
            <Plus className="w-4 h-4 mr-2" />
            {t('createReport')}
          </Button>
        </Link>
      </div>
    </FadeInUp>
  );
}
