import { getTranslations } from 'next-intl/server';
import { BoatsPageClient } from '@/components/sand/boats/BoatsPageClient';
import { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('sand.boatsPage');
  
  return {
    title: t('title'),
    description: t('subtitle'),
  };
}

export default function BoatsPage() {
  return (
    <div className="w-full h-full">
      <BoatsPageClient />
    </div>
  );
}
