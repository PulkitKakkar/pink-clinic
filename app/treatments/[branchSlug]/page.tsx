import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { MapPin } from "lucide-react";
import { notFound } from "next/navigation";
import { Treatments } from "@/components/sections/treatments";
import { branches, getBranchBySlug } from "@/lib/branches";

export function generateStaticParams() {
  return branches.map((branch) => ({ branchSlug: branch.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ branchSlug: string }> }): Promise<Metadata> {
  const branch = getBranchBySlug((await params).branchSlug);
  return branch ? { title: `Treatments at ${branch.name}`, description: `View treatment prices and book at ${branch.name}, ${branch.address}.` } : {};
}

export default async function BranchTreatmentsPage({ params }: { params: Promise<{ branchSlug: string }> }) {
  const branch = getBranchBySlug((await params).branchSlug);
  if (!branch) notFound();

  return <main><section className="relative overflow-hidden bg-[#210013] pb-8 pt-24 text-white sm:pb-14 sm:pt-32"><Image src={branch.image} alt="" fill priority className="object-cover opacity-35" sizes="100vw" /><div className="absolute inset-0 bg-gradient-to-r from-[#210013] via-[#210013]/80 to-pink/25" /><div className="container-site relative flex flex-col justify-end"><p className="text-[10px] font-bold uppercase tracking-[.3em] text-pink-light">Your selected branch</p><h1 className="mt-3 max-w-3xl font-display text-5xl leading-[.92] tracking-[-.055em] sm:mt-5 sm:text-8xl">{branch.name}</h1><p className="mt-4 flex gap-2 text-xs leading-5 text-white/65 sm:mt-6 sm:gap-3 sm:text-sm"><MapPin size={15} className="mt-0.5 shrink-0 text-pink-light sm:h-[17px] sm:w-[17px]" />{branch.address}</p><Link href="/treatments/select-branch" className="mt-4 inline-block text-[10px] font-bold uppercase tracking-[.16em] text-pink-light underline underline-offset-4 sm:mt-7 sm:text-xs">Choose another branch</Link></div></section><Treatments branch={branch} /></main>;
}
