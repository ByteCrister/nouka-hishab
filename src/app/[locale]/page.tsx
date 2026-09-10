import { getLocale } from "next-intl/server";
import { LandingPage } from "@/components/landing/page";
import { PublicLayoutWrapper } from "@/components/wrappers/PublicLayoutWrapper";
import { type AppLocale } from "@/constants/common";

export default async function LocalePage() {
  const locale = await getLocale();
  return (
    <PublicLayoutWrapper locale={locale as AppLocale}>
      <LandingPage locale={locale as AppLocale} />
    </PublicLayoutWrapper>
  );
}
