import type { Metadata } from "next";
import Link from "next/link";
import { TreatmentFinder } from "@/components/catalog/treatment-finder";
import { getCombinedCatalog } from "@/lib/catalog";

export const metadata: Metadata = { title: "Find a treatment", description: "Explore Pink Beauty treatments by concern, downtime preference and personal goals before your consultation.", alternates: { canonical: "/treatment-finder" } };

export default async function TreatmentFinderPage() {
  const items = (await getCombinedCatalog()).filter((item) => item.kind === "service");
  return <main><section className="bg-[#210013] pb-12 pt-28 text-white sm:pb-20 sm:pt-36"><div className="container-site"><p className="text-[10px] font-bold uppercase tracking-[.3em] text-pink-light">Not sure where to start?</p><h1 className="mt-3 max-w-4xl font-display text-5xl leading-[.92] tracking-[-.05em] sm:text-8xl">Find your treatment.</h1><p className="mt-5 max-w-2xl text-sm leading-7 text-white/60">Answer three quick questions and explore relevant starting points. No diagnosis, pressure or guaranteed outcomes—just a clearer way into the Pink catalogue.</p></div></section><section className="section-shell bg-cream"><div className="container-site"><TreatmentFinder items={items} /><p className="mt-10 text-center text-xs leading-6 text-black/45">Need personal advice? <Link href="/contact" className="font-bold text-pink underline underline-offset-4">Speak to the Pink team.</Link></p></div></section></main>;
}
