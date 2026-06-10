import type { Metadata } from "next";
import Image from "next/image";
import { Check } from "lucide-react";
import { notFound } from "next/navigation";
import { BookingLink } from "@/components/ui/booking-link";
import { AppointmentCta } from "@/components/sections/cta";
import { services } from "@/lib/content";

export function generateStaticParams() { return services.map(service => ({ slug: service.slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params; const service = services.find(item => item.slug === slug);
  return service ? { title: `${service.title} Reading`, description: service.excerpt } : {};
}

export default async function ServicePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params; const service = services.find(item => item.slug === slug); if (!service) notFound();
  const schema = { "@context": "https://schema.org", "@type": "Service", name: service.title, description: service.description, provider: { "@type": "BeautySalon", name: "Pink Beauty Salon" }, areaServed: "Reading" };
  return <main><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} /><section className="bg-[#210013] pb-20 pt-32 text-white"><div className="container-site grid gap-10 lg:grid-cols-2 lg:items-center"><div><p className="mb-5 text-[10px] font-bold uppercase tracking-[.3em] text-pink-light">{service.category}</p><h1 className="font-display text-6xl leading-[.9] tracking-[-.05em] sm:text-8xl">{service.title}</h1><p className="mt-7 max-w-xl text-base leading-8 text-white/65">{service.description}</p><div className="mt-8 flex flex-wrap items-center gap-5"><BookingLink label="Book consultation" intent={{ serviceSlug: service.slug, source: "service-page" }} /><span className="text-sm text-white/50">{service.price} · {service.duration}</span></div></div><div className="relative aspect-[4/5] overflow-hidden rounded-[2rem]"><Image src={service.image} alt={service.title} fill priority className="object-cover" sizes="50vw" /></div></div></section><section className="bg-white py-24"><div className="container-site grid gap-12 lg:grid-cols-2"><div><p className="eyebrow">The Pink approach</p><h2 className="section-title">Expert-led. Tailored to you.</h2></div><div className="grid gap-4">{service.benefits.map(benefit => <div key={benefit} className="flex items-center gap-4 rounded-2xl bg-pink-light/50 p-5"><span className="grid h-9 w-9 place-items-center rounded-full bg-pink text-white"><Check size={16} /></span><p className="font-bold">{benefit}</p></div>)}</div></div></section><AppointmentCta /></main>;
}
