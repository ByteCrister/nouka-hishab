import { HowItWorksPage } from "@/components/how-it-works/page";
import { setRequestLocale } from "next-intl/server";
import { APP_LOCALES, type AppLocale } from "@/constants/common";

export function generateStaticParams() {
  return Object.values(APP_LOCALES).map((locale) => ({ locale }));
}

interface Props {
  params: Promise<{ locale: AppLocale }>;
}

export default async function HowItWorksRoute({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <HowItWorksPage locale={locale} />;
}
