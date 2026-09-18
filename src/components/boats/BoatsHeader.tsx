"use client";

import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Link } from '@/i18n/routing';
import { PlusCircle, RefreshCcw } from 'lucide-react';
import { FadeInUp } from '@/components/wrappers/motion-wrappers';
import { Breadcrumbs } from '@/components/shared/Breadcrumbs';
import { useQueryClient, useIsFetching } from '@tanstack/react-query';
import { boatKeys } from '@/hooks/queries/useBoatsQueries';

export function BoatsHeader() {
  const t = useTranslations('boatsPage');
  const tSand = useTranslations('sand');
  
  const queryClient = useQueryClient();
  const isFetching = useIsFetching({ queryKey: boatKeys.lists() }) > 0;

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: boatKeys.lists() });
  };

  const breadcrumbItems = [
    { label: tSand('home'), href: '/', isHome: true },
    { label: t('title') }
  ];

  return (
    <div className="space-y-4">
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
              disabled={isFetching}
              className="flex-1 sm:flex-none h-11 rounded-xl bg-background/50 backdrop-blur-sm border-border/50 hover:bg-background/80"
            >
              <RefreshCcw className={`w-4 h-4 mr-2 ${isFetching ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">{tSand('refresh')}</span>
            </Button>
            
            <Button asChild className="flex-1 sm:flex-none h-11 rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all">
              <Link href="/boats/new">
                <PlusCircle className="w-4 h-4 mr-2" />
                {t('addBoat')}
              </Link>
            </Button>
          </div>
        </div>
      </FadeInUp>
    </div>
  );
}


