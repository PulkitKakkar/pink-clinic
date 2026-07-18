export default function Loading() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Loading page"
      className="fixed inset-0 z-[290] grid place-items-center bg-cream/80 backdrop-blur-sm"
    >
      <div className="flex items-center gap-3 rounded-full bg-white px-5 py-3 text-sm font-bold text-pink shadow-luxe">
        <span className="action-loader-spinner h-5 w-5 rounded-full border-2 border-pink/20 border-t-pink" />
        Loading…
      </div>
    </div>
  );
}
