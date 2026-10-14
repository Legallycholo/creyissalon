export type Locale = "es" | "en";
export type PageKey =
  | "home"
  | "services"
  | "work"
  | "reviews"
  | "about"
  | "contact"
  | "privacy";
export type Localized = Record<Locale, string>;
export type BusinessHour = {
  day: Localized;
  schemaDay: string;
  status: "open" | "closed";
  opens: string;
  closes: string;
  display: Localized;
};
export const locales: Locale[] = ["es", "en"];
export const routes: Record<Locale, Record<PageKey, string>> = {
  es: {
    home: "",
    services: "servicios",
    work: "trabajos",
    reviews: "resenas",
    about: "sobre-creyis",
    contact: "contacto",
    privacy: "privacidad",
  },
  en: {
    home: "",
    services: "services",
    work: "work",
    reviews: "reviews",
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
export const GOOGLE_BUSINESS_PROFILE_URL =
  "https://www.google.com/maps/place/Creiyi%E2%80%99s+Salon/@18.3894987,-66.1140613,13z/data=!4m10!1m2!2m1!1sCreiyis+salon!3m6!1s0x8c03699ad7b4df63:0x69b64d5fa802c7aa!8m2!3d18.4146874!4d-66.0797551!15sCg1DcmVpeWlzIHNhbG9uWg8iDWNyZWl5aXMgc2Fsb26SAQxiZWF1dHlfc2Fsb26aAURDaTlEUVVsUlFVTnZaRU5vZEhsalJqbHZUMnBDY1ZwdFdrSmhhM1IwV1cxNFlXUXhRbkZTYTFKNllqQnNVbFJ0WXhBQuABAPoBBAgTEDI!16s%2Fg%2F11nvmcrd02?entry=ttu&g_ep=EgoyMDI2MTAxMS4wIKXMDSoASAFQAw%3D%3D";
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
  hours: [
    {
      day: { es: "Lunes", en: "Monday" },
      schemaDay: "Monday",
      status: "closed",
      opens: "00:00",
      closes: "00:00",
      display: { es: "Cerrado", en: "Closed" },
    },
    {
      day: { es: "Martes", en: "Tuesday" },
      schemaDay: "Tuesday",
      status: "open",
      opens: "09:00",
      closes: "18:00",
      display: { es: "9:00 a. m.–6:00 p. m.", en: "9:00 AM–6:00 PM" },
    },
    {
      day: { es: "Miércoles", en: "Wednesday" },
      schemaDay: "Wednesday",
      status: "open",
      opens: "09:00",
      closes: "18:00",
      display: { es: "9:00 a. m.–6:00 p. m.", en: "9:00 AM–6:00 PM" },
    },
    {
      day: { es: "Jueves", en: "Thursday" },
      schemaDay: "Thursday",
      status: "open",
      opens: "09:00",
      closes: "18:00",
      display: { es: "9:00 a. m.–6:00 p. m.", en: "9:00 AM–6:00 PM" },
    },
    {
      day: { es: "Viernes", en: "Friday" },
      schemaDay: "Friday",
      status: "open",
      opens: "09:00",
      closes: "18:00",
      display: { es: "9:00 a. m.–6:00 p. m.", en: "9:00 AM–6:00 PM" },
    },
    {
      day: { es: "Sábado", en: "Saturday" },
      schemaDay: "Saturday",
      status: "open",
      opens: "09:00",
      closes: "18:00",
      display: { es: "9:00 a. m.–6:00 p. m.", en: "9:00 AM–6:00 PM" },
    },
    {
      day: { es: "Domingo", en: "Sunday" },
      schemaDay: "Sunday",
      status: "closed",
      opens: "00:00",
      closes: "00:00",
      display: { es: "Cerrado", en: "Closed" },
    },
  ] satisfies BusinessHour[],
  instagram: "",
  googleMaps: GOOGLE_BUSINESS_PROFILE_URL,
  googleReviews:
    "https://www.google.com/search?sca_esv=d0fa25ced5188e1a&sxsrf=APpeQnuJkQwbQX2L9sZHsZ7ga3RhWoYX_Q%3A1791648812778&q=Creiyi%E2%80%99s%20Salon&stick=H4sIAAAAAAAAAONgU1I1qLBINjA2s7RMTDFPMklJMzO2Mqgws0wyM0kxTUu0MDBKNk9MXMQq4FyUmlmZ-ahhZrFCcGJOfh4AaPb_rTwAAAA&mat=CUa-0Oee9oz7&ved=2ahUKEwiYwbD466-XAxUmFzQIHSxxDfkQrMcEegQIIRAC#mpd=~18126133762613886534/customers/reviews",
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
export function businessHoursSummary(locale: Locale) {
  const open = business.hours.filter((hour) => hour.status === "open");
  const closed = business.hours.filter((hour) => hour.status === "closed");
  const language = locale === "es" ? "es-PR" : "en-US";
  const list = new Intl.ListFormat(language, { style: "long", type: "conjunction" });
  const dayName = (hour: BusinessHour) =>
    locale === "es" ? hour.day.es.toLowerCase() : hour.day.en;
  const openDays = list.format(open.map(dayName));
  const closedDays = list.format(closed.map(dayName));
  const hours = open[0]?.display[locale];
  return locale === "es"
    ? `Abrimos ${openDays} de ${hours}. Cerramos ${closedDays}.`
    : `We are open ${openDays} from ${hours}. We are closed ${closedDays}.`;
}
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
export const hairstyles: PortfolioItem[] = [
  [
    "caramel-pixie",
    "Pixie caramelo",
    "Caramel pixie",
    "01-caramel-pixie.jpg",
  ],
  [
    "dark-layered-curls",
    "Capas con movimiento",
    "Layered movement",
    "02-dark-layered-curls.jpg",
  ],
  [
    "long-sleek-black",
    "Largo pulido",
    "Long and sleek",
    "03-long-sleek-black.jpg",
  ],
  [
    "soft-brunette-curls",
    "Rizos suaves",
    "Soft brunette curls",
    "04-soft-brunette-curls.jpg",
  ],
  ["silver-bob", "Bob plateado", "Silver bob", "05-silver-bob.jpg"],
  [
    "honey-blonde-sleek",
    "Rubio miel pulido",
    "Sleek honey blonde",
    "06-honey-blonde-sleek.jpg",
  ],
  [
    "burgundy-layers",
    "Capas borgoña",
    "Burgundy layers",
    "07-burgundy-layers.jpg",
  ],
  [
    "warm-brunette-waves",
    "Ondas cálidas",
    "Warm brunette waves",
    "08-warm-brunette-waves.jpg",
  ],
  [
    "precision-dark-bob",
    "Bob de precisión",
    "Precision dark bob",
    "09-precision-dark-bob.jpg",
  ],
  [
    "honey-blonde-waves",
    "Ondas rubio miel",
    "Honey blonde waves",
    "10-honey-blonde-waves.jpg",
  ],
].map(([id, es, en, file]) => ({
  id,
  category: "hair" as const,
  title: { es, en },
  image: `/images/work/hairstyles/${file}`,
  alt: {
    es: `Trabajo de cabello de Creiyi's Salon: ${es.toLowerCase()}`,
    en: `Hairstyle work by Creiyi's Salon: ${en.toLowerCase()}`,
  },
}));

export const portfolio: PortfolioItem[] = [
  ...hairstyles,
  {
    id: services[1].id,
    category: services[1].id,
    title: services[1].title,
    image: services[1].image,
    alt: services[1].alt,
    reference: true,
  },
];
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
            dayOfWeek: h.schemaDay,
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
