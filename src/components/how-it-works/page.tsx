import { WaveDivider } from "../marketing/wave-divider";
import { MarketingCTA } from "../marketing/client/marketing-cta";
import { howItWorksMessages } from "@/messages/how-it-works/index";
import { homeMessages } from "@/messages/home";
import { type AppLocale } from "@/constants/common.const";
import { FadeIn, FadeInUp, FadeInRight } from "../wrappers/motion-wrappers";
import { Anchor, HandCoins, Ship, Navigation } from "lucide-react";

export function HowItWorksPage({ locale }: { locale: AppLocale }) {
  const t = howItWorksMessages[locale];

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-24 pb-32 bg-river-50">
        <div className="absolute inset-0 bg-gradient-to-b from-white to-river-50/50" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <FadeInUp className="max-w-3xl mx-auto">
            <h1 className="font-display text-display-md sm:text-display-lg font-bold leading-tight mb-6 text-ink-900">
              {t.hero.title}
            </h1>
            <p className="text-xl text-ink-500 mb-10 text-balance">
              {t.hero.subtitle}
            </p>
          </FadeInUp>
        </div>

        <div className="absolute bottom-0 left-0 right-0 z-0">
          <WaveDivider fill="white" className="opacity-100" />
        </div>
      </section>

      {/* Steps Section */}
      <section className="py-24 relative bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">

            {/* Step 1 */}
            <div className="flex flex-col md:flex-row gap-8 items-start mb-24 relative">
              <FadeIn className="hidden md:block absolute left-8 top-20 bottom-[-6rem] w-[2px] bg-river-100 border-l-2 border-dashed border-river-200 z-0" />
              <FadeIn className="relative z-10 shrink-0">
                <div className="w-16 h-16 bg-river-100 text-river-600 rounded-2xl flex items-center justify-center shadow-sm">
                  <Ship className="w-8 h-8" />
                </div>
              </FadeIn>
              <FadeInRight className="flex-1 pt-2">
                <h3 className="text-2xl font-bold text-ink-900 mb-4">{t.steps.step1.title}</h3>
                <p className="text-lg text-ink-600 leading-relaxed bg-river-50/50 p-6 rounded-2xl border border-river-100">
                  {t.steps.step1.desc}
                </p>
              </FadeInRight>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col md:flex-row gap-8 items-start mb-24 relative">
              <FadeIn className="hidden md:block absolute left-8 top-20 bottom-[-6rem] w-[2px] bg-river-100 border-l-2 border-dashed border-river-200 z-0" />
              <FadeIn className="relative z-10 shrink-0">
                <div className="w-16 h-16 bg-sindoor-100 text-sindoor-600 rounded-2xl flex items-center justify-center shadow-sm">
                  <Anchor className="w-8 h-8" />
                </div>
              </FadeIn>
              <FadeInRight className="flex-1 pt-2">
                <h3 className="text-2xl font-bold text-ink-900 mb-4">{t.steps.step2.title}</h3>
                <p className="text-lg text-ink-600 leading-relaxed bg-sindoor-50/50 p-6 rounded-2xl border border-sindoor-100">
                  {t.steps.step2.desc}
                </p>
              </FadeInRight>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col md:flex-row gap-8 items-start mb-24 relative">
              <FadeIn className="hidden md:block absolute left-8 top-20 bottom-[-6rem] w-[2px] bg-river-100 border-l-2 border-dashed border-river-200 z-0" />
              <FadeIn className="relative z-10 shrink-0">
                <div className="w-16 h-16 bg-sand-100 text-sand-700 rounded-2xl flex items-center justify-center shadow-sm">
                  <Navigation className="w-8 h-8" />
                </div>
              </FadeIn>
              <FadeInRight className="flex-1 pt-2">
                <h3 className="text-2xl font-bold text-ink-900 mb-4">{t.steps.step3.title}</h3>
                <p className="text-lg text-ink-600 leading-relaxed bg-sand-50/50 p-6 rounded-2xl border border-sand-200">
                  {t.steps.step3.desc}
                </p>
              </FadeInRight>
            </div>

            {/* Step 4 */}
            <div className="flex flex-col md:flex-row gap-8 items-start relative">
              <FadeIn className="relative z-10 shrink-0">
                <div className="w-16 h-16 bg-river-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-river-500/30">
                  <HandCoins className="w-8 h-8" />
                </div>
              </FadeIn>
              <FadeInRight className="flex-1 pt-2">
                <h3 className="text-2xl font-bold text-ink-900 mb-4">{t.steps.step4.title}</h3>
                <p className="text-lg text-ink-600 leading-relaxed bg-white shadow-sm p-6 rounded-2xl border border-river-100">
                  {t.steps.step4.desc}
                </p>
              </FadeInRight>
            </div>

          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-24 bg-ink-900 relative overflow-hidden mt-auto">
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
            dashboardText={homeMessages[locale].nav.dashboard}
            className="h-14 px-10 text-lg font-bold rounded-2xl shadow-2xl shadow-sindoor-500/20"
            tone="red"
          />
        </FadeInUp>
      </section>
    </div>
  );
}
