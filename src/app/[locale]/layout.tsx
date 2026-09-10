import { Fraunces, Manrope, Tiro_Bangla, Hind_Siliguri } from "next/font/google";
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';
import { CustomToaster } from "@/components/shared/client/custom-toaster";
import "../globals.css";

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
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html
      lang={locale}
      className={`${fraunces.variable} ${manrope.variable} ${tiroBangla.variable} ${hindSiliguri.variable}`}
      data-locale={locale}
    >
      <body className="font-sans antialiased">
        <NextIntlClientProvider messages={messages} locale={locale}>
          {children}
          <CustomToaster />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
