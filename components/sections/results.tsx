import Image from "next/image";

const results = [
  ["https://images.unsplash.com/photo-1556229010-6c3f2c9ca5f8?auto=format&fit=crop&w=1200&q=85", "Hydrafacial glow"],
  ["https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=1200&q=85", "Skin rejuvenation"],
  ["https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=1200&q=85", "Advanced skincare"],
];

export function Results() {
  return <section id="results" className="section-shell overflow-hidden bg-[#19010e] text-white"><div className="container-site"><div className="section-header max-w-2xl"><p className="eyebrow">Real client results</p><h2 className="section-title !text-white">Results that speak<br />for themselves.</h2><p className="mt-4 text-sm leading-6 text-white/50 sm:mt-5 sm:leading-7">Every face is different. Every plan is personal. Results shown are from real treatment journeys; individual outcomes vary.</p></div><div className="grid grid-cols-3 gap-2 sm:gap-5">{results.map(([src, label], i) => <article key={src} className={`relative overflow-hidden rounded-xl sm:rounded-[1.5rem] ${i === 1 ? "md:translate-y-10" : ""}`}><div className="relative aspect-[3/4] sm:aspect-[4/5]"><Image src={src} alt={label} fill className="object-cover opacity-90" sizes="33vw" /><div className="absolute inset-x-2 bottom-2 rounded-full bg-black/45 px-2 py-2 text-center text-[8px] font-bold uppercase tracking-[.1em] backdrop-blur-md sm:inset-x-4 sm:bottom-4 sm:flex sm:justify-between sm:px-5 sm:py-3 sm:text-[10px] sm:tracking-[.16em]"><span>{label}</span><span className="hidden text-pink-light sm:inline">View result</span></div></div></article>)}</div></div></section>;
}
