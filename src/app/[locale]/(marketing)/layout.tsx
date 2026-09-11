import { PublicLayoutWrapper } from "@/components/wrappers/PublicLayoutWrapper";
import { type AppLocale } from "@/constants/common";

interface Props {
  children: React.ReactNode;
  params: Promise<{ locale: AppLocale }>;
}

export default async function MarketingLayout({ children, params }: Props) {
  const { locale } = await params;
  return (
    <PublicLayoutWrapper locale={locale}>
      {children}
    </PublicLayoutWrapper>
  );
}
