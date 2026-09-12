import { WaveDivider } from "../marketing/wave-divider";
import { MarketingCTA } from "../marketing/client/marketing-cta";
import { Link } from "@/i18n/routing";
import { homeMessages } from "@/messages/home";
import { APP_LOCALES, type AppLocale } from "@/constants/common";
import { Anchor, Calculator, FileSpreadsheet, Ship, Wallet, LineChart } from "lucide-react";
import { FadeInUp, FadeInRight, FadeInLeft, StaggerContainer, StaggerItem } from "../wrappers/motion-wrappers";
import { LedgerCard } from "../shared/ledger-card";

export function LandingPage({ locale }: { locale: AppLocale }) {
  const t = homeMessages[locale];

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-8 items-center">
            <FadeInRight className="max-w-2xl" duration={0.6}>
              <span className="inline-flex items-center rounded-full border border-river-500/20 bg-river-500/10 px-3 py-1 text-sm font-semibold text-river-700 mb-6">
                {t.hero.eyebrow}
              </span>
              <h1 className="font-display text-display-lg sm:text-display-xl font-bold leading-tight mb-6 text-balance text-ink-900">
                {t.hero.headline}
              </h1>
              <p className="text-body-lg text-ink-500 mb-10 max-w-xl text-balance">
                {t.hero.lead}
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <MarketingCTA
                  signInText={t.hero.ctaPrimary}
                  dashboardText={t.nav.dashboard}
                  className="h-12 px-8 text-base font-bold rounded-xl w-full sm:w-auto"
                  tone="red"
                />
                <Link href="/how-it-works" className="inline-flex h-12 items-center justify-center rounded-xl border-2 border-river-500/20 bg-white/50 px-8 text-base font-bold text-river-700 transition-colors hover:bg-white hover:border-river-500/40 w-full sm:w-auto">
                  {t.hero.ctaSecondary}
                </Link>
              </div>
            </FadeInRight>

            <FadeInLeft delay={0.2} duration={0.6} className="relative mx-auto w-full max-w-md lg:max-w-none">
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
            </FadeInLeft>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 z-0">
          <WaveDivider fill="var(--color-river-50)" className="opacity-100" />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-river-50 relative">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInUp className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold font-display text-ink-900 mb-4">{t.features.title}</h2>
            <p className="text-lg text-ink-500">{t.features.subtitle}</p>
          </FadeInUp>

          <StaggerContainer className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Feature 1 */}
            <StaggerItem className="bg-white/60 backdrop-blur-sm border border-river-100 p-8 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-river-100 text-river-600 rounded-2xl flex items-center justify-center mb-6">
                <Ship className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-ink-900 mb-3">{t.features.fleetTitle}</h3>
              <p className="text-ink-600 leading-relaxed">{t.features.fleetDesc}</p>
            </StaggerItem>

            {/* Feature 2 */}
            <StaggerItem className="bg-white/60 backdrop-blur-sm border border-river-100 p-8 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-sindoor-100 text-sindoor-600 rounded-2xl flex items-center justify-center mb-6">
                <Calculator className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-ink-900 mb-3">{t.features.accountingTitle}</h3>
              <p className="text-ink-600 leading-relaxed">{t.features.accountingDesc}</p>
            </StaggerItem>

            {/* Feature 3 */}
            <StaggerItem className="bg-white/60 backdrop-blur-sm border border-river-100 p-8 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-sand-100 text-sand-700 rounded-2xl flex items-center justify-center mb-6">
                <Anchor className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-ink-900 mb-3">{t.features.tollsTitle}</h3>
              <p className="text-ink-600 leading-relaxed">{t.features.tollsDesc}</p>
            </StaggerItem>

            {/* Feature 4 */}
            <StaggerItem className="bg-white/60 backdrop-blur-sm border border-river-100 p-8 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-river-100 text-river-600 rounded-2xl flex items-center justify-center mb-6">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-ink-900 mb-3">{t.features.expensesTitle}</h3>
              <p className="text-ink-600 leading-relaxed">{t.features.expensesDesc}</p>
            </StaggerItem>
          </StaggerContainer>
        </div>

        <div className="absolute bottom-0 left-0 right-0 z-0">
          <WaveDivider fill="white" className="opacity-100" />
        </div>
      </section>

      {/* Workflow Section */}
      <section className="py-24 relative overflow-hidden bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInUp className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-3xl sm:text-4xl font-bold font-display text-ink-900 mb-4">{t.workflow.title}</h2>
            <p className="text-lg text-ink-500">{t.workflow.subtitle}</p>
          </FadeInUp>

          <StaggerContainer className="grid md:grid-cols-3 gap-12 max-w-5xl mx-auto relative">
            <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-[2px] bg-river-100 z-0 border-t border-dashed border-river-300"></div>

            <StaggerItem className="relative z-10 text-center">
              <div className="w-24 h-24 mx-auto bg-white border-4 border-river-50 shadow-xl rounded-full flex items-center justify-center mb-6">
                <Ship className="w-10 h-10 text-river-600" />
              </div>
              <h3 className="text-xl font-bold text-ink-900 mb-3">{t.workflow.step1Title}</h3>
              <p className="text-ink-600 leading-relaxed">{t.workflow.step1Desc}</p>
            </StaggerItem>

            <StaggerItem className="relative z-10 text-center">
              <div className="w-24 h-24 mx-auto bg-white border-4 border-river-50 shadow-xl rounded-full flex items-center justify-center mb-6">
                <Wallet className="w-10 h-10 text-river-600" />
              </div>
              <h3 className="text-xl font-bold text-ink-900 mb-3">{t.workflow.step2Title}</h3>
              <p className="text-ink-600 leading-relaxed">{t.workflow.step2Desc}</p>
            </StaggerItem>

            <StaggerItem className="relative z-10 text-center">
              <div className="w-24 h-24 mx-auto bg-white border-4 border-river-50 shadow-xl rounded-full flex items-center justify-center mb-6">
                <LineChart className="w-10 h-10 text-river-600" />
              </div>
              <h3 className="text-xl font-bold text-ink-900 mb-3">{t.workflow.step3Title}</h3>
              <p className="text-ink-600 leading-relaxed">{t.workflow.step3Desc}</p>
            </StaggerItem>
          </StaggerContainer>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-24 bg-ink-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid-pattern" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M0 40L40 0H20L0 20M40 40V20L20 40" stroke="white" strokeWidth="1" fill="none" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid-pattern)" />
          </svg>
        </div>

        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-full bg-gradient-to-b from-river-500/20 to-transparent blur-3xl" />

        <FadeInUp className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <h2 className="text-3xl sm:text-5xl font-bold font-display text-white mb-6">
            {t.cta.title}
          </h2>
          <p className="text-xl text-river-100 mb-10 max-w-2xl mx-auto">
            {t.cta.subtitle}
          </p>
          <MarketingCTA
            signInText={t.cta.button}
            dashboardText={t.nav.dashboard}
            className="h-14 px-10 text-lg font-bold rounded-2xl shadow-2xl shadow-sindoor-500/20"
            tone="red"
          />
        </FadeInUp>
      </section>
    </div>
  );
}
