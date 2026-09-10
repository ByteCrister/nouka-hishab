import { WaveDivider } from "../marketing/wave-divider";
import { GlossButton } from "../shared/gloss-button";
import { LedgerCard } from "../shared/ledger-card";
import { homeMessages } from "@/messages/home";
import { APP_LOCALES, type AppLocale } from "@/constants/common";

export function LandingPage({ locale }: { locale: AppLocale }) {
  const t = homeMessages[locale];

  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-8 items-center">
            <div className="max-w-2xl">
              <span className="inline-flex items-center rounded-full border border-river-500/20 bg-river-500/10 px-3 py-1 text-sm font-semibold text-river-700 mb-6">
                {t.hero.eyebrow}
              </span>
              <h1 className="font-display text-display-lg sm:text-display-xl font-bold leading-tight mb-6 text-balance">
                {t.hero.headline}
              </h1>
              <p className="text-body-lg text-[var(--color-ink-500)] mb-10 max-w-xl text-balance">
                {t.hero.lead}
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <GlossButton tone="red" className="h-12 px-8 text-base font-bold rounded-xl">
                  {t.hero.ctaPrimary}
                </GlossButton>
                <button className="inline-flex h-12 items-center justify-center rounded-xl border-2 border-river-500/20 bg-white/50 px-8 text-base font-bold text-river-700 transition-colors hover:bg-white hover:border-river-500/40">
                  {t.hero.ctaSecondary}
                </button>
              </div>
            </div>
            
            <div className="relative mx-auto w-full max-w-md lg:max-w-none">
              <div className="absolute -inset-4 bg-gradient-to-tr from-[var(--color-river-100)] to-[var(--color-sand-100)] opacity-50 blur-3xl rounded-full" />
              <LedgerCard
                title={locale === APP_LOCALES.EN ? "Trip: MV Shahjalal" : "ট্রিপ: এমভি শাহজালাল"}
                tag={locale === APP_LOCALES.EN ? "Settled" : "হিসাব ক্লিয়ার"}
                lines={[
                  { label: locale === APP_LOCALES.EN ? "Total Sand (CFT)" : "মোট বালু (সিএফটি)", value: "5,200" },
                  { label: locale === APP_LOCALES.EN ? "Rate per CFT" : "দর (প্রতি সিএফটি)", value: "৳ 12.50" },
                  { label: locale === APP_LOCALES.EN ? "Mahajan Commission (5%)" : "মহাজন কমিশন (৫%)", value: "- ৳ 3,250", positive: false },
                  { label: locale === APP_LOCALES.EN ? "Boat Owner Dues" : "মাঝির পাওনা", value: "- ৳ 45,000", positive: false },
                ]}
                totalLabel={locale === APP_LOCALES.EN ? "Net Profit" : "নিট লাভ"}
                totalValue="৳ 16,750"
                className="relative z-10 rotate-1 transform transition-transform hover:rotate-0"
              />
              <div className="absolute -bottom-6 -right-6 z-0 h-48 w-48 rounded-full bg-[var(--color-sindoor-500)]/10 blur-2xl" />
            </div>
          </div>
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 z-0">
          <WaveDivider fill="var(--color-river-900)" className="opacity-5" />
        </div>
      </section>
    </>
  );
}
