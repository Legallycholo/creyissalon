import type { MetadataRoute } from "next";
import {
  business,
  href,
  launchReady,
  locales,
  routes,
  type PageKey,
} from "@/lib/site";
export default function sitemap(): MetadataRoute.Sitemap {
  if (!launchReady) return [];
  return locales.flatMap((locale) =>
    (Object.keys(routes[locale]) as PageKey[]).map((page) => ({
      url: `${business.siteUrl}${href(locale, page)}`,
      alternates: {
        languages: {
          es: `${business.siteUrl}${href("es", page)}`,
          en: `${business.siteUrl}${href("en", page)}`,
        },
      },
    })),
  );
}
