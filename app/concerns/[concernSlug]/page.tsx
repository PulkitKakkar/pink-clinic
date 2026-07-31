import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  Check,
  ExternalLink,
  MessageCircle,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { notFound } from "next/navigation";
import { CatalogBrowser } from "@/components/catalog/catalog-browser";
import { getCombinedCatalog } from "@/lib/catalog";
import {
  concernDecisionGuides,
  concernGuidanceReviewed,
} from "@/lib/concern-guidance";
import {
  getConcernBySlug,
  matchesConcern,
  treatmentConcerns,
} from "@/lib/concerns";

type PageProps = { params: Promise<{ concernSlug: string }> };

export function generateStaticParams() {
  return treatmentConcerns.map((concern) => ({ concernSlug: concern.slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const concern = getConcernBySlug((await params).concernSlug);
  return concern
    ? {
        title: `${concern.name} in Reading`,
        description: `${concern.description} Compare treatment availability and prices across Pink Beauty's Reading clinics.`,
        alternates: { canonical: `/concerns/${concern.slug}` },
      }
    : {};
}

export default async function ConcernPage({ params }: PageProps) {
  const concern = getConcernBySlug((await params).concernSlug);
  if (!concern) notFound();
  const decisionGuide = concernDecisionGuides[concern.slug];
  const items = (await getCombinedCatalog()).filter(
    (item) => item.kind === "service" && matchesConcern(item, concern),
  );
  const heroImage = items.find((item) => item.images[0])?.images[0];
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://pinkclinic.co.uk";
  const pageUrl = `${siteUrl}/concerns/${concern.slug}`;
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${pageUrl}#webpage`,
        name: `${concern.name} in Reading`,
        description: concern.description,
        url: pageUrl,
        dateModified: "2026-07-31",
        about: concern.shortName,
        primaryImageOfPage: heroImage
          ? { "@type": "ImageObject", url: heroImage }
          : undefined,
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
          {
            "@type": "ListItem",
            position: 2,
            name: "Treatments",
            item: `${siteUrl}/products-services`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: concern.shortName,
            item: pageUrl,
          },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: decisionGuide.faqs.map((faq) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: { "@type": "Answer", text: faq.answer },
        })),
      },
      {
        "@type": "ItemList",
        name: `Treatments for ${concern.shortName}`,
        itemListElement: items.map((item, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: item.title,
          url: `${siteUrl}/products-services/item/${item.handle}`,
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
      <section className="overflow-hidden bg-cream pb-12 pt-28 sm:pb-20 sm:pt-36">
        <div className="container-site grid gap-8 lg:grid-cols-[1.05fr_.95fr] lg:items-center lg:gap-14">
          <div>
            <Link
              href="/products-services"
              className="text-[10px] font-bold uppercase tracking-[.2em] text-pink"
            >
              Treatments by concern
            </Link>
            <h1 className="mt-4 max-w-4xl font-display text-5xl leading-[.92] tracking-[-.05em] text-ink sm:text-7xl">
              {concern.shortName}
              <br />
              <em className="font-normal text-pink">Your guide.</em>
            </h1>
            <p className="mt-6 max-w-2xl text-sm leading-7 text-black/60 sm:text-base sm:leading-8">
              {concern.description}
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <a href="#understanding" className="button-primary">
                Understand the concern
              </a>
              <a
                href="#treatments"
                className="inline-flex min-h-12 items-center gap-2 px-3 text-xs font-bold text-pink"
              >
                View treatments <ArrowRight size={15} />
              </a>
            </div>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-[2rem] bg-pink-light">
            {heroImage && (
              <Image
                src={heroImage}
                alt={`Treatment consultation for ${concern.shortName.toLowerCase()} at Pink Beauty`}
                fill
                priority
                className="object-cover"
                sizes="(min-width: 1024px) 45vw, 100vw"
              />
            )}
            <div className="absolute inset-x-4 bottom-4 rounded-2xl bg-white/90 p-5 backdrop-blur sm:inset-x-6 sm:bottom-6">
              <p className="text-[9px] font-bold uppercase tracking-[.2em] text-pink">
                Pink’s approach
              </p>
              <p className="mt-2 font-display text-2xl leading-none">
                Assessment before treatment.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section
        id="understanding"
        className="section-shell scroll-mt-12 bg-white"
      >
        <div className="container-site grid gap-10 lg:grid-cols-[.8fr_1.2fr] lg:gap-16">
          <div>
            <p className="eyebrow">Understanding the concern</p>
            <h2 className="section-title">
              What does {concern.shortName.toLowerCase()} mean?
            </h2>
          </div>
          <div>
            <p className="text-base leading-8 text-black/65">
              {concern.whatItMeans}
            </p>
            <div className="mt-7 rounded-2xl bg-pink-light/45 p-6">
              <h3 className="font-display text-2xl">
                What clients often notice
              </h3>
              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {concern.commonSigns.map((sign) => (
                  <li key={sign} className="flex gap-3 text-sm text-black/60">
                    <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-pink text-white">
                      <Check size={11} />
                    </span>
                    {sign}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="section-shell bg-cream">
        <div className="container-site">
          <div className="max-w-3xl">
            <p className="eyebrow">Possible approaches</p>
            <h2 className="section-title">
              More than one route may be suitable.
            </h2>
            <p className="mt-4 text-sm leading-7 text-black/55">
              The most appropriate option depends on your starting point, health
              history, desired result and tolerance for downtime.
            </p>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {concern.approaches.map((approach, index) => (
              <article
                key={approach.title}
                className="rounded-2xl bg-white p-6 shadow-soft sm:p-7"
              >
                <span className="grid h-9 w-9 place-items-center rounded-full bg-pink text-xs font-bold text-white">
                  0{index + 1}
                </span>
                <h3 className="mt-6 font-display text-2xl">{approach.title}</h3>
                <p className="mt-3 text-sm leading-7 text-black/55">
                  {approach.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section-shell bg-white">
        <div className="container-site grid gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <p className="eyebrow">Your goals</p>
            <h2 className="section-title">
              What a personalised plan can focus on.
            </h2>
            <div className="mt-7 grid gap-3">
              {concern.goals.map((goal) => (
                <div
                  key={goal}
                  className="flex gap-3 rounded-2xl bg-cream p-5 text-sm font-bold"
                >
                  <Sparkles size={17} className="shrink-0 text-pink" />
                  {goal}
                </div>
              ))}
            </div>
          </div>
          <div>
            <p className="eyebrow">What to expect</p>
            <h2 className="section-title">A considered consultation.</h2>
            <div className="mt-7 grid gap-3">
              {concern.whatToExpect.map((expectation) => (
                <div
                  key={expectation}
                  className="flex gap-3 border-b border-black/5 pb-4 text-sm leading-6 text-black/60"
                >
                  <ShieldCheck size={18} className="shrink-0 text-pink" />
                  {expectation}
                </div>
              ))}
            </div>
            <p className="mt-5 text-xs leading-6 text-black/45">
              Treatment suitability, likely response and downtime are discussed
              before you proceed. Results vary and cannot be guaranteed.
            </p>
          </div>
        </div>
      </section>

      <section className="section-shell bg-cream">
        <div className="container-site">
          <div className="max-w-3xl">
            <p className="eyebrow">Before you decide</p>
            <h2 className="section-title">
              The context that shapes a safe recommendation.
            </h2>
            <p className="mt-4 text-sm leading-7 text-black/55">
              This information helps you prepare for a consultation. It cannot
              determine whether a treatment is suitable for you.
            </p>
          </div>
          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            <GuideList
              title="What may contribute"
              items={decisionGuide.causes}
            />
            <GuideList
              title="Who may explore treatment"
              items={decisionGuide.maySuit}
            />
            <GuideList
              title="Discuss before treatment"
              items={decisionGuide.discussFirst}
              warning
            />
          </div>
          <div className="mt-5 rounded-2xl bg-[#210013] p-6 text-white sm:p-8">
            <p className="text-[9px] font-bold uppercase tracking-[.2em] text-pink-light">
              Typical treatment journey
            </p>
            <p className="mt-3 max-w-4xl text-sm leading-7 text-white/70">
              {decisionGuide.treatmentCourse}
            </p>
          </div>
        </div>
      </section>

      <section className="section-shell bg-white">
        <div className="container-site grid gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <p className="eyebrow">Effects & risks</p>
            <h2 className="section-title">What should be discussed clearly.</h2>
            <GuideList
              title="Common effects and possible complications"
              items={decisionGuide.commonEffects}
              plain
            />
            <div className="mt-5 rounded-2xl border border-pink/15 bg-pink-light/35 p-6">
              <div className="flex gap-3">
                <AlertTriangle
                  size={20}
                  className="mt-0.5 shrink-0 text-pink"
                />
                <div>
                  <h3 className="text-sm font-bold">
                    When to seek medical advice
                  </h3>
                  <p className="mt-2 text-xs leading-6 text-black/60">
                    {decisionGuide.medicalAdvice}
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div>
            <p className="eyebrow">Plan for your appointment</p>
            <h2 className="section-title">Preparation and aftercare.</h2>
            <div className="mt-7 grid gap-4 sm:grid-cols-2">
              <GuideList
                title="Before treatment"
                items={decisionGuide.preparation}
                plain
              />
              <GuideList
                title="After treatment"
                items={decisionGuide.aftercare}
                plain
              />
            </div>
          </div>
        </div>
      </section>

      <section className="section-shell bg-cream">
        <div className="container-site grid gap-10 lg:grid-cols-[1fr_1fr] lg:gap-16">
          <div>
            <p className="eyebrow">Common questions</p>
            <h2 className="section-title">
              Useful questions before consultation.
            </h2>
            <div className="mt-7 grid gap-3">
              {decisionGuide.faqs.map((faq) => (
                <details
                  key={faq.question}
                  className="rounded-2xl bg-white p-5"
                >
                  <summary className="cursor-pointer text-sm font-bold">
                    {faq.question}
                  </summary>
                  <p className="mt-3 text-xs leading-6 text-black/55">
                    {faq.answer}
                  </p>
                </details>
              ))}
            </div>
          </div>
          <aside className="rounded-[2rem] bg-white p-6 sm:p-8">
            <BookOpen size={22} className="text-pink" />
            <h2 className="mt-5 font-display text-3xl">Sources and review</h2>
            <p className="mt-3 text-xs leading-6 text-black/50">
              This guide was last reviewed on {concernGuidanceReviewed}. It is
              general information, not medical advice, and treatment-specific
              consent information takes priority.
            </p>
            <div className="mt-5 grid gap-3">
              {decisionGuide.sources.map((source) => (
                <a
                  key={source.url}
                  href={source.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-start justify-between gap-3 rounded-xl bg-cream p-4 text-xs font-bold text-pink"
                >
                  <span>{source.label}</span>
                  <ExternalLink size={13} className="shrink-0" />
                </a>
              ))}
            </div>
          </aside>
        </div>
      </section>

      <section id="treatments" className="section-shell scroll-mt-12 bg-cream">
        <div className="container-site">
          <p className="eyebrow">Relevant treatments</p>
          <h2 className="section-title">Options to discuss with Pink.</h2>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-black/50">
            Browse without choosing a branch. Open a treatment to compare
            availability and prices at both Pink locations.
          </p>
          <div className="mt-8">
            <CatalogBrowser
              items={items}
              combined
              showDiscovery={false}
              hideTypeFilters
              collectionEyebrow="More ways to browse"
              collectionTitle="Treatment collections"
            />
          </div>
        </div>
      </section>

      <section className="section-shell bg-pink-light/55">
        <div className="container-site grid gap-7 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <p className="eyebrow">A note from Pink</p>
            <h2 className="section-title">
              You do not need to know the treatment name.
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-black/55">
              Tell us what you have noticed and what you would like to improve.
              The team can help you understand the options—and will be honest if
              treatment is not appropriate.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/treatment-finder" className="button-primary">
              Try the treatment finder
            </Link>
            <Link
              href="/contact"
              className="inline-flex min-h-12 items-center gap-2 rounded-full border border-pink/20 bg-white px-6 text-xs font-bold text-pink"
            >
              <MessageCircle size={15} /> Contact Pink
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

function GuideList({
  title,
  items,
  warning = false,
  plain = false,
}: {
  title: string;
  items: string[];
  warning?: boolean;
  plain?: boolean;
}) {
  return (
    <div className={plain ? "mt-7" : "rounded-2xl bg-white p-6 shadow-soft"}>
      <h3 className="font-display text-2xl">{title}</h3>
      <ul className="mt-4 grid gap-3">
        {items.map((item) => (
          <li key={item} className="flex gap-3 text-xs leading-6 text-black/55">
            <span
              className={`mt-1 grid h-5 w-5 shrink-0 place-items-center rounded-full ${warning ? "bg-[#210013] text-pink-light" : "bg-pink text-white"}`}
            >
              {warning ? <AlertTriangle size={11} /> : <Check size={11} />}
            </span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
