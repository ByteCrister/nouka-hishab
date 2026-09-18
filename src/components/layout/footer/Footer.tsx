import { Logo } from "@/components/marketing/logo";
import { homeMessages } from "@/messages/home";
import { APP_LOCALES, type AppLocale } from "@/constants/common.const";

export function Footer({ locale }: { locale: AppLocale }) {
  const t = homeMessages[locale];

  return (
    <footer className="relative w-full overflow-hidden bg-gradient-to-b from-[#FDFBF7] via-[#F8F5EE] to-[#EBE5D9] pt-40 pb-12 shadow-[0_-20px_40px_-20px_rgba(20,50,40,0.05)] text-stone-700">
      
      {/* Premium Multi-layered Wave Top Transition */}
      <div className="absolute top-0 left-0 right-0 w-full text-background rotate-180 transform -mt-[1px]">
        <svg viewBox="0 0 1440 120" className="w-full h-[60px] md:h-[120px] block drop-shadow-sm" preserveAspectRatio="none">
          <path d="M0,40 C240,100 480,0 720,40 C960,80 1200,20 1440,60 L1440,120 L0,120 Z" fill="currentColor" opacity="0.4" />
          <path d="M0,60 C320,0 500,80 720,40 C940,0 1120,60 1440,20 L1440,120 L0,120 Z" fill="currentColor" opacity="0.7" />
          <path d="M0,80 C200,120 400,60 720,80 C1040,100 1200,40 1440,80 L1440,120 L0,120 Z" fill="currentColor" />
        </svg>
      </div>

      {/* Gloss sheen overlay & Glowing orbs (Green and Red theme) */}
      <div className="pointer-events-none absolute inset-0 bg-[image:var(--background-image-sheen)] opacity-[0.03]" />
      <div className="absolute top-0 -right-40 h-[600px] w-[600px] rounded-full bg-emerald-600/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 -left-40 h-[600px] w-[600px] rounded-full bg-rose-600/10 blur-[120px] pointer-events-none" />

      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-4 lg:gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="inline-block">
              <Logo />
            </div>
            <p className="mt-8 text-base text-stone-600 max-w-sm leading-relaxed">
              {t.hero.eyebrow}. {locale === APP_LOCALES.EN ? "Bringing digital ledgers to Bangladesh's riverways." : "বাংলাদেশের নদীপথে ডিজিটাল হিসাবের সুবিধা।"}
            </p>
          </div>
          <div>
            <h3 className="font-display text-lg font-bold text-stone-900 mb-6">{t.nav.product}</h3>
            <ul className="space-y-4 text-sm font-medium text-stone-600">
              <li><a href="#how-it-works" className="inline-block transition-all hover:translate-x-1 hover:text-rose-600">{t.nav.howItWorks}</a></li>
              <li><a href="#pricing" className="inline-block transition-all hover:translate-x-1 hover:text-rose-600">{t.nav.pricing}</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-display text-lg font-bold text-stone-900 mb-6">Legal</h3>
            <ul className="space-y-4 text-sm font-medium text-stone-600">
              <li><a href="#" className="inline-block transition-all hover:translate-x-1 hover:text-rose-600">Privacy Policy</a></li>
              <li><a href="#" className="inline-block transition-all hover:translate-x-1 hover:text-rose-600">Terms of Service</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-20 flex flex-col items-center justify-between gap-6 border-t border-stone-300/50 pt-8 text-sm text-stone-500 md:flex-row">
          <p>&copy; {new Date().getFullYear()} NoukaHishab. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

