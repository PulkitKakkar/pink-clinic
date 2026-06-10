import Image from "next/image";

export function PageHero({ eyebrow, title, copy, image }: { eyebrow: string; title: string; copy: string; image: string }) {
  return <section className="relative overflow-hidden bg-[#210013] pt-24 text-white sm:pt-32"><Image src={image} alt="" fill priority className="object-cover opacity-45" sizes="100vw" /><div className="absolute inset-0 bg-gradient-to-r from-[#210013] via-[#210013]/75 to-pink/20" /><div className="container-site relative flex pb-8 sm:pb-14"><div className="max-w-3xl"><p className="mb-3 text-[10px] font-bold uppercase tracking-[.3em] text-pink-light sm:mb-5">{eyebrow}</p><h1 className="font-display text-5xl leading-[.92] tracking-[-.055em] sm:text-8xl">{title}</h1><p className="mt-4 max-w-xl text-sm leading-6 text-white/65 sm:mt-6 sm:text-base sm:leading-7">{copy}</p></div></div></section>;
}
