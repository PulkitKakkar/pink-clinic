import Link from "next/link";
import { Instagram, MapPin, Phone } from "lucide-react";
import { locations } from "@/lib/content";

export function Footer() {
  return (
    <footer className="bg-[#16010d] py-10 text-white sm:py-16">
      <div className="container-site grid gap-8 sm:gap-12 md:grid-cols-2 lg:grid-cols-4">
        <div><p className="font-display text-4xl">pink beauty</p><p className="mt-5 max-w-xs text-sm leading-7 text-white/55">Expert beauty, aesthetics and accredited training in the heart of Reading.</p></div>
        <div><p className="text-xs font-bold uppercase tracking-[.2em] text-pink">Explore</p><div className="mt-5 grid gap-3 text-sm text-white/65"><Link href="/treatments/select-branch">Treatments</Link><Link href="/courses">Academy courses</Link><Link href="/#results">Results</Link><Link href="/contact">Contact</Link></div></div>
        <div><p className="text-xs font-bold uppercase tracking-[.2em] text-pink">Visit us</p><div className="mt-5 grid gap-4">{locations.map(location => <Link key={location.slug} href={`/locations/${location.slug}`} className="flex gap-3 text-sm leading-6 text-white/65"><MapPin size={16} className="mt-1 shrink-0 text-pink" />{location.address}</Link>)}</div></div>
        <div><p className="text-xs font-bold uppercase tracking-[.2em] text-pink">Connect</p><div className="mt-5 grid gap-3"><a href="tel:01189627111" className="flex items-center gap-3 text-sm text-white/65"><span className="grid h-10 w-10 place-items-center rounded-full border border-white/15"><Phone size={16} /></span>Call Pink Beauty</a>{locations.map(location => <a key={location.id} href={location.instagramUrl} target="_blank" rel="noreferrer" className="flex items-center gap-3 text-sm text-white/65 transition hover:text-white"><span className="grid h-10 w-10 place-items-center rounded-full border border-white/15"><Instagram size={16} /></span>{location.name} Instagram</a>)}</div></div>
      </div>
      <div className="container-site mt-8 flex flex-col gap-2 border-t border-white/10 pt-5 text-[10px] text-white/35 sm:mt-14 sm:flex-row sm:justify-between sm:pt-7 sm:text-xs"><p>© {new Date().getFullYear()} Pink Beauty Salon & Academy.</p><p>Beauty. Confidence. Success.</p></div>
    </footer>
  );
}
