import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { services } from "@/lib/content";

export function ServicesShowcase() {
  return (
    <section id="services" className="section-shell bg-white">
      <div className="container-site">
        <div className="section-header flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
          <div>
            <p className="eyebrow">Expert care, tailored to you</p>
            <h2 className="section-title">Our services</h2>
          </div>
          <Link href="/treatments/select-branch" className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.16em] text-pink sm:text-xs">
            Explore all treatments <ArrowRight size={16} />
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
          {services.map((service) => (
            <Link
              href={`/treatments/select-branch?service=${service.slug}`}
              key={service.slug}
              className="group relative min-h-[230px] overflow-hidden rounded-2xl bg-ink text-white shadow-soft sm:min-h-[440px] sm:rounded-[1.5rem]"
            >
              <Image src={service.image} alt={service.title} fill className="object-cover transition duration-700 group-hover:scale-105" sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-black/5" />
              <div className="absolute inset-x-0 bottom-0 p-3.5 sm:p-6">
                <p className="text-[7px] font-bold uppercase tracking-[.16em] text-pink-light sm:text-[9px] sm:tracking-[.2em]">{service.category}</p>
                <h3 className="mt-1.5 font-display text-xl leading-none tracking-tight sm:mt-2 sm:text-3xl">{service.title}</h3>
                <p className="mt-3 hidden text-xs leading-5 text-white/65 sm:block">{service.excerpt}</p>
                <span className="mt-3 inline-flex items-center gap-1.5 text-[8px] font-bold uppercase tracking-[.12em] sm:mt-5 sm:gap-2 sm:text-[10px] sm:tracking-[.16em]">
                  Explore service <ArrowUpRight size={14} className="transition group-hover:translate-x-1 group-hover:-translate-y-1" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
