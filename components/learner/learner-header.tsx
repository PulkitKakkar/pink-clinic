import Image from "next/image";
import Link from "next/link";
import { LayoutDashboard, LifeBuoy, LogOut } from "lucide-react";

export function LearnerHeader({ learnerName }: { learnerName: string }) {
  return (
    <header className="border-b border-black/5 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-5 py-4">
        <Link href="/learners" className="flex min-w-0 items-center gap-3">
          <Image src="/images/pink-logo.jpeg" alt="Pink Beauty" width={80} height={40} className="h-10 w-20 rounded-md object-cover" priority />
          <span className="hidden sm:block">
            <strong className="block text-sm">Pink Academy</strong>
            <small className="block max-w-48 truncate text-[10px] text-black/45">Signed in as {learnerName}</small>
          </span>
        </Link>
        <nav aria-label="Learner navigation" className="flex items-center gap-1 sm:gap-2">
          <Link href="/learners" className="flex min-h-11 items-center gap-2 rounded-full px-3 text-xs font-bold text-black/65 hover:bg-cream hover:text-pink sm:px-4">
            <LayoutDashboard size={15} /> <span className="hidden sm:inline">Dashboard</span>
          </Link>
          <a href="mailto:info@pinkbeautysalons.co.uk?subject=Pink%20Academy%20learner%20support" className="flex min-h-11 items-center gap-2 rounded-full px-3 text-xs font-bold text-black/65 hover:bg-cream hover:text-pink sm:px-4">
            <LifeBuoy size={15} /> <span className="hidden sm:inline">Get help</span>
          </a>
          <form action="/api/learner/logout" method="post">
            <button aria-label="Sign out" className="flex min-h-11 items-center gap-2 rounded-full border border-black/10 px-3 text-xs font-bold sm:px-4">
              <LogOut size={14} /> <span className="hidden sm:inline">Sign out</span>
            </button>
          </form>
        </nav>
      </div>
    </header>
  );
}
