import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.join(process.cwd()),
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "cdn.shopify.com" },
      { protocol: "https", hostname: "cdn.sanity.io" },
    ],
  },
  async redirects() {
    const legacyLemonBottleHandles = [
      "lemon-bottle-back",
      "lemon-bottle-double-chin",
      "lemon-bottle-double-chin-jawline",
      "lemon-bottle-love-handles",
      "lemon-bottle-upper-arms",
      "lemon-bottle-upper-or-lower-stomach",
    ];
    return [
      {
        source:
          "/products-services/item/glutathione-and-vitamin-c-iv-drip-1",
        destination:
          "/products-services/item/glutathione-and-vitamin-c-iv-drip",
        permanent: true,
      },
      {
        source:
          "/products-services/:branchSlug/glutathione-and-vitamin-c-iv-drip-1",
        destination:
          "/products-services/:branchSlug/glutathione-and-vitamin-c-iv-drip",
        permanent: true,
      },
      ...legacyLemonBottleHandles.flatMap((handle) => [
        {
          source: `/products-services/item/${handle}`,
          destination: "/products-services/item/lemon-bottle",
          permanent: true,
        },
        {
          source: `/products-services/:branchSlug/${handle}`,
          destination: "/products-services/:branchSlug/lemon-bottle",
          permanent: true,
        },
        {
          source: `/checkout/:branchSlug/catalog/${handle}`,
          destination: "/checkout/:branchSlug/catalog/lemon-bottle",
          permanent: true,
        },
      ]),
    ];
  },
};

export default nextConfig;
