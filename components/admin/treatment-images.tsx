"use client";

import Image from "next/image";
import { Camera, X } from "lucide-react";
import type { TreatmentImage } from "@/lib/admin/booking-types";

async function prepareImage(file: File): Promise<string> {
  const source = await createImageBitmap(file);
  const scale = Math.min(1, 1600 / Math.max(source.width, source.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(source.width * scale);
  canvas.height = Math.round(source.height * scale);
  canvas.getContext("2d")!.drawImage(source, 0, 0, canvas.width, canvas.height);
  source.close();
  return canvas.toDataURL("image/jpeg", 0.82);
}

export function treatmentImageUrl(image: TreatmentImage) {
  return image.key ? `/api/admin/images/view?key=${encodeURIComponent(image.key)}` : image.dataUrl || "";
}

export function TreatmentImages({ images, onChange }: { images: TreatmentImage[]; onChange: (images: TreatmentImage[]) => void }) {
  async function add(files: FileList | null, phase: TreatmentImage["phase"]) {
    if (!files) return;
    const additions = await Promise.all(Array.from(files).map(async (file) => {
      const dataUrl = await prepareImage(file);
      const blob = await (await fetch(dataUrl)).blob();
      const prepared = await fetch("/api/admin/images/upload", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ contentType: blob.type }) });
      const result = await prepared.json() as { key?: string; uploadUrl?: string; error?: string };
      if (!prepared.ok || !result.key || !result.uploadUrl) throw new Error(result.error || "Could not prepare image upload.");
      const uploaded = await fetch(result.uploadUrl, { method: "PUT", headers: { "content-type": blob.type }, body: blob });
      if (!uploaded.ok) throw new Error("Could not upload image.");
      return { id: crypto.randomUUID(), key: result.key, phase, name: file.name, contentType: blob.type };
    }));
    onChange([...images, ...additions]);
  }
  return (
    <div className="grid gap-3 sm:col-span-2">
      <div>
        <p className="text-xs font-bold">Treatment images <span className="font-normal text-black/40">(optional)</span></p>
        <p className="mt-1 text-[11px] text-black/45">Take or upload as many before and after images as needed.</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {(["before", "after"] as const).map((phase) => (
          <label key={phase} className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-pink/40 bg-pink-light/25 p-4 text-xs font-bold text-pink hover:bg-pink-light/50">
            <Camera size={16} /> Add {phase} images
            <input className="sr-only" type="file" accept="image/*" multiple onChange={(e) => { void add(e.target.files, phase); e.target.value = ""; }} />
          </label>
        ))}
      </div>
      {images.length > 0 && <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {images.map((item) => <div key={item.id} className="relative overflow-hidden rounded-xl border border-black/10 bg-white">
          <Image src={treatmentImageUrl(item)} alt={`${item.phase} treatment image`} width={400} height={300} unoptimized className="aspect-square w-full object-cover" />
          <span className="absolute bottom-2 left-2 rounded-full bg-black/70 px-2 py-1 text-[9px] font-bold uppercase text-white">{item.phase}</span>
          <button type="button" aria-label={`Remove ${item.name}`} onClick={() => onChange(images.filter((image) => image.id !== item.id))} className="absolute right-2 top-2 rounded-full bg-white p-1 shadow"><X size={13} /></button>
        </div>)}
      </div>}
    </div>
  );
}
