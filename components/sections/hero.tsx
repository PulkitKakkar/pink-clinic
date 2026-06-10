import Image from "next/image";
import Link from "next/link";
import { ArrowDown, Star } from "lucide-react";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-[#230013] text-white lg:min-h-[720px]">
      <Image src="https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=2200&q=90" alt="Luxury Pink Beauty salon" fill priority className="object-cover object-center opacity-75" sizes="100vw" />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(34,0,19,.92)_0%,rgba(72,0,42,.64)_48%,rgba(228,1,127,.28)_100%)]" />
      <div className="noise absolute inset-0 opacity-40" />
      <div className="container-site relative flex pb-10 pt-28 sm:pb-14 sm:pt-36 lg:min-h-[720px] lg:items-center lg:py-32">
        <div className="max-w-3xl">
          <div className="mb-4 flex items-center gap-3 text-[9px] font-bold uppercase tracking-[.28em] text-white/75 sm:mb-6 sm:text-[10px]"><span className="h-px w-8 bg-pink" />Reading’s beauty destination</div>
          <h1 className="font-display text-[clamp(3.6rem,10vw,8.5rem)] leading-[.82] tracking-[-.065em]">Beauty.<br /><span className="text-pink">Confidence.</span><br />Success.</h1>
          <p className="mt-5 max-w-xl text-sm leading-6 text-white/75 sm:mt-7 sm:text-lg sm:leading-7">Choose your journey with Pink Beauty Salon. Advanced treatments and career-shaping education, delivered by experts.</p>
          <div className="mt-6 flex gap-2 sm:mt-8 sm:gap-3"><Link href="/treatments/select-branch" className="button-primary">Explore treatments</Link><Link href="/courses" className="button-outline">Explore courses</Link></div>
          <div className="mt-6 flex items-center gap-3 text-[10px] text-white/70 sm:mt-10 sm:gap-4 sm:text-xs"><div className="flex text-[#ffcb69]">{[1,2,3,4,5].map(i => <Star key={i} size={12} fill="currentColor" />)}</div><span><strong className="text-white">4.9</strong> from 500+ client reviews</span></div>
        </div>
      </div>
      <a href="#journey" className="absolute bottom-8 right-8 hidden items-center gap-3 text-[10px] font-bold uppercase tracking-[.2em] text-white/55 sm:flex">Discover <span className="grid h-10 w-10 place-items-center rounded-full border border-white/25"><ArrowDown size={15} /></span></a>
    </section>
  );
}
