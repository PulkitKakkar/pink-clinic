import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Award, BriefcaseBusiness, Users } from "lucide-react";
import type { CombinedCatalogItem } from "@/lib/catalog";

const featuredHandles = [
  "beauty-therapy-diploma",
  "facial-and-skincare-course",
  "ultimate-brow-masterclass-microblading-machine-ombre-powder-combination-course",
];

export function AcademyShowcase({ courses }: { courses: CombinedCatalogItem[] }) {
  const featured = featuredHandles
    .map((handle) => courses.find((course) => course.handle === handle))
    .filter((course): course is CombinedCatalogItem => Boolean(course));
  const displayCourses = [
    ...featured,
    ...courses.filter((course) => !featuredHandles.includes(course.handle)),
  ].slice(0, 4);

  if (!displayCourses.length) return null;

  return (
    <section className="relative overflow-hidden border-t-4 border-pink bg-[#31001c] py-12 text-white sm:py-20 lg:py-24">
      <div className="absolute -right-32 -top-32 h-80 w-80 rounded-full bg-pink/25 blur-3xl" aria-hidden="true" />
      <div className="container-site relative">
        <div className="grid gap-8 lg:grid-cols-[.85fr_1.15fr] lg:items-center lg:gap-16">
          <div className="relative min-h-[300px] overflow-hidden rounded-[2rem] bg-pink sm:min-h-[420px]">
            <Image
              src="/images/photoshoot/courses.jpg"
              alt="Pink Beauty Academy training"
              fill
              className="object-cover"
              sizes="(min-width: 1024px) 40vw, 100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#210013] via-[#210013]/20 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
              <p className="text-[10px] font-bold uppercase tracking-[.25em] text-pink-light">Pink Beauty Academy</p>
              <p className="mt-2 max-w-xs font-display text-3xl leading-none sm:text-4xl">Learn in the treatment room, not just the classroom.</p>
            </div>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[.3em] text-pink-light">Training for your next chapter</p>
            <h2 className="mt-4 max-w-2xl font-display text-5xl leading-[.95] tracking-[-.045em] sm:text-7xl">
              Learn the craft. <em className="font-normal text-pink">Build your future.</em>
            </h2>
            <p className="mt-6 max-w-xl text-sm leading-7 text-white/70 sm:text-base sm:leading-8">
              Practical beauty training for new and experienced professionals, taught by educators who understand the treatment room as well as the classroom.
            </p>
            <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3 text-xs font-bold text-white/80">
              <span className="flex items-center gap-2"><Award size={16} className="text-pink-light" /> VTCT qualifications</span>
              <span className="flex items-center gap-2"><Award size={16} className="text-pink-light" /> ABT-accredited training</span>
              <span className="flex items-center gap-2"><Users size={16} className="text-pink-light" /> Hands-on training</span>
              <span className="flex items-center gap-2"><BriefcaseBusiness size={16} className="text-pink-light" /> Career-ready skills</span>
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/courses" className="button-primary">Explore all academy courses <ArrowRight size={15} /></Link>
              <Link href="/contact?type=course" className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/25 px-7 text-sm font-bold text-white transition hover:border-white hover:bg-white hover:text-ink">Talk to the academy team</Link>
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {displayCourses.map((course, index) => {
            const prices = course.branchItems.flatMap(({ item }) => item.variants.map((variant) => variant.price));
            const startingPrice = prices.length ? Math.min(...prices) : null;
            return (
              <Link
                key={course.handle}
                href={`/products-services/item/${course.handle}`}
                className="group rounded-2xl border border-white/15 bg-white/5 p-5 transition hover:-translate-y-1 hover:border-pink hover:bg-white/10"
              >
                <span className="text-[10px] font-bold uppercase tracking-[.18em] text-pink-light">0{index + 1} · Academy course</span>
                <h3 className="mt-4 font-display text-2xl leading-[1.05]">{course.title}</h3>
                <div className="mt-5 flex items-center justify-between gap-3 border-t border-white/10 pt-4">
                  <p className="text-xs text-white/60">{startingPrice !== null ? <>From <strong className="text-sm text-white">£{startingPrice.toLocaleString("en-GB")}</strong></> : "Enquire for pricing"}</p>
                  <ArrowRight size={16} className="shrink-0 text-pink-light transition group-hover:translate-x-1" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
