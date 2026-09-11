import { HowItWorksPage } from "@/components/how-it-works/page";
import { type AppLocale } from "@/constants/common";

interface Props {
  params: Promise<{ locale: AppLocale }>;
}

export default async function HowItWorksRoute({ params }: Props) {
  const { locale } = await params;
  return <HowItWorksPage locale={locale} />;
}
