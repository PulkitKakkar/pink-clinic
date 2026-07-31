import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check, MapPin } from "lucide-react";
import { notFound } from "next/navigation";
import { CatalogItemPurchase } from "@/components/catalog/catalog-item-purchase";
import { getBranchBySlug } from "@/lib/branches";
import { getBranchCatalog } from "@/lib/catalog";
import { getCatalogGuidance } from "@/lib/catalog-guidance";

type PageProps = {
  params: Promise<{ branchSlug: string; itemHandle: string }>;
};
const availabilitySchema = {
  in_stock: "InStock",
  out_of_stock: "OutOfStock",
  preorder: "PreOrder",
  backorder: "BackOrder",
} as const;
const conditionSchema = {
  new: "NewCondition",
  refurbished: "RefurbishedCondition",
  used: "UsedCondition",
} as const;

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { branchSlug, itemHandle } = await params;
  const branch = getBranchBySlug(branchSlug);
  const item = branch
    ? (await getBranchCatalog(branch.slug)).find(
        (entry) => entry.handle === decodeURIComponent(itemHandle),
      )
    : undefined;
  if (!branch || !item) return {};
  const description =
    `${item.description || `Learn about ${item.title}`} Available at ${branch.name} in Reading. View options, preparation guidance and aftercare information.`.slice(
      0,
      158,
    );
  return {
    title: `${item.title} in Reading | ${branch.name}`,
    description,
    alternates: {
      canonical: `/products-services/item/${item.handle}`,
    },
    openGraph: {
      title: `${item.title} at ${branch.name}`,
      description,
      images: item.images[0] ? [item.images[0]] : [],
    },
  };
}

export default async function CatalogItemPage({ params }: PageProps) {
  const { branchSlug, itemHandle } = await params;
  const branch = getBranchBySlug(branchSlug);
  if (!branch) notFound();
  const catalog = await getBranchCatalog(branch.slug);
  const item = catalog.find(
    (entry) => entry.handle === decodeURIComponent(itemHandle),
  );
  if (!item) notFound();
  const guidance = getCatalogGuidance(item);
  const priced = item.variants.filter((variant) => variant.price > 0);
  const related = catalog
    .filter(
      (entry) =>
        entry.handle !== item.handle &&
        entry.tags.some((tag) => item.tags.includes(tag)),
    )
    .slice(0, 3);
  const lowPrice = priced.length
    ? Math.min(...priced.map((variant) => variant.price))
    : undefined;
  const highPrice = priced.length
    ? Math.max(...priced.map((variant) => variant.price))
    : undefined;
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://pinkclinic.co.uk";
  const itemUrl = `${siteUrl}/products-services/${branch.slug}/${item.handle}`;
  const schema =
    item.kind === "product"
      ? {
          "@context": "https://schema.org",
          "@type": "Product",
          name: item.title,
          description: item.description || guidance.overview,
          image: item.images,
          url: itemUrl,
          brand: item.brand
            ? { "@type": "Brand", name: item.brand }
            : undefined,
          gtin: item.gtin || undefined,
          mpn: item.mpn || undefined,
          sku: priced.find((variant) => variant.sku)?.sku || undefined,
          offers: priced.map((variant) => ({
            "@type": "Offer",
            name: variant.name,
            price: variant.price.toFixed(2),
            priceCurrency: "GBP",
            url: itemUrl,
            sku: variant.sku || undefined,
            availability: item.merchantAvailability
              ? `https://schema.org/${availabilitySchema[item.merchantAvailability]}`
              : undefined,
            itemCondition: item.merchantCondition
              ? `https://schema.org/${conditionSchema[item.merchantCondition]}`
              : undefined,
            seller: { "@type": "Organization", name: "Pink Beauty" },
          })),
        }
      : {
          "@context": "https://schema.org",
          "@type": "Service",
          name: item.title,
          description: item.description || guidance.overview,
          image: item.images[0],
          url: itemUrl,
          provider: {
            "@type": "BeautySalon",
            name: branch.name,
            telephone: branch.phone,
            address: branch.address,
          },
          areaServed: "Reading, Berkshire",
          offers:
            lowPrice != null
              ? {
                  "@type": "AggregateOffer",
                  priceCurrency: "GBP",
                  lowPrice,
                  highPrice,
                  offerCount: priced.length,
                }
              : undefined,
        };

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <section className="bg-pink-berry pb-10 pt-24 text-white sm:pb-16 sm:pt-32">
        <div className="container-site grid gap-7 lg:grid-cols-[1.1fr_.9fr] lg:items-center lg:gap-12">
          <div>
            <Link
              href={
                item.kind === "course"
                  ? "/courses"
                  : `/treatments/${branch.slug}?catalogCollection=${encodeURIComponent(item.tags[0] || "all")}#complete-catalogue`
              }
              className="text-[10px] font-bold uppercase tracking-[.16em] text-pink-light"
            >
              {item.kind === "course"
                ? "Academy courses"
                : "Products & services"}
            </Link>
            <p className="mt-5 text-[10px] font-bold uppercase tracking-[.25em] text-white/50">
              {item.tags.join(" · ") || item.kind}
            </p>
            <h1 className="mt-3 font-display text-5xl leading-[.92] tracking-[-.05em] sm:text-7xl">
              {item.title}
            </h1>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-white/65">
              {item.description || guidance.overview}
            </p>
            <p className="mt-5 flex gap-2 text-xs text-white/55">
              <MapPin size={15} className="shrink-0 text-pink-light" />
              Available at {branch.name}, {branch.address}
            </p>
            <CatalogItemPurchase item={item} branch={branch} />
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-pink-light sm:rounded-[2rem]">
            {item.images[0] && (
              <Image
                src={item.images[0]}
                alt={`${item.title} at ${branch.name}`}
                fill
                priority
                className="object-cover"
                sizes="(min-width: 1024px) 45vw, 100vw"
              />
            )}
          </div>
        </div>
      </section>
      <section className="section-shell bg-white">
        <div className="container-site grid gap-8 lg:grid-cols-[.8fr_1.2fr] lg:gap-14">
          <div>
            <p className="eyebrow">
              About this{" "}
              {item.kind === "product"
                ? "product"
                : item.kind === "course"
                  ? "course"
                  : "service"}
            </p>
            <h2 className="section-title">What to know before you choose.</h2>
            <p className="mt-5 text-sm leading-7 text-black/55">
              {guidance.overview}
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <InfoCard title="Before booking" items={guidance.prerequisites} />
            <InfoCard title="How to prepare" items={guidance.preparation} />
            <InfoCard title="Aftercare" items={guidance.aftercare} />
            <div className="rounded-2xl bg-pink-berry p-6 text-white sm:p-7">
              <p className="text-[10px] font-bold uppercase tracking-[.18em] text-pink-light">
                Important
              </p>
              <p className="mt-3 text-sm leading-7 text-white/65">
                {guidance.suitabilityNote}
              </p>
            </div>
          </div>
        </div>
      </section>
      {related.length > 0 && (
        <section className="section-shell bg-cream">
          <div className="container-site">
            <p className="eyebrow">You may also like</p>
            <h2 className="section-title">Related at {branch.name}.</h2>
            <div className="mt-7 grid gap-4 sm:grid-cols-3">
              {related.map((entry) => (
                <Link
                  key={entry.handle}
                  href={`/products-services/${branch.slug}/${entry.handle}`}
                  className="group overflow-hidden rounded-2xl bg-white shadow-soft"
                >
                  <div className="relative aspect-[4/3] bg-pink-light">
                    {entry.images[0] && (
                      <Image
                        src={entry.images[0]}
                        alt={entry.title}
                        fill
                        className="object-cover transition duration-500 group-hover:scale-105"
                        sizes="33vw"
                      />
                    )}
                  </div>
                  <div className="flex items-center justify-between gap-3 p-5">
                    <h3 className="font-display text-2xl leading-none">
                      {entry.title}
                    </h3>
                    <ArrowRight size={16} className="shrink-0 text-pink" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}

function InfoCard({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-2xl bg-cream p-6 sm:p-7">
      <h3 className="font-display text-2xl">{title}</h3>
      <ul className="mt-4 grid gap-3">
        {items.map((item) => (
          <li key={item} className="flex gap-3 text-xs leading-5 text-black/55">
            <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-pink text-white">
              <Check size={11} />
            </span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
