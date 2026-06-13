"use client";

import Link from "next/link";
import { ArrowUpRight, Search, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useBranch } from "@/components/providers/branch-provider";
import { searchSite, type SearchItem } from "@/lib/search";

export function SiteSearch({ mobile = false, onNavigate }: { mobile?: boolean; onNavigate?: () => void }) {
  const { selectedBranch } = useBranch();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const results = searchSite(query);

  useEffect(() => {
    function shortcut(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen(true);
      }
      if (event.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", shortcut);
    return () => window.removeEventListener("keydown", shortcut);
  }, []);

  useEffect(() => {
    if (open) window.setTimeout(() => inputRef.current?.focus(), 0);
  }, [open]);

  function hrefFor(item: SearchItem) {
    return item.serviceSlug && selectedBranch ? `/treatments/${selectedBranch.slug}/${item.serviceSlug}` : item.href;
  }

  function close() {
    setOpen(false);
    setQuery("");
    onNavigate?.();
  }

  function keyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive((current) => Math.min(current + 1, results.length - 1));
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((current) => Math.max(current - 1, 0));
    }
    if (event.key === "Enter" && results[active]) {
      window.location.href = hrefFor(results[active]);
    }
  }

  return (
    <>
      <button onClick={() => setOpen(true)} className={mobile ? "flex w-full items-center gap-3 border-b border-black/5 py-4 font-semibold" : "grid h-11 w-11 place-items-center rounded-full border border-white/30 text-white transition hover:bg-white hover:text-ink"} aria-label="Search Pink Beauty">
        <Search size={mobile ? 18 : 16} />{mobile && "Search"}
      </button>
      {open && <div className="fixed inset-0 z-[100] bg-[#16010d]/75 p-3 text-ink backdrop-blur-md sm:p-6" onMouseDown={(event) => { if (event.target === event.currentTarget) close(); }}>
        <div className="mx-auto mt-12 max-w-2xl overflow-hidden rounded-2xl bg-white shadow-luxe sm:mt-20 sm:rounded-[2rem]">
          <div className="flex items-center gap-3 border-b border-black/5 px-4 sm:px-6"><Search size={18} className="shrink-0 text-pink" /><input ref={inputRef} value={query} onChange={(event) => { setQuery(event.target.value); setActive(0); }} onKeyDown={keyDown} placeholder="Search treatments, courses, locations..." className="min-w-0 flex-1 bg-transparent py-5 text-sm outline-none sm:py-6 sm:text-base" /><button onClick={close} aria-label="Close search" className="p-2"><X size={18} /></button></div>
          <div className="max-h-[65vh] overflow-y-auto p-2 sm:p-3">
            {results.length ? results.map((item, index) => <Link onMouseEnter={() => setActive(index)} onClick={close} href={hrefFor(item)} key={item.id} className={`flex items-center justify-between gap-4 rounded-xl p-3 transition sm:p-4 ${active === index ? "bg-pink-light/60" : "hover:bg-cream"}`}><div><p className="text-[8px] font-bold uppercase tracking-[.16em] text-pink sm:text-[9px]">{item.category}</p><p className="mt-1 font-display text-xl leading-none sm:text-2xl">{item.title}</p><p className="mt-1.5 line-clamp-1 text-[10px] text-black/40 sm:text-xs">{item.description}</p></div><ArrowUpRight size={16} className="shrink-0 text-pink" /></Link>) : <div className="p-7 text-center"><p className="font-display text-2xl">No exact match found.</p><Link onClick={close} href={`/contact?search=${encodeURIComponent(query)}`} className="mt-3 inline-flex text-xs font-bold text-pink">Ask our team about “{query}”</Link></div>}
          </div>
          <div className="hidden items-center justify-between border-t border-black/5 px-6 py-3 text-[9px] uppercase tracking-[.12em] text-black/30 sm:flex"><span>Use ↑ ↓ to navigate · Enter to open</span><span>⌘K to search</span></div>
        </div>
      </div>}
    </>
  );
}
