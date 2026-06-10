import Link from "next/link";
import { Instagram, MapPin, Phone } from "lucide-react";
import { locations } from "@/lib/content";

export function Footer() {
  return (
    <footer className="bg-[#16010d] py-16 text-white">
      <div className="container-site grid gap-12 md:grid-cols-2 lg:grid-cols-4">
        <div><p className="font-display text-4xl">pink beauty</p><p className="mt-5 max-w-xs text-sm leading-7 text-white/55">Expert beauty, aesthetics and accredited training in the heart of Reading.</p></div>
        <div><p className="text-xs font-bold uppercase tracking-[.2em] text-pink">Explore</p><div className="mt-5 grid gap-3 text-sm text-white/65"><Link href="/services">Treatments</Link><Link href="/courses">Academy courses</Link><Link href="/#results">Results</Link><Link href="/contact">Contact</Link></div></div>
        <div><p className="text-xs font-bold uppercase tracking-[.2em] text-pink">Visit us</p><div className="mt-5 grid gap-4">{locations.map(location => <Link key={location.slug} href={`/locations/${location.slug}`} className="flex gap-3 text-sm leading-6 text-white/65"><MapPin size={16} className="mt-1 shrink-0 text-pink" />{location.address}</Link>)}</div></div>
        <div><p className="text-xs font-bold uppercase tracking-[.2em] text-pink">Connect</p><div className="mt-5 flex gap-3"><a href="tel:01189627111" className="grid h-11 w-11 place-items-center rounded-full border border-white/15"><Phone size={17} /></a><a href="https://instagram.com" className="grid h-11 w-11 place-items-center rounded-full border border-white/15"><Instagram size={17} /></a></div></div>
      </div>
      <div className="container-site mt-14 flex flex-col gap-2 border-t border-white/10 pt-7 text-xs text-white/35 sm:flex-row sm:justify-between"><p>© {new Date().getFullYear()} Pink Beauty Salon & Academy.</p><p>Beauty. Confidence. Success.</p></div>
    </footer>
  );
}
