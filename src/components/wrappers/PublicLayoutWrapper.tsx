import { Navbar } from "@/components/layout/nav/Navbar";
import { Footer } from "@/components/layout/footer/Footer";
import { type AppLocale } from "@/constants/common.const";

export function PublicLayoutWrapper({
  children,
  locale,
}: {
  children: React.ReactNode;
  locale: AppLocale;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-sand-50)] text-[var(--color-ink-700)] selection:bg-[var(--color-river-500)] selection:text-[var(--color-sand-50)]">
      <Navbar locale={locale} />
      <main className="flex-1">
        {children}
      </main>
      <Footer locale={locale} />
    </div>
  );
}
