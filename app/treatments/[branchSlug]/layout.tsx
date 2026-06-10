import { notFound } from "next/navigation";
import { BranchRouteSync } from "@/components/branch-route-sync";
import { branches, getBranchBySlug } from "@/lib/branches";

export function generateStaticParams() {
  return branches.map((branch) => ({ branchSlug: branch.slug }));
}

export default async function BranchTreatmentLayout({ children, params }: { children: React.ReactNode; params: Promise<{ branchSlug: string }> }) {
  const { branchSlug } = await params;
  const branch = getBranchBySlug(branchSlug);
  if (!branch) notFound();

  return <><BranchRouteSync branch={branch} />{children}</>;
}
