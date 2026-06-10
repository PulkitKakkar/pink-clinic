import { Star } from "lucide-react";
import { reviews } from "@/lib/content";

export function Reviews() {
  return <section className="bg-white py-24 sm:py-32"><div className="container-site"><div className="mb-12 text-center"><p className="mx-auto mb-4 justify-center text-[11px] font-bold uppercase tracking-[.3em] text-pink">Client stories</p><h2 className="section-title">Beautiful words from<br />our community.</h2></div><div className="grid gap-5 lg:grid-cols-3">{reviews.map(review => <article key={review.name} className="rounded-[1.5rem] border border-black/5 bg-cream p-7 sm:p-8"><div className="flex text-[#f4b638]">{[1,2,3,4,5].map(i => <Star key={i} size={14} fill="currentColor" />)}</div><blockquote className="mt-6 font-display text-2xl leading-[1.25] tracking-tight">“{review.text}”</blockquote><div className="mt-8 flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-full bg-pink text-xs font-bold text-white">{review.initials}</span><div><p className="text-sm font-bold">{review.name}</p><p className="text-[10px] uppercase tracking-[.14em] text-black/40">{review.service} · Google review</p></div></div></article>)}</div></div></section>;
}
