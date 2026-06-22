import { LoaderCircle } from "lucide-react";

export function PageLoader({ label = "Loading" }: { label?: string }) {
  return <div className="grid min-h-[55vh] place-items-center px-5 py-16">
    <div className="w-full max-w-sm rounded-2xl border border-black/5 bg-white p-7 text-center shadow-soft">
      <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-pink-light text-pink">
        <LoaderCircle className="animate-spin" size={30} aria-hidden="true" />
      </div>
      <p className="mt-5 font-display text-3xl">{label}</p>
      <p className="mt-2 text-xs leading-5 text-black/45">Preparing the latest admin data...</p>
      <div className="mt-5 grid grid-cols-3 gap-2" aria-hidden="true">
        <span className="h-2 rounded-full bg-pink-light" />
        <span className="h-2 rounded-full bg-pink/50" />
        <span className="h-2 rounded-full bg-pink-light" />
      </div>
    </div>
  </div>;
}
