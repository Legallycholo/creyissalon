"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { hairstyles, type Locale } from "@/lib/site";

const Scene = dynamic(() => import("./hairstyle-showcase-scene"), {
  ssr: false,
});

export default function HairstyleShowcase({ locale }: { locale: Locale }) {
  const [active, setActive] = useState(0);
  const [visible, setVisible] = useState(false);
  const stage = useRef<HTMLDivElement>(null);
  const current = hairstyles[active];

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting && !document.hidden),
      { rootMargin: "120px" },
    );
    if (stage.current) observer.observe(stage.current);
    const onVisibility = () => setVisible(!document.hidden);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  const move = (direction: number) =>
    setActive((index) =>
      (index + direction + hairstyles.length) % hairstyles.length,
    );

  return (
    <div className="hairstyle-showcase" ref={stage}>
      <div className="hairstyle-canvas" aria-hidden="true">
        <Scene
          images={hairstyles.map((item) => item.image)}
          active={active}
          running={visible}
        />
        <div className="hairstyle-stage-glow" />
      </div>

      <div
        className="hairstyle-static"
        aria-label={locale === "es" ? "Trabajos de cabello" : "Hairstyle work"}
      >
        {hairstyles.map((item, index) => (
          <figure key={item.id}>
            <div>
              <Image
                src={item.image}
                alt={item.alt[locale]}
                fill
                loading={index < 2 ? "eager" : "lazy"}
                unoptimized
                sizes="(max-width: 760px) 78vw, 32vw"
              />
            </div>
            <figcaption>{item.title[locale]}</figcaption>
          </figure>
        ))}
      </div>

      <div className="hairstyle-controls">
        <button
          type="button"
          onClick={() => move(-1)}
          aria-label={locale === "es" ? "Trabajo anterior" : "Previous work"}
        >
          <ChevronLeft aria-hidden="true" />
        </button>
        <div aria-live="polite">
          <span>
            {String(active + 1).padStart(2, "0")} /{" "}
            {String(hairstyles.length).padStart(2, "0")}
          </span>
          <strong>{current.title[locale]}</strong>
        </div>
        <button
          type="button"
          onClick={() => move(1)}
          aria-label={locale === "es" ? "Próximo trabajo" : "Next work"}
        >
          <ChevronRight aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
