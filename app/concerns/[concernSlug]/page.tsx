import type { Metadata } from "next";
import Link from "next/link";
import { Check } from "lucide-react";
import { notFound } from "next/navigation";
import { CatalogBrowser } from "@/components/catalog/catalog-browser";
import { getCombinedCatalog } from "@/lib/catalog";
import { getConcernBySlug, matchesConcern, treatmentConcerns } from "@/lib/concerns";

type PageProps = { params: Promise<{ concernSlug: string }> };
export function generateStaticParams() { return treatmentConcerns.map((concern) => ({ concernSlug: concern.slug })); }
export async function generateMetadata({ params }: PageProps): Promise<Metadata> { const concern = getConcernBySlug((await params).concernSlug); return concern ? { title: `${concern.name} in Reading`, description: `${concern.description} Compare treatment availability and prices across Pink Beauty's Reading clinics.`, alternates: { canonical: `/concerns/${concern.slug}` } } : {}; }

export default async function ConcernPage({ params }: PageProps) {
  const concern = getConcernBySlug((await params).concernSlug);
  if (!concern) notFound();
  const items = (await getCombinedCatalog()).filter((item) => item.kind === "service" && matchesConcern(item, concern));
  return <main><section className="bg-[#210013] pb-12 pt-28 text-white sm:pb-20 sm:pt-36"><div className="container-site"><Link href="/products-services" className="text-[10px] font-bold uppercase tracking-[.2em] text-pink-light">Treatments by concern</Link><h1 className="mt-4 max-w-4xl font-display text-5xl leading-[.92] tracking-[-.05em] sm:text-8xl">{concern.name}<br /><em className="font-normal text-pink">in Reading.</em></h1><p className="mt-6 max-w-2xl text-sm leading-7 text-white/65">{concern.description}</p></div></section><section className="section-shell bg-white"><div className="container-site grid gap-8 lg:grid-cols-[.8fr_1.2fr] lg:items-start"><div><p className="eyebrow">Your goals</p><h2 className="section-title">A plan built around your skin and priorities.</h2></div><div className="grid gap-3">{concern.goals.map((goal) => <div key={goal} className="flex gap-3 rounded-2xl bg-cream p-5 text-sm font-bold"><span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-pink text-white"><Check size={12} /></span>{goal}</div>)}<p className="mt-3 text-xs leading-6 text-black/50">Treatment suitability, likely response and any downtime are discussed during consultation. Results vary and cannot be guaranteed.</p></div></div></section><section className="section-shell bg-cream"><div className="container-site"><p className="eyebrow">Relevant treatments</p><h2 className="section-title">Compare your options.</h2><p className="mt-4 max-w-2xl text-sm leading-7 text-black/50">Browse without choosing a branch. Open a treatment to compare availability and prices at both Pink locations.</p><div className="mt-8"><CatalogBrowser items={items} combined hideTypeFilters collectionEyebrow="More ways to browse" collectionTitle="Treatment collections" /></div></div></section><section className="section-shell bg-[#210013] text-white"><div className="container-site text-center"><p className="text-[10px] font-bold uppercase tracking-[.25em] text-pink-light">Still unsure?</p><h2 className="mx-auto mt-3 max-w-3xl font-display text-5xl leading-none">Get a more personal starting point.</h2><div className="mt-7 flex flex-wrap justify-center gap-3"><Link href="/treatment-finder" className="button-primary">Try the treatment finder</Link><Link href="/contact" className="button-outline">Contact Pink</Link></div></div></section></main>;
}
