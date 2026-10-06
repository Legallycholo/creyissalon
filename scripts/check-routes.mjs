import assert from "node:assert/strict";

const origin = process.argv[2] || "http://localhost:3000";
const pages = {
  es: ["", "servicios", "trabajos", "sobre-creyis", "contacto", "privacidad"],
  en: ["", "services", "work", "about", "contact", "privacy"],
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
console.log(
  `Verified ${verified} localized pages with exact footer business details, Spanish redirect, four 404 paths, robots, and sitemap.`,
);
