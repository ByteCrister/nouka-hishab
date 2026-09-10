"use client";

import { usePathname, useRouter } from "@/i18n/routing";
import { useLocale } from "next-intl";
import { Button } from "@/components/ui/button";

export function LanguageSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const next = locale === "en" ? "bn" : "en";

  return (
    <Button
      variant="outline"
      size="sm"
      className="gap-1.5 rounded-full"
      onClick={() => router.replace(pathname, { locale: next })}
    >
      {locale === "en" ? "বাংলা" : "English"}
    </Button>
  );
}
