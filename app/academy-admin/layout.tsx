import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { absolute: "Pink Academy Admin" },
  robots: { index: false, follow: false },
};

export default function AcademyAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="min-h-screen bg-[#f8f3f6]">{children}</div>;
}
