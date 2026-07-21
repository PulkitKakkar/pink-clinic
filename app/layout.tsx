import type { Metadata } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import { BranchProvider } from "@/components/providers/branch-provider";
import { BasketProvider } from "@/components/providers/basket-provider";
import { PublicChrome } from "@/components/public-chrome";
import "./globals.css";

const display = Cormorant_Garamond({ subsets: ["latin"], variable: "--font-display", weight: ["500", "600", "700"], display: "swap" });
const sans = Manrope({ subsets: ["latin"], variable: "--font-sans", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://pinkclinic.co.uk"),
  title: { default: "Pink Beauty Salon & Academy | Reading", template: "%s | Pink Beauty" },
  description: "Luxury beauty, advanced aesthetics and accredited beauty training in Reading. Book your consultation with Pink Beauty Salon.",
  icons: { icon: [{ url: "/icon.svg", type: "image/svg+xml" }], shortcut: "/icon.svg", apple: "/apple-icon.png" },
  openGraph: { title: "Pink Beauty Salon & Academy", description: "Beauty. Confidence. Success.", type: "website", images: ["/images/west-street.jpg"] },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" data-scroll-behavior="smooth"><body suppressHydrationWarning className={`${display.variable} ${sans.variable} font-sans antialiased`}><BranchProvider><BasketProvider><PublicChrome>{children}</PublicChrome></BasketProvider></BranchProvider></body></html>;
}
