import Image from "next/image";

const results = [
  ["https://images.unsplash.com/photo-1556229010-6c3f2c9ca5f8?auto=format&fit=crop&w=1200&q=85", "Hydrafacial glow"],
  ["https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=1200&q=85", "Skin rejuvenation"],
  ["https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=1200&q=85", "Advanced skincare"],
];

export function Results() {
  return <section id="results" className="overflow-hidden bg-[#19010e] py-24 text-white sm:py-32"><div className="container-site"><div className="mb-12 max-w-2xl"><p className="eyebrow">Real client results</p><h2 className="section-title !text-white">Results that speak<br />for themselves.</h2><p className="mt-5 text-sm leading-7 text-white/50">Every face is different. Every plan is personal. Results shown are from real treatment journeys; individual outcomes vary.</p></div><div className="grid gap-5 md:grid-cols-3">{results.map(([src, label], i) => <article key={src} className={`relative overflow-hidden rounded-[1.5rem] ${i === 1 ? "md:translate-y-10" : ""}`}><div className="relative aspect-[4/5]"><Image src={src} alt={label} fill className="object-cover opacity-90" sizes="33vw" /><div className="absolute inset-x-4 bottom-4 flex justify-between rounded-full bg-black/45 px-5 py-3 text-[10px] font-bold uppercase tracking-[.16em] backdrop-blur-md"><span>{label}</span><span className="text-pink-light">View result</span></div></div></article>)}</div></div></section>;
}
