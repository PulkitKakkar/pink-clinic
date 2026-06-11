"use client";

import Link from "next/link";
import Image from "next/image";
import { LogOut, ShieldCheck } from "lucide-react";

export function AdminHeader() {
  return <header className="border-b border-black/5 bg-white"><div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8"><Link href="/admin" className="flex items-center gap-3"><Image src="/images/pink-logo.jpeg" alt="Pink Beauty" width={80} height={40} className="h-10 w-20 rounded-md object-cover" priority /><span><strong className="block text-sm">Pink Admin</strong><small className="flex items-center gap-1 text-[9px] uppercase tracking-[.16em] text-black/40"><ShieldCheck size={11} /> Staff only</small></span></Link><form action="/api/admin/logout" method="post"><button className="flex items-center gap-2 rounded-full border border-black/10 px-4 py-2 text-xs font-bold" type="submit"><LogOut size={14} /> Sign out</button></form></div></header>;
}
