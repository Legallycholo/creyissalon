# Creiyi's Salon

Spanish-first bilingual salon website built with Next.js App Router, TypeScript, Tailwind CSS, React Three Fiber, Drei, and Motion. The core content is prerendered; the decorative WebGL scene is isolated and loaded on the client.

## Local development

```sh
npm install
npm run dev
```

Open http://localhost:3000/es or http://localhost:3000/en. The root redirects permanently to Spanish.

```sh
npm run test
npm run typecheck
npm run build
npm run start
```

With a server running, `npm run test:routes` checks all 12 localized pages, the Spanish redirect, invalid paths, robots, and sitemap. Pass an alternate origin as `npm run test:routes -- http://localhost:3001`.

## Content and launch configuration

- `src/lib/site.ts`: verified business details, service categories, gallery items, reviews, and translated route mapping.
- `src/lib/copy.ts`: complete Spanish and English copy.
- `src/app/globals.css`: visual system, responsive layouts, and reduced-motion handling.
- `.env.example`: public origin, international WhatsApp/phone numbers, and optional GTM container.

Create `.env.local` from the example and fill in the actual values. Do not put secrets in `NEXT_PUBLIC_*` variables. Public environment variables are embedded at build time; restart development or rebuild after changing them.

Until the public origin, physical address, city, phone, and WhatsApp number are configured, the site explicitly remains a preview: search indexing is disabled, its sitemap is empty, and incomplete business structured data is omitted. Unconfigured booking and phone buttons lead to an explanatory contact section. They never send to a sample phone number or claim a booking succeeded.

Before launch, confirm the exact brand spelling and logo; replace reference photographs with authorized salon images; supply the location, hours, map link, and social profiles; provide the service list and actual policies; and review both translations. Add real customer reviews with source links and authorization. No ratings, customer counts, credentials, guarantees, or testimonials have been fabricated.

The hero, service cards, and salon introduction currently identify their photographs as references. Replace both the files and corresponding alt text/captions when real photographs are supplied. Remove the inspiration labels only from actual salon work. The gallery section introduction should then be revised to describe the real portfolio. Add verified salon image paths to `business.images` to include them in structured data.

## Portfolio and reviews

Each `PortfolioItem` has a stable ID, category (`hair` or `nails`), localized title and alt text, image path, optional `before` image path, and a `reference` flag. Add a real `before` image to activate the keyboard-accessible comparison slider and the Before & After filter. Until matching salon images exist, the filter shows an honest empty state.

Reviews use a real author name, Spanish and English text, and source URL. An empty review list displays the salon’s care philosophy instead of fake social proof. Do not mark self-serving reviews with AggregateRating/Review schema to seek Google review stars.

## Search and advertising

There are six pages per language: Home, Services, Work, About, Contact, and Privacy. Language switching preserves the semantic page. The site generates localized titles, descriptions, canonical URLs, reciprocal language alternates, Open Graph metadata, a sitemap, and BeautySalon/BreadcrumbList JSON-LD when configured. JSON-LD is safely serialized. Keep name/address/phone consistent with the Google Business Profile.

Individual service landing pages are intentionally deferred until the real service list and substantial original content are supplied. They should include their own photos, service information, FAQs, and Service/BreadcrumbList schema. Do not generate thin municipality pages or invented service content.

Optional Google Tag Manager loads only after analytics consent. Events are `whatsapp_click`, `call_click`, `directions_click`, `service_page_view`, and `page_view`; payloads contain locale and placement, not message contents or phone numbers. Configure GA4/Google Ads inside the real GTM account before relying on reports. GTM tags must respect the website’s consent setting. A contact click is a lead intent event, not a confirmed appointment. Confirmed-booking conversions require the future booking provider’s verified callback. Revoking consent reloads the page without GTM; existing provider cookies are governed by the eventual tag configuration.

No data is collected or transmitted by the optional analytics integration without a configured container and user consent. External maps are rendered only when an actual map URL and coordinates have been supplied.

## Motion and accessibility

The Three.js sculpture is decorative; all copy, navigation, and actions are ordinary HTML. It is skipped for reduced-motion preferences, data saving, or unavailable WebGL. Animation pauses outside the viewport and when the document is hidden. Pixel density is capped and an error boundary preserves the static fallback. The gallery uses a native modal dialog with Escape dismissal and restored focus. The mobile menu traps keyboard focus and restores scrolling on close; FAQs expose expanded state.

## Deployment

Run the production build and deploy to a Next.js-compatible Node hosting provider after the real business information is ready. The development preview is not a production deployment. Verify production canonicals, hreflang, JSON-LD, WhatsApp/call destinations, and analytics before running Google Ads. Check Core Web Vitals on the production domain; local development timings are not production performance evidence.

See `ASSETS.md` for reference image provenance.
