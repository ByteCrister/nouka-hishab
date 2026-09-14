import { setRequestLocale } from "next-intl/server";
import { LandingPage } from "@/components/home/page";
import { type AppLocale } from "@/constants/common.const";

interface Props {
  params: Promise<{ locale: AppLocale }>;
}

export default async function LocalePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <LandingPage locale={locale} />;
}
