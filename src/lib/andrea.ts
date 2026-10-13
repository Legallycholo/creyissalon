import type { Locale } from "./site";

export type AndreaChatStep =
  | "service"
  | "name"
  | "phone"
  | "email"
  | "timing"
  | "notes"
  | "complete";

export type AndreaLeadDraft = {
  service?: string;
  name?: string;
  phone?: string;
  email?: string;
  preferredTime?: string;
  notes?: string;
  locale: Locale;
  pagePath: string;
  source: "andrea_chat";
};

export type AndreaChatState = {
  step: AndreaChatStep;
  lead: AndreaLeadDraft;
};

export type AndreaChatResult = {
  reply: string;
  state: AndreaChatState;
  draftReady?: boolean;
};

export type LeadSubmissionResult =
  | { ok: true; leadId?: string }
  | { ok: false; error: string };

export interface LeadSubmissionAdapter {
  submit(lead: AndreaLeadDraft): Promise<LeadSubmissionResult>;
}

const MAX_FIELD_LENGTH = 500;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /(?:\+?1[\s.-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/;
const SERVICE_WORDS =
  /\b(hair|cabello|corte|cut|color|tinte|highlights|mechas|blowout|peinado|style|styling|nail|nails|uña|uñas|manicure|manicura|pedicure|pedicura|gel|acrylic|acrílico)\b/i;

function clean(value: unknown, max = MAX_FIELD_LENGTH) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function isSkip(message: string) {
  return /^(skip|pass|none|no|nope|prefiero no decir|omitir|ninguno|ninguna)$/i.test(
    message.trim(),
  );
}

function initialState(locale: Locale, pagePath: string): AndreaChatState {
  return {
    step: "service",
    lead: { locale, pagePath: clean(pagePath, 250) || `/${locale}`, source: "andrea_chat" },
  };
}

function sanitizeState(
  value: unknown,
  locale: Locale,
  pagePath: string,
): AndreaChatState {
  if (!value || typeof value !== "object") return initialState(locale, pagePath);
  const raw = value as Record<string, unknown>;
  const allowed: AndreaChatStep[] = [
    "service",
    "name",
    "phone",
    "email",
    "timing",
    "notes",
    "complete",
  ];
  const step = allowed.includes(raw.step as AndreaChatStep)
    ? (raw.step as AndreaChatStep)
    : "service";
  const rawLead =
    raw.lead && typeof raw.lead === "object"
      ? (raw.lead as Record<string, unknown>)
      : {};
  const lead: AndreaLeadDraft = {
    locale,
    pagePath: clean(pagePath || rawLead.pagePath, 250) || `/${locale}`,
    source: "andrea_chat",
  };
  for (const field of [
    "service",
    "name",
    "phone",
    "email",
    "preferredTime",
    "notes",
  ] as const) {
    const result = clean(rawLead[field]);
    if (result) lead[field] = result;
  }
  return { step, lead };
}

function update(
  state: AndreaChatState,
  step: AndreaChatStep,
  values: Partial<AndreaLeadDraft>,
): AndreaChatState {
  return { step, lead: { ...state.lead, ...values } };
}

function answerKnownQuestion(message: string, locale: Locale) {
  const normalized = message.toLowerCase();
  if (/\b(price|pricing|cost|precio|cuánto|cuanto)\b/.test(normalized)) {
    return locale === "es"
      ? "Los precios dependen del servicio. El salón confirmará el precio, la duración y lo que incluye antes de reservar."
      : "Prices depend on the service. The salon will confirm the price, duration, and what is included before booking.";
  }
  if (/\b(hour|hours|open|schedule|horario|abren|cierran)\b/.test(normalized)) {
    return locale === "es"
      ? "El horario todavía no está publicado. El salón puede confirmarlo cuando se comuniquen contigo."
      : "Business hours have not been published yet. The salon can confirm them when they contact you.";
  }
  if (/\b(where|address|location|dónde|donde|dirección|ubicación)\b/.test(normalized)) {
    return locale === "es"
      ? "Creiyi’s Salon está en 1003 Cll Alejandria, San Juan, PR 00920."
      : "Creiyi’s Salon is at 1003 Cll Alejandria, San Juan, PR 00920.";
  }
  if (/\b(service|offer|do you do|servicio|ofrecen|hacen)\b/.test(normalized)) {
    return locale === "es"
      ? "El salón ofrece servicios de cabello y uñas. Cuéntame qué cambio o cuidado tienes en mente."
      : "The salon offers hair and nail services. Tell me what kind of change or care you have in mind.";
  }
  if (/\b(ai|bot|robot|human|persona|humana)\b/.test(normalized)) {
    return locale === "es"
      ? "Soy Andrea, la asistente virtual del sitio. Puedo orientarte y preparar los detalles de tu solicitud."
      : "I’m Andrea, the website’s virtual assistant. I can help with the basics and prepare your request details.";
  }
  return null;
}

export function runLocalAndrea(input: {
  message: unknown;
  state?: unknown;
  locale?: unknown;
  pagePath?: unknown;
}): AndreaChatResult {
  const locale: Locale = input.locale === "en" ? "en" : "es";
  const message = clean(input.message);
  const state = sanitizeState(input.state, locale, clean(input.pagePath, 250));
  const es = locale === "es";

  if (!message) {
    return { reply: es ? "¿En qué puedo ayudarte?" : "How can I help?", state };
  }
  if (/^(reset|restart|start over|reiniciar|empezar de nuevo)$/i.test(message)) {
    return {
      reply: es
        ? "Empecemos de nuevo. ¿Te interesa un servicio de cabello o de uñas?"
        : "Let’s start over. Are you interested in a hair or nail service?",
      state: initialState(locale, state.lead.pagePath),
    };
  }
  if (state.step === "complete") {
    return {
      reply: es
        ? "Tus datos están preparados, pero el envío al salón todavía no está habilitado. No se ha confirmado ninguna cita. Escribe “reiniciar” para comenzar otra solicitud."
        : "Your details are prepared, but sending them to the salon is not enabled yet. No appointment has been confirmed. Type “restart” to begin another request.",
      state,
      draftReady: true,
    };
  }

  switch (state.step) {
    case "service": {
      const answer = answerKnownQuestion(message, locale);
      if (!SERVICE_WORDS.test(message)) {
        return {
          reply: `${answer ? `${answer} ` : ""}${
            es
              ? "¿Qué servicio de cabello o uñas te interesa?"
              : "Which hair or nail service interests you?"
          }`,
          state,
        };
      }
      return {
        reply: `${answer ? `${answer} ` : ""}${
          es ? "¿Cuál es tu nombre completo?" : "What’s your full name?"
        }`,
        state: update(state, "name", { service: message }),
      };
    }
    case "name": {
      const name = clean(
        message
          .replace(/^(me llamo|mi nombre es|my name is|i am|i'm)\s+/i, "")
          .replace(/[^a-zÀ-ž' .-]/gi, ""),
        100,
      );
      if (name.length < 2) {
        return {
          reply: es
            ? "¿Qué nombre completo debo incluir en la solicitud?"
            : "What full name should I include with the request?",
          state,
        };
      }
      return {
        reply: es
          ? `Gracias, ${name.split(/\s+/)[0]}. ¿Cuál es el mejor número para contactarte?`
          : `Thanks, ${name.split(/\s+/)[0]}. What’s the best phone number to reach you?`,
        state: update(state, "phone", { name }),
      };
    }
    case "phone": {
      const phone = message.match(PHONE_PATTERN)?.[0];
      if (!phone) {
        return {
          reply: es
            ? "Envíame un número de teléfono de 10 dígitos."
            : "Please send a 10-digit phone number.",
          state,
        };
      }
      return {
        reply: es
          ? "¿Quieres añadir un correo electrónico? Puedes escribir “omitir”."
          : "Would you like to add an email? You can type “skip.”",
        state: update(state, "email", { phone }),
      };
    }
    case "email": {
      if (!isSkip(message) && !EMAIL_PATTERN.test(message.toLowerCase())) {
        return {
          reply: es
            ? "Ese correo parece incompleto. Inténtalo de nuevo o escribe “omitir”."
            : "That email looks incomplete. Try again or type “skip.”",
          state,
        };
      }
      return {
        reply: es
          ? "¿Qué día u horario prefieres? También puedes escribir “omitir”."
          : "Which day or time do you prefer? You can also type “skip.”",
        state: update(state, "timing", isSkip(message) ? {} : { email: message.toLowerCase() }),
      };
    }
    case "timing":
      return {
        reply: es
          ? "Por último, ¿hay algún detalle que quieras compartir? Escribe “omitir” si no."
          : "Lastly, is there anything else you’d like to share? Type “skip” if not.",
        state: update(
          state,
          "notes",
          isSkip(message) ? {} : { preferredTime: message },
        ),
      };
    case "notes": {
      const complete = update(
        state,
        "complete",
        isSkip(message) ? {} : { notes: message },
      );
      return {
        reply: es
          ? "Ya preparé tus datos. El envío al salón todavía no está habilitado, así que no se ha enviado la solicitud ni confirmado una cita."
          : "Your details are ready. Sending to the salon is not enabled yet, so the request has not been sent and no appointment is confirmed.",
        state: complete,
        draftReady: true,
      };
    }
  }
}
