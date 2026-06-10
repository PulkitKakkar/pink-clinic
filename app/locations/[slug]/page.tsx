import type { Metadata } from "next";
import Image from "next/image";
import { MapPin, Phone } from "lucide-react";
import { notFound } from "next/navigation";
import { BookingLink } from "@/components/ui/booking-link";
import { Treatments } from "@/components/sections/treatments";
import { locations } from "@/lib/content";

export function generateStaticParams() { return locations.map(location => ({ slug: location.slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params; const location = locations.find(item => item.slug === slug);
  return location ? { title: `Pink Beauty ${location.name}, Reading`, description: `Visit Pink Beauty at ${location.address}. Book beauty and aesthetic treatments in Reading.` } : {};
}

export default async function LocationPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params; const location = locations.find(item => item.slug === slug); if (!location) notFound();
  return <main><section className="bg-[#210013] pt-32 text-white"><div className="container-site grid gap-10 pb-20 lg:grid-cols-2 lg:items-center"><div><p className="mb-5 text-[10px] font-bold uppercase tracking-[.3em] text-pink-light">Pink Beauty · Reading</p><h1 className="font-display text-6xl leading-[.9] tracking-[-.05em] sm:text-8xl">{location.name}</h1><p className="mt-6 text-lg text-white/60">{location.note}</p><div className="mt-8 grid gap-3 text-sm text-white/65"><p className="flex gap-3"><MapPin size={18} className="text-pink" />{location.address}</p><a href={`tel:${location.phone}`} className="flex gap-3"><Phone size={18} className="text-pink" />{location.phone}</a></div><div className="mt-9"><BookingLink label="Book at this location" intent={{ locationSlug: location.slug, source: "location-page" }} /></div></div><div className="relative aspect-[4/5] overflow-hidden rounded-[2rem]"><Image src={location.image} alt={`${location.name} Pink Beauty salon`} fill className="object-cover" sizes="50vw" /></div></div></section><Treatments /></main>;
}
