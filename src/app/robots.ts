import type { MetadataRoute } from "next";
import { business, launchReady } from "@/lib/site";
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      ...(launchReady ? { allow: "/" } : { disallow: "/" }),
    },
    ...(launchReady ? { sitemap: `${business.siteUrl}/sitemap.xml` } : {}),
  };
}
