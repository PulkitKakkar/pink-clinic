import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Check, Clock, Layers3, MapPin, ShieldCheck, Sparkles } from "lucide-react";
import { notFound } from "next/navigation";
import { CatalogItemPurchase } from "@/components/catalog/catalog-item-purchase";
import { getCatalogGuidance } from "@/lib/catalog-guidance";
import { getCombinedCatalog } from "@/lib/catalog";
import { reviews } from "@/lib/content";

type PageProps = { params: Promise<{ itemHandle: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const handle = decodeURIComponent((await params).itemHandle);
  const item = (await getCombinedCatalog()).find((entry) => entry.handle === handle);
  if (!item) return {};
  const description = `${item.description || `Learn about ${item.title}`} Compare availability and prices at both Pink Beauty branches in Reading.`.slice(0, 158);
  return { title: `${item.title} in Reading`, description, alternates: { canonical: `/products-services/item/${item.handle}` }, openGraph: { title: `${item.title} at Pink Beauty`, description, images: item.images[0] ? [item.images[0]] : [] } };
}

export default async function CombinedCatalogItemPage({ params }: PageProps) {
  const handle = decodeURIComponent((await params).itemHandle);
  const item = (await getCombinedCatalog()).find((entry) => entry.handle === handle);
  if (!item) notFound();
  const guidance = getCatalogGuidance(item);
  return <main>
    <section className="bg-[#210013] pb-10 pt-24 text-white sm:pb-16 sm:pt-32"><div className="container-site grid gap-7 lg:grid-cols-[1.1fr_.9fr] lg:items-center lg:gap-12">
      <div><Link href="/products-services" className="text-[10px] font-bold uppercase tracking-[.16em] text-pink-light">Products & services</Link><p className="mt-5 text-[10px] font-bold uppercase tracking-[.25em] text-white/50">{item.tags.join(" · ") || item.kind}</p><h1 className="mt-3 font-display text-5xl leading-[.92] tracking-[-.05em] sm:text-7xl">{item.title}</h1><p className="mt-5 max-w-2xl text-sm leading-7 text-white/65">{item.description || guidance.overview}</p><p className="mt-5 flex gap-2 text-xs text-white/55"><MapPin size={15} className="shrink-0 text-pink-light" />Choose your branch and price below</p></div>
      <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-pink-light sm:rounded-[2rem]">{item.images[0] && <Image src={item.images[0]} alt={item.title} fill priority className="object-cover" sizes="(min-width: 1024px) 45vw, 100vw" />}</div>
    </div></section>
    <section id="branch-prices" className="section-shell scroll-mt-6 bg-cream"><div className="container-site"><p className="eyebrow">Choose where to purchase</p><h2 className="section-title">Branch prices & options.</h2><p className="mt-4 max-w-2xl text-sm leading-7 text-black/50">West Street is our central salon for everyday beauty and hair. Watlington Street is our advanced clinic and academy. Only locations offering this item are shown.</p><div className="mt-7 grid gap-5 lg:grid-cols-2">
      {item.branchItems.map(({ branch, item: branchItem }) => <article key={branch.id} className="rounded-2xl bg-[#210013] p-6 text-white shadow-soft sm:p-8"><p className="text-[10px] font-bold uppercase tracking-[.2em] text-pink-light">{branch.note}</p><h3 className="mt-2 font-display text-3xl">{branch.name}</h3><p className="mt-3 flex gap-2 text-xs leading-5 text-white/55"><MapPin size={14} className="mt-0.5 shrink-0 text-pink-light" />{branch.address}</p><CatalogItemPurchase item={branchItem} branch={branch} /></article>)}
    </div></div></section>
    <section className="section-shell bg-[#210013] text-white"><div className="container-site"><p className="text-[10px] font-bold uppercase tracking-[.22em] text-pink-light">At a glance</p><div className="mt-6 grid gap-px overflow-hidden rounded-2xl bg-white/10 sm:grid-cols-2 lg:grid-cols-4"><Detail icon={Clock} title="Appointment" text={guidance.duration} /><Detail icon={Sparkles} title="Expected result" text={guidance.expectedResults[0]} /><Detail icon={Layers3} title="Treatment plan" text={guidance.sessions} /><Detail icon={ShieldCheck} title="Downtime" text={guidance.downtime} /></div><p className="mt-4 text-[10px] leading-5 text-white/45">Timings, response and downtime are indicative only and are confirmed during consultation.</p></div></section>
    <section className="section-shell bg-white"><div className="container-site grid gap-8 lg:grid-cols-[.8fr_1.2fr] lg:gap-14"><div><p className="eyebrow">About this {item.kind === "product" ? "product" : "service"}</p><h2 className="section-title">What to know before you choose.</h2><p className="mt-5 text-sm leading-7 text-black/55">{guidance.overview}</p></div><div className="grid gap-4 sm:grid-cols-2"><InfoCard title="Before booking" items={guidance.prerequisites} /><InfoCard title="How to prepare" items={guidance.preparation} /><InfoCard title="Aftercare" items={guidance.aftercare} /><div className="rounded-2xl bg-[#210013] p-6 text-white sm:p-7"><p className="text-[10px] font-bold uppercase tracking-[.18em] text-pink-light">Important</p><p className="mt-3 text-sm leading-7 text-white/65">{guidance.suitabilityNote}</p></div></div></div></section>
    <section className="section-shell bg-cream"><div className="container-site grid gap-10 lg:grid-cols-2 lg:gap-16"><div><p className="eyebrow">Treatment details</p><h2 className="section-title">Results and treatment areas.</h2><InfoCard title="Expected results" items={guidance.expectedResults} /><div className="mt-4"><InfoCard title="Possible treatment areas" items={guidance.treatmentAreas} /></div></div><div><p className="eyebrow">Common questions</p><h2 className="section-title">Before you book.</h2><div className="mt-7 grid gap-3">{guidance.faqs.map((faq) => <details key={faq.question} className="rounded-2xl bg-white p-5"><summary className="cursor-pointer text-sm font-bold text-ink">{faq.question}</summary><p className="mt-3 text-xs leading-6 text-black/55">{faq.answer}</p></details>)}</div></div></div></section>
    {item.beforeAfter?.length ? <section className="section-shell bg-white"><div className="container-site"><p className="eyebrow">Real client results</p><h2 className="section-title">Before and after.</h2><p className="mt-4 max-w-2xl text-xs leading-6 text-black/50">Individual results vary. Images are published only with client consent and are not a guarantee of outcome.</p><div className="mt-7 grid gap-5 sm:grid-cols-2">{item.beforeAfter.map((result, index) => <figure key={`${result.before}-${index}`} className="grid grid-cols-2 overflow-hidden rounded-2xl bg-cream"><div className="relative aspect-square"><Image src={result.before} alt={result.alt ? `Before: ${result.alt}` : `Before ${item.title}`} fill className="object-cover" sizes="25vw" /><span className="absolute bottom-2 left-2 rounded-full bg-black/70 px-3 py-1 text-[9px] font-bold uppercase text-white">Before</span></div><div className="relative aspect-square"><Image src={result.after} alt={result.alt ? `After: ${result.alt}` : `After ${item.title}`} fill className="object-cover" sizes="25vw" /><span className="absolute bottom-2 left-2 rounded-full bg-pink px-3 py-1 text-[9px] font-bold uppercase text-white">After</span></div></figure>)}</div></div></section> : null}
    <section className="section-shell bg-white"><div className="container-site grid gap-8 lg:grid-cols-[.7fr_1.3fr] lg:items-center"><div><p className="eyebrow">Why Pink</p><h2 className="section-title">Experienced hands. Honest advice.</h2><p className="mt-4 text-sm leading-7 text-black/55">Every advanced treatment starts with suitability, realistic expectations and clear aftercare. If a treatment is not appropriate, the Pink team will tell you.</p></div><div className="grid gap-4 sm:grid-cols-2">{reviews.slice(0, 2).map((review) => <blockquote key={review.name} className="rounded-2xl bg-pink-light/45 p-6"><p className="text-sm leading-7 text-black/65">“{review.text}”</p><footer className="mt-4 text-xs font-bold text-pink">{review.name} · {review.service}</footer></blockquote>)}</div></div></section>
    <div className="sticky bottom-3 z-30 mx-auto mb-3 w-[calc(100%-1.5rem)] rounded-full bg-[#210013]/95 p-2 shadow-luxe backdrop-blur sm:hidden"><Link href="#branch-prices" className="button-primary w-full">View branch prices & book</Link></div>
  </main>;
}

function Detail({ icon: Icon, title, text }: { icon: typeof Clock; title: string; text: string }) { return <div className="bg-[#210013] p-5 sm:p-6"><Icon size={19} className="text-pink-light" /><p className="mt-5 text-[9px] font-bold uppercase tracking-[.18em] text-white/45">{title}</p><p className="mt-2 text-sm leading-6 text-white/75">{text}</p></div>; }

function InfoCard({ title, items }: { title: string; items: string[] }) {
  return <div className="rounded-2xl bg-cream p-6 sm:p-7"><h3 className="font-display text-2xl">{title}</h3><ul className="mt-4 grid gap-3">{items.map((item) => <li key={item} className="flex gap-3 text-xs leading-5 text-black/55"><span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-pink text-white"><Check size={11} /></span>{item}</li>)}</ul></div>;
}
