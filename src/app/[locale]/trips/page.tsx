import { getTranslations, setRequestLocale } from 'next-intl/server';
import { TripsPageClient } from '@/components/trips/TripsPageClient';
import { Breadcrumbs } from '@/components/shared/Breadcrumbs';

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'trips' });
  return {
    title: `${t('meta.title')} | Nouka Hishab`,
    description: t('meta.description'),
  };
}

export default async function TripsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'trips' });

  return (
    <main className="container mx-auto py-8 px-4 max-w-7xl">
      <Breadcrumbs
        items={[
          { label: t('breadcrumbs.home'), href: '/', isHome: true },
          { label: t('breadcrumbs.trips') },
        ]}
      />
      <TripsPageClient />
    </main>
  );
}
