import Image from "next/image";
import Link from "next/link";
import { BookOpen, LogOut, ShieldCheck } from "lucide-react";

export function AcademyHeader() {
  return (
    <header className="border-b border-black/5 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
        <Link href="/academy-admin" className="flex items-center gap-3">
          <Image src="/images/pink-logo.jpeg" alt="Pink Beauty" width={80} height={40} className="h-10 w-20 rounded-md object-cover" priority />
          <span>
            <strong className="block text-sm">Pink Academy</strong>
            <small className="flex items-center gap-1 text-[9px] uppercase tracking-[.16em] text-black/40">
              <ShieldCheck size={11} /> Academy administrator
            </small>
          </span>
        </Link>
        <nav className="rounded-full bg-cream p-1 text-xs font-bold">
          <Link href="/academy-admin" className="flex items-center gap-1.5 rounded-full px-4 py-2 transition hover:bg-white">
            <BookOpen size={14} /> Learners
          </Link>
        </nav>
        <form action="/api/academy-admin/logout" method="post">
          <button aria-label="Sign out" className="flex min-h-11 items-center gap-2 rounded-full border border-black/10 px-4 py-2 text-xs font-bold" type="submit">
            <LogOut size={14} /> <span className="hidden sm:inline">Sign out</span>
          </button>
        </form>
      </div>
    </header>
  );
}
