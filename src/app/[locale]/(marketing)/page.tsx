import { getLocale } from "next-intl/server";
import { LandingPage } from "@/components/home/page";
import { type AppLocale } from "@/constants/common";

export default async function LocalePage() {
  const locale = await getLocale();
  return <LandingPage locale={locale as AppLocale} />;
}
