import { PublicLayoutWrapper } from "@/components/wrappers/PublicLayoutWrapper";
import { setRequestLocale } from "next-intl/server";
import { type AppLocale } from "@/constants/common";

interface Props {
  children: React.ReactNode;
  params: Promise<{ locale: string }>; // must be string to satisfy Next.js's type validator
}

export default async function MarketingLayout({ children, params }: Props) {
  const { locale } = await params as { locale: AppLocale };
  setRequestLocale(locale);
  return (
    <PublicLayoutWrapper locale={locale}>
      {children}
    </PublicLayoutWrapper>
  );
}
