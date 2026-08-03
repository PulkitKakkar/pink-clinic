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
    <section className="relative overflow-hidden border-t-[10px] border-pink bg-pink-light/60 py-12 text-ink sm:py-20 lg:py-24">
      <div className="absolute -right-32 -top-32 h-80 w-80 rounded-full bg-pink/10 blur-3xl" aria-hidden="true" />
      <div className="container-site relative">
        <div className="grid gap-8 lg:grid-cols-[.8fr_1.2fr] lg:items-end lg:gap-16">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[.3em] text-pink">
              Pink Beauty Academy
            </p>
            <h2 className="mt-4 max-w-2xl font-display text-5xl leading-[.95] tracking-[-.045em] sm:text-7xl">
              Learn the craft. <em className="font-normal text-pink">Build your future.</em>
            </h2>
          </div>
          <div className="lg:pb-2">
            <p className="max-w-xl text-sm leading-7 text-black/60 sm:text-base sm:leading-8">
              Practical beauty training for new and experienced professionals, taught by educators who understand the treatment room as well as the classroom.
            </p>
            <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3 text-xs font-bold text-black/70">
              <span className="flex items-center gap-2"><Award size={16} className="text-pink" /> Accredited learning</span>
              <span className="flex items-center gap-2"><Users size={16} className="text-pink" /> Hands-on training</span>
              <span className="flex items-center gap-2"><BriefcaseBusiness size={16} className="text-pink" /> Career-ready skills</span>
            </div>
          </div>
        </div>

        <div className="mt-9 grid grid-cols-2 gap-3 sm:mt-12 sm:gap-4">
          {displayCourses.map((course) => {
            const prices = course.branchItems.flatMap(({ item }) => item.variants.map((variant) => variant.price));
            const startingPrice = prices.length ? Math.min(...prices) : null;
            return (
              <Link
                key={course.handle}
                href={`/products-services/item/${course.handle}`}
                className="group overflow-hidden rounded-[1.5rem] border border-pink/10 bg-white text-ink shadow-soft"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-pink-light">
                  {course.images[0] && <Image src={course.images[0]} alt="" fill className="object-cover transition duration-500 group-hover:scale-105" sizes="(min-width: 768px) 33vw, 100vw" />}
                  <span className="absolute left-4 top-4 rounded-full bg-[#210013]/90 px-3 py-2 text-[9px] font-bold uppercase tracking-[.18em] text-white backdrop-blur">
                    Academy course
                  </span>
                </div>
                <div className="p-3 sm:p-6">
                  <h3 className="font-display text-xl leading-[1.05] sm:text-3xl">{course.title}</h3>
                  <div className="mt-4 flex flex-col items-start justify-between gap-3 border-t border-black/5 pt-4 sm:mt-5 sm:flex-row sm:items-end sm:gap-4">
                    <p className="text-xs text-black/45">{startingPrice !== null ? <>From <strong className="text-sm text-ink">£{startingPrice.toLocaleString("en-GB")}</strong></> : "Enquire for pricing"}</p>
                    <span className="flex items-center gap-2 text-xs font-bold text-pink">View course <ArrowRight size={14} /></span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/courses" className="button-primary">Explore all academy courses <ArrowRight size={15} /></Link>
          <Link href="/contact?type=course" className="inline-flex min-h-12 items-center justify-center rounded-full border border-pink/25 bg-white px-7 text-sm font-bold text-pink transition hover:-translate-y-0.5 hover:border-pink">Talk to the academy team</Link>
        </div>
      </div>
    </section>
  );
}
