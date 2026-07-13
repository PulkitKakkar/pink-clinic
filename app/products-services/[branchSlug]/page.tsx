import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CatalogBrowser } from "@/components/catalog/catalog-browser";
import { branches, getBranchBySlug } from "@/lib/branches";
import { getBranchCatalog } from "@/lib/catalog";

export function generateStaticParams() { return branches.map((branch) => ({ branchSlug: branch.slug })); }

export async function generateMetadata({ params }: { params: Promise<{ branchSlug: string }> }): Promise<Metadata> {
  const branch = getBranchBySlug((await params).branchSlug);
  return branch ? { title: `Products & services at ${branch.name}`, description: `Browse products, salon services, clinic treatments and academy courses at ${branch.name}.` } : {};
}

export default async function ProductsServicesPage({ params }: { params: Promise<{ branchSlug: string }> }) {
  const branch = getBranchBySlug((await params).branchSlug);
  if (!branch) notFound();
  const items = await getBranchCatalog(branch.slug);
  return <main><section className="bg-[#210013] pb-12 pt-28 text-white sm:pb-20 sm:pt-36"><div className="container-site"><p className="text-[10px] font-bold uppercase tracking-[.3em] text-pink-light">{branch.name}</p><h1 className="mt-3 max-w-4xl font-display text-5xl leading-[.92] tracking-[-.05em] sm:text-8xl">Products & services.</h1><p className="mt-5 max-w-2xl text-sm leading-7 text-white/60">Explore treatments, salon services, academy courses and retail products currently available at this branch.</p></div></section><section className="section-shell bg-cream"><div className="container-site">{items.length ? <CatalogBrowser items={items} branchId={branch.id} /> : <div className="rounded-[2rem] bg-white p-8 text-center shadow-soft sm:p-14"><p className="eyebrow justify-center">Coming soon</p><h2 className="font-display text-4xl">{branch.name} prices are being prepared.</h2><p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-black/50">Contact our team for current services and prices while we prepare the full online catalogue.</p><Link href={`/contact?branchId=${branch.id}`} className="button-primary mt-6">Contact this branch</Link></div>}</div></section></main>;
}
