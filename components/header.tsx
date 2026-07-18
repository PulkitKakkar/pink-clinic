"use client";

import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { BranchSwitcher } from "@/components/branch-switcher";
import { SiteSearch } from "@/components/site-search";
import { BasketLink } from "@/components/basket-link";
import { useBranch } from "@/components/providers/branch-provider";

const baseLinks = [["Treatments", "/treatments/select-branch"], ["Academy", "/courses"], ["Reviews", "/#reviews"], ["Our Team", "/#team"], ["Locations", "/locations"]];

export function Header() {
  const [open, setOpen] = useState(false);
  const { selectedBranch } = useBranch();
  const links = [
    baseLinks[0],
    ["Products & Services", selectedBranch ? `/products-services/${selectedBranch.slug}` : "/treatments/select-branch"],
    ...baseLinks.slice(1),
  ];
  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);
  return (
    <header className="absolute inset-x-0 top-0 z-50 border-b border-white/15 text-white">
      <div className="container-site relative flex h-20 items-center justify-center xl:h-32 xl:flex-col">
        <div className="flex h-full items-center justify-center xl:h-[72px] xl:w-full">
          <Link href="/" className="flex items-center justify-center transition hover:scale-[1.02] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white" aria-label="Pink Beauty home">
            <Image src="/images/pink-logo.jpeg" alt="Pink Beauty" width={128} height={64} className="h-12 w-24 rounded-md object-cover sm:h-14 sm:w-28 xl:h-[58px] xl:w-[116px]" priority />
          </Link>
        </div>
        <div className="hidden h-14 w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-5 border-t border-white/10 xl:grid">
          <nav className="flex min-w-0 items-center justify-between gap-4 pr-2">{links.map(([label, href]) => <Link key={label} href={href} className="text-[10px] font-bold uppercase tracking-[.14em] text-white/80 transition hover:text-white 2xl:text-xs 2xl:tracking-[.16em]">{label}</Link>)}</nav>
          <div className="flex shrink-0 items-center gap-3"><SiteSearch /><BranchSwitcher /><BasketLink /></div>
        </div>
        <div className="absolute right-[4.5rem] sm:right-[5.25rem] xl:hidden"><BasketLink mobileHeader onNavigate={() => setOpen(false)} /></div>
        <button onClick={() => setOpen(!open)} className="absolute right-5 rounded-full border border-white/30 p-2 sm:right-8 xl:hidden" aria-label="Toggle navigation" aria-expanded={open} aria-controls="mobile-navigation">{open ? <X /> : <Menu />}</button>
      </div>
      {open && <nav id="mobile-navigation" className="mx-4 max-h-[calc(100dvh-6rem)] overflow-y-auto rounded-3xl bg-white p-5 text-ink shadow-luxe xl:hidden"><SiteSearch mobile onNavigate={() => setOpen(false)} />{links.map(([label, href]) => <Link onNavigate={() => setOpen(false)} key={label} href={href} className="block border-b border-black/5 py-4 font-semibold">{label}</Link>)}<Link href="/treatments/select-branch" onNavigate={() => setOpen(false)} className="mt-5 block text-xs font-bold uppercase tracking-[.14em] text-pink">Choose or switch branch</Link><BasketLink mobile onNavigate={() => setOpen(false)} /></nav>}
    </header>
  );
}
