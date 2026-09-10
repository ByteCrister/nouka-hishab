import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';
import { APP_LOCALES } from '@/constants/common';

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;
  
  if (!locale || !routing.locales.includes(locale as any)) {
    locale = routing.defaultLocale;
  }
 
  const { homeMessages } = await import('@/messages/home');
 
  return {
    locale,
    messages: homeMessages[locale as typeof APP_LOCALES.EN | typeof APP_LOCALES.BN]
  };
});
