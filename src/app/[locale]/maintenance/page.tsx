import { setRequestLocale, getTranslations } from 'next-intl/server';

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'nav' });

  return {
    title: `${t('maintenance')} | Nouka Hishab`,
  };
}

export default async function MaintenancePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <main className="container mx-auto py-8 px-4 max-w-7xl">
      {/* TODO: Add Maintenance client component here */}
    </main>
  );
}
