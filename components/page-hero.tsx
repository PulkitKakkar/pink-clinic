import Image from "next/image";

export function PageHero({ eyebrow, title, copy, image }: { eyebrow: string; title: string; copy: string; image: string }) {
  return <section className="relative min-h-[520px] overflow-hidden bg-[#210013] pt-32 text-white"><Image src={image} alt="" fill priority className="object-cover opacity-45" sizes="100vw" /><div className="absolute inset-0 bg-gradient-to-r from-[#210013] via-[#210013]/75 to-pink/20" /><div className="container-site relative flex min-h-[390px] items-end pb-16"><div className="max-w-3xl"><p className="mb-5 text-[10px] font-bold uppercase tracking-[.3em] text-pink-light">{eyebrow}</p><h1 className="font-display text-6xl leading-[.92] tracking-[-.055em] sm:text-8xl">{title}</h1><p className="mt-6 max-w-xl text-sm leading-7 text-white/65 sm:text-base">{copy}</p></div></div></section>;
}
