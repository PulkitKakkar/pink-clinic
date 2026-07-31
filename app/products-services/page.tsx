import type { Metadata } from "next";
import Link from "next/link";
import { CatalogBrowser } from "@/components/catalog/catalog-browser";
import { getCombinedCatalog } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Products, treatments & services",
  description: "Browse Pink Beauty products and treatments, compare branch prices, then choose where to book or buy.",
  alternates: { canonical: "/products-services" },
};

export default async function ProductsServicesPage() {
  const items = (await getCombinedCatalog()).filter((item) => item.kind !== "course");
  return <main>
    <section className="bg-[#210013] pb-12 pt-28 text-white sm:pb-20 sm:pt-36"><div className="container-site">
      <p className="text-[10px] font-bold uppercase tracking-[.3em] text-pink-light">All Pink Beauty locations</p>
      <h1 className="mt-3 max-w-4xl font-display text-5xl leading-[.92] tracking-[-.05em] sm:text-8xl">Products & services.</h1>
      <p className="mt-5 max-w-2xl text-sm leading-7 text-white/60">Browse without choosing a branch. Open an item to compare availability and prices at both Reading locations, then choose the option that suits you.</p><div className="mt-6 flex flex-wrap gap-5"><Link href="/treatment-finder" className="button-primary">Help me choose</Link><Link href="/courses" className="inline-flex min-h-11 items-center text-xs font-bold text-pink-light underline underline-offset-4">View academy courses</Link></div>
    </div></section>
    <section className="section-shell bg-cream"><div className="container-site"><CatalogBrowser items={items} combined /></div></section>
  </main>;
}
