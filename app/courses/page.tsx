import type { Metadata } from "next";
import { Award, BriefcaseBusiness, Users } from "lucide-react";
import Link from "next/link";
import { PageHero } from "@/components/page-hero";
import { CourseCatalogue } from "@/components/catalog/course-catalogue";
import { branches } from "@/lib/branches";
import { getBranchCatalog } from "@/lib/catalog";

export const metadata: Metadata = { title: "Accredited Beauty Courses Reading", description: "Professional, accredited beauty training and courses at Pink Beauty Academy in Reading.", alternates: { canonical: "/courses" } };

export default async function CoursesPage() {
  const catalogues = await Promise.all(branches.map(async (branch) => ({
    branch,
    items: (await getBranchCatalog(branch.slug)).filter((item) => item.kind === "course"),
  })));
  return <main><PageHero eyebrow="Pink Beauty Academy" title="Turn passion into profession." copy="Accredited, practical beauty training from experienced educators who understand what it takes to build a successful career." image="https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?auto=format&fit=crop&w=2200&q=90" /><section className="section-shell bg-white"><div className="container-site"><div className="grid gap-3 md:grid-cols-3 sm:gap-4">{[[Award,"Ofqual-regulated learning"],[Users,"Practical assessment"],[BriefcaseBusiness,"Industry-recognised skills"]].map(([Icon,title]) => { const I = Icon as typeof Award; return <article key={title as string} className="flex items-center gap-4 rounded-2xl bg-pink-light/50 p-4 sm:block sm:rounded-[1.5rem] sm:p-7"><I className="shrink-0 text-pink" /><h2 className="font-display text-2xl sm:mt-7 sm:text-3xl">{title as string}</h2></article>})}</div><div className="mt-12 sm:mt-20"><div className="section-header"><p className="eyebrow">Study with Pink</p><h2 className="section-title">All academy courses.</h2><p className="mt-4 max-w-2xl text-sm leading-7 text-black/50">Browse every current course, then choose the academy location to see its accurate price and offer. Dates, assessments, kit requirements and enrolment terms are confirmed before payment.</p></div><CourseCatalogue catalogues={catalogues} /></div></div></section><section className="bg-[#210013] py-14 text-center text-white sm:py-20"><div className="container-site"><p className="eyebrow justify-center text-pink-light">Need help choosing?</p><h2 className="mx-auto mt-3 max-w-2xl font-display text-4xl sm:text-6xl">Talk to the academy team.</h2><p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-white/60">Ask about dates, prerequisites, accreditation, kits and payment options before you enrol.</p><Link href="/contact?type=course" className="button-light mt-7">Enquire about courses</Link></div></section></main>;
}
