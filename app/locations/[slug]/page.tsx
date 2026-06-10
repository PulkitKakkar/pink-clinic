import type { Metadata } from "next";
import Image from "next/image";
import { MapPin, Phone } from "lucide-react";
import { notFound } from "next/navigation";
import { BookingLink } from "@/components/ui/booking-link";
import { Treatments } from "@/components/sections/treatments";
import { locations } from "@/lib/content";
import { getBranchById } from "@/lib/branches";

export function generateStaticParams() { return locations.map(location => ({ slug: location.slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params; const location = locations.find(item => item.slug === slug);
  return location ? { title: `Pink Beauty ${location.name}, Reading`, description: `Visit Pink Beauty at ${location.address}. Book beauty and aesthetic treatments in Reading.` } : {};
}

export default async function LocationPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params; const location = locations.find(item => item.slug === slug); if (!location) notFound();
  return <main><section className="bg-[#210013] pb-8 pt-24 text-white sm:pb-20 sm:pt-32"><div className="container-site grid gap-6 lg:grid-cols-2 lg:items-center lg:gap-10"><div><p className="mb-3 text-[10px] font-bold uppercase tracking-[.3em] text-pink-light sm:mb-5">Pink Beauty · Reading</p><h1 className="font-display text-5xl leading-[.9] tracking-[-.05em] sm:text-8xl">{location.name}</h1><p className="mt-3 text-sm text-white/60 sm:mt-6 sm:text-lg">{location.note}</p><div className="mt-5 grid gap-2 text-xs text-white/65 sm:mt-8 sm:gap-3 sm:text-sm"><p className="flex gap-2 sm:gap-3"><MapPin size={16} className="shrink-0 text-pink sm:h-[18px] sm:w-[18px]" />{location.address}</p><a href={`tel:${location.phone}`} className="flex gap-2 sm:gap-3"><Phone size={16} className="text-pink sm:h-[18px] sm:w-[18px]" />{location.phone}</a></div><div className="mt-5 sm:mt-9"><BookingLink label="Book at this location" intent={{ branchId: location.id, branchSlug: location.treatmentSlug, source: "location-page" }} /></div></div><div className="relative aspect-[16/9] overflow-hidden rounded-2xl sm:aspect-[4/5] sm:rounded-[2rem]"><Image src={location.image} alt={`${location.name} Pink Beauty salon`} fill className="object-cover" sizes="50vw" /></div></div></section><Treatments branch={getBranchById(location.id)} /></main>;
}
