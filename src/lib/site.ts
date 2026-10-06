export type Locale = "es" | "en";
export type PageKey =
  "home" | "services" | "work" | "about" | "contact" | "privacy";
export type Localized = Record<Locale, string>;
export const locales: Locale[] = ["es", "en"];
export const routes: Record<Locale, Record<PageKey, string>> = {
  es: {
    home: "",
    services: "servicios",
    work: "trabajos",
    about: "sobre-creyis",
    contact: "contacto",
    privacy: "privacidad",
  },
  en: {
    home: "",
    services: "services",
    work: "work",
    about: "about",
    contact: "contact",
    privacy: "privacy",
  },
};
export function href(locale: Locale, page: PageKey = "home") {
  return `/${locale}${routes[locale][page] ? `/${routes[locale][page]}` : ""}`;
}
export function resolvePage(
  locale: Locale,
  slug: string[] = [],
): PageKey | undefined {
  if (slug.length > 1) return undefined;
  return (Object.keys(routes[locale]) as PageKey[]).find(
    (key) => routes[locale][key] === (slug[0] || ""),
  );
}
export function validPhone(value?: string) {
  const digits = (value || "").replace(/\D/g, "");
  return /^[1-9]\d{9,14}$/.test(digits) ? digits : undefined;
}
export function siteOrigin(value?: string) {
  if (!value) return "";
  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol) ? url.origin : "";
  } catch {
    return "";
  }
}
export const business = {
  name: "Creiyi's Salon",
  siteUrl: siteOrigin(process.env.NEXT_PUBLIC_SITE_URL),
  whatsapp: validPhone(process.env.NEXT_PUBLIC_WHATSAPP_NUMBER),
  phone: "19396405333",
  displayPhone: "+1 939-640-5333",
  address: "1003 Cll Alejandria",
  city: "San Juan",
  postalCode: "00920",
  displayAddress:
    "1003 Cll Alejandria, San Juan, 00920, Puerto Rico",
  latitude: null as number | null,
  longitude: null as number | null,
  hours: [] as {
    days: Localized;
    opens: string;
    closes: string;
    schemaDays: string[];
  }[],
  instagram: "",
  googleMaps:
    "https://www.google.com/maps/search/?api=1&query=1003%20Cll%20Alejandria%2C%20San%20Juan%2C%2000920%2C%20Puerto%20Rico",
  googleReviews: "",
  priceRange: "",
  images: [] as string[],
};
export function isLaunchReady(details = business) {
  return Boolean(
    details.siteUrl &&
    details.address &&
    details.city &&
    details.phone &&
    details.whatsapp,
  );
}
export const launchReady = isLaunchReady();
export function bookingUrl(locale: Locale, service?: string) {
  if (!business.whatsapp) return `${href(locale, "contact")}#reservar`;
  const message =
    locale === "es"
      ? `¡Hola, Creiyi's Salon! Me gustaría coordinar una cita${service ? ` para ${service}` : ""}.`
      : `Hi Creiyi's Salon! I’d like to arrange an appointment${service ? ` for ${service}` : ""}.`;
  return `https://wa.me/${business.whatsapp}?text=${encodeURIComponent(message)}`;
}
export const services: {
  id: "hair" | "nails";
  title: Localized;
  subtitle: Localized;
  description: Localized;
  image: string;
  alt: Localized;
}[] = [
  {
    id: "hair",
    title: { es: "Cabello con personalidad.", en: "Hair with personality." },
    subtitle: { es: "ESTILISMO PROFESIONAL", en: "PROFESSIONAL HAIRSTYLING" },
    description: {
      es: "Tu estilo empieza por escucharte. Hablemos de tu cabello, de lo que te gusta y de ese cambio que tienes en mente.",
      en: "Your style begins with being heard. Let’s talk about your hair, what you love, and the change you have in mind.",
    },
    image: "/images/hair.jpg",
    alt: {
      es: "Fotografía de referencia de un corte largo en capas",
      en: "Reference photograph of a long layered haircut",
    },
  },
  {
    id: "nails",
    title: {
      es: "Detalles que hablan de ti.",
      en: "Details that feel like you.",
    },
    subtitle: { es: "UÑAS & BELLEZA", en: "NAILS & BEAUTY" },
    description: {
      es: "Un momento para tus manos. Inspírate, comparte tus ideas y consulta las opciones disponibles para tu próxima cita.",
      en: "A moment for your hands. Find inspiration, share your ideas, and ask about the options for your next appointment.",
    },
    image: "/images/nails.jpg",
    alt: {
      es: "Fotografía de referencia de una manicura",
      en: "Reference photograph of a manicure",
    },
  },
];
export type PortfolioItem = {
  id: string;
  category: "hair" | "nails";
  title: Localized;
  image: string;
  alt: Localized;
  before?: string;
  reference?: boolean;
};
export const portfolio: PortfolioItem[] = services.map((service) => ({
  id: service.id,
  category: service.id,
  title: service.title,
  image: service.image,
  alt: service.alt,
  reference: true,
}));
export type Review = { name: string; text: Localized; sourceUrl: string };
export const reviews: Review[] = [];
export function businessSchema(details = business) {
  if (!isLaunchReady(details)) return null;
  const business = details;
  return {
    "@context": "https://schema.org",
    "@type": "BeautySalon",
    "@id": `${business.siteUrl}/#salon`,
    name: business.name,
    url: business.siteUrl,
    telephone: `+${business.phone}`,
    ...(business.images.length
      ? {
          image: business.images.map(
            (image) => new URL(image, business.siteUrl).href,
          ),
        }
      : {}),
    address: {
      "@type": "PostalAddress",
      streetAddress: business.address,
      addressLocality: business.city,
      addressRegion: "PR",
      postalCode: business.postalCode,
      addressCountry: "US",
    },
    ...(business.latitude !== null && business.longitude !== null
      ? {
          geo: {
            "@type": "GeoCoordinates",
            latitude: business.latitude,
            longitude: business.longitude,
          },
        }
      : {}),
    ...(business.instagram ? { sameAs: [business.instagram] } : {}),
    ...(business.priceRange ? { priceRange: business.priceRange } : {}),
    ...(business.googleMaps ? { hasMap: business.googleMaps } : {}),
    ...(business.hours.length
      ? {
          openingHoursSpecification: business.hours.map((h) => ({
            "@type": "OpeningHoursSpecification",
            dayOfWeek: h.schemaDays,
            opens: h.opens,
            closes: h.closes,
          })),
        }
      : {}),
  };
}
export function serializeSchema(value: unknown) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}
