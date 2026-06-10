import Image from "next/image";
import Link from "next/link";
import { ArrowDown, Star } from "lucide-react";
import { BookingLink } from "@/components/ui/booking-link";

export function Hero() {
  return (
    <section className="relative min-h-[92svh] overflow-hidden bg-[#230013] text-white">
      <Image src="https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=2200&q=90" alt="Luxury Pink Beauty salon" fill priority className="object-cover object-center opacity-75" sizes="100vw" />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(34,0,19,.92)_0%,rgba(72,0,42,.64)_48%,rgba(228,1,127,.28)_100%)]" />
      <div className="noise absolute inset-0 opacity-40" />
      <div className="container-site relative flex min-h-[92svh] items-end pb-16 pt-36 sm:items-center sm:pb-0">
        <div className="max-w-3xl">
          <div className="mb-6 flex items-center gap-3 text-[10px] font-bold uppercase tracking-[.28em] text-white/75"><span className="h-px w-8 bg-pink" />Reading’s beauty destination</div>
          <h1 className="font-display text-[clamp(4rem,10vw,8.5rem)] leading-[.82] tracking-[-.065em]">Beauty.<br /><span className="text-pink">Confidence.</span><br />Success.</h1>
          <p className="mt-7 max-w-xl text-base leading-7 text-white/75 sm:text-lg">Choose your journey with Pink Beauty Salon. Advanced treatments and career-shaping education, delivered by experts.</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row"><BookingLink label="Explore treatments" intent={{ source: "hero-treatments" }} /><Link href="/courses" className="button-outline">Explore courses</Link></div>
          <div className="mt-10 flex items-center gap-4 text-xs text-white/70"><div className="flex text-[#ffcb69]">{[1,2,3,4,5].map(i => <Star key={i} size={13} fill="currentColor" />)}</div><span><strong className="text-white">4.9</strong> from 500+ client reviews</span></div>
        </div>
      </div>
      <a href="#journey" className="absolute bottom-8 right-8 hidden items-center gap-3 text-[10px] font-bold uppercase tracking-[.2em] text-white/55 sm:flex">Discover <span className="grid h-10 w-10 place-items-center rounded-full border border-white/25"><ArrowDown size={15} /></span></a>
    </section>
  );
}
