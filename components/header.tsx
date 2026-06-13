"use client";

import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { BookingLink } from "@/components/ui/booking-link";
import { BranchSwitcher } from "@/components/branch-switcher";
import { SiteSearch } from "@/components/site-search";

const links = [["Treatments", "/treatments/select-branch"], ["Academy", "/courses"], ["Reviews", "/#reviews"], ["Our Team", "/#team"], ["Locations", "/locations"]];

export function Header() {
  const [open, setOpen] = useState(false);
  return (
    <header className="absolute inset-x-0 top-0 z-50 border-b border-white/15 text-white">
      <div className="container-site relative flex h-20 items-center justify-center lg:grid lg:grid-cols-[1fr_auto_1fr]">
        <nav className="hidden items-center gap-7 justify-self-start lg:flex">{links.map(([label, href]) => <Link key={label} href={href} className="text-[10px] font-bold uppercase tracking-[.14em] text-white/80 transition hover:text-white xl:text-xs xl:tracking-[.16em]">{label}</Link>)}</nav>
        <Link href="/" className="flex items-center justify-center" aria-label="Pink Beauty home">
          <Image src="/images/pink-logo.jpeg" alt="Pink Beauty" width={112} height={56} className="h-12 w-24 rounded-md object-cover sm:h-14 sm:w-28" priority />
        </Link>
        <div className="hidden items-center gap-3 justify-self-end lg:flex"><SiteSearch /><BranchSwitcher /><BookingLink className="button-light" label="Book now" intent={{ source: "header" }} /></div>
        <button onClick={() => setOpen(!open)} className="absolute right-5 rounded-full border border-white/30 p-2 sm:right-8 lg:hidden" aria-label="Toggle navigation">{open ? <X /> : <Menu />}</button>
      </div>
      {open && <nav className="mx-4 rounded-3xl bg-white p-5 text-ink shadow-luxe lg:hidden"><SiteSearch mobile onNavigate={() => setOpen(false)} />{links.map(([label, href]) => <Link onClick={() => setOpen(false)} key={label} href={href} className="block border-b border-black/5 py-4 font-semibold">{label}</Link>)}<Link href="/treatments/select-branch" onClick={() => setOpen(false)} className="mt-5 block text-xs font-bold uppercase tracking-[.14em] text-pink">Choose or switch branch</Link><BookingLink className="button-primary mt-5 w-full" intent={{ source: "mobile-menu" }} /></nav>}
    </header>
  );
}
