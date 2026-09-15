import { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { NewBoatForm } from "@/components/boats/new/NewBoatForm";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "boatsPage" });

  return {
    title: t("new.title"),
    description: t("new.subtitle"),
  };
}

export default async function NewBoatPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="container py-8 max-w-5xl mx-auto space-y-8">
      <NewBoatForm />
    </div>
  );
}
