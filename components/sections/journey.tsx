import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Reveal } from "@/components/ui/reveal";

const cards = [
  { title: "Treatments", href: "/treatments/select-branch", description: "Advanced beauty and aesthetic treatments designed to help you look and feel your best.", image: "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?auto=format&fit=crop&w=1400&q=85", label: "Explore treatments", number: "01" },
  { title: "Courses", href: "/courses", description: "Professional beauty training and accredited courses for the next generation of specialists.", image: "https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?auto=format&fit=crop&w=1400&q=85", label: "Explore courses", number: "02" },
];

export function Journey() {
  return <section id="journey" className="section-shell bg-white"><div className="container-site"><div className="section-header max-w-2xl"><p className="eyebrow">Choose your journey</p><h2 className="section-title">Where will your next chapter begin?</h2></div><Reveal className="grid gap-4 sm:gap-5 lg:grid-cols-2">{cards.map(card => <Link href={card.href} key={card.title} className="group relative min-h-[300px] overflow-hidden rounded-2xl bg-ink text-white shadow-soft sm:min-h-[480px] sm:rounded-[2rem]"><Image src={card.image} alt="" fill className="object-cover transition duration-700 group-hover:scale-105" sizes="(min-width: 1024px) 50vw, 100vw" /><div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" /><span className="absolute right-5 top-5 font-display text-4xl text-white/25 sm:right-7 sm:top-7 sm:text-5xl">{card.number}</span><div className="absolute inset-x-0 bottom-0 p-5 sm:p-10"><h3 className="font-display text-4xl tracking-tight sm:text-5xl">{card.title}</h3><p className="mt-2 max-w-md text-xs leading-5 text-white/70 sm:mt-4 sm:text-sm sm:leading-6">{card.description}</p><span className="mt-4 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.18em] sm:mt-7 sm:text-xs">{card.label}<ArrowUpRight size={15} className="transition group-hover:translate-x-1 group-hover:-translate-y-1" /></span></div></Link>)}</Reveal></div></section>;
}
