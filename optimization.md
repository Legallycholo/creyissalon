# Creiyi’s Salon Optimization

Implemented as one coordinated update:

- Andrea is a bilingual, provider-free lead assistant with an optional Google/Vertex path and truthful local fallback. The production widget remains disabled until `NEXT_PUBLIC_ANDREA_ENABLED=true`; Supabase persistence is intentionally deferred.
- The hairstyle scene now runs on WebGL-capable mobile devices with responsive quality, reduced-motion/data-saver handling, context-loss fallback, and the original static gallery as the safety net.
- The official Google Business Profile logo is used in the navbar, footer, favicon, and Apple icon metadata.
- Localized review routes, Google verification/review CTAs, accessible progressive loading, and a static snapshot importer are in place. The public profile exposed no review rows at implementation time, so the generated dataset remains empty rather than presenting invented testimonials.

## Deferred dependency

The future Supabase plan must implement `LeadSubmissionAdapter`, persist `AndreaLeadDraft`, and only then enable the public widget and success confirmation.
