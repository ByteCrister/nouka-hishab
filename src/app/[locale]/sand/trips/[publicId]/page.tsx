import { setRequestLocale } from 'next-intl/server';
import { SandTripDetailClient } from '@/components/sand/trips/detail/SandTripDetailClient';
import { Breadcrumbs } from '@/components/shared/Breadcrumbs';

interface Props {
  params: Promise<{ locale: string; publicId: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { publicId } = await params;
  return {
    title: `Trip ${publicId} | Nouka Hishab`,
    description: 'Sand trip details, expenses and attachments',
  };
}

export default async function SandTripDetailPage({ params }: Props) {
  const { locale, publicId } = await params;
  setRequestLocale(locale);

  return (
    <main className="container mx-auto py-8 px-4 max-w-7xl">
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/', isHome: true },
          { label: 'Sand', href: '/sand' },
          { label: 'Trips', href: '/sand/trips' },
          { label: 'Trip Details' },
        ]}
      />
      <SandTripDetailClient publicId={publicId} />
    </main>
  );
}
