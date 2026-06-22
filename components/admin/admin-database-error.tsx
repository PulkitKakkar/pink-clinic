import { AlertTriangle } from "lucide-react";

export function AdminDatabaseError({ error }: { error: unknown }) {
  const message = error instanceof Error ? error.message : "The database could not be reached.";
  return <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm leading-6 text-red-900">
    <span className="flex items-center gap-2 font-bold"><AlertTriangle size={16} /> Admin data is temporarily unavailable</span>
    <p className="mt-2">Bookings and customer history could not be loaded. Please try again shortly or contact the site administrator.</p>
    {process.env.NODE_ENV !== "production" && <pre className="mt-3 overflow-auto rounded-xl bg-white/80 p-3 text-xs">{message}</pre>}
  </div>;
}
