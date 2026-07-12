"use client";

import Image from "next/image";
import { useState } from "react";
import { Camera, LoaderCircle, X } from "lucide-react";
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
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  async function add(files: FileList | null, phase: TreatmentImage["phase"]) {
    if (!files) return;
    setUploading(true);
    setError("");
    try {
      const additions = await Promise.all(Array.from(files).map(async (file) => {
        const dataUrl = await prepareImage(file);
        const blob = await (await fetch(dataUrl)).blob();
        const prepared = await fetch("/api/admin/images/upload", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ contentType: blob.type }) });
        const result = await prepared.json() as { key?: string; uploadUrl?: string; error?: string };
        if (!prepared.ok || !result.key || !result.uploadUrl) throw new Error(result.error || "Could not prepare image upload.");
        const uploaded = await fetch(result.uploadUrl, { method: "PUT", headers: { "content-type": blob.type }, body: blob });
        if (!uploaded.ok) throw new Error(`S3 rejected the image upload (${uploaded.status}).`);
        return { id: crypto.randomUUID(), key: result.key, phase, name: file.name, contentType: blob.type };
      }));
      onChange([...images, ...additions]);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Could not upload image.");
    } finally {
      setUploading(false);
    }
  }
  return (
    <div className="grid gap-3 sm:col-span-2">
      <div>
        <p className="text-xs font-bold">Treatment images <span className="font-normal text-black/40">(optional)</span></p>
        <p className="mt-1 text-[11px] text-black/45">Take or upload as many before and after images as needed.</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {(["before", "after"] as const).map((phase) => (
          <label key={phase} className={`flex items-center justify-center gap-2 rounded-xl border border-dashed border-pink/40 bg-pink-light/25 p-4 text-xs font-bold text-pink hover:bg-pink-light/50 ${uploading ? "cursor-wait opacity-60" : "cursor-pointer"}`}>
            {uploading ? <LoaderCircle size={16} className="animate-spin" /> : <Camera size={16} />} {uploading ? "Uploading..." : `Add ${phase} images`}
            <input disabled={uploading} className="sr-only" type="file" accept="image/*" multiple onChange={(e) => { void add(e.target.files, phase); e.target.value = ""; }} />
          </label>
        ))}
      </div>
      {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-xs font-bold text-red-700">{error}</p>}
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
