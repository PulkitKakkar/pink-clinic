"use client";
import { useState } from "react";
import { LoaderCircle, Pencil } from "lucide-react";
import { TreatmentImages } from "@/components/admin/treatment-images";
import type { TreatmentImage } from "@/lib/admin/booking-types";

export function EditConsultationImages({ id, initialImages }: { id: string; initialImages: TreatmentImage[] }) {
  const [images, setImages] = useState(initialImages);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  async function save() {
    setSaving(true); setError("");
    const response = await fetch("/api/admin/consultations", { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ id, images }) });
    setSaving(false);
    if (!response.ok) { const result = await response.json() as { error?: string }; setError(result.error || "Could not update images."); return; }
    setEditing(false);
  }
  if (!editing) return <button type="button" onClick={() => setEditing(true)} className="button-primary mt-6"><Pencil size={14} /> {images.length ? `Edit treatment images (${images.length})` : "Add treatment images"}</button>;
  return <div className="mt-6 rounded-2xl border border-black/5 bg-white p-5 shadow-soft">
    <TreatmentImages images={images} onChange={setImages} />
    {error && <p className="mt-3 text-xs font-bold text-red-700">{error}</p>}
    <div className="mt-4 flex gap-3"><button type="button" disabled={saving} onClick={() => void save()} className="button-primary">{saving && <LoaderCircle size={14} className="animate-spin" />} Save images</button><button type="button" onClick={() => { setImages(initialImages); setEditing(false); }} className="text-xs font-bold">Cancel</button></div>
  </div>;
}
