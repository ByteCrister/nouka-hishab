import { getTranslations, setRequestLocale } from 'next-intl/server';
import { SandTripDetailClient } from '@/components/trips/sand/detail/SandTripDetailClient';
import { Breadcrumbs } from '@/components/shared/Breadcrumbs';

interface Props {
  params: Promise<{ locale: string; publicId: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'sandTripsDetail' });
  return {
    title: `${t('meta.title')} | Nouka Hishab`,
    description: t('meta.description'),
  };
}

export default async function SandTripDetailPage({ params }: Props) {
  const { locale, publicId } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'sandTripsDetail' });

  return (
    <main className="container mx-auto py-8 px-4 max-w-7xl">
      <Breadcrumbs
        items={[
          { label: t('breadcrumbs.home'), href: '/', isHome: true },
          { label: t('breadcrumbs.trips'), href: '/trips' },
          { label: t('breadcrumbs.tripDetails') },
        ]}
      />
      <SandTripDetailClient publicId={publicId} />
    </main>
  );
}
