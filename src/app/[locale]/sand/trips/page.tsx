import { setRequestLocale } from 'next-intl/server';
import { SandTripsPageClient } from '@/components/sand/trips/SandTripsPageClient';
import { Breadcrumbs } from '@/components/shared/Breadcrumbs';

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata() {
  return {
    title: 'Sand Trips | Nouka Hishab',
    description: 'Manage all sand transport trips',
  };
}

export default async function SandTripsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <main className="container mx-auto py-8 px-4 max-w-7xl">
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/', isHome: true },
          { label: 'Sand', href: '/sand' },
          { label: 'Trips' },
        ]}
      />
      <SandTripsPageClient />
    </main>
  );
}
