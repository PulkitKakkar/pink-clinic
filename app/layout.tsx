import type { Metadata } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import { BranchProvider } from "@/components/providers/branch-provider";
import { BasketProvider } from "@/components/providers/basket-provider";
import { PublicChrome } from "@/components/public-chrome";
import { getCombinedCatalog } from "@/lib/catalog";
import "./globals.css";

const display = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["500", "600", "700"],
  display: "swap",
});
const sans = Manrope({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://pinkclinic.co.uk",
  ),
  title: {
    default: "Pink Beauty Salon & Academy | Reading",
    template: "%s | Pink Beauty",
  },
  description:
    "Consultation-led skin, aesthetic and laser treatments across two Pink Beauty locations in Reading.",
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    shortcut: "/icon.svg",
    apple: "/apple-icon.png",
  },
  openGraph: {
    title: "Pink Beauty Salon & Academy",
    description:
      "Advanced skin and aesthetic treatments in Reading, made personal.",
    type: "website",
    siteName: "Pink Beauty",
    locale: "en_GB",
    images: ["/images/west-street.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Pink Beauty | Skin & aesthetics in Reading",
    description:
      "Explore treatments by concern and compare both Pink Beauty locations.",
    images: ["/images/west-street.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://pinkclinic.co.uk";
  const offerItems = (await getCombinedCatalog())
    .filter((item) => item.tags.includes("Offers"))
    .slice(0, 4);
  const offers = offerItems.map((item) => {
    const variants = item.variants.filter((variant) => variant.price > 0);
    const lowest = variants.length
      ? variants.reduce((current, variant) =>
          variant.price < current.price ? variant : current,
        )
      : undefined;
    const price = lowest ? `£${lowest.price.toFixed(0)}` : "View offer";
    const saving =
      lowest?.compareAtPrice && lowest.compareAtPrice > lowest.price
        ? ` · was £${lowest.compareAtPrice.toFixed(0)}`
        : "";
    return {
      label: `${item.title} · ${price}${saving}`,
      href: `/products-services/item/${item.handle}`,
    };
  });
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${siteUrl}/#organization`,
    name: "Pink Beauty",
    url: siteUrl,
    logo: `${siteUrl}/images/pink-logo.jpeg`,
    contactPoint: [
      {
        "@type": "ContactPoint",
        telephone: "0118 996 2711",
        contactType: "customer service",
        areaServed: "GB",
        availableLanguage: "English",
      },
    ],
    hasMerchantReturnPolicy: {
      "@type": "MerchantReturnPolicy",
      applicableCountry: "GB",
      returnPolicyCategory:
        "https://schema.org/MerchantReturnFiniteReturnWindow",
      merchantReturnDays: 14,
      returnMethod: "https://schema.org/ReturnByMail",
      merchantReturnLink: `${siteUrl}/returns`,
    },
  };
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body
        suppressHydrationWarning
        className={`${display.variable} ${sans.variable} font-sans antialiased`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema),
          }}
        />
        <BranchProvider>
          <BasketProvider>
            <PublicChrome offers={offers}>{children}</PublicChrome>
          </BasketProvider>
        </BranchProvider>
      </body>
    </html>
  );
}
