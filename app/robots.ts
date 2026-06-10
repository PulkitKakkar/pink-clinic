import type { MetadataRoute } from "next";
export default function robots(): MetadataRoute.Robots { const base = process.env.NEXT_PUBLIC_SITE_URL || "https://pinkbeauty.co.uk"; return { rules: { userAgent: "*", allow: "/", disallow: "/studio/" }, sitemap: `${base}/sitemap.xml` }; }
