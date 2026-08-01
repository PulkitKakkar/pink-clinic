import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  Check,
  Clock,
  Layers3,
  MapPin,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { notFound } from "next/navigation";
import { CatalogItemPurchase } from "@/components/catalog/catalog-item-purchase";
import { getCatalogGuidance } from "@/lib/catalog-guidance";
import { getCombinedCatalog } from "@/lib/catalog";
import { reviews } from "@/lib/content";

type PageProps = { params: Promise<{ itemHandle: string }> };

const merchantAvailabilitySchema = {
  in_stock: "InStock",
  out_of_stock: "OutOfStock",
  preorder: "PreOrder",
  backorder: "BackOrder",
} as const;
const merchantConditionSchema = {
  new: "NewCondition",
  refurbished: "RefurbishedCondition",
  used: "UsedCondition",
} as const;

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const handle = decodeURIComponent((await params).itemHandle);
  const item = (await getCombinedCatalog()).find(
    (entry) => entry.handle === handle,
  );
  if (!item) return {};
  const description =
    `${item.description || `Learn about ${item.title}`} Compare availability and prices at both Pink Beauty branches in Reading.`.slice(
      0,
      158,
    );
  return {
    title: `${item.title} in Reading`,
    description,
    alternates: { canonical: `/products-services/item/${item.handle}` },
    openGraph: {
      title: `${item.title} at Pink Beauty`,
      description,
      images: item.images[0] ? [item.images[0]] : [],
    },
  };
}

export default async function CombinedCatalogItemPage({ params }: PageProps) {
  const handle = decodeURIComponent((await params).itemHandle);
  const item = (await getCombinedCatalog()).find(
    (entry) => entry.handle === handle,
  );
  if (!item) notFound();
  const guidance = getCatalogGuidance(item);
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://pinkclinic.co.uk";
  const itemUrl = `${siteUrl}/products-services/item/${item.handle}`;
  const allPrices = item.branchItems
    .flatMap(({ item: branchItem }) =>
      branchItem.variants.map((variant) => variant.price),
    )
    .filter((price) => price > 0);
  const merchantOffers = item.branchItems.flatMap(
    ({ branch, item: branchItem }) =>
      branchItem.variants
        .filter((variant) => variant.price > 0)
        .map((variant) => ({
          "@type": "Offer",
          name: `${variant.name} · ${branch.name}`,
          price: variant.price.toFixed(2),
          priceCurrency: "GBP",
          url: `${siteUrl}/checkout/${branch.slug}/catalog/${encodeURIComponent(item.handle)}`,
          sku: variant.sku || undefined,
          availability: branchItem.merchantAvailability
            ? `https://schema.org/${merchantAvailabilitySchema[branchItem.merchantAvailability]}`
            : undefined,
          itemCondition: item.merchantCondition
            ? `https://schema.org/${merchantConditionSchema[item.merchantCondition]}`
            : undefined,
          seller: { "@type": "Organization", name: "Pink Beauty" },
        })),
  );
  const mainSchema =
    item.kind === "product"
      ? {
          "@type": "Product",
          "@id": `${itemUrl}#product`,
          name: item.title,
          description: item.description || guidance.overview,
          image: item.images,
          url: itemUrl,
          brand: item.brand
            ? { "@type": "Brand", name: item.brand }
            : undefined,
          gtin: item.gtin || undefined,
          mpn: item.mpn || undefined,
          sku: item.variants.find((variant) => variant.sku)?.sku || undefined,
          offers: merchantOffers,
        }
      : item.kind === "course"
        ? {
            "@type": "Course",
            "@id": `${itemUrl}#course`,
            name: item.title,
            description: item.description || guidance.overview,
            image: item.images[0],
            url: itemUrl,
            provider: {
              "@type": "Organization",
              name: "Pink Academy",
              url: siteUrl,
            },
          }
        : {
            "@type": "Service",
            "@id": `${itemUrl}#service`,
            name: item.title,
            description: item.description || guidance.overview,
            image: item.images,
            url: itemUrl,
            areaServed: { "@type": "City", name: "Reading" },
            provider: item.branchItems.map(({ branch }) => ({
              "@type": "BeautySalon",
              name: branch.name,
              address: branch.address,
              telephone: branch.phone,
            })),
            offers: allPrices.length
              ? {
                  "@type": "AggregateOffer",
                  priceCurrency: "GBP",
                  lowPrice: Math.min(...allPrices).toFixed(2),
                  highPrice: Math.max(...allPrices).toFixed(2),
                  offerCount: allPrices.length,
                  url: itemUrl,
                }
              : undefined,
          };
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      mainSchema,
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
          {
            "@type": "ListItem",
            position: 2,
            name: "Products & services",
            item: `${siteUrl}/products-services`,
          },
          { "@type": "ListItem", position: 3, name: item.title, item: itemUrl },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: guidance.faqs.map((faq) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: { "@type": "Answer", text: faq.answer },
        })),
      },
    ],
  };
  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <section className="bg-pink-berry pb-10 pt-24 text-white sm:pb-16 sm:pt-32">
        <div className="container-site grid gap-7 lg:grid-cols-[1.1fr_.9fr] lg:items-center lg:gap-12">
          <div>
            <Link
              href="/products-services"
              className="text-[10px] font-bold uppercase tracking-[.16em] text-pink-light"
            >
              Products & services
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
              Choose your branch and price below
            </p>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-pink-light sm:rounded-[2rem]">
            {item.images[0] && (
              <Image
                src={item.images[0]}
                alt={item.title}
                fill
                priority
                className="object-cover"
                sizes="(min-width: 1024px) 45vw, 100vw"
              />
            )}
          </div>
        </div>
      </section>
      <section
        id="branch-prices"
        className="section-shell scroll-mt-24 bg-cream"
      >
        <div className="container-site">
          <div className="max-w-2xl">
            <p className="eyebrow">Available in Reading</p>
            <h2 className="section-title">Choose your location.</h2>
            <p className="mt-4 text-sm leading-7 text-black/50">
              Compare the price and available options at each Pink location. You can choose here without changing the rest of the catalogue.
            </p>
          </div>
          <div className="mt-7 grid gap-5 lg:grid-cols-2">
            {item.branchItems.map(({ branch, item: branchItem }, index) => {
              const prices = branchItem.variants.map((variant) => variant.price).filter((price) => price > 0);
              const fromPrice = prices.length ? Math.min(...prices) : null;
              return (
              <article
                key={branch.id}
                className="relative overflow-hidden rounded-2xl border border-pink/10 bg-white p-6 shadow-soft sm:p-8"
              >
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-pink-dark via-pink to-pink/30" />
                <div className="flex items-start justify-between gap-5">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[.2em] text-pink">Location {index + 1}</p>
                    <h3 className="mt-2 font-display text-3xl text-ink sm:text-4xl">{branch.name}</h3>
                    <p className="mt-2 text-xs font-bold text-black/45">{branch.note}</p>
                  </div>
                  {fromPrice != null && <div className="shrink-0 rounded-2xl bg-pink-light/65 px-4 py-3 text-right"><p className="text-[9px] font-bold uppercase tracking-[.14em] text-black/40">{prices.length > 1 ? "From" : "Price"}</p><p className="mt-1 text-xl font-bold text-pink-dark">£{fromPrice.toFixed(2)}</p></div>}
                </div>
                <p className="mt-5 flex gap-2 border-y border-black/5 py-4 text-xs leading-5 text-black/50">
                  <MapPin
                    size={14}
                    className="mt-0.5 shrink-0 text-pink"
                  />
                  {branch.address}
                </p>
                <CatalogItemPurchase item={branchItem} branch={branch} appearance="light" />
              </article>
              );
            })}
          </div>
        </div>
      </section>
      {item.kind === "product" && (
        <section className="bg-white py-8 sm:py-12">
          <div className="container-site">
            <div className="rounded-2xl border border-black/5 bg-cream p-6 sm:p-8">
              <p className="eyebrow">Product information</p>
              <dl className="grid gap-5 text-sm sm:grid-cols-2 lg:grid-cols-4">
                {item.brand && (
                  <div>
                    <dt className="text-[9px] font-bold uppercase tracking-[.16em] text-black/40">
                      Brand
                    </dt>
                    <dd className="mt-2 font-bold">{item.brand}</dd>
                  </div>
                )}
                {item.gtin && (
                  <div>
                    <dt className="text-[9px] font-bold uppercase tracking-[.16em] text-black/40">
                      GTIN
                    </dt>
                    <dd className="mt-2 font-bold">{item.gtin}</dd>
                  </div>
                )}
                {item.mpn && (
                  <div>
                    <dt className="text-[9px] font-bold uppercase tracking-[.16em] text-black/40">
                      MPN
                    </dt>
                    <dd className="mt-2 font-bold">{item.mpn}</dd>
                  </div>
                )}
                <div>
                  <dt className="text-[9px] font-bold uppercase tracking-[.16em] text-black/40">
                    Buying information
                  </dt>
                  <dd className="mt-2 flex gap-3">
                    <Link
                      href="/delivery"
                      className="font-bold text-pink underline underline-offset-4"
                    >
                      Delivery
                    </Link>
                    <Link
                      href="/returns"
                      className="font-bold text-pink underline underline-offset-4"
                    >
                      Returns
                    </Link>
                  </dd>
                </div>
              </dl>
              <p className="mt-5 text-xs leading-6 text-black/45">
                Price, stock status and the selected option shown here must
                match checkout. Contact Pink if you need help confirming
                collection or delivery.
              </p>
            </div>
          </div>
        </section>
      )}
      <section className="section-shell bg-pink-berry text-white">
        <div className="container-site">
          <p className="text-[10px] font-bold uppercase tracking-[.22em] text-pink-light">
            At a glance
          </p>
          <div className="mt-6 grid gap-px overflow-hidden rounded-2xl bg-white/10 sm:grid-cols-2 lg:grid-cols-4">
            <Detail icon={Clock} title="Appointment" text={guidance.duration} />
            <Detail
              icon={Sparkles}
              title="Expected result"
              text={guidance.expectedResults[0]}
            />
            <Detail
              icon={Layers3}
              title="Treatment plan"
              text={guidance.sessions}
            />
            <Detail
              icon={ShieldCheck}
              title="Downtime"
              text={guidance.downtime}
            />
          </div>
          <p className="mt-4 text-[10px] leading-5 text-white/45">
            Timings, response and downtime are indicative only and are confirmed
            during consultation.
          </p>
        </div>
      </section>
      <section className="section-shell bg-white">
        <div className="container-site grid gap-8 lg:grid-cols-[.8fr_1.2fr] lg:gap-14">
          <div>
            <p className="eyebrow">
              About this {item.kind === "product" ? "product" : "service"}
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
      <section className="section-shell bg-cream">
        <div className="container-site grid gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <p className="eyebrow">Treatment details</p>
            <h2 className="section-title">Results and treatment areas.</h2>
            <InfoCard
              title="Expected results"
              items={guidance.expectedResults}
            />
            <div className="mt-4">
              <InfoCard
                title="Possible treatment areas"
                items={guidance.treatmentAreas}
              />
            </div>
          </div>
          <div>
            <p className="eyebrow">Common questions</p>
            <h2 className="section-title">Before you book.</h2>
            <div className="mt-7 grid gap-3">
              {guidance.faqs.map((faq) => (
                <details
                  key={faq.question}
                  className="rounded-2xl bg-white p-5"
                >
                  <summary className="cursor-pointer text-sm font-bold text-ink">
                    {faq.question}
                  </summary>
                  <p className="mt-3 text-xs leading-6 text-black/55">
                    {faq.answer}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>
      {item.beforeAfter?.length ? (
        <section className="section-shell bg-white">
          <div className="container-site">
            <p className="eyebrow">Real client results</p>
            <h2 className="section-title">Before and after.</h2>
            <p className="mt-4 max-w-2xl text-xs leading-6 text-black/50">
              Individual results vary. Images are published only with client
              consent and are not a guarantee of outcome.
            </p>
            <div className="mt-7 grid gap-5 sm:grid-cols-2">
              {item.beforeAfter.map((result, index) => (
                <figure
                  key={`${result.before}-${index}`}
                  className="grid grid-cols-2 overflow-hidden rounded-2xl bg-cream"
                >
                  <div className="relative aspect-square">
                    <Image
                      src={result.before}
                      alt={
                        result.alt
                          ? `Before: ${result.alt}`
                          : `Before ${item.title}`
                      }
                      fill
                      className="object-cover"
                      sizes="25vw"
                    />
                    <span className="absolute bottom-2 left-2 rounded-full bg-black/70 px-3 py-1 text-[9px] font-bold uppercase text-white">
                      Before
                    </span>
                  </div>
                  <div className="relative aspect-square">
                    <Image
                      src={result.after}
                      alt={
                        result.alt
                          ? `After: ${result.alt}`
                          : `After ${item.title}`
                      }
                      fill
                      className="object-cover"
                      sizes="25vw"
                    />
                    <span className="absolute bottom-2 left-2 rounded-full bg-pink px-3 py-1 text-[9px] font-bold uppercase text-white">
                      After
                    </span>
                  </div>
                </figure>
              ))}
            </div>
          </div>
        </section>
      ) : null}
      <section className="section-shell bg-white">
        <div className="container-site grid gap-8 lg:grid-cols-[.7fr_1.3fr] lg:items-center">
          <div>
            <p className="eyebrow">Why Pink</p>
            <h2 className="section-title">Experienced hands. Honest advice.</h2>
            <p className="mt-4 text-sm leading-7 text-black/55">
              Every advanced treatment starts with suitability, realistic
              expectations and clear aftercare. If a treatment is not
              appropriate, the Pink team will tell you.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {reviews.slice(0, 2).map((review) => (
              <blockquote
                key={review.name}
                className="rounded-2xl bg-pink-light/45 p-6"
              >
                <p className="text-sm leading-7 text-black/65">
                  “{review.text}”
                </p>
                <footer className="mt-4 text-xs font-bold text-pink">
                  {review.name} · {review.service}
                </footer>
              </blockquote>
            ))}
          </div>
        </div>
      </section>
      <div className="sticky bottom-3 z-30 mx-auto mb-3 w-[calc(100%-1.5rem)] rounded-full bg-pink-berry/95 p-2 shadow-luxe backdrop-blur sm:hidden">
        <Link href="#branch-prices" className="button-primary w-full">
          View branch prices & book
        </Link>
      </div>
    </main>
  );
}

function Detail({
  icon: Icon,
  title,
  text,
}: {
  icon: typeof Clock;
  title: string;
  text: string;
}) {
  return (
    <div className="bg-pink-berry p-5 sm:p-6">
      <Icon size={19} className="text-pink-light" />
      <p className="mt-5 text-[9px] font-bold uppercase tracking-[.18em] text-white/45">
        {title}
      </p>
      <p className="mt-2 text-sm leading-6 text-white/75">{text}</p>
    </div>
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
