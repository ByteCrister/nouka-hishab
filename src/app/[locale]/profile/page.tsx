import { ProfileView } from "@/components/profile/ProfileView";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { type AppLocale } from "@/constants/common.const";

interface Props {
  params: Promise<{ locale: AppLocale }>;
}

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "profile" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription")
  };
}

export default async function ProfilePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "profile" });

  return (
    <div className="w-full relative">
      <div className="container mx-auto py-10 px-4 sm:px-6 lg:px-8 max-w-6xl relative z-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-[var(--color-ink-900)]">{t("pageTitle")}</h1>
          <p className="text-[var(--color-ink-500)] mt-2">{t("pageDescription")}</p>
        </div>

        <ProfileView />
      </div>

      {/* Background ambient light effects */}
      <div className="absolute top-0 inset-x-0 h-64 bg-gradient-to-b from-[var(--color-river-50)] to-transparent pointer-events-none -z-10" />
    </div>
  );
}
