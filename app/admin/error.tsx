"use client";
import Link from "next/link";
import { useEffect } from "react";
import { reportClientError } from "@/lib/admin/client-errors";

export default function AdminError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { reportClientError("render"); }, []);
  return <div className="mx-auto max-w-xl p-8">
    <h1 className="font-display text-3xl">Something went wrong</h1>
    <p className="mt-3 text-sm">Please try again. Saved consultation drafts are available in consultation records.</p>
    <button onClick={reset} className="mt-5 rounded-full bg-pink px-5 py-3 font-bold text-white">Try again</button>
    <Link href="/admin/consultation-records" className="ml-4 text-sm underline">Consultation records</Link>
  </div>;
}
