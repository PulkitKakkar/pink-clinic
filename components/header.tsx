"use client";

import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { SiteSearch } from "@/components/site-search";
import { BasketLink } from "@/components/basket-link";
import { OfferBanner, type Promotion } from "@/components/offer-banner";

const links = [
  ["Treatments", "/products-services"],
  ["Find a Treatment", "/treatment-finder"],
  ["Academy Courses", "/courses"],
  ["Reviews", "/#reviews"],
  ["Locations", "/locations"],
];

const lightHeaderRoutes = ["/concerns/", "/checkout/"];

export function usesLightHeader(pathname: string) {
  return lightHeaderRoutes.some((route) => pathname.startsWith(route));
}

export function Header({ offers = [] }: { offers?: Promotion[] }) {
  const pathname = usePathname();
  const lightHeader = usesLightHeader(pathname);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  return (
    <header className={`absolute inset-x-0 top-0 z-50 border-b ${lightHeader ? "border-black/10 text-ink" : "border-white/15 text-white"}`}>
      <div className="container-site relative flex h-20 items-center justify-center xl:h-32 xl:flex-col">
        <div className="flex h-full items-center justify-center xl:h-[72px] xl:w-full">
          <Link
            href="/"
            className={`flex items-center justify-center transition hover:scale-[1.02] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 ${lightHeader ? "focus-visible:outline-pink" : "focus-visible:outline-white"}`}
            aria-label="Pink Beauty home"
          >
            <Image
              src="/images/pink-logo.jpeg"
              alt="Pink Beauty"
              width={128}
              height={64}
              className="h-16 w-32 rounded-md object-cover xl:h-[72px] xl:w-36"
              priority
            />
          </Link>
        </div>
        <div className={`hidden h-14 w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-5 border-t xl:grid ${lightHeader ? "border-black/10" : "border-white/10"}`}>
          <nav className="flex min-w-0 items-center justify-between gap-4 pr-2">
            {links.map(([label, href]) => (
              <Link
                key={label}
                href={href}
                className={`inline-flex min-h-11 items-center text-xs font-bold uppercase tracking-[.12em] transition 2xl:text-[13px] 2xl:tracking-[.14em] ${lightHeader ? "text-ink/70 hover:text-pink" : "text-white/80 hover:text-white"}`}
              >
                {label}
              </Link>
            ))}
          </nav>
          <div className="flex shrink-0 items-center gap-3">
            <Link
              href="/learner-login"
              className={`inline-flex min-h-11 items-center rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-[.12em] transition ${lightHeader ? "border-black/15 text-ink hover:border-pink hover:text-pink" : "border-white/35 text-white hover:border-white hover:bg-white hover:text-ink"}`}
            >
              Learner portal
            </Link>
            <SiteSearch lightHeader={lightHeader} />
            <BasketLink />
          </div>
        </div>
        <div className="absolute right-[4.5rem] sm:right-[5.25rem] xl:hidden">
          <BasketLink mobileHeader lightHeader={lightHeader} onNavigate={() => setOpen(false)} />
        </div>
        <button
          onClick={() => setOpen(!open)}
          className={`absolute right-5 grid h-11 w-11 place-items-center rounded-full border sm:right-8 xl:hidden ${lightHeader ? "border-black/20" : "border-white/30"}`}
          aria-label="Toggle navigation"
          aria-expanded={open}
          aria-controls="mobile-navigation"
        >
          {open ? <X /> : <Menu />}
        </button>
      </div>
      <OfferBanner offers={offers} />
      {open && (
        <nav
          id="mobile-navigation"
          className="mx-4 max-h-[calc(100dvh-6rem)] overflow-y-auto rounded-3xl bg-white p-5 text-ink shadow-luxe xl:hidden"
        >
          <SiteSearch mobile onNavigate={() => setOpen(false)} />
          {links.map(([label, href]) => (
            <Link
              onClick={() => setOpen(false)}
              key={label}
              href={href}
              className="block border-b border-black/5 py-4 font-semibold"
            >
              {label}
            </Link>
          ))}
          <Link
            onClick={() => setOpen(false)}
            href="/learner-login"
            className="mt-4 block rounded-full bg-[#210013] px-5 py-3 text-center text-xs font-bold uppercase tracking-[.14em] text-white"
          >
            Learner portal
          </Link>
          <BasketLink mobile onNavigate={() => setOpen(false)} />
        </nav>
      )}
    </header>
  );
}
