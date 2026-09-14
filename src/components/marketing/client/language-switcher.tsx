"use client";

import { usePathname, useRouter } from "@/i18n/routing";
import { useLocale } from "next-intl";
import { Globe } from "lucide-react";
import { APP_LOCALES } from "@/constants/common.const";

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  function toggleLocale() {
    const nextLocale = locale === APP_LOCALES.EN ? APP_LOCALES.BN : APP_LOCALES.EN;
    router.replace(pathname, { locale: nextLocale });
  }

  return (
    <button
      onClick={toggleLocale}
      className="inline-flex h-9 items-center justify-center rounded-lg border border-[var(--color-ink-700)]/10 bg-transparent px-3 text-sm font-medium text-[var(--color-ink-700)] transition-colors hover:bg-[var(--color-ink-700)]/5"
      aria-label="Toggle language"
    >
      <Globe className="mr-2 h-4 w-4" />
      {locale === APP_LOCALES.EN ? "বাংলা" : "English"}
    </button>
  );
}
