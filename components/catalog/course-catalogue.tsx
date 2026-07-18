"use client";

import { useState } from "react";
import { CatalogBrowser } from "@/components/catalog/catalog-browser";
import type { Branch } from "@/lib/branches";
import type { CatalogItem } from "@/lib/catalog";

type BranchCourses = {
  branch: Branch;
  items: CatalogItem[];
};

export function CourseCatalogue({ catalogues }: { catalogues: BranchCourses[] }) {
  const [selectedBranchId, setSelectedBranchId] = useState(catalogues[0]?.branch.id || "");
  const selected = catalogues.find(({ branch }) => branch.id === selectedBranchId) || catalogues[0];
  if (!selected) return null;

  return (
    <div>
      <div className="rounded-2xl bg-pink-light/50 p-4 sm:p-6">
        <p className="text-[10px] font-bold uppercase tracking-[.18em] text-pink">Choose academy location</p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {catalogues.map(({ branch, items }) => (
            <button
              key={branch.id}
              type="button"
              aria-pressed={branch.id === selected.branch.id}
              onClick={() => setSelectedBranchId(branch.id)}
              className={`min-h-12 rounded-xl px-4 text-left text-sm font-bold transition ${branch.id === selected.branch.id ? "bg-pink text-white" : "bg-white text-ink hover:text-pink"}`}
            >
              {branch.name}
              <span className={`ml-2 text-[10px] ${branch.id === selected.branch.id ? "text-white/70" : "text-black/40"}`}>{items.length} courses</span>
            </button>
          ))}
        </div>
        <p className="mt-3 text-xs leading-5 text-black/50">Prices and offers below are specific to {selected.branch.name}. Switch location to compare availability.</p>
      </div>
      <div className="mt-7">
        <CatalogBrowser items={selected.items} branchId={selected.branch.id} branchSlug={selected.branch.slug} hideTypeFilters collectionEyebrow="Academy catalogue" collectionTitle="Browse course collections" />
      </div>
    </div>
  );
}
