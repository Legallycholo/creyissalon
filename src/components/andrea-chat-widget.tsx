"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { MessageCircle, Phone, Send, Sparkles, X } from "lucide-react";
import type { AndreaChatState } from "@/lib/andrea";
import type { Locale } from "@/lib/site";
import { business } from "@/lib/site";

type ChatMessage = { id: string; role: "assistant" | "user"; text: string };

const language = {
  es: {
    greeting:
      "Hola, soy Andrea, la asistente virtual de Creiyi’s Salon. ¿Te interesa un servicio de cabello o de uñas?",
    title: "Andrea",
    status: "Asistente virtual · En línea",
    strip: "Cabello y uñas · San Juan, Puerto Rico",
    placeholder: "Escribe tu mensaje…",
    open: "Abrir chat con Andrea",
    close: "Cerrar chat",
    send: "Enviar mensaje",
    call: "Llamar al salón",
    error:
      "No pude responder en este momento. Puedes llamar al salón al +1 939-640-5333.",
    attention: "¿Pensando en tu próximo look? Estoy aquí para ayudarte.",
    testMode: "Modo de prueba",
    summary: "Resumen de tu solicitud",
    service: "Servicio",
    name: "Nombre",
    phone: "Teléfono",
    email: "Correo",
    timing: "Horario preferido",
    notes: "Detalles",
    notProvided: "No indicado",
    notSent:
      "Esta información no fue enviada ni guardada, y no confirma una cita.",
    restart: "Empezar de nuevo",
  },
  en: {
    greeting:
      "Hi, I’m Andrea, Creiyi’s Salon’s virtual assistant. Are you interested in a hair or nail service?",
    title: "Andrea",
    status: "Virtual assistant · Online",
    strip: "Hair and nails · San Juan, Puerto Rico",
    placeholder: "Write your message…",
    open: "Open chat with Andrea",
    close: "Close chat",
    send: "Send message",
    call: "Call the salon",
    error:
      "I couldn’t respond right now. You can call the salon at +1 939-640-5333.",
    attention: "Thinking about your next look? I’m here to help.",
    testMode: "Test mode",
    summary: "Request summary",
    service: "Service",
    name: "Name",
    phone: "Phone",
    email: "Email",
    timing: "Preferred time",
    notes: "Details",
    notProvided: "Not provided",
    notSent:
      "This information was not sent or saved, and it does not confirm an appointment.",
    restart: "Start over",
  },
} as const;

export default function AndreaChatWidget({ locale }: { locale: Locale }) {
  const t = language[locale];
  const titleId = useId();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: "greeting", role: "assistant", text: t.greeting },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [state, setState] = useState<AndreaChatState | null>(null);
  const [draftReady, setDraftReady] = useState(false);
  const [attention, setAttention] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages([{ id: "greeting", role: "assistant", text: t.greeting }]);
    setState(null);
    setSessionId(null);
    setDraftReady(false);
  }, [locale, t.greeting]);

  useEffect(() => {
    const timer = window.setTimeout(() => setAttention(true), 25_000);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!open) return;
    setAttention(false);
    inputRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
      }
      if (event.key !== "Tab" || !panelRef.current) return;
      const items = panelRef.current.querySelectorAll<HTMLElement>(
        "a, button:not([disabled]), input:not([disabled])",
      );
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [messages, loading]);

  const send = useCallback(async () => {
    const text = input.trim();
    if (!text || loading) return;
    setMessages((current) => [
      ...current,
      { id: `user-${Date.now()}`, role: "user", text },
    ]);
    setInput("");
    setLoading(true);
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          locale,
          pagePath: window.location.pathname,
          sessionId,
          state,
        }),
      });
      const result = (await response.json()) as {
        reply?: string;
        sessionId?: string;
        state?: AndreaChatState;
        draftReady?: boolean;
      };
      if (!response.ok || !result.reply) throw new Error("Chat unavailable");
      if (result.sessionId) setSessionId(result.sessionId);
      if (result.state) setState(result.state);
      setDraftReady(Boolean(result.draftReady));
      setMessages((current) => [
        ...current,
        { id: `andrea-${Date.now()}`, role: "assistant", text: result.reply! },
      ]);
    } catch {
      setMessages((current) => [
        ...current,
        { id: `error-${Date.now()}`, role: "assistant", text: t.error },
      ]);
    } finally {
      setLoading(false);
    }
  }, [input, loading, locale, sessionId, state, t.error]);

  const restart = useCallback(() => {
    setMessages([{ id: "greeting", role: "assistant", text: t.greeting }]);
    setInput("");
    setLoading(false);
    setSessionId(null);
    setState(null);
    setDraftReady(false);
    window.requestAnimationFrame(() => inputRef.current?.focus());
  }, [t.greeting]);

  const summaryFields: [string, string | undefined][] = state
    ? [
        [t.service, state.lead.service],
        [t.name, state.lead.name],
        [t.phone, state.lead.phone],
        [t.email, state.lead.email],
        [t.timing, state.lead.preferredTime],
        [t.notes, state.lead.notes],
      ]
    : [];

  return (
    <div className="andrea-widget">
      <div
        ref={panelRef}
        className={`andrea-panel ${open ? "is-open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        inert={!open}
      >
        <header className="andrea-header">
          <span className="andrea-avatar" aria-hidden="true">A</span>
          <div>
            <strong id={titleId}>{t.title}</strong>
            <small>{t.status}</small>
          </div>
          <a href={`tel:+${business.phone}`} aria-label={t.call}>
            <Phone size={17} />
          </a>
          <button type="button" onClick={() => setOpen(false)} aria-label={t.close}>
            <X size={18} />
          </button>
        </header>
        <p className="andrea-strip"><Sparkles size={13} />{t.strip}</p>
        <div className="andrea-messages" aria-live="polite" aria-busy={loading}>
          {messages.map((message) => (
            <div key={message.id} className={`andrea-message ${message.role}`}>
              {message.role === "assistant" && <span aria-hidden="true">A</span>}
              <p>{message.text}</p>
            </div>
          ))}
          {loading && (
            <div className="andrea-message assistant andrea-typing" aria-label="Andrea is typing">
              <span aria-hidden="true">A</span><p><i /><i /><i /></p>
            </div>
          )}
          {draftReady && state?.step === "complete" && (
            <section className="andrea-summary" aria-label={t.summary}>
              <span className="andrea-test-badge">{t.testMode}</span>
              <h3>{t.summary}</h3>
              <dl>
                {summaryFields.map(([label, value]) => (
                  <div key={label}>
                    <dt>{label}</dt>
                    <dd>{value || t.notProvided}</dd>
                  </div>
                ))}
              </dl>
              <p>{t.notSent}</p>
              <button type="button" onClick={restart}>
                {t.restart}
              </button>
            </section>
          )}
          <div ref={endRef} />
        </div>
        <form
          className="andrea-form"
          onSubmit={(event) => {
            event.preventDefault();
            void send();
          }}
        >
          <input
            ref={inputRef}
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder={t.placeholder}
            maxLength={500}
            aria-label={t.placeholder}
          />
          <button type="submit" disabled={!input.trim() || loading} aria-label={t.send}>
            <Send size={18} />
          </button>
        </form>
      </div>

      {attention && !open && <p className="andrea-attention">{t.attention}</p>}
      <button
        ref={toggleRef}
        className="andrea-toggle"
        type="button"
        aria-expanded={open}
        aria-label={open ? t.close : t.open}
        onClick={() => setOpen((current) => !current)}
      >
        {open ? <X size={24} /> : <MessageCircle size={25} />}
        {attention && !open && <span className="andrea-unread" />}
      </button>
    </div>
  );
}
