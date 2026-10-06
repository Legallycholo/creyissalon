"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { hairstyles, type Locale } from "@/lib/site";

const Scene = dynamic(() => import("./hairstyle-showcase-scene"), {
  ssr: false,
});

export default function HairstyleShowcase({ locale }: { locale: Locale }) {
  const [active, setActive] = useState(0);
  const [visible, setVisible] = useState(false);
  const [enhanced, setEnhanced] = useState(false);
  const stage = useRef<HTMLDivElement>(null);
  const progress = useRef(0);
  const frame = useRef<number | null>(null);
  const current = hairstyles[active];

  useEffect(() => {
    const query = window.matchMedia(
      "(min-width: 701px) and (prefers-reduced-motion: no-preference)",
    );
    const sync = () => setEnhanced(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    const element = stage.current;
    if (!element) return;

    let inView = false;
    const syncVisibility = () => setVisible(inView && !document.hidden);
    const observer = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting;
        syncVisibility();
      },
      { rootMargin: "120px" },
    );
    observer.observe(element);
    document.addEventListener("visibilitychange", syncVisibility);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", syncVisibility);
    };
  }, []);

  useEffect(() => {
    if (!enhanced) return;

    const update = () => {
      frame.current = null;
      const element = stage.current;
      if (!element) return;
      const rect = element.getBoundingClientRect();
      const headerHeight = window.innerWidth <= 900 ? 83 : 98;
      const distance = Math.max(rect.height - window.innerHeight + headerHeight, 1);
      const next = Math.min(1, Math.max(0, (headerHeight - rect.top) / distance));
      progress.current = next;
      element.style.setProperty("--gallery-progress", `${next * 100}%`);
      const nextActive = Math.min(
        hairstyles.length - 1,
        Math.round(next * (hairstyles.length - 1)),
      );
      setActive((previous) => (previous === nextActive ? previous : nextActive));
    };
    const requestUpdate = () => {
      if (frame.current === null) frame.current = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);
    return () => {
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
      if (frame.current !== null) cancelAnimationFrame(frame.current);
    };
  }, [enhanced]);

  useEffect(() => {
    const cards = stage.current?.querySelectorAll<HTMLElement>(
      "[data-hairstyle-card]",
    );
    if (!cards?.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            (entry.target as HTMLElement).classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -12%", threshold: 0.12 },
    );
    cards.forEach((card) => observer.observe(card));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="hairstyle-scroll" ref={stage}>
      <div className="hairstyle-showcase">
        {enhanced && (
          <div className="hairstyle-canvas" aria-hidden="true">
            <Scene
              images={hairstyles.map((item) => item.image)}
              progress={progress}
              running={visible}
            />
            <div className="hairstyle-stage-glow" />
          </div>
        )}

        <div className="hairstyle-overlay" aria-hidden="true">
          <p>{locale === "es" ? "CREADO EN CREIYI'S" : "CREATED AT CREIYI'S"}</p>
          <h3>
            <em>{locale === "es" ? "Tu estilo." : "Your style."}</em>{" "}
            {locale === "es" ? "Tu momento." : "Your moment."}
          </h3>
        </div>

        <div
          className="hairstyle-static"
          aria-label={locale === "es" ? "Trabajos de cabello" : "Hairstyle work"}
        >
          {hairstyles.map((item, index) => (
            <figure key={item.id} data-hairstyle-card>
              <div>
                <Image
                  src={item.image}
                  alt={item.alt[locale]}
                  fill
                  loading={index < 2 ? "eager" : "lazy"}
                  unoptimized
                  sizes="(max-width: 700px) 92vw, 32vw"
                />
              </div>
              <figcaption>
                <span>{String(index + 1).padStart(2, "0")}</span>
                {item.title[locale]}
              </figcaption>
            </figure>
          ))}
        </div>

        <div className="hairstyle-progress" aria-live="polite">
          <div>
            <span>{String(active + 1).padStart(2, "0")}</span>
            <i aria-hidden="true">
              <b />
            </i>
            <span>{String(hairstyles.length).padStart(2, "0")}</span>
          </div>
          <strong>{current.title[locale]}</strong>
          <small>
            {locale === "es" ? "DESLIZA PARA EXPLORAR" : "SCROLL TO EXPLORE"}
          </small>
        </div>
      </div>
    </div>
  );
}
