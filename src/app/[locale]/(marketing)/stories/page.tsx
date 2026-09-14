import { StoriesPage } from "@/components/stories/page";
import { setRequestLocale } from "next-intl/server";
import { APP_LOCALES, type AppLocale } from "@/constants/common.const";

export function generateStaticParams() {
  return Object.values(APP_LOCALES).map((locale) => ({ locale }));
}

interface Props {
  params: Promise<{ locale: AppLocale }>;
}

export default async function StoriesRoute({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <StoriesPage locale={locale} />;
}
