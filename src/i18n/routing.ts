import { defineRouting } from "next-intl/routing";
import { createNavigation } from "next-intl/navigation";
import { APP_LOCALES } from "@/constants/common";

export const routing = defineRouting({
  locales: [APP_LOCALES.EN, APP_LOCALES.BN],
  defaultLocale: APP_LOCALES.BN,
  localePrefix: "as-needed", // "/" = BN, "/en" = EN
});

export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
