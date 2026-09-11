import { StoriesPage } from "@/components/stories/page";
import { type AppLocale } from "@/constants/common";

interface Props {
  params: Promise<{ locale: AppLocale }>;
}

export default async function StoriesRoute({ params }: Props) {
  const { locale } = await params;
  return <StoriesPage locale={locale} />;
}
