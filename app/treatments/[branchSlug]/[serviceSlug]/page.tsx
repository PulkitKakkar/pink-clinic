import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Check, MapPin } from "lucide-react";
import { notFound } from "next/navigation";
import { BookingLink } from "@/components/ui/booking-link";
import { AppointmentCta } from "@/components/sections/cta";
import { branches, getBranchBySlug } from "@/lib/branches";
import { services } from "@/lib/content";
import { formatTreatmentPrice, pricingProvider } from "@/lib/pricing";
import { getCatalogGuidance } from "@/lib/catalog-guidance";

export function generateStaticParams() {
  return branches.flatMap((branch) => services.map((service) => ({ branchSlug: branch.slug, serviceSlug: service.slug })));
}

export async function generateMetadata({ params }: { params: Promise<{ branchSlug: string; serviceSlug: string }> }): Promise<Metadata> {
  const { branchSlug, serviceSlug } = await params;
  const branch = getBranchBySlug(branchSlug);
  const service = services.find((item) => item.slug === serviceSlug);
  return branch && service ? { title: `${service.title} at ${branch.name}`, description: `${service.excerpt} View pricing and book at ${branch.name}.`, alternates: { canonical: `/treatments/${branch.slug}/${service.slug}` } } : {};
}

export default async function BranchServicePage({ params }: { params: Promise<{ branchSlug: string; serviceSlug: string }> }) {
  const { branchSlug, serviceSlug } = await params;
  const branch = getBranchBySlug(branchSlug);
  const service = services.find((item) => item.slug === serviceSlug);
  if (!branch || !service) notFound();
  const price = formatTreatmentPrice(pricingProvider.getTreatmentPrice(service.id, branch.id));
  const treatmentPrice = pricingProvider.getTreatmentPrice(service.id, branch.id);
  const guidance = getCatalogGuidance({ handle: service.slug, title: service.title, description: service.description, kind: "service", tags: [service.category], images: [service.image], variants: [] });
  const schema = { "@context": "https://schema.org", "@type": "Service", name: service.title, description: service.description, offers: { "@type": "Offer", priceCurrency: "GBP", price: pricingProvider.getTreatmentPrice(service.id, branch.id)?.price }, provider: { "@type": "BeautySalon", name: branch.name, address: branch.address } };

  return <main><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} /><section className="bg-[#210013] pb-8 pt-24 text-white sm:pb-20 sm:pt-32"><div className="container-site grid gap-6 lg:grid-cols-2 lg:items-center lg:gap-10"><div><p className="mb-3 text-[10px] font-bold uppercase tracking-[.3em] text-pink-light sm:mb-5">{service.category}</p><h1 className="font-display text-5xl leading-[.9] tracking-[-.05em] sm:text-8xl">{service.title}</h1><p className="mt-4 max-w-xl text-sm leading-6 text-white/65 sm:mt-7 sm:text-base sm:leading-8">{service.description}</p><div className="mt-4 flex items-center gap-2 text-[10px] text-white/60 sm:mt-7 sm:gap-3 sm:text-xs"><MapPin size={14} className="text-pink-light sm:h-[15px] sm:w-[15px]" /><span>{branch.name}</span><Link href="/treatments/select-branch" className="min-h-11 py-3 font-bold text-pink-light underline underline-offset-4">Change</Link></div><div className="mt-5 flex flex-wrap items-center gap-3 sm:mt-8 sm:gap-5"><BookingLink label={treatmentPrice?.price != null ? "Book & pay" : "Book consultation"} intent={{ branchId: branch.id, branchSlug: branch.slug, serviceSlug: service.slug, source: "treatment-page" }} /><span className="text-xs font-bold text-white sm:text-sm">{price} <span className="font-normal text-white/45">· {service.duration}</span></span></div><p className="mt-4 text-[10px] leading-5 text-white/50">Suitability review, consultation or a patch test may be required. Response, downtime and number of sessions vary.</p></div><div className="relative aspect-[16/9] overflow-hidden rounded-2xl sm:aspect-[4/5] sm:rounded-[2rem]"><Image src={service.image} alt={service.title} fill priority className="object-cover" sizes="50vw" /></div></div></section><section className="section-shell bg-white"><div className="container-site grid gap-8 lg:grid-cols-2 lg:gap-12"><div><p className="eyebrow">The Pink approach</p><h2 className="section-title">Expert-led. Tailored to you.</h2></div><div className="grid gap-3 sm:gap-4">{service.benefits.map((benefit) => <div key={benefit} className="flex items-center gap-3 rounded-2xl bg-pink-light/50 p-4 sm:gap-4 sm:p-5"><span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-pink text-white sm:h-9 sm:w-9"><Check size={15} /></span><p className="text-sm font-bold sm:text-base">{benefit}</p></div>)}</div></div></section><section className="section-shell bg-cream"><div className="container-site"><p className="eyebrow">Plan with confidence</p><h2 className="section-title">Before and after your appointment.</h2><div className="mt-7 grid gap-4 md:grid-cols-3"><Guidance title="Before booking" items={guidance.prerequisites} /><Guidance title="How to prepare" items={guidance.preparation} /><Guidance title="Aftercare" items={guidance.aftercare} /></div><div className="mt-4 rounded-2xl bg-[#210013] p-5 text-sm leading-7 text-white/65"><strong className="text-white">Important:</strong> {guidance.suitabilityNote}</div></div></section><AppointmentCta /></main>;
}

function Guidance({ title, items }: { title: string; items: string[] }) {
  return <article className="rounded-2xl bg-white p-6"><h3 className="font-display text-3xl">{title}</h3><ul className="mt-4 grid gap-3">{items.map((item) => <li key={item} className="flex gap-3 text-xs leading-5 text-black/55"><Check size={14} className="mt-0.5 shrink-0 text-pink" />{item}</li>)}</ul></article>;
}
