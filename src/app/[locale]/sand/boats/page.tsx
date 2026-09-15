import { setRequestLocale } from 'next-intl/server';
import { getTranslations } from 'next-intl/server';
import { BoatsPageClient } from '@/components/sand/boats/BoatsPageClient';

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'sand.boatsPage' });
  
  return {
    title: `${t('title')} | Nouka Hishab`,
    description: t('subtitle'),
  };
}

export default async function BoatsDashboardPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <main className="container mx-auto py-8 px-4 max-w-7xl">
      <div>
        <BoatsPageClient />
      </div>
    </main>
  );
}
