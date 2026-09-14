import { Fraunces, Manrope, Tiro_Bangla, Hind_Siliguri } from "next/font/google";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { CustomToaster } from "@/components/shared/client/custom-toaster";
import { AuthWrapper } from "@/components/wrappers/AuthWrapper";
import { PublicLayoutWrapper } from "@/components/wrappers/PublicLayoutWrapper";
import { APP_LOCALES, type AppLocale } from "@/constants/common.const";
import "../globals.css";

export function generateStaticParams() {
  return Object.values(APP_LOCALES).map((locale) => ({ locale }));
}

const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-fraunces", weight: ["500", "600", "700"], display: "swap" });
const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope", weight: ["400", "500", "600", "700", "800"], display: "swap" });
const tiroBangla = Tiro_Bangla({ subsets: ["bengali"], variable: "--font-tiro-bangla", weight: ["400"], display: "swap" });
const hindSiliguri = Hind_Siliguri({ subsets: ["bengali"], variable: "--font-hind-siliguri", weight: ["400", "500", "600", "700"], display: "swap" });

export const metadata = {
  title: "NoukaHishab",
  description: "River sand-trade business management.",
};

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params as { locale: AppLocale };
  // MUST be called before any next-intl server function to enable static rendering
  setRequestLocale(locale);
  const messages = await getMessages({ locale });

  return (
    <html
      lang={locale}
      className={`${fraunces.variable} ${manrope.variable} ${tiroBangla.variable} ${hindSiliguri.variable}`}
      data-locale={locale}
    >
      <body className="font-sans antialiased">
        <NextIntlClientProvider messages={messages} locale={locale}>
          <AuthWrapper>
            <PublicLayoutWrapper locale={locale}>
              {children}
            </PublicLayoutWrapper>
            <CustomToaster />
          </AuthWrapper>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
