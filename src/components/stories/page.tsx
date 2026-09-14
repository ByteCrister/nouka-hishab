import { WaveDivider } from "../marketing/wave-divider";
import { MarketingCTA } from "../marketing/client/marketing-cta";
import { storiesMessages } from "@/messages/stories/index";
import { homeMessages } from "@/messages/home";
import { type AppLocale } from "@/constants/common.const";
import { FadeInUp, StaggerContainer, StaggerItem, ScaleIn } from "../wrappers/motion-wrappers";
import { Quote } from "lucide-react";

export function StoriesPage({ locale }: { locale: AppLocale }) {
  const t = storiesMessages[locale];

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-24 pb-32 bg-river-900">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <FadeInUp className="max-w-3xl mx-auto">
            <h1 className="font-display text-display-md sm:text-display-lg font-bold leading-tight mb-6 text-white">
              {t.hero.title}
            </h1>
            <p className="text-xl text-river-100 mb-10 text-balance">
              {t.hero.subtitle}
            </p>
          </FadeInUp>
        </div>

        <div className="absolute bottom-0 left-0 right-0 z-0">
          <WaveDivider fill="white" className="opacity-100" />
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-white relative -mt-16 z-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <ScaleIn className="bg-white rounded-3xl shadow-xl shadow-river-900/5 border border-river-100 p-8 max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-river-100">
            <div className="pt-4 md:pt-0">
              <div className="text-4xl font-bold font-display text-river-600 mb-2">{t.stats.trips}</div>
              <div className="text-ink-500 font-medium">{t.stats.tripsLabel}</div>
            </div>
            <div className="pt-4 md:pt-0">
              <div className="text-4xl font-bold font-display text-sindoor-600 mb-2">{t.stats.sand}</div>
              <div className="text-ink-500 font-medium">{t.stats.sandLabel}</div>
            </div>
            <div className="pt-4 md:pt-0">
              <div className="text-4xl font-bold font-display text-river-600 mb-2">{t.stats.users}</div>
              <div className="text-ink-500 font-medium">{t.stats.usersLabel}</div>
            </div>
          </ScaleIn>
        </div>
      </section>

      {/* Testimonials Grid */}
      <section className="py-24 bg-white relative">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          <StaggerContainer className="grid md:grid-cols-3 gap-8">
            {t.testimonials.map((testimonial: { name: string; role: string; quote: string }, idx: number) => (
              <StaggerItem key={idx} className="bg-river-50/50 border border-river-100 rounded-3xl p-8 relative flex flex-col h-full">
                <Quote className="w-10 h-10 text-river-200 absolute top-6 right-6 rotate-180" />
                <p className="text-lg text-ink-700 leading-relaxed mb-8 relative z-10 flex-1 italic">
                  &quot;{testimonial.quote}&quot;
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-river-200 to-river-300 flex items-center justify-center text-river-700 font-bold text-lg shrink-0">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-ink-900">{testimonial.name}</h4>
                    <p className="text-sm text-ink-500">{testimonial.role}</p>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-24 bg-river-50 relative overflow-hidden mt-auto">
        <div className="absolute inset-0 bg-gradient-to-t from-river-100/50 to-transparent" />
        <FadeInUp className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <h2 className="text-3xl sm:text-5xl font-bold font-display text-ink-900 mb-6">
            {t.cta.title}
          </h2>
          <p className="text-xl text-ink-500 mb-10 max-w-2xl mx-auto">
            {t.cta.subtitle}
          </p>
          <MarketingCTA
            signInText={t.cta.button}
            dashboardText={homeMessages[locale].nav.dashboard}
            className="h-14 px-10 text-lg font-bold rounded-2xl shadow-xl shadow-river-500/20"
            tone="river"
          />
        </FadeInUp>
      </section>
    </div>
  );
}
