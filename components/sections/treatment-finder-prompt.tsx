import Link from "next/link";
import { ArrowRight, MessagesSquare, Sparkles } from "lucide-react";

export function TreatmentFinderPrompt() {
  return (
    <section className="bg-[#210013] py-8 text-white sm:py-12">
      <div className="container-site grid gap-6 lg:grid-cols-[auto_1fr_auto] lg:items-center">
        <span className="grid h-12 w-12 place-items-center rounded-full bg-pink text-white">
          <Sparkles size={20} />
        </span>
        <div>
          <p className="text-[9px] font-bold uppercase tracking-[.22em] text-pink-light">
            Not sure which treatment?
          </p>
          <h2 className="mt-2 font-display text-3xl leading-none sm:text-4xl">
            Start with your concern, not a treatment name.
          </h2>
          <p className="mt-3 max-w-2xl text-xs leading-6 text-white/55">
            Answer three quick questions for relevant starting points, or speak
            directly with Pink for personal guidance.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/treatment-finder" className="button-primary">
            Try the treatment finder <ArrowRight size={15} />
          </Link>
          <Link
            href="/contact"
            className="inline-flex min-h-11 items-center gap-2 px-3 text-xs font-bold text-pink-light"
          >
            <MessagesSquare size={15} /> Ask Pink
          </Link>
        </div>
      </div>
    </section>
  );
}
