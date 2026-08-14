"use client";

import { usePathname } from "next/navigation";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { ActionLoader } from "@/components/action-loader";
import type { Promotion } from "@/components/offer-banner";

export function PublicChrome({ children, offers }: { children: React.ReactNode; offers: Promotion[] }) {
  const pathname = usePathname();
  const isWorkspace =
    pathname.startsWith("/admin") ||
    pathname.startsWith("/academy-admin") ||
    pathname === "/learner-login" ||
    pathname.startsWith("/learners") ||
    pathname === "/studio-login" ||
    pathname === "/studio" ||
    pathname.startsWith("/studio/");
  if (isWorkspace) return <><ActionLoader />{children}</>;
  return <><ActionLoader /><a href="#main-content" className="fixed left-3 top-3 z-[200] -translate-y-24 rounded-full bg-white px-4 py-3 text-sm font-bold text-pink shadow-luxe transition focus:translate-y-0">Skip to content</a><Header offers={offers} /><div id="main-content" tabIndex={-1}>{children}</div><Footer /></>;
}
