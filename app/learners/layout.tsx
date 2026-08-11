import type { Metadata } from "next";
export const metadata: Metadata = {
  title: { absolute: "Pink Academy Learners" },
  robots: { index: false, follow: false },
};
export default function LearnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="min-h-screen bg-cream">{children}</div>;
}
