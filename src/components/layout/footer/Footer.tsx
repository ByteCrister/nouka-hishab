import { Logo } from "@/components/marketing/logo";
import { WaveDivider } from "@/components/marketing/wave-divider";
import { homeMessages } from "@/messages/home";
import { APP_LOCALES, type AppLocale } from "@/constants/common";

export function Footer({ locale }: { locale: AppLocale }) {
  const t = homeMessages[locale];

  return (
    <footer className="relative w-full overflow-hidden bg-gradient-to-b from-sand-50 via-sand-100 to-sand-200 pt-32 pb-12 shadow-[0_-20px_40px_-20px_rgba(16,32,27,0.1)]">
      {/* Wavy top transition */}
      <div className="absolute top-0 left-0 right-0 w-full text-background rotate-180 transform -mt-[1px]">
        <WaveDivider fill="currentColor" />
      </div>

      {/* Gloss sheen overlay */}
      <div className="pointer-events-none absolute inset-0 bg-[image:var(--background-image-sheen)] opacity-60" />

      {/* Decorative glowing orbs */}
      <div className="absolute top-0 -right-40 h-[500px] w-[500px] rounded-full bg-gold-300/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 -left-40 h-[500px] w-[500px] rounded-full bg-river-300/15 blur-[120px] pointer-events-none" />

      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-4 lg:gap-8">
          <div className="col-span-1 md:col-span-2">
            <Logo />
            <p className="mt-6 text-base text-ink-500/70 max-w-sm leading-relaxed">
              {t.hero.eyebrow}. {locale === APP_LOCALES.EN ? "Bringing digital ledgers to Bangladesh's riverways." : "বাংলাদেশের নদীপথে ডিজিটাল হিসাবের সুবিধা।"}
            </p>
          </div>
          <div>
            <h3 className="font-display text-lg font-bold text-ink-700 mb-6">{t.nav.product}</h3>
            <ul className="space-y-4 text-sm font-medium text-ink-500/70">
              <li><a href="#how-it-works" className="inline-block transition-all hover:translate-x-1 hover:text-river-500">{t.nav.howItWorks}</a></li>
              <li><a href="#pricing" className="inline-block transition-all hover:translate-x-1 hover:text-river-500">{t.nav.pricing}</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-display text-lg font-bold text-ink-700 mb-6">Legal</h3>
            <ul className="space-y-4 text-sm font-medium text-ink-500/70">
              <li><a href="#" className="inline-block transition-all hover:translate-x-1 hover:text-river-500">Privacy Policy</a></li>
              <li><a href="#" className="inline-block transition-all hover:translate-x-1 hover:text-river-500">Terms of Service</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-20 flex flex-col items-center justify-between gap-6 border-t border-ink-500/10 pt-8 text-sm text-ink-500/60 md:flex-row">
          <p>&copy; {new Date().getFullYear()} NoukaHishab. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}