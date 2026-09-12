"use client";

import { Logo } from "@/components/marketing/logo";
import { LanguageSwitcher } from "@/components/marketing/client/language-switcher";
import { homeMessages } from "@/messages/home/index";
import { type AppLocale } from "@/constants/common";
import { SignInDialog } from "@/components/shared/signin/SigninDialog";
import { Link } from "@/i18n/routing";
import { useSession } from "next-auth/react";
import { UserAccountNav } from "./UserAccountNav";
import { SandMegaMenu } from "./SandMegaMenu";
import { MobileNav } from "./MobileNav";

export function Navbar({ locale }: { locale: AppLocale }) {
  const t = homeMessages[locale];
  const { data: session, status } = useSession();
  const isAuthenticated = status === "authenticated";

  return (
    <header className="sticky top-0 z-50 w-full border-b border-ink-700/5 bg-sand-50/80 backdrop-blur-xl">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Logo />
          <nav className="hidden items-center gap-8 md:flex">
            {isAuthenticated && <SandMegaMenu />}
            <Link href="/how-it-works" className="text-sm font-medium text-ink-700 hover:text-river-500 transition-colors">
              {t.nav.howItWorks}
            </Link>
            <Link href="/pricing" className="text-sm font-medium text-ink-700 hover:text-river-500 transition-colors">
              {t.nav.pricing}
            </Link>
            <Link href="/stories" className="text-sm font-medium text-ink-700 hover:text-river-500 transition-colors">
              {t.nav.stories}
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <LanguageSwitcher />

          <div className="hidden md:block">
            {isAuthenticated ? (
              <UserAccountNav />
            ) : (
              <SignInDialog>
                <button className="text-sm font-bold hover:text-river-500 transition-colors text-ink-700 outline-none">
                  {t.nav.signIn}
                </button>
              </SignInDialog>
            )}
          </div>

          <MobileNav isAuthenticated={isAuthenticated} user={session?.user} />
        </div>
      </div>
    </header>
  );
}
