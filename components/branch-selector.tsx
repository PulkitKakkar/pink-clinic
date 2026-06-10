"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowRight, MapPin } from "lucide-react";
import { useBranch } from "@/components/providers/branch-provider";
import type { Branch } from "@/lib/branches";

export function BranchSelector({ branches, serviceSlug }: { branches: Branch[]; serviceSlug?: string }) {
  const router = useRouter();
  const { setSelectedBranch } = useBranch();

  function selectBranch(branch: Branch) {
    setSelectedBranch(branch);
    router.push(serviceSlug ? `/treatments/${branch.slug}/${serviceSlug}` : `/treatments/${branch.slug}`);
  }

  return <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">{branches.map((branch) => <article key={branch.id} className="grid grid-cols-[110px_1fr] overflow-hidden rounded-2xl border border-black/5 bg-white shadow-soft sm:block sm:rounded-[2rem]"><div className="relative min-h-full sm:aspect-[16/10]"><Image src={branch.image} alt={`${branch.name} salon`} fill className="object-cover" sizes="(min-width: 1024px) 50vw, (min-width: 640px) 100vw, 110px" /></div><div className="flex flex-col items-start p-4 sm:block sm:p-9"><p className="hidden text-[10px] font-bold uppercase tracking-[.2em] text-pink sm:block">{branch.note}</p><h2 className="font-display text-[1.65rem] leading-none tracking-tight sm:mt-3 sm:text-4xl">{branch.name}</h2><p className="mt-2 flex gap-2 text-[11px] leading-4 text-black/50 sm:mt-4 sm:gap-3 sm:text-sm sm:leading-6"><MapPin size={14} className="mt-0.5 shrink-0 text-pink sm:h-[17px] sm:w-[17px]" />{branch.address}</p><button type="button" onClick={() => selectBranch(branch)} className="mt-3 inline-flex min-h-9 items-center justify-center gap-2 rounded-full bg-pink px-4 py-2 text-[11px] font-bold text-white shadow-[0_10px_24px_rgba(228,1,127,.2)] transition hover:bg-pink-dark sm:mt-7 sm:min-h-12 sm:px-7 sm:py-3 sm:text-sm"><span className="sm:hidden">Choose branch</span><span className="hidden sm:inline">Choose this branch</span><ArrowRight size={14} className="sm:h-4 sm:w-4" /></button></div></article>)}</div>;
}
