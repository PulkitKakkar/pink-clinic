import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function PinkStory() {
  return (
    <section id="our-story" className="section-shell overflow-hidden bg-cream">
      <div className="container-site grid gap-8 lg:grid-cols-[.9fr_1.1fr] lg:items-center lg:gap-16">
        <div className="relative min-h-[380px] overflow-hidden rounded-[2rem] bg-pink-light sm:min-h-[560px]">
          <Image src="/images/west-street.jpg" alt="Pink Beauty's West Street salon in Reading" fill className="object-cover" sizes="(min-width: 1024px) 45vw, 100vw" />
          <div className="absolute inset-x-4 bottom-4 rounded-2xl bg-[#210013]/90 p-5 text-white backdrop-blur sm:inset-x-6 sm:bottom-6 sm:p-7">
            <p className="text-[9px] font-bold uppercase tracking-[.2em] text-pink-light">Two Reading locations</p>
            <p className="mt-2 font-display text-2xl leading-tight sm:text-3xl">One Pink standard of care.</p>
          </div>
        </div>
        <div>
          <p className="eyebrow">Our story</p>
          <h2 className="section-title">Born in Reading.<br /><em className="font-normal text-pink">Built around confidence.</em></h2>
          <div className="mt-6 grid gap-4 text-sm leading-7 text-black/55">
            <p>Pink began with a simple belief: beauty appointments should feel personal, honest and empowering. From our first Reading salon, we have grown into two distinct destinations with one shared approach to exceptional care.</p>
            <p>Today, West Street brings together everyday beauty, hair and salon rituals, while Watlington Street is home to advanced aesthetics, skin treatments and Pink Academy. Across both, our experienced team combines trusted techniques, modern technology and advice tailored to the person in front of us.</p>
          </div>
          <div className="mt-7 flex flex-wrap gap-5">
            <Link href="/locations" className="button-primary">Discover our locations</Link>
            <Link href="/#team" className="inline-flex min-h-12 items-center gap-2 text-xs font-bold uppercase tracking-[.14em] text-pink">Meet the Pink team <ArrowRight size={15} /></Link>
          </div>
        </div>
      </div>
    </section>
  );
}
