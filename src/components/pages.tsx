import Image from "next/image";
import Link from "next/link";
import {
  Flower2,
  Sparkles,
  Heart,
  MapPin,
  Clock3,
  Instagram,
  MessageCircle,
  Phone,
  ArrowDown,
} from "lucide-react";
import { copy } from "@/lib/copy";
import {
  business,
  bookingUrl,
  href,
  launchReady,
  reviews,
  services,
  type Locale,
  type PageKey,
} from "@/lib/site";
import {
  Action,
  Directions,
  FAQ,
  Gallery,
  Header,
  PageTracker,
  PrivacyControls,
  Reveal,
} from "./interactions";
import HeroArt from "./hero-art";
import HairstyleShowcase from "./hairstyle-showcase";

export function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="eyebrow">
      <span />
      {children}
    </p>
  );
}
function Buttons({ locale, placement }: { locale: Locale; placement: string }) {
  return (
    <div className="button-row">
      <Action locale={locale} placement={placement} />
      <Action locale={locale} placement={placement} type="call" />
    </div>
  );
}
export function Shell({
  locale,
  page,
  children,
}: {
  locale: Locale;
  page: PageKey;
  children: React.ReactNode;
}) {
  const t = copy(locale);
  return (
    <>
      <a className="skip-link" href="#main">
        {t.skip}
      </a>
      <Header locale={locale} page={page} />
      <main id="main">{children}</main>
      <footer className="site-footer">
        <div className="container footer-top">
          <div>
            <Link href={href(locale)} className="wordmark footer-brand">
              <span>
                creiyi's<span className="brand-dot">.</span>
              </span>
              <small>BEAUTY SALON</small>
            </Link>
            <p>{t.footerLine}</p>
          </div>
          <div className="footer-nav">
            {(["services", "work", "about", "contact"] as PageKey[]).map(
              (key) => (
                <Link key={key} href={href(locale, key)}>
                  {t.nav[key]}
                </Link>
              ),
            )}
          </div>
          <div className="footer-location">
            <span>{locale === "es" ? "INFORMACIÓN" : "BUSINESS INFO"}</span>
            <address className="footer-business">
              <strong>{business.name}</strong>
              <a
                className="footer-contact-line"
                href={business.googleMaps}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${t.location}: ${business.displayAddress}`}
              >
                <MapPin size={18} strokeWidth={1.35} aria-hidden="true" />
                <span>{business.displayAddress}</span>
              </a>
              <a
                className="footer-contact-line"
                href={`tel:+${business.phone}`}
                aria-label={`${t.call}: ${business.displayPhone}`}
              >
                <Phone size={18} strokeWidth={1.35} aria-hidden="true" />
                <span>{business.displayPhone}</span>
              </a>
            </address>
            {business.instagram && (
              <a
                href={business.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
              >
                <Instagram size={19} />
              </a>
            )}
          </div>
        </div>
        <div className="container footer-bottom">
          <span>
            © {new Date().getFullYear()} {business.name}. {t.rights}
          </span>
          <div>
            <PrivacyControls locale={locale} />
            <Link href={href(locale, "privacy")}>{t.nav.privacy}</Link>
            <Link href={href(locale === "es" ? "en" : "es", page)}>
              {locale === "es" ? "English" : "Español"}
            </Link>
          </div>
        </div>
        {!launchReady && <p className="preview-notice">{t.preview}</p>}
      </footer>
      <div className="mobile-actions">
        <Action locale={locale} placement="mobile-bar" />
        <Action locale={locale} placement="mobile-bar" type="call" />
      </div>
      <PageTracker locale={locale} page={page} />
    </>
  );
}
function Hero({ locale }: { locale: Locale }) {
  const t = copy(locale);
  return (
    <section className="hero">
      <div className="hero-photograph">
        <Image
          src="/images/hair.jpg"
          alt={services[0].alt[locale]}
          fill
          loading="eager"
          fetchPriority="high"
          sizes="(max-width: 700px) 100vw, 64vw"
        />
        <div className="hero-image-shade" />
        <span className="hero-reference">{t.reference}</span>
      </div>
      <HeroArt />
      <div className="container hero-content">
        <Eyebrow>{t.eyebrow}</Eyebrow>
        <h1>
          {t.heroFirst}
          <br />
          <em>{t.heroSecond}</em>
        </h1>
        <p className="hero-description">{t.heroBody}</p>
        <Buttons locale={locale} placement="hero" />
        <p className="hero-note">
          <span className="small-star">✦</span>
          {t.heroNote}
        </p>
      </div>
      <div className="container hero-bottom">
        <a href="#experiencia" className="scroll-cue">
          <span className="scroll-circle">
            <ArrowDown size={15} />
          </span>
          {t.scroll}
        </a>
        <p className="handwritten">{t.signature}</p>
      </div>
    </section>
  );
}
function Ribbon({ locale }: { locale: Locale }) {
  return (
    <div className="ribbon">
      {copy(locale).ribbon.map((text) => (
        <span key={text}>
          <Flower2 size={20} strokeWidth={1} />
          {text}
        </span>
      ))}
    </div>
  );
}
export function Experience({ locale }: { locale: Locale }) {
  const t = copy(locale);
  const icons = [Heart, Sparkles, Flower2];
  return (
    <section className="section experience" id="experiencia">
      <div className="container">
        <Reveal className="experience-heading">
          <div>
            <Eyebrow>{t.experienceTag}</Eyebrow>
            <h2>
              {t.experienceTitle}
              <br />
              <em>{t.experienceItalic}</em>
            </h2>
          </div>
          <p className="section-description">{t.experienceBody}</p>
        </Reveal>
        <div className="values-grid">
          {t.values.map((value, i) => {
            const Icon = icons[i];
            return (
              <Reveal className="value-card" key={value.title}>
                <span className="value-icon">
                  <Icon size={27} strokeWidth={1.1} />
                </span>
                <span className="value-number">0{i + 1}</span>
                <h3>{value.title}</h3>
                <p>{value.text}</p>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
export function Services({
  locale,
  full = false,
}: {
  locale: Locale;
  full?: boolean;
}) {
  const t = copy(locale);
  return (
    <section
      className={`section services-section ${full ? "services-full" : ""}`}
    >
      <div className="container">
        <Reveal className="section-heading">
          <div>
            <Eyebrow>{t.servicesTag}</Eyebrow>
            <h2>{t.servicesTitle}</h2>
          </div>
          {!full && (
            <Link href={href(locale, "services")} className="text-link">
              {t.allServices}
              <PlusMark />
            </Link>
          )}
        </Reveal>
        <div className="service-grid">
          {services.map((service, i) => (
            <Reveal className="service-card" key={service.id}>
              <div className="service-photo">
                <Image
                  src={service.image}
                  alt={service.alt[locale]}
                  fill
                  sizes="(max-width: 760px) 92vw, 45vw"
                />
                <div className="service-photo-overlay" />
                <span className="service-number">0{i + 1}</span>
                <span className="reference-label">{t.reference}</span>
                <p className="service-category">{service.subtitle[locale]}</p>
              </div>
              <div className="service-copy">
                <h3>{service.title[locale]}</h3>
                <p>{service.description[locale]}</p>
                <Action
                  locale={locale}
                  service={service.id === "hair" ? t.filters[1] : t.filters[2]}
                  placement="service-card"
                  className="service-action"
                />
              </div>
            </Reveal>
          ))}
        </div>
        {full && <p className="service-note">{t.serviceNote}</p>}
      </div>
    </section>
  );
}
function PlusMark() {
  return (
    <span className="plus-mark" aria-hidden="true">
      +
    </span>
  );
}
export function Work({
  locale,
  full = false,
}: {
  locale: Locale;
  full?: boolean;
}) {
  const t = copy(locale);
  return (
    <section className="section work-section">
      <div className="container">
        <Reveal className="section-heading">
          <div>
            <Eyebrow>{t.galleryTag}</Eyebrow>
            <h2>
              {t.galleryTitle}
              <br />
              <em>{t.galleryItalic}</em>
            </h2>
          </div>
          {!full && (
            <Link href={href(locale, "work")} className="text-link">
              {t.allWork}
              <PlusMark />
            </Link>
          )}
        </Reveal>
        <p className="work-showcase-intro">{t.galleryBody}</p>
        <HairstyleShowcase locale={locale} />
      </div>
    </section>
  );
}
export function Care({ locale }: { locale: Locale }) {
  const t = copy(locale);
  return (
    <section className="care-section">
      <div className="care-orbit" aria-hidden="true" />
      <div className="container">
        <Reveal>
          <Flower2 className="care-flower" size={42} strokeWidth={0.8} />
          <Eyebrow>{reviews.length ? t.reviewsTag : t.careTag}</Eyebrow>
          {reviews.length ? (
            <>
              <h2>{t.reviewsTitle}</h2>
              <div className="review-grid">
                {reviews.map((review) => (
                  <figure key={review.name}>
                    <blockquote>{review.text[locale]}</blockquote>
                    <figcaption>{review.name}</figcaption>
                    <a
                      href={review.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-link"
                    >
                      {t.reviewSource}
                    </a>
                  </figure>
                ))}
              </div>
            </>
          ) : (
            <>
              <h2>{t.careQuote}</h2>
              <p>{t.careBody}</p>
            </>
          )}
          <span className="care-signature">creiyi's</span>
        </Reveal>
      </div>
    </section>
  );
}
export function About({
  locale,
  full = false,
}: {
  locale: Locale;
  full?: boolean;
}) {
  const t = copy(locale);
  return (
    <section className="section about-section">
      <div className="container about-grid">
        <Reveal className="about-image">
          <Image
            src="/images/salon.jpg"
            alt={
              locale === "es"
                ? "Interior de salón de referencia; no es una fotografía de Creiyi's Salon"
                : "Reference salon interior; not a photograph of Creiyi's Salon"
            }
            fill
            sizes="(max-width: 760px) 90vw, 45vw"
          />
          <span className="reference-label">{t.reference}</span>
          <span className="image-corner" aria-hidden="true" />
        </Reveal>
        <Reveal className="about-copy">
          <Eyebrow>{t.aboutTag}</Eyebrow>
          <h2>
            {t.aboutTitle}
            <br />
            <em>{t.aboutItalic}</em>
          </h2>
          <p>{t.aboutBody}</p>
          {full ? (
            <p className="subtle-note">{t.aboutNote}</p>
          ) : (
            <Link className="text-link" href={href(locale, "about")}>
              {t.more}
              <PlusMark />
            </Link>
          )}
          <div className="about-signoff">
            <span className="handwritten">
              {locale === "es"
                ? "Con cariño, Creiyi's Salon"
                : "With love, Creiyi's Salon"}
            </span>
            <span>PUERTO RICO</span>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
export function CTA({ locale }: { locale: Locale }) {
  const t = copy(locale);
  return (
    <section className="cta-section">
      <div className="container">
        <Reveal>
          <Eyebrow>{t.ctaTag}</Eyebrow>
          <h2>
            {t.ctaTitle}
            <br />
            <em>{t.ctaItalic}</em>
          </h2>
          <p>{t.ctaBody}</p>
          <Buttons locale={locale} placement="closing-cta" />
          <span className="cta-star" aria-hidden="true">
            ✧
          </span>
        </Reveal>
      </div>
    </section>
  );
}
export function Questions({ locale }: { locale: Locale }) {
  const t = copy(locale);
  return (
    <section className="section faq-section">
      <div className="container faq-grid">
        <div>
          <Eyebrow>{t.faqTag}</Eyebrow>
          <h2>{t.faqTitle}</h2>
          <Link href={href(locale, "contact")} className="text-link">
            {t.nav.contact}
            <PlusMark />
          </Link>
        </div>
        <FAQ locale={locale} />
      </div>
    </section>
  );
}
export function Visit({
  locale,
  full = false,
}: {
  locale: Locale;
  full?: boolean;
}) {
  const t = copy(locale);
  return (
    <section
      className={`section visit-section ${full ? "contact-full" : ""}`}
      id="reservar"
    >
      <div className="container">
        <div className="contact-grid">
          <div className="contact-booking">
            <span className="contact-icon">
              <MessageCircle size={28} strokeWidth={1} />
            </span>
            <h2>{t.whatsapp}</h2>
            <p>{business.whatsapp ? t.contactReady : t.contactPending}</p>
            {business.whatsapp && (
              <Action locale={locale} placement="contact" />
            )}
            <p className="booking-hint">{t.bookingHint}</p>
          </div>
          <div className="contact-details">
            <div>
              <MapPin size={22} strokeWidth={1.25} />
              <h3>{t.location}</h3>
              <p>
                {business.address ? business.displayAddress : t.addressPending}
              </p>
              <Directions locale={locale} />
            </div>
            <div>
              <Clock3 size={22} strokeWidth={1.25} />
              <h3>{t.hours}</h3>
              {business.hours.length ? (
                business.hours.map((h) => (
                  <p key={h.days.es}>
                    {h.days[locale]} · {h.opens}–{h.closes}
                  </p>
                ))
              ) : (
                <p>{t.hoursPending}</p>
              )}
            </div>
            <div>
              <Phone size={22} strokeWidth={1.25} />
              <h3>{t.call}</h3>
              {business.phone ? (
                <Action locale={locale} type="call" placement="contact" />
              ) : (
                <p>{t.phonePending}</p>
              )}
            </div>
          </div>
        </div>
        {business.googleMaps &&
          business.latitude !== null &&
          business.longitude !== null && (
            <iframe
              className="location-map"
              title={t.location}
              src={`https://maps.google.com/maps?q=${business.latitude},${business.longitude}&z=16&output=embed`}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          )}
      </div>
    </section>
  );
}
export function PageIntro({
  locale,
  page,
}: {
  locale: Locale;
  page: Exclude<PageKey, "home" | "privacy">;
}) {
  const t = copy(locale);
  const titles = {
    services: [t.servicesTag, t.servicesTitle, "", t.servicesBody],
    work: [t.galleryTag, t.galleryTitle, t.galleryItalic, t.galleryBody],
    about: [t.aboutTag, t.aboutTitle, t.aboutItalic, t.aboutBody],
    contact: [t.contactTag, t.contactTitle, t.contactItalic, t.contactBody],
  };
  const [tag, title, italic, body] = titles[page];
  return (
    <section className="page-intro container">
      <div className="breadcrumbs">
        <Link href={href(locale)}>{t.nav.home}</Link>
        <span>/</span>
        <span>{t.nav[page]}</span>
      </div>
      <Eyebrow>{tag}</Eyebrow>
      <h1>
        {title}
        {italic && (
          <>
            <br />
            <em>{italic}</em>
          </>
        )}
      </h1>
      <p>{body}</p>
    </section>
  );
}
export function HomePage({ locale }: { locale: Locale }) {
  return (
    <>
      <Hero locale={locale} />
      <Ribbon locale={locale} />
      <Experience locale={locale} />
      <Work locale={locale} />
      <Services locale={locale} />
      <Care locale={locale} />
      <About locale={locale} />
      <CTA locale={locale} />
      <Questions locale={locale} />
      <Visit locale={locale} />
    </>
  );
}
export function ContentPage({
  locale,
  page,
}: {
  locale: Locale;
  page: PageKey;
}) {
  const t = copy(locale);
  switch (page) {
    case "home":
      return <HomePage locale={locale} />;
    case "services":
      return (
        <>
          <PageIntro locale={locale} page={page} />
          <Services locale={locale} full />
          <Questions locale={locale} />
          <CTA locale={locale} />
        </>
      );
    case "work":
      return (
        <>
          <PageIntro locale={locale} page={page} />
          <section
            className="signature-work"
            aria-labelledby="signature-work-title"
          >
            <div className="container">
              <div className="signature-work-heading">
                <div>
                  <Eyebrow>
                    {locale === "es" ? "HECHO EN CREIYI'S" : "MADE AT CREIYI'S"}
                  </Eyebrow>
                  <h2 id="signature-work-title">
                    {locale === "es" ? "Cabello que habla" : "Hair that speaks"}
                    <br />
                    <em>{locale === "es" ? "por ti." : "for you."}</em>
                  </h2>
                </div>
                <p>
                  {locale === "es"
                    ? "Explora cortes, color, textura y acabados realizados en el salón. Usa las flechas para recorrer cada look."
                    : "Explore cuts, color, texture, and finishes created in the salon. Use the arrows to move through every look."}
                </p>
              </div>
              <HairstyleShowcase locale={locale} />
              <div className="signature-work-action">
                <p>
                  {locale === "es"
                    ? "¿Viste un estilo para ti? Conversemos sobre tu próximo look."
                    : "Found a style for you? Let’s talk about your next look."}
                </p>
                <Action
                  locale={locale}
                  placement="hairstyle-showcase"
                  service={locale === "es" ? "Cabello" : "Hair"}
                />
              </div>
            </div>
          </section>
          <section className="section gallery-page">
            <div className="container">
              <Gallery locale={locale} />
            </div>
          </section>
          <CTA locale={locale} />
        </>
      );
    case "about":
      return (
        <>
          <PageIntro locale={locale} page={page} />
          <About locale={locale} full />
          <Experience locale={locale} />
          <Care locale={locale} />
          <CTA locale={locale} />
        </>
      );
    case "contact":
      return (
        <>
          <PageIntro locale={locale} page={page} />
          <Visit locale={locale} full />
          <Questions locale={locale} />
        </>
      );
    case "privacy":
      return (
        <section className="container privacy-page">
          <Eyebrow>CREYI’S SALON</Eyebrow>
          <h1>{t.privacyTitle}</h1>
          <p>{t.privacyBody}</p>
          <p>{t.privacyAnalytics}</p>
          <Link href={href(locale, "contact")} className="text-link">
            {t.nav.contact}
            <PlusMark />
          </Link>
        </section>
      );
  }
}
