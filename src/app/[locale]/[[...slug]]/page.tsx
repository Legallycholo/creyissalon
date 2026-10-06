import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ContentPage, Shell } from "@/components/pages";
import {
  business,
  businessSchema,
  href,
  launchReady,
  locales,
  resolvePage,
  routes,
  serializeSchema,
  type Locale,
  type PageKey,
} from "@/lib/site";
import { copy } from "@/lib/copy";
type Props = { params: Promise<{ locale: string; slug?: string[] }> };
export const dynamicParams = false;
export function generateStaticParams() {
  return locales.flatMap((locale) =>
    (Object.keys(routes[locale]) as PageKey[]).map((page) => ({
      locale,
      slug: routes[locale][page] ? [routes[locale][page]] : [],
    })),
  );
}
async function route(props: Props) {
  const { locale: raw, slug } = await props.params;
  if (!locales.includes(raw as Locale)) notFound();
  const locale = raw as Locale;
  const page = resolvePage(locale, slug);
  if (!page) notFound();
  return { locale, page };
}
export async function generateMetadata(props: Props): Promise<Metadata> {
  const { locale, page } = await route(props);
  const t = copy(locale);
  const title =
    page === "home"
      ? locale === "es"
        ? "Creiyi's Salon | Tu belleza. Tu momento. · Puerto Rico"
        : "Creiyi's Salon | Your beauty. Your moment. · Puerto Rico"
      : `${t.nav[page]} | Creiyi's Salon · Puerto Rico`;
  const description =
    page === "home"
      ? t.heroBody
      : page === "services"
        ? t.servicesBody
        : page === "work"
          ? t.galleryBody
          : page === "about"
            ? t.aboutBody
            : page === "privacy"
              ? t.privacyBody
              : t.contactBody;
  return {
    title,
    description,
    icons: { icon: "/favicon.svg" },
    robots: { index: launchReady, follow: launchReady },
    ...(business.siteUrl
      ? {
          metadataBase: new URL(business.siteUrl),
          alternates: {
            canonical: href(locale, page),
            languages: {
              es: href("es", page),
              en: href("en", page),
              "x-default": href("es", page),
            },
          },
        }
      : {}),
    openGraph: {
      title,
      description,
      type: "website",
      siteName: business.name,
      locale: locale === "es" ? "es_PR" : "en_US",
      ...(business.siteUrl
        ? { url: `${business.siteUrl}${href(locale, page)}` }
        : {}),
    },
    twitter: { card: "summary", title, description },
  };
}
export default async function Page(props: Props) {
  const { locale, page } = await route(props);
  const schema = businessSchema();
  const breadcrumb =
    business.siteUrl && page !== "home"
      ? {
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            {
              "@type": "ListItem",
              position: 1,
              name: copy(locale).nav.home,
              item: `${business.siteUrl}${href(locale)}`,
            },
            {
              "@type": "ListItem",
              position: 2,
              name: copy(locale).nav[page],
              item: `${business.siteUrl}${href(locale, page)}`,
            },
          ],
        }
      : null;
  return (
    <Shell locale={locale} page={page}>
      {schema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeSchema(schema) }}
        />
      )}
      {breadcrumb && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeSchema(breadcrumb) }}
        />
      )}
      <ContentPage locale={locale} page={page} />
    </Shell>
  );
}
