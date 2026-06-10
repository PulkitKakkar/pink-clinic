import type { Metadata } from "next";
import { Award, BriefcaseBusiness, Users } from "lucide-react";
import { PageHero } from "@/components/page-hero";
import { AppointmentCta } from "@/components/sections/cta";
import Link from "next/link";

export const metadata: Metadata = { title: "Accredited Beauty Courses Reading", description: "Professional, accredited beauty training and courses at Pink Beauty Academy in Reading." };
const courses = ["VTCT Beauty Therapy", "Laser & IPL", "Semi-Permanent Makeup", "Facial & Skincare", "Waxing", "Gel Manicure & Pedicure"];

export default function CoursesPage() {
  return <main><PageHero eyebrow="Pink Beauty Academy" title="Turn passion into profession." copy="Accredited, practical beauty training from experienced educators who understand what it takes to build a successful career." image="https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?auto=format&fit=crop&w=2200&q=90" /><section className="bg-white py-24"><div className="container-site"><div className="grid gap-4 md:grid-cols-3">{[[Award,"Accredited learning"],[Users,"Small class sizes"],[BriefcaseBusiness,"Business-ready skills"]].map(([Icon,title]) => { const I = Icon as typeof Award; return <article key={title as string} className="rounded-[1.5rem] bg-pink-light/50 p-7"><I className="text-pink" /><h2 className="mt-7 font-display text-3xl">{title as string}</h2></article>})}</div><div className="mt-20 grid gap-12 lg:grid-cols-[.75fr_1.25fr]"><div><p className="eyebrow">Study with Pink</p><h2 className="section-title">Courses built for your future.</h2><p className="mt-6 text-sm leading-7 text-black/50">From your first qualification to advanced specialisms, our educators combine theory, practical confidence and commercial insight.</p></div><div className="grid gap-3 sm:grid-cols-2">{courses.map((course,i) => <Link href="/contact?type=course" key={course} className="group flex min-h-36 flex-col justify-between rounded-[1.5rem] border border-black/5 bg-cream p-6 transition hover:-translate-y-1 hover:shadow-soft"><span className="text-xs text-pink">0{i+1}</span><h3 className="font-display text-2xl">{course}</h3></Link>)}</div></div></div></section><AppointmentCta /></main>;
}
