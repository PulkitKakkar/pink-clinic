"use client";

import { MapPin } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useBranch } from "@/components/providers/branch-provider";
import { branches } from "@/lib/branches";

export function BranchSwitcher() {
  const pathname = usePathname();
  const router = useRouter();
  const { selectedBranch, setSelectedBranch } = useBranch();

  function switchBranch(branchId: string) {
    const branch = branches.find((item) => item.id === branchId);
    if (!branch) return;

    setSelectedBranch(branch);
    const parts = pathname.split("/").filter(Boolean);
    const serviceSlug = parts[0] === "treatments" && parts.length >= 3 ? parts[2] : undefined;
    router.push(serviceSlug ? `/treatments/${branch.slug}/${serviceSlug}` : `/treatments/${branch.slug}`);
  }

  return <label className="flex items-center gap-2 rounded-full border border-white/25 bg-black/10 px-3 py-2 text-[10px] font-bold uppercase tracking-[.12em] text-white"><MapPin size={13} className="text-pink-light" /><span className="sr-only">Selected branch</span><select aria-label="Selected treatment branch" value={selectedBranch?.id ?? ""} onChange={(event) => event.target.value ? switchBranch(event.target.value) : router.push("/treatments/select-branch")} className="max-w-40 bg-transparent outline-none"><option value="" className="text-ink">Choose branch</option>{branches.map((branch) => <option key={branch.id} value={branch.id} className="text-ink">{branch.name}</option>)}</select></label>;
}
