"use client";
import { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Menu,
  X,
  Phone,
  MessageCircle,
  Plus,
  Minus,
  Expand,
  SlidersHorizontal,
} from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import {
  bookingUrl,
  business,
  href,
  portfolio,
  type Locale,
  type PageKey,
  type PortfolioItem,
} from "@/lib/site";
import { copy } from "@/lib/copy";

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
  }
}
export function track(event: string, detail: Record<string, string> = {}) {
  try {
    if (localStorage.getItem("creyis-analytics") === "granted") {
      window.dataLayer ||= [];
      window.dataLayer.push({ event, ...detail });
    }
  } catch {
    /* Storage may be disabled. */
  }
}
export function Reveal({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={false}
      whileInView={reduced ? {} : { y: [16, 0], opacity: [0.6, 1] }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
export function Action({
  locale,
  type = "book",
  placement = "page",
  service,
  className = "",
}: {
  locale: Locale;
  type?: "book" | "call";
  placement?: string;
  service?: string;
  className?: string;
}) {
  const t = copy(locale);
  const target =
    type === "call"
      ? business.phone
        ? `tel:+${business.phone}`
        : `${href(locale, "contact")}#reservar`
      : bookingUrl(locale, service);
  const configured =
    type === "call" ? Boolean(business.phone) : Boolean(business.whatsapp);
  return (
    <a
      href={target}
      className={`${type === "book" ? "button button-gold" : "button button-outline"} ${className}`}
      onClick={() =>
        configured &&
        track(type === "call" ? "call_click" : "whatsapp_click", {
          locale,
          placement,
          ...(service ? { service } : {}),
        })
      }
    >
      {type === "call" ? <Phone size={15} /> : <MessageCircle size={17} />}
      {type === "call" ? t.call : t.book}
    </a>
  );
}
export function Header({ locale, page }: { locale: Locale; page: PageKey }) {
  const [open, setOpen] = useState(false);
  const toggle = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLElement>(null);
  const t = copy(locale);
  const other = locale === "es" ? "en" : "es";
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const links = panel.current?.querySelectorAll<HTMLElement>("a, button");
    links?.[0]?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        toggle.current?.focus();
      }
      if (e.key === "Tab" && links?.length) {
        const first = links[0],
          last = links[links.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          toggle.current?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          toggle.current?.focus();
        } else if (document.activeElement === toggle.current) {
          e.preventDefault();
          (e.shiftKey ? last : first).focus();
        }
      }
    };
    const onResize = () => {
      if (window.innerWidth > 900) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    window.addEventListener("resize", onResize);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
    };
  }, [open]);
  return (
    <header className="site-header">
      <div className="header-inner">
        <Link
          href={href(locale)}
          className="wordmark"
          aria-label="Creiyi's Salon"
        >
          <span>
            creiyi's<span className="brand-dot">.</span>
          </span>
          <small>BEAUTY SALON</small>
        </Link>
        <nav
          className="desktop-nav"
          aria-label={
            locale === "es" ? "Navegación principal" : "Main navigation"
          }
        >
          {(["services", "work", "about", "contact"] as PageKey[]).map(
            (key) => (
              <Link
                aria-current={page === key ? "page" : undefined}
                key={key}
                href={href(locale, key)}
              >
                {t.nav[key]}
              </Link>
            ),
          )}
        </nav>
        <div className="header-actions">
          <Link
            className="language"
            href={href(other, page)}
            hrefLang={other}
            aria-label={t.language}
          >
            <span className={locale === "es" ? "active-language" : ""}>ES</span>
            <span className="language-divider">/</span>
            <span className={locale === "en" ? "active-language" : ""}>EN</span>
          </Link>
          <Action locale={locale} placement="header" className="header-book" />
          <button
            ref={toggle}
            className="icon-button menu-toggle"
            aria-expanded={open}
            aria-controls="mobile-navigation"
            aria-label={open ? t.menuClose : t.menuOpen}
            onClick={() => setOpen(!open)}
          >
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </div>
      <nav
        ref={panel}
        id="mobile-navigation"
        className={`mobile-navigation ${open ? "is-open" : ""}`}
        aria-label={locale === "es" ? "Menú móvil" : "Mobile navigation"}
        inert={!open}
        onClick={(event) => {
          if ((event.target as HTMLElement).closest("a")) setOpen(false);
        }}
      >
        {(["home", "services", "work", "about", "contact"] as PageKey[]).map(
          (key, i) => (
            <Link
              key={key}
              href={href(locale, key)}
              onClick={() => setOpen(false)}
            >
              <small>0{i + 1}</small>
              {t.nav[key]}
            </Link>
          ),
        )}
        <Action locale={locale} placement="mobile-menu" />
      </nav>
    </header>
  );
}
export function FAQ({ locale }: { locale: Locale }) {
  const [active, setActive] = useState<number | null>(null);
  const t = copy(locale);
  return (
    <div className="faq-list">
      {t.faqs.map((item, i) => (
        <div
          className={`faq-item ${active === i ? "expanded" : ""}`}
          key={item.q}
        >
          <h3>
            <button
              id={`faq-question-${i}`}
              aria-expanded={active === i}
              aria-controls={`faq-answer-${i}`}
              onClick={() => setActive(active === i ? null : i)}
            >
              {item.q}
              {active === i ? <Minus size={18} /> : <Plus size={18} />}
            </button>
          </h3>
          <div
            id={`faq-answer-${i}`}
            role="region"
            aria-labelledby={`faq-question-${i}`}
            hidden={active !== i}
          >
            <p>{item.a}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
export function BeforeAfter({
  item,
  locale,
}: {
  item: PortfolioItem;
  locale: Locale;
}) {
  const [value, setValue] = useState(50);
  const t = copy(locale);
  return (
    <div className="comparison">
      <Image
        src={item.image}
        fill
        sizes="(max-width: 760px) 90vw, 50vw"
        alt={`${t.after}: ${item.alt[locale]}`}
      />
      <div
        className="comparison-before"
        style={{ clipPath: `inset(0 ${100 - value}% 0 0)` }}
      >
        <Image
          src={item.before!}
          fill
          sizes="(max-width: 760px) 90vw, 50vw"
          alt={`${t.before}: ${item.alt[locale]}`}
        />
      </div>
      <span className="compare-label before-label">{t.before}</span>
      <span className="compare-label after-label">{t.after}</span>
      <span className="compare-divider" style={{ left: `${value}%` }}>
        <SlidersHorizontal size={18} />
      </span>
      <input
        type="range"
        min="0"
        max="100"
        value={value}
        onChange={(e) => setValue(Number(e.target.value))}
        aria-label={t.comparison}
      />
    </div>
  );
}
export function Gallery({
  locale,
  compact = false,
}: {
  locale: Locale;
  compact?: boolean;
}) {
  const [filter, setFilter] = useState(0);
  const [selected, setSelected] = useState<PortfolioItem | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  const t = copy(locale);
  const items = portfolio.filter(
    (item) =>
      filter === 0 ||
      (filter === 1 && item.category === "hair") ||
      (filter === 2 && item.category === "nails") ||
      (filter === 3 && item.before),
  );
  useEffect(() => {
    if (selected) {
      dialog.current?.showModal();
      const previous = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = previous;
      };
    }
    dialog.current?.close();
    opener.current?.focus();
  }, [selected]);
  return (
    <>
      <div
        className="gallery-filters"
        role="group"
        aria-label={locale === "es" ? "Filtrar galería" : "Filter gallery"}
      >
        {t.filters.map((label, i) => (
          <button
            key={label}
            aria-pressed={filter === i}
            className={filter === i ? "selected" : ""}
            onClick={() => setFilter(i)}
          >
            {label}
            <span>
              {i === 0 ? String(portfolio.length).padStart(2, "0") : ""}
            </span>
          </button>
        ))}
      </div>
      <div className={`gallery-grid ${compact ? "compact" : ""}`}>
        {items.map((item) => (
          <figure className="gallery-item" key={item.id}>
            {item.before ? (
              <BeforeAfter item={item} locale={locale} />
            ) : (
              <button
                className="gallery-image"
                aria-label={`${t.enlarge}: ${item.title[locale]}`}
                onClick={(e) => {
                  opener.current = e.currentTarget;
                  setSelected(item);
                }}
              >
                <Image
                  src={item.image}
                  alt={item.alt[locale]}
                  fill
                  sizes="(max-width: 760px) 92vw, 46vw"
                />
                <span className="expand-icon">
                  <Expand size={19} />
                </span>
                {item.reference && (
                  <span className="reference-label">{t.reference}</span>
                )}
              </button>
            )}
            <figcaption>
              <span>{item.title[locale]}</span>
              <small>
                {item.category === "hair" ? t.filters[1] : t.filters[2]}
              </small>
            </figcaption>
          </figure>
        ))}
      </div>
      {items.length === 0 && (
        <div className="gallery-empty">
          <SlidersHorizontal size={30} />
          <h3>{t.emptyTransform}</h3>
          <p>{t.emptyBody}</p>
          <button className="text-link" onClick={() => setFilter(0)}>
            {t.filters[0]}
          </button>
        </div>
      )}
      <p className="image-disclaimer">
        {portfolio.some((i) => i.reference) ? t.galleryNotice : ""}
      </p>
      <dialog
        ref={dialog}
        className="lightbox"
        onCancel={() => setSelected(null)}
        onClick={(e) => {
          if (e.target === e.currentTarget) setSelected(null);
        }}
        aria-label={selected?.title[locale] || t.enlarge}
      >
        <button
          className="lightbox-close icon-button"
          aria-label={t.close}
          onClick={() => setSelected(null)}
        >
          <X />
        </button>
        {selected && (
          <div className="lightbox-content">
            <div className="lightbox-image">
              <Image
                src={selected.image}
                alt={selected.alt[locale]}
                fill
                sizes="90vw"
              />
            </div>
            <p>
              {selected.title[locale]}{" "}
              {selected.reference && <small>· {t.reference}</small>}
            </p>
          </div>
        )}
      </dialog>
    </>
  );
}
export function PrivacyControls({ locale }: { locale: Locale }) {
  const [choice, setChoice] = useState<string | null>("pending");
  const t = copy(locale);
  const gtm = process.env.NEXT_PUBLIC_GTM_ID;
  useEffect(() => {
    try {
      setChoice(localStorage.getItem("creyis-analytics"));
    } catch {
      setChoice("denied");
    }
  }, []);
  useEffect(() => {
    if (
      choice !== "granted" ||
      !gtm ||
      !/^GTM-[A-Z0-9]+$/.test(gtm) ||
      document.getElementById("creyis-gtm")
    )
      return;
    window.dataLayer ||= [];
    window.dataLayer.push({ "gtm.start": Date.now(), event: "gtm.js" });
    const script = document.createElement("script");
    script.id = "creyis-gtm";
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtm.js?id=${gtm}`;
    document.head.append(script);
  }, [choice, gtm]);
  function choose(value: string) {
    const revoke = choice === "granted" && value === "denied";
    try {
      localStorage.setItem("creyis-analytics", value);
    } catch {}
    setChoice(value);
    if (revoke || (value === "denied" && document.getElementById("creyis-gtm")))
      window.location.reload();
  }
  if (!gtm) return null;
  return (
    <>
      <button className="privacy-settings" onClick={() => setChoice(null)}>
        {t.preferences}
      </button>
      {choice === null && (
        <aside className="consent-panel" aria-label={t.preferences}>
          <p>{t.cookieText}</p>
          <Link href={href(locale, "privacy")}>{t.nav.privacy}</Link>
          <div>
            <button
              className="button button-outline"
              onClick={() => choose("denied")}
            >
              {t.decline}
            </button>
            <button
              className="button button-gold"
              onClick={() => choose("granted")}
            >
              {t.accept}
            </button>
          </div>
        </aside>
      )}
    </>
  );
}
export function PageTracker({
  locale,
  page,
}: {
  locale: Locale;
  page: PageKey;
}) {
  useEffect(() => {
    if (!window.location.hash) window.scrollTo({ top: 0, behavior: "instant" });
    track(page === "services" ? "service_page_view" : "page_view", {
      locale,
      page,
    });
  }, [locale, page]);
  return null;
}
export function Directions({ locale }: { locale: Locale }) {
  return business.googleMaps ? (
    <a
      className="text-link"
      href={business.googleMaps}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => track("directions_click", { locale })}
    >
      {copy(locale).directions}
    </a>
  ) : null;
}
