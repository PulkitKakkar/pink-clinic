"use client";

import { usePathname } from "next/navigation";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";

export function PublicChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isWorkspace = pathname.startsWith("/admin") || pathname === "/studio-login" || pathname === "/studio" || pathname.startsWith("/studio/");
  if (isWorkspace) return children;
  return <><Header />{children}<Footer /></>;
}
