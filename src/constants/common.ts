export const APP_LOCALES = {
  EN: "en",
  BN: "bn",
} as const;

export type AppLocale = typeof APP_LOCALES[keyof typeof APP_LOCALES];
