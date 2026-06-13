import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { locations } from "@/lib/content";

const teamCopy = [
  "Beauty specialists focused on thoughtful service, confidence and the details that make every visit feel personal.",
  "Advanced aesthetic practitioners and educators delivering consultation-led treatments and professional training.",
];

export function Team() {
  return (
    <section id="team" className="section-shell bg-[#19010e] text-white">
      <div className="container-site">
        <div className="grid gap-7 lg:grid-cols-[.75fr_1.25fr] lg:items-end lg:gap-12">
          <div>
            <p className="eyebrow">Meet our team</p>
            <h2 className="section-title !text-white">Expert hands.<br />A personal approach.</h2>
            <p className="mt-4 max-w-md text-sm leading-7 text-white/55">Across both Reading locations, our team combines technical expertise with considered, honest care.</p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:gap-5">
            {locations.map((location, index) => <Link href={`/locations/${location.slug}`} key={location.id} className="group overflow-hidden rounded-2xl border border-white/10 bg-white/5 sm:rounded-[1.5rem]"><div className="relative aspect-[4/3] overflow-hidden"><Image src={location.image} alt={`${location.name} Pink Beauty team`} fill className="object-cover transition duration-700 group-hover:scale-105" sizes="(min-width: 1024px) 32vw, 50vw" /><div className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent" /></div><div className="p-3.5 sm:p-6"><p className="text-[8px] font-bold uppercase tracking-[.16em] text-pink-light sm:text-[10px]">{location.name}</p><p className="mt-2 hidden text-xs leading-5 text-white/55 sm:block">{teamCopy[index]}</p><span className="mt-3 inline-flex items-center gap-1.5 text-[8px] font-bold uppercase tracking-[.12em] sm:mt-5 sm:text-[10px]">Meet the branch <ArrowUpRight size={13} /></span></div></Link>)}
          </div>
        </div>
      </div>
    </section>
  );
}
