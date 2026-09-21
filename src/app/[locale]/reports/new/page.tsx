import { setRequestLocale } from 'next-intl/server';
import { NewReportForm } from '@/components/reports/new/NewReportForm';

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata() {
  return {
    title: `New Report | Nouka Hishab`,
    description: 'Create a new report, bug, or feature request',
  };
}

export default async function NewReportPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <main className="container mx-auto py-8 px-4 max-w-7xl">
      <div>
        <NewReportForm />
      </div>
    </main>
  );
}
