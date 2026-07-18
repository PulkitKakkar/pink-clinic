"use client";

import { usePathname } from "next/navigation";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";

export function PublicChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isWorkspace = pathname.startsWith("/admin") || pathname === "/studio-login" || pathname === "/studio" || pathname.startsWith("/studio/");
  if (isWorkspace) return children;
  return <><a href="#main-content" className="fixed left-3 top-3 z-[200] -translate-y-24 rounded-full bg-white px-4 py-3 text-sm font-bold text-pink shadow-luxe transition focus:translate-y-0">Skip to content</a><Header /><div id="main-content" tabIndex={-1}>{children}</div><Footer /></>;
}
