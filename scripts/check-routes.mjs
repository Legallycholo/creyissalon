import assert from "node:assert/strict";

const origin = process.argv[2] || "http://localhost:3000";
const pages = {
  es: ["", "servicios", "trabajos", "resenas", "sobre-creyis", "contacto", "privacidad"],
  en: ["", "services", "work", "reviews", "about", "contact", "privacy"],
};
let verified = 0;
for (const [locale, paths] of Object.entries(pages)) {
  for (const path of paths) {
    const url = `${origin}/${locale}${path ? `/${path}` : ""}`;
    const response = await fetch(url);
    assert.equal(response.status, 200, url);
    const html = await response.text();
    assert.match(
      html,
      new RegExp(`<html[^>]*lang="${locale === "es" ? "es-PR" : "en"}"`),
      url,
    );
    assert.equal(
      (html.match(/<h1(?:\s|>)/g) || []).length,
      1,
      `Exactly one h1: ${url}`,
    );
    assert.match(html, /<meta name="description" content="[^"]+"/, url);
    assert.match(html, /<main id="main">/, url);
    assert.ok(!html.includes("https://wa.me/undefined"), url);
    assert.ok(html.includes("Creiyi&#x27;s Salon"), `Business name: ${url}`);
    assert.ok(
      html.includes(
        "1003 Cll Alejandria, San Juan, 00920, Puerto Rico",
      ),
      `Business address: ${url}`,
    );
    assert.ok(html.includes("+1 939-640-5333"), `Business phone: ${url}`);
    assert.ok(html.includes('href="tel:+19396405333"'), `Phone link: ${url}`);
    assert.ok(html.includes('class="andrea-widget"'), `Andrea widget: ${url}`);
    assert.ok(html.includes('class="footer-hours"'), `Footer hours disclosure: ${url}`);
    assert.ok(
      html.includes("/images/brand/creiyis-salon-logo-white-bg.png"),
      `Supplied footer logo: ${url}`,
    );
    assert.ok(html.includes("0x69b64d5fa802c7aa"), `Google Business Profile: ${url}`);
    assert.ok(
      html.includes(locale === "es" ? "Cerrado" : "Closed"),
      `Localized closed hours: ${url}`,
    );
    if (path === "trabajos" || path === "work") {
      assert.ok(
        html.includes("/images/work/hairstyles/01-caramel-pixie.jpg"),
        `Hairstyle work: ${url}`,
      );
      assert.ok(
        html.includes(locale === "es" ? "Cabello que habla" : "Hair that speaks"),
        `Hairstyle showcase heading: ${url}`,
      );
    }
    verified++;
  }
}
const root = await fetch(origin, { redirect: "manual" });
assert.equal(root.status, 308);
assert.equal(root.headers.get("location"), "/es");
for (const path of [
  "/fr",
  "/es/not-a-page",
  "/en/servicios",
  "/es/servicios/inventado",
]) {
  assert.equal((await fetch(origin + path)).status, 404, path);
}
assert.equal((await fetch(origin + "/robots.txt")).status, 200);
assert.equal((await fetch(origin + "/sitemap.xml")).status, 200);
const chat = await fetch(origin + "/api/chat", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    message: "What are your hours?",
    locale: "en",
    pagePath: "/en",
  }),
});
assert.equal(chat.status, 200);
const chatBody = await chat.json();
assert.match(chatBody.reply, /Tuesday.*Saturday.*9:00 AM/i);
assert.equal(chatBody.state.step, "service");
let chatState = chatBody.state;
for (const [message, expectedStep] of [
  ["hair cut", "name"],
  ["Jamie Lee", "phone"],
  ["939-555-1212", "email"],
  ["skip", "timing"],
  ["Saturday morning", "notes"],
  ["Layers", "complete"],
]) {
  const response = await fetch(origin + "/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message,
      locale: "en",
      pagePath: "/en",
      state: chatState,
    }),
  });
  assert.equal(response.status, 200);
  const result = await response.json();
  assert.equal(result.state.step, expectedStep);
  chatState = result.state;
  if (expectedStep === "complete") {
    assert.equal(result.draftReady, true);
    assert.match(result.reply, /not been sent/i);
  }
}
console.log(
  `Verified ${verified} localized pages, footer hours, Google profile, Andrea chat, Spanish redirect, four 404 paths, robots, and sitemap.`,
);
