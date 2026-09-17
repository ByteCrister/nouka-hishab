"use client";

import { BoatListItem } from '@/types/boats.types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Ship, Anchor, Navigation } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';

interface BoatCardProps {
  boat: BoatListItem;
}

export function BoatCard({ boat }: BoatCardProps) {
  const t = useTranslations('boatsPage');
  const tShared = useTranslations('shared');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-emerald-500/10 text-emerald-500 border-emerald-200/50 hover:bg-emerald-500/20';
      case 'maintenance':
        return 'bg-amber-500/10 text-amber-500 border-amber-200/50 hover:bg-amber-500/20';
      default:
        return 'bg-muted text-muted-foreground border-border hover:bg-muted/80';
    }
  };

  return (
    <Card className="group overflow-hidden border-border/40 bg-card/60 backdrop-blur-sm hover:shadow-xl hover:shadow-primary/5 hover:border-primary/30 transition-all duration-300 rounded-2xl h-full flex flex-col">
      <div className="relative h-48 w-full bg-muted/20 overflow-hidden">
        {boat.primaryImageUrl ? (
          <Image
            src={boat.primaryImageUrl}
            alt={boat.name}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-muted/30 to-muted/10">
            <Ship className="w-16 h-16 text-muted-foreground/20 transition-transform duration-500 group-hover:-translate-y-1 group-hover:text-primary/20 group-hover:scale-110" />
          </div>
        )}
        <div className="absolute top-3 right-3">
          <Badge variant="outline" className={`font-medium shadow-sm backdrop-blur-md px-3 py-1 ${getStatusColor(boat.status)}`}>
            {t(`status.${boat.status}`)}
          </Badge>
        </div>
      </div>
      
      <CardContent className="p-6 flex-1 flex flex-col">
        <div className="flex items-start justify-between mb-1 gap-2">
          <h3 className="font-bold text-xl truncate text-foreground group-hover:text-primary transition-colors">
            {boat.name}
          </h3>
          <Badge variant="secondary" className="font-normal text-xs bg-muted/50 border-border/50 text-muted-foreground whitespace-nowrap">
            {tShared(`sectors.${boat.sector}`)}
          </Badge>
        </div>
        
        <div className="space-y-4 mt-auto pt-6">
          <div className="flex items-center text-sm text-muted-foreground bg-muted/30 p-2.5 rounded-xl">
            <Anchor className="w-4 h-4 mr-2.5 text-primary/70" />
            <span className="font-medium">
              {boat.capacityValue ? `${boat.capacityValue} ${boat.capacityUnit}` : t('capacity')}
            </span>
          </div>
          
          <div className="flex items-center justify-between text-sm bg-muted/30 p-2.5 rounded-xl">
            <div className="flex items-center text-muted-foreground">
              <Navigation className="w-4 h-4 mr-2.5 text-primary/70" />
              <span className="font-medium">{t('totalTrips')}:</span>
            </div>
            <span className="font-bold text-foreground bg-background shadow-sm px-3 py-1 rounded-lg border border-border/50">
              {boat.totalTrips}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
