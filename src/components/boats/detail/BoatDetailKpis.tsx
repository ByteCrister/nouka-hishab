import { useTranslations } from 'next-intl';
import { Banknote, Package, Activity, Wrench, Navigation, CheckCircle2, Wallet, TrendingUp, PlayCircle, CalendarClock } from 'lucide-react';
import { FadeInUp } from '@/components/wrappers/motion-wrappers';
import type { BoatDetailKpis } from '@/types/boats.types';

interface BoatDetailKpisProps {
  kpis: BoatDetailKpis | null;
}

export function BoatDetailKpis({ kpis }: BoatDetailKpisProps) {
  const t = useTranslations('boatsPage.detail.kpis');
  const tBoats = useTranslations('boatsPage');

  if (!kpis) return null;

  const kpiItems = [
    {
      title: t('totalRevenue'),
      value: `৳ ${(kpis.totalRevenueTk || 0).toLocaleString()}`,
      icon: <Banknote className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />,
      bg: 'bg-emerald-100 dark:bg-emerald-900/30',
      delay: 0.1,
    },
    {
      title: t('operatingCost'),
      value: `৳ ${(kpis.totalOperatingCostTk || 0).toLocaleString()}`,
      icon: <Wallet className="w-5 h-5 text-orange-600 dark:text-orange-400" />,
      bg: 'bg-orange-100 dark:bg-orange-900/30',
      delay: 0.2,
    },
    {
      title: t('maintenanceCost'),
      value: `৳ ${(kpis.totalMaintenanceCostTk || 0).toLocaleString()}`,
      icon: <Wrench className="w-5 h-5 text-rose-600 dark:text-rose-400" />,
      bg: 'bg-rose-100 dark:bg-rose-900/30',
      delay: 0.3,
    },
    {
      title: t('netProfit'),
      value: `৳ ${(kpis.netProfitTk || 0).toLocaleString()}`,
      icon: <Activity className="w-5 h-5 text-blue-600 dark:text-blue-400" />,
      bg: 'bg-blue-100 dark:bg-blue-900/30',
      delay: 0.4,
    },
    {
      title: t('avgProfitPerTrip'),
      value: `৳ ${(kpis.avgProfitPerTripTk || 0).toLocaleString()}`,
      icon: <TrendingUp className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />,
      bg: 'bg-indigo-100 dark:bg-indigo-900/30',
      delay: 0.5,
    },
    {
      title: tBoats('totalTrips'),
      value: kpis.totalTrips,
      icon: <Navigation className="w-5 h-5 text-purple-600 dark:text-purple-400" />,
      bg: 'bg-purple-100 dark:bg-purple-900/30',
      delay: 0.6,
    },
    {
      title: t('completedTrips'),
      value: kpis.completedTrips,
      icon: <CheckCircle2 className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />,
      bg: 'bg-cyan-100 dark:bg-cyan-900/30',
      delay: 0.7,
    },
    {
      title: t('ongoingTrips'),
      value: kpis.ongoingTrips,
      icon: <PlayCircle className="w-5 h-5 text-sky-600 dark:text-sky-400" />,
      bg: 'bg-sky-100 dark:bg-sky-900/30',
      delay: 0.8,
    },
    {
      title: t('totalCargo'),
      value: (kpis.totalCargoMoved || 0).toLocaleString(),
      icon: <Package className="w-5 h-5 text-amber-600 dark:text-amber-400" />,
      bg: 'bg-amber-100 dark:bg-amber-900/30',
      delay: 0.9,
    },
    {
      title: t('lastTrip'),
      value: kpis.lastTripAt ? new Date(kpis.lastTripAt).toLocaleDateString() : '-',
      icon: <CalendarClock className="w-5 h-5 text-teal-600 dark:text-teal-400" />,
      bg: 'bg-teal-100 dark:bg-teal-900/30',
      delay: 1.0,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
      {kpiItems.map((item, idx) => (
        <FadeInUp key={idx} delay={item.delay}>
          <div className="rounded-xl border border-border/50 bg-card p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center space-x-3 mb-3">
              <div className={`p-2 rounded-lg ${item.bg}`}>
                {item.icon}
              </div>
              <h3 className="font-medium text-muted-foreground text-sm leading-tight">
                {item.title}
              </h3>
            </div>
            <p className="text-2xl font-bold tracking-tight text-foreground truncate" title={String(item.value)}>
              {item.value}
            </p>
          </div>
        </FadeInUp>
      ))}
    </div>
  );
}


