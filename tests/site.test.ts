import assert from "node:assert/strict";
import test from "node:test";
import {
  bookingUrl,
  business,
  businessSchema,
  href,
  hairstyles,
  locales,
  resolvePage,
  routes,
  serializeSchema,
  validPhone,
  siteOrigin,
  isLaunchReady,
  type PageKey,
} from "../src/lib/site";
import { copy } from "../src/lib/copy";

test("every translated page resolves to the same semantic page", () => {
  for (const locale of locales)
    for (const page of Object.keys(routes[locale]) as PageKey[]) {
      const url = href(locale, page);
      assert.equal(resolvePage(locale, url.split("/").slice(2)), page);
      assert.ok(copy(locale).nav[page]);
    }
});
test("unsupported and nested paths do not silently become a valid page", () => {
  assert.equal(resolvePage("es", ["services"]), undefined);
  assert.equal(resolvePage("en", ["servicios"]), undefined);
  assert.equal(resolvePage("es", ["servicios", "inventado"]), undefined);
});
test("phone normalization does not create broken tel or WhatsApp links", () => {
  assert.equal(validPhone("+1 (787) 555-0123"), "17875550123");
  assert.equal(validPhone(""), undefined);
  assert.equal(validPhone("123"), undefined);
  assert.equal(validPhone("01234567890"), undefined);
});
test("Google Business Profile details remain exact and callable", () => {
  assert.equal(business.name, "Creiyi's Salon");
  assert.equal(
    business.displayAddress,
    "1003 Cll Alejandria, San Juan, 00920, Puerto Rico",
  );
  assert.equal(business.displayPhone, "+1 939-640-5333");
  assert.equal(business.phone, "19396405333");
});
test("hairstyle showcase contains ten unique salon photographs", () => {
  assert.equal(hairstyles.length, 10);
  assert.equal(new Set(hairstyles.map((item) => item.image)).size, 10);
  assert.ok(
    hairstyles.every((item) =>
      item.image.startsWith("/images/work/hairstyles/"),
    ),
  );
  assert.ok(hairstyles.every((item) => item.reference !== true));
});
test("unconfigured booking routes to the translated contact section", () => {
  const original = business.whatsapp;
  try {
    business.whatsapp = undefined;
    assert.equal(bookingUrl("es"), "/es/contacto#reservar");
    assert.equal(bookingUrl("en"), "/en/contact#reservar");
  } finally {
    business.whatsapp = original;
  }
});
test("WhatsApp messages retain accents and service context without malformed URLs", () => {
  const original = business.whatsapp;
  try {
    business.whatsapp = "17875550123";
    const target = new URL(bookingUrl("es", "Uñas & belleza"));
    assert.equal(target.host, "wa.me");
    assert.equal(target.pathname, "/17875550123");
    assert.match(target.searchParams.get("text")!, /Uñas & belleza/);
    assert.match(
      new URL(bookingUrl("en", "Hair")).searchParams.get("text")!,
      /for Hair/,
    );
  } finally {
    business.whatsapp = original;
  }
});
test("schema serialization cannot close its script element", () => {
  const result = serializeSchema({
    name: "</script><script>alert(1)</script>",
  });
  assert.ok(!result.includes("<"));
  assert.deepEqual(JSON.parse(result), {
    name: "</script><script>alert(1)</script>",
  });
});
test("unverified salon is not presented as a complete LocalBusiness", () => {
  if (!business.address) assert.equal(businessSchema(), null);
});
test("public origin is normalized and non-web schemes are rejected", () => {
  assert.equal(
    siteOrigin("https://salon.example/es/"),
    "https://salon.example",
  );
  assert.equal(siteOrigin("not-a-url"), "");
  assert.equal(siteOrigin("javascript:alert(1)"), "");
});
test("verified configuration produces one truthful BeautySalon entity", () => {
  const configured = {
    ...business,
    siteUrl: "https://salon.example",
    address: "Test address",
    city: "San Juan",
    phone: "17875550123",
    whatsapp: "17875550123",
    images: ["/images/actual-salon.jpg"],
  };
  assert.equal(isLaunchReady(configured), true);
  const schema = businessSchema(configured)!;
  assert.equal(schema["@type"], "BeautySalon");
  assert.equal(schema["@id"], "https://salon.example/#salon");
  assert.deepEqual(schema.image, [
    "https://salon.example/images/actual-salon.jpg",
  ]);
  assert.equal(schema.address.addressLocality, "San Juan");
  assert.equal("aggregateRating" in schema, false);
  assert.equal("geo" in schema, false);
  assert.equal("openingHoursSpecification" in schema, false);
});
