import type { Metadata } from "next";
import Image from "next/image";
import westStreetCatalog from "@/data/west-street-catalog.json";
import { getProposedCatalogImage } from "@/lib/catalog-image-proposals";
import type { CatalogItem } from "@/lib/catalog";

export const metadata: Metadata = { title: "Catalogue image review", robots: { index: false, follow: false } };

export default function CatalogImageReviewPage() {
  const items = westStreetCatalog as CatalogItem[];
  return <main className="bg-cream">
    <section className="bg-[#210013] pb-10 pt-28 text-white sm:pt-36"><div className="container-site"><p className="text-[10px] font-bold uppercase tracking-[.3em] text-pink-light">Local review · Not indexed</p><h1 className="mt-3 font-display text-5xl sm:text-7xl">Catalogue image review.</h1><p className="mt-4 max-w-2xl text-sm leading-7 text-white/60">Compare every current catalogue image with its proposed replacement. Genuine retail product pack shots are intentionally retained.</p></div></section>
    <section className="section-shell"><div className="container-site"><div className="grid gap-5">{items.map((item) => { const proposed = getProposedCatalogImage(item); const retained = proposed === item.images[0]; return <article key={item.handle} className="overflow-hidden rounded-2xl bg-white shadow-soft"><div className="grid sm:grid-cols-2"><ReviewImage label="Existing" src={item.images[0]} title={item.title} /><ReviewImage label={retained ? "Retained · genuine product image" : "Proposed"} src={proposed} title={item.title} /></div><div className="flex flex-col gap-2 p-5 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-[9px] font-bold uppercase tracking-[.16em] text-pink">{item.kind} · {item.tags.join(" · ") || "Uncategorised"}</p><h2 className="mt-1 font-display text-2xl">{item.title}</h2></div><code className="max-w-full overflow-hidden text-ellipsis whitespace-nowrap text-[9px] text-black/35">{item.handle}</code></div></article>; })}</div></div></section>
  </main>;
}

function ReviewImage({ label, src, title }: { label: string; src: string; title: string }) {
  return <div><p className="bg-pink-light px-4 py-2 text-[9px] font-bold uppercase tracking-[.16em] text-pink">{label}</p><div className="relative aspect-[4/3] bg-pink-light/40"><Image src={src} alt={`${label} image for ${title}`} fill className="object-cover" sizes="(min-width: 640px) 50vw, 100vw" /></div></div>;
}
