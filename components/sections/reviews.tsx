import Image from "next/image";
import { ExternalLink, Star } from "lucide-react";
import { getGoogleReviews } from "@/lib/google-reviews";

export async function Reviews() {
  const { reviews, sources } = await getGoogleReviews();

  return (
    <section id="reviews" className="section-shell bg-white">
      <div className="container-site">
        <div className="section-header flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow">Client stories</p>
            <h2 className="section-title">What our clients say.</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {sources.map((source) => <a key={source.branchName} href={source.mapsUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full border border-black/10 px-4 py-2 text-[9px] font-bold uppercase tracking-[.12em] text-pink transition hover:border-pink"><span>{source.branchName}</span>{source.rating && <span className="text-black/45">{source.rating} · {source.reviewCount}</span>}<ExternalLink size={12} /></a>)}
          </div>
        </div>

        {reviews.length ? <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-3 [scrollbar-width:none] sm:gap-5 [&::-webkit-scrollbar]:hidden">{reviews.map((review) => <article key={review.id} className="min-w-[82%] snap-start rounded-2xl border border-black/5 bg-cream p-5 sm:min-w-[360px] sm:rounded-[1.5rem] sm:p-7"><div className="flex items-center justify-between gap-3"><div className="flex text-[#f4b638]">{Array.from({ length: review.rating }, (_, index) => <Star key={index} size={12} fill="currentColor" />)}</div><span className="text-[8px] font-bold uppercase tracking-[.13em] text-pink">{review.branchName}</span></div><blockquote className="mt-4 line-clamp-4 font-display text-xl leading-[1.25] tracking-tight">“{review.text}”</blockquote><div className="mt-5 flex items-center gap-3">{review.photoUrl ? <Image src={review.photoUrl} alt="" width={36} height={36} className="h-9 w-9 rounded-full object-cover" unoptimized /> : <span className="grid h-9 w-9 place-items-center rounded-full bg-pink text-[10px] font-bold text-white">{review.author.slice(0, 1)}</span>}<div><a href={review.authorUrl} target="_blank" rel="noreferrer" className="text-xs font-bold">{review.author}</a><p className="mt-0.5 text-[9px] text-black/40">{review.published} · Google review</p></div></div></article>)}</div> : <div className="rounded-2xl border border-black/5 bg-cream p-5 text-sm leading-6 text-black/55"><p>Read verified client stories from both Pink Beauty locations on Google.</p><p className="mt-2 text-xs text-black/35">Live reviews will display here once the Google Places credentials are configured.</p></div>}
      </div>
    </section>
  );
}
