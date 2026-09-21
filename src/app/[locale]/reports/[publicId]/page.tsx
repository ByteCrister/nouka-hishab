import { setRequestLocale } from 'next-intl/server';
import { ReportDetailClient } from '@/components/reports/detail/ReportDetailClient';

interface Props {
  params: Promise<{ locale: string; publicId: string }>;
}

export async function generateMetadata() {
  return {
    title: `Report Details | Nouka Hishab`,
    description: 'View and manage report details',
  };
}

export default async function ReportDetailPage({ params }: Props) {
  const { locale, publicId } = await params;
  setRequestLocale(locale);

  return (
    <main className="container mx-auto py-8 px-4 max-w-7xl">
      <div>
        <ReportDetailClient publicId={publicId} />
      </div>
    </main>
  );
}
