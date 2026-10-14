import assert from "node:assert/strict";
import test from "node:test";
import {
  bookingUrl,
  business,
  businessHoursSummary,
  businessSchema,
  GOOGLE_BUSINESS_PROFILE_URL,
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
  assert.equal(business.googleMaps, GOOGLE_BUSINESS_PROFILE_URL);
  assert.match(business.googleMaps, /0x69b64d5fa802c7aa/);
});
test("business hours contain every localized day in calendar order", () => {
  assert.equal(business.hours.length, 7);
  assert.deepEqual(
    business.hours.map((hour) => hour.schemaDay),
    ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
  );
  assert.deepEqual(
    business.hours.filter((hour) => hour.status === "closed").map((hour) => hour.schemaDay),
    ["Monday", "Sunday"],
  );
  assert.ok(
    business.hours
      .filter((hour) => hour.status === "open")
      .every((hour) => hour.opens === "09:00" && hour.closes === "18:00"),
  );
  assert.match(businessHoursSummary("es"), /martes.*sábado.*9:00 a\. m\./i);
  assert.match(businessHoursSummary("en"), /Tuesday.*Saturday.*9:00 AM/i);
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
  assert.equal(schema.hasMap, GOOGLE_BUSINESS_PROFILE_URL);
  assert.equal("aggregateRating" in schema, false);
  assert.equal("geo" in schema, false);
  assert.deepEqual(
    schema.openingHoursSpecification,
    business.hours.map((hour) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: hour.schemaDay,
      opens: hour.opens,
      closes: hour.closes,
    })),
  );
  assert.deepEqual(schema.openingHoursSpecification[0], {
    "@type": "OpeningHoursSpecification",
    dayOfWeek: "Monday",
    opens: "00:00",
    closes: "00:00",
  });
});
