import Link from "next/link";

export function CheckoutAgreements() {
  return (
    <label className="mt-6 flex items-start gap-3 rounded-2xl border border-black/10 bg-white p-4 text-xs leading-5 text-black/60">
      <input
        type="checkbox"
        name="acceptTerms"
        required
        className="mt-1 h-4 w-4 shrink-0 accent-pink"
      />
      <span>
        I have reviewed and agree to the{" "}
        <Link href="/terms" target="_blank" className="font-bold text-pink underline">
          terms
        </Link>
        ,{" "}
        <Link href="/cancellations" target="_blank" className="font-bold text-pink underline">
          cancellation policy
        </Link>
        ,{" "}
        <Link href="/returns" target="_blank" className="font-bold text-pink underline">
          returns policy
        </Link>{" "}
        and{" "}
        <Link href="/privacy" target="_blank" className="font-bold text-pink underline">
          privacy notice
        </Link>
        .
      </span>
    </label>
  );
}
