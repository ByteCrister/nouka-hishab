import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  if (!locale || !routing.locales.includes(locale as never)) {
    locale = routing.defaultLocale;
  }

  // Dynamically import only the locale file for this request.
  // Each page folder has its own en.json / bn.json.
  // We merge all page messages into one flat messages object so
  // useTranslations() works across layouts and pages in the same tree.
  const [home, howItWorks, stories, profile, sand, boats, boatsDetails, boatsNew, shared, trips, tripsSandNew, tripsSandDetail, maintenance, reportsList, reportsNew, reportsDetail] = await Promise.all([
    import(`@/messages/home/${locale}.json`),
    import(`@/messages/how-it-works/${locale}.json`),
    import(`@/messages/stories/${locale}.json`),
    import(`@/messages/profile/${locale}.json`),
    import(`@/messages/sand/${locale}.json`),
    import(`@/messages/boats/${locale}.json`),
    import(`@/messages/boats/details/${locale}.json`),
    import(`@/messages/boats/new/${locale}.json`),
    import(`@/messages/shared/${locale}.json`),
    import(`@/messages/trips/${locale}.json`),
    import(`@/messages/trips/sand/new/${locale}.json`),
    import(`@/messages/trips/sand/detail/${locale}.json`),
    import(`@/messages/maintenance/${locale}.json`),
    import(`@/messages/reports/list/${locale}.json`),
    import(`@/messages/reports/new/${locale}.json`),
    import(`@/messages/reports/detail/${locale}.json`),
  ]);

  return {
    locale,
    messages: {
      ...home.default,
      howItWorks: howItWorks.default,
      stories: stories.default,
      profile: profile.default,
      sand: sand.default,
      boatsPage: {
        ...boats.default,
        detail: boatsDetails.default,
        ...boatsNew.default
      },
      shared: shared.default,
      trips: trips.default,
      sandTripsNew: tripsSandNew.default,
      sandTripsDetail: tripsSandDetail.default,
      maintenance: maintenance.default,
      reportsPage: {
        list: reportsList.default,
        new: reportsNew.default,
        detail: reportsDetail.default,
      },
    },
  };
});


