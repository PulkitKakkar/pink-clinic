import type { Metadata } from "next";
import { AdminErrorReporter } from "@/components/admin/error-reporter";

export const metadata: Metadata = { title: { absolute: "Pink Admin" }, robots: { index: false, follow: false } };

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-[#f8f3f6]"><AdminErrorReporter />{children}</div>;
}
