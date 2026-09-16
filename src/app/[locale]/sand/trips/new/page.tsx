import { setRequestLocale } from 'next-intl/server';
import { NewSandTripForm } from '@/components/sand/trips/new/NewSandTripForm';
import { Breadcrumbs } from '@/components/shared/Breadcrumbs';

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata() {
  return {
    title: 'New Sand Trip | Nouka Hishab',
    description: 'Log a new sand transport trip',
  };
}

export default async function NewSandTripPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <main className="container mx-auto py-8 px-4 max-w-7xl">
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/', isHome: true },
          { label: 'Sand', href: '/sand' },
          { label: 'Trips', href: '/sand/trips' },
          { label: 'New Trip' },
        ]}
      />
      <NewSandTripForm />
    </main>
  );
}
