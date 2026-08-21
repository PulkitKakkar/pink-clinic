"use client";

import { ArrowUp } from "lucide-react";
import { useEffect, useState } from "react";

export function ConcernTreatmentsShortcut() {
  const [treatmentsVisible, setTreatmentsVisible] = useState(false);

  useEffect(() => {
    const treatments = document.getElementById("treatments");
    if (!treatments) return;

    const observer = new IntersectionObserver(
      ([entry]) => setTreatmentsVisible(entry.isIntersecting),
      { threshold: 0, rootMargin: "0px 0px -20px 0px" },
    );

    observer.observe(treatments);
    return () => observer.disconnect();
  }, []);

  return (
    <a
      href="#treatments"
      aria-hidden={treatmentsVisible}
      tabIndex={treatmentsVisible ? -1 : undefined}
      className={`fixed bottom-[max(1.25rem,env(safe-area-inset-bottom))] left-1/2 z-40 inline-flex min-h-12 -translate-x-1/2 items-center gap-2 whitespace-nowrap rounded-full bg-pink px-6 text-sm font-bold text-white shadow-[0_14px_36px_rgba(88,20,63,.35)] transition duration-300 hover:-translate-y-0.5 hover:bg-pink-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-pink ${treatmentsVisible ? "pointer-events-none translate-y-4 opacity-0" : "opacity-100"}`}
    >
      View treatments <ArrowUp size={16} aria-hidden="true" />
    </a>
  );
}
