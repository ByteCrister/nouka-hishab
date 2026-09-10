import { getLocale } from "next-intl/server";
import { LandingPage } from "@/components/home/landing-page";

export default async function Page() {
  const locale = await getLocale();
  return <LandingPage locale={locale as "en" | "bn"} />;
}
