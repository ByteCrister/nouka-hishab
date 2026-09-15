"use client";

import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { PlusCircle, RefreshCcw } from 'lucide-react';
import { FadeInUp } from '@/components/wrappers/motion-wrappers';
import { Breadcrumbs } from '@/components/shared/Breadcrumbs';
import { useBoatsListStore } from '@/store/sand/useBoatStore';

export function BoatsHeader() {
  const t = useTranslations('sand.boatsPage');
  const tSand = useTranslations('sand');
  const { fetchBoats, isRefreshing, isLoading } = useBoatsListStore();

  const handleRefresh = () => {
    fetchBoats({ silent: false });
  };

  const breadcrumbItems = [
    { label: tSand('home'), href: '/', isHome: true },
    { label: tSand('title'), href: '/sand/dashboard' },
    { label: t('title') }
  ];

  return (
    <div className="space-y-4 mb-8">
      <Breadcrumbs items={breadcrumbItems} />
      
      <FadeInUp>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
              {t('title')}
            </h1>
            <p className="text-muted-foreground mt-2 text-sm md:text-base">
              {t('subtitle')}
            </p>
          </div>
          
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRefresh} 
              disabled={isRefreshing || isLoading}
              className="flex-1 sm:flex-none h-10"
            >
              <RefreshCcw className={`w-4 h-4 mr-2 ${(isRefreshing || isLoading) ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">{tSand('refresh')}</span>
            </Button>
            
            <Button className="flex-1 sm:flex-none h-10 shadow-lg shadow-primary/20">
              <PlusCircle className="w-4 h-4 mr-2" />
              {t('addBoat')}
            </Button>
          </div>
        </div>
      </FadeInUp>
    </div>
  );
}
