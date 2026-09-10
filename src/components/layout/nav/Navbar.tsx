import { Logo } from "@/components/marketing/logo";
import { LanguageSwitcher } from "@/components/marketing/client/language-switcher";
import { homeMessages } from "@/messages/home";
import { type AppLocale } from "@/constants/common";
import { SignInDialog } from "@/components/layout/nav/signin/client/signin-dialog";

export function Navbar({ locale }: { locale: AppLocale }) {
  const t = homeMessages[locale];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-ink-700/5 bg-sand-50/80 backdrop-blur-xl">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <Logo />
        <nav className="hidden items-center gap-8 md:flex">
          <a href="#how-it-works" className="text-sm font-medium hover:text-river-500 transition-colors">
            {t.nav.howItWorks}
          </a>
          <a href="#pricing" className="text-sm font-medium hover:text-river-500 transition-colors">
            {t.nav.pricing}
          </a>
          <a href="#stories" className="text-sm font-medium hover:text-river-500 transition-colors">
            {t.nav.stories}
          </a>
        </nav>
        <div className="flex items-center gap-4">
          <LanguageSwitcher />
          <SignInDialog>
            <button className="hidden text-sm font-bold md:block hover:text-river-500 transition-colors text-ink-700">
              {t.nav.signIn}
            </button>
          </SignInDialog>
        </div>
      </div>
    </header>
  );
}
