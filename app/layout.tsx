import type { Metadata } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import { BranchProvider } from "@/components/providers/branch-provider";
import { PublicChrome } from "@/components/public-chrome";
import "./globals.css";

const display = Cormorant_Garamond({ subsets: ["latin"], variable: "--font-display", weight: ["500", "600", "700"], display: "swap" });
const sans = Manrope({ subsets: ["latin"], variable: "--font-sans", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://pinkbeauty.co.uk"),
  title: { default: "Pink Beauty Salon & Academy | Reading", template: "%s | Pink Beauty" },
  description: "Luxury beauty, advanced aesthetics and accredited beauty training in Reading. Book your consultation with Pink Beauty Salon.",
  openGraph: { title: "Pink Beauty Salon & Academy", description: "Beauty. Confidence. Success.", type: "website", images: ["/images/west-street.jpg"] },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body className={`${display.variable} ${sans.variable} font-sans antialiased`}><BranchProvider><PublicChrome>{children}</PublicChrome></BranchProvider></body></html>;
}
