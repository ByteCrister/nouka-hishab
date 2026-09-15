import { SandDashboardClient } from '@/components/sand/dashboard/SandDashboardClient';
import { Breadcrumbs } from '@/components/shared/Breadcrumbs';
import { getTranslations, setRequestLocale } from 'next-intl/server';

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'sand' });
  
  return {
    title: `${t('title')} | Nouka Hishab`,
    description: t('subtitle'),
  };
}

export default async function SandDashboardPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'sand' });

  return (
    <main className="container mx-auto py-8 px-4 max-w-7xl">
      <Breadcrumbs 
        items={[
          { label: t('home'), href: '/', isHome: true },
          { label: t('title') }
        ]} 
      />
      <SandDashboardClient />
    </main>
  );
}
