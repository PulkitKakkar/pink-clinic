import Image from "next/image";
import { ArrowRight } from "lucide-react";
import type { TreatmentConcern } from "@/lib/concerns";

export const concernCardClassName =
  "group relative min-h-[220px] overflow-hidden rounded-2xl bg-pink-berry text-left text-white shadow-soft sm:min-h-[360px] sm:rounded-[1.5rem]";

export function ConcernCardContent({
  concern,
  image,
  priority = false,
  actionLabel = "Explore treatments",
}: {
  concern: Pick<TreatmentConcern, "shortName" | "description">;
  image?: string;
  priority?: boolean;
  actionLabel?: string;
}) {
  return (
    <>
      {image && (
        <Image
          src={image}
          alt=""
          fill
          priority={priority}
          className="object-cover opacity-65 transition duration-700 group-hover:scale-105"
          sizes="(min-width: 1024px) 33vw, 50vw"
        />
      )}
      <span className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/35 to-transparent" />
      <span className="absolute inset-x-0 bottom-0 p-4 sm:p-7">
        <span className="block text-[8px] font-bold uppercase tracking-[.12em] text-pink-light sm:text-[9px] sm:tracking-[.2em]">
          Concern guide
        </span>
        <span className="mt-2 block font-display text-2xl leading-none sm:text-4xl">
          {concern.shortName}
        </span>
        <span className="mt-3 hidden text-xs leading-5 text-white/65 sm:block">
          {concern.description}
        </span>
        <span className="mt-4 inline-flex items-center gap-1.5 text-[8px] font-bold uppercase tracking-[.1em] sm:mt-5 sm:gap-2 sm:text-[10px] sm:tracking-[.15em]">
          {actionLabel}
          <ArrowRight
            size={14}
            className="transition group-hover:translate-x-1"
          />
        </span>
      </span>
    </>
  );
}
