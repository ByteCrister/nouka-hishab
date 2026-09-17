import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Breadcrumbs } from '@/components/shared/Breadcrumbs';
import { requireAuthPublicId } from '@/lib/auth/utils';
import { EditSandTripClient } from '@/components/sand/trips/edit/EditSandTripClient';

interface Props {
  params: Promise<{ locale: string; publicId: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'sandTripsNew' });
  return {
    title: `${t('meta.editTitle')} | Nouka Hishab`,
    description: t('meta.description'),
  };
}

export default async function EditSandTripPage({ params }: Props) {
  const { locale, publicId } = await params;
  setRequestLocale(locale);
  await requireAuthPublicId();

  const t = await getTranslations({ locale, namespace: 'sandTripsNew' });
  
  return (
    <main className="container mx-auto py-8 px-4 max-w-7xl">
      <Breadcrumbs
        items={[
          { label: t('breadcrumbs.home'), href: '/', isHome: true },
          { label: t('breadcrumbs.sand'), href: '/sand' },
          { label: t('breadcrumbs.trips'), href: '/sand/trips' },
          { label: t('breadcrumbs.tripDetails'), href: `/sand/trips/${publicId}` },
          { label: t('breadcrumbs.edit') },
        ]}
      />
      <EditSandTripClient publicId={publicId} />
    </main>
  );
}
