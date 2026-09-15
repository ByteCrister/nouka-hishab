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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20';
      case 'maintenance':
        return 'bg-amber-500/10 text-amber-500 hover:bg-amber-500/20';
      default:
        return 'bg-muted text-muted-foreground hover:bg-muted/80';
    }
  };

  return (
    <Card className="group overflow-hidden border-border/50 bg-card hover:shadow-lg hover:shadow-primary/5 hover:border-primary/20 transition-all duration-300">
      <div className="relative h-48 w-full bg-muted/30 overflow-hidden">
        {boat.primaryImageUrl ? (
          <Image
            src={boat.primaryImageUrl}
            alt={boat.name}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-muted/50 to-muted">
            <Ship className="w-16 h-16 text-muted-foreground/30 transition-transform duration-500 group-hover:-translate-y-1 group-hover:text-primary/20" />
          </div>
        )}
        <div className="absolute top-3 right-3">
          <Badge variant="outline" className={`border-0 font-medium shadow-sm backdrop-blur-md ${getStatusColor(boat.status)}`}>
            {t(`status.${boat.status}`)}
          </Badge>
        </div>
      </div>
      
      <CardContent className="p-5">
        <h3 className="font-bold text-lg mb-1 truncate text-foreground group-hover:text-primary transition-colors">
          {boat.name}
        </h3>
        
        <div className="space-y-3 mt-4">
          <div className="flex items-center text-sm text-muted-foreground">
            <Anchor className="w-4 h-4 mr-2.5 text-primary/70" />
            <span className="font-medium">
              {boat.capacityValue ? `${boat.capacityValue} ${boat.capacityUnit}` : t('capacity')}
            </span>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center text-muted-foreground">
              <Navigation className="w-4 h-4 mr-2.5 text-primary/70" />
              <span>{t('totalTrips')}:</span>
            </div>
            <span className="font-semibold text-foreground bg-primary/10 px-2 py-0.5 rounded-md">
              {boat.totalTrips}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
