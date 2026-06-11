"use client";

import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { BookingLink } from "@/components/ui/booking-link";
import { BranchSwitcher } from "@/components/branch-switcher";

const links = [["Treatments", "/treatments/select-branch"], ["Academy", "/courses"], ["Results", "/#results"], ["About", "/#why"], ["Locations", "/locations"]];

export function Header() {
  const [open, setOpen] = useState(false);
  return (
    <header className="absolute inset-x-0 top-0 z-50 border-b border-white/15 text-white">
      <div className="container-site flex h-20 items-center justify-between">
        <Link href="/" className="flex items-center gap-3" aria-label="Pink Beauty home">
          <Image src="/images/pink-logo.jpeg" alt="" width={80} height={40} className="h-10 w-20 rounded-md object-cover" priority />
          <span className="leading-none"><strong className="block text-lg tracking-tight">pink beauty</strong><small className="text-[9px] uppercase tracking-[.2em] text-white/70">Salon · Clinic · Academy</small></span>
        </Link>
        <nav className="hidden items-center gap-8 lg:flex">{links.map(([label, href]) => <Link key={label} href={href} className="text-xs font-bold uppercase tracking-[.16em] text-white/80 transition hover:text-white">{label}</Link>)}</nav>
        <div className="hidden items-center gap-3 lg:flex"><BranchSwitcher /><BookingLink className="button-light" label="Book now" intent={{ source: "header" }} /></div>
        <button onClick={() => setOpen(!open)} className="rounded-full border border-white/30 p-2 lg:hidden" aria-label="Toggle navigation">{open ? <X /> : <Menu />}</button>
      </div>
      {open && <nav className="mx-4 rounded-3xl bg-white p-5 text-ink shadow-luxe lg:hidden">{links.map(([label, href]) => <Link onClick={() => setOpen(false)} key={label} href={href} className="block border-b border-black/5 py-4 font-semibold">{label}</Link>)}<Link href="/treatments/select-branch" onClick={() => setOpen(false)} className="mt-5 block text-xs font-bold uppercase tracking-[.14em] text-pink">Choose or switch branch</Link><BookingLink className="button-primary mt-5 w-full" intent={{ source: "mobile-menu" }} /></nav>}
    </header>
  );
}
