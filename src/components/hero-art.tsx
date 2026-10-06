"use client";
import dynamic from "next/dynamic";
import { Component, useEffect, useRef, useState, type ReactNode } from "react";
const Scene = dynamic(() => import("./light-sculpture"), { ssr: false });
class ArtBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}
export default function HeroArt() {
  const ref = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    const connection = (
      navigator as Navigator & { connection?: { saveData?: boolean } }
    ).connection;
    const update = () => {
      if (media.matches || connection?.saveData) {
        setEnabled(false);
        return;
      }
      try {
        const canvas = document.createElement("canvas");
        const gl = canvas.getContext("webgl2");
        setEnabled(Boolean(gl));
        gl?.getExtension("WEBGL_lose_context")?.loseContext();
      } catch {
        setEnabled(false);
      }
    };
    update();
    media.addEventListener("change", update);
    const observer = new IntersectionObserver(([entry]) =>
      setVisible(entry.isIntersecting && !document.hidden),
    );
    if (ref.current) observer.observe(ref.current);
    const visibility = () => {
      if (document.hidden) setVisible(false);
      else if (ref.current) {
        const bounds = ref.current.getBoundingClientRect();
        setVisible(bounds.bottom > 0 && bounds.top < window.innerHeight);
      }
    };
    document.addEventListener("visibilitychange", visibility);
    return () => {
      observer.disconnect();
      media.removeEventListener("change", update);
      document.removeEventListener("visibilitychange", visibility);
    };
  }, []);
  return (
    <div ref={ref} className="hero-art" aria-hidden="true">
      <div className="art-fallback" />
      {enabled && (
        <ArtBoundary>
          <Scene active={visible} />
        </ArtBoundary>
      )}
    </div>
  );
}
