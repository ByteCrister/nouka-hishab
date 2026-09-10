import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';
import { homeMessages } from '@/messages/home';

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  if (!locale || !routing.locales.includes(locale as any)) {
    locale = routing.defaultLocale;
  }

  // Aggregate messages across the app
  const messages = {
    nav: homeMessages[locale as "en" | "bn"].nav,
    hero: homeMessages[locale as "en" | "bn"].hero,
  };

  return {
    locale,
    messages
  };
});
