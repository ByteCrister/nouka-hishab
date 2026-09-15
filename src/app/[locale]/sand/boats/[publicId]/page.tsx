import { setRequestLocale } from 'next-intl/server';
import { getTranslations } from 'next-intl/server';
import { BoatDetailClient } from '../../../../../components/sand/boats/detail/BoatDetailClient';

interface Props {
  params: Promise<{ locale: string; publicId: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'sand.boatsPage.detail' });
  
  return {
    title: `${t('title')} | Nouka Hishab`,
  };
}

export default async function BoatDetailPage({ params }: Props) {
  const { locale, publicId } = await params;
  setRequestLocale(locale);

  return (
    <main className="container mx-auto py-8 px-4 max-w-7xl">
      <div className="mt-6">
        <BoatDetailClient publicId={publicId} />
      </div>
    </main>
  );
}
