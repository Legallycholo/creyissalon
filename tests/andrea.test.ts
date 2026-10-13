import assert from "node:assert/strict";
import test from "node:test";
import {
  runLocalAndrea,
  type AndreaLeadDraft,
  type LeadSubmissionAdapter,
} from "../src/lib/andrea";

function reply(message: string, state?: unknown, locale: "es" | "en" = "es") {
  return runLocalAndrea({ message, state, locale, pagePath: `/${locale}` });
}

test("Andrea collects the required Spanish lead fields without claiming submission", () => {
  let result = reply("Quiero un corte de cabello");
  assert.equal(result.state.step, "name");
  result = reply("Me llamo Ana Rivera", result.state);
  assert.equal(result.state.step, "phone");
  result = reply("939-555-1212", result.state);
  assert.equal(result.state.step, "email");
  result = reply("omitir", result.state);
  result = reply("sábado por la mañana", result.state);
  result = reply("Quiero capas", result.state);
  assert.equal(result.state.step, "complete");
  assert.equal(result.draftReady, true);
  assert.equal(result.state.lead.source, "andrea_chat");
  assert.match(result.reply, /no se ha enviado/i);
  assert.doesNotMatch(result.reply, /cita confirmada/i);
});

test("Andrea validates English contact fields and can reset", () => {
  let result = reply("nail manicure", undefined, "en");
  result = reply("Jamie Lee", result.state, "en");
  const invalid = reply("123", result.state, "en");
  assert.equal(invalid.state.step, "phone");
  assert.match(invalid.reply, /10-digit/i);
  const reset = reply("restart", invalid.state, "en");
  assert.equal(reset.state.step, "service");
  assert.equal(reset.state.lead.name, undefined);
});

test("Andrea answers only verified business facts", () => {
  const location = reply("¿Dónde están?");
  assert.match(location.reply, /1003 Cll Alejandria/);
  const price = reply("¿Cuánto cuesta?");
  assert.match(price.reply, /confirmará el precio/);
  assert.doesNotMatch(price.reply, /\$/);
});

test("a fake submission adapter can exercise the future contract", async () => {
  let captured: AndreaLeadDraft | undefined;
  const fake: LeadSubmissionAdapter = {
    async submit(lead) {
      captured = lead;
      return { ok: true, leadId: "test-lead" };
    },
  };
  const lead: AndreaLeadDraft = {
    name: "Test User",
    phone: "9395551212",
    service: "Hair",
    locale: "en",
    pagePath: "/en/services",
    source: "andrea_chat",
  };
  assert.deepEqual(await fake.submit(lead), { ok: true, leadId: "test-lead" });
  assert.deepEqual(captured, lead);
});
