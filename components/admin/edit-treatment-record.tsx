"use client";
import { useState } from "react";
import { LoaderCircle, Pencil, X } from "lucide-react";
import { useRouter } from "next/navigation";
import type { Booking } from "@/lib/admin/booking-types";
import { TreatmentImages } from "@/components/admin/treatment-images";
import { SearchableOptionInput } from "@/components/admin/searchable-option-input";
const cls =
  "w-full rounded-xl border border-black/10 bg-cream px-4 py-3 text-sm outline-none focus:border-pink";
function details(notes: string) {
  const session = notes.match(/^Session:\s*(\d*)\s*of\s*(\d*)/i);
  const match = notes.match(
    /Consultation:\s*([\s\S]*?)\s*Outcome:\s*([\s\S]*?)(?:\s*Amount paid:|\s*Laser settings:|$)/i,
  );
  const amount = notes.match(/Amount paid:\s*£?([\d.]+)/i);
  const laserSettings = notes.match(/Laser settings:\s*Fluence:\s*(.+)\s*Hertz:\s*(.+)\s*Shots fired:\s*(.+)\s*Pulse:\s*(.+?)\s*$/i);
  return {
    sessionNumber: session?.[1] || "",
    totalSessions: session?.[2] || "",
    consultation: match?.[1]?.trim() || notes,
    outcome: match?.[2]?.trim() || "",
    amount: amount?.[1] || "",
    fluence: laserSettings?.[1]?.trim() || "",
    hertz: laserSettings?.[2]?.trim() || "",
    shotsFired: laserSettings?.[3]?.trim() || "",
    pulse: laserSettings?.[4]?.trim() || "Auto by machine",
  };
}
export function EditTreatmentRecord({ booking, treatmentNames }: { booking: Booking; treatmentNames: string[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [images, setImages] = useState(booking.images || []);
  const record = details(booking.notes);
  const [treatmentName, setTreatmentName] = useState(booking.treatmentName);
  const isLaserTreatment = /laser/i.test(treatmentName);
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError("");
    const f = new FormData(e.currentTarget);
    const response = await fetch("/api/admin/customers", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        action: "treatment",
        bookingId: booking.id,
        treatmentName: f.get("treatmentName"),
        consultation: f.get("consultation"),
        outcome: f.get("outcome"),
        sessionNumber: f.get("sessionNumber"),
        totalSessions: f.get("totalSessions"),
        amount: f.get("amount"),
        fluence: f.get("fluence"),
        hertz: f.get("hertz"),
        shotsFired: f.get("shotsFired"),
        pulse: f.get("pulse"),
        images,
      }),
    });
    const result = (await response.json()) as { error?: string };
    setSaving(false);
    if (!response.ok) {
      setError(result.error || "Could not update treatment record.");
      return;
    }
    setOpen(false);
    router.refresh();
  }
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-black/10 px-3 py-1.5 text-[10px] font-bold hover:border-pink hover:text-pink"
      >
        <Pencil size={11} /> Edit treatment record
      </button>
      {open && (
        <div
          className="fixed inset-0 z-[100] overflow-y-auto bg-[#16010d]/75 p-3 backdrop-blur-sm sm:p-6"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          <form
            onSubmit={submit}
            className="mx-auto my-8 max-w-2xl rounded-2xl bg-white p-5 shadow-luxe sm:p-8"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[.18em] text-pink">
                  Treatment history
                </p>
                <h2 className="font-display text-3xl">Edit treatment record</h2>
              </div>
              <button type="button" onClick={() => setOpen(false)}>
                <X size={18} />
              </button>
            </div>
            <div className="mt-6 grid gap-4">
              <label className="grid gap-2 text-xs font-bold">
                Treatment
                <SearchableOptionInput
                  required
                  name="treatmentName"
                  options={treatmentNames}
                  defaultValue={booking.treatmentName}
                  value={treatmentName}
                  onChange={setTreatmentName}
                  placeholder="Search treatments or enter another treatment"
                  className={cls}
                />
              </label>
              <TreatmentImages images={images} onChange={setImages} />
              <div className="grid grid-cols-2 gap-4">
                <label className="grid gap-2 text-xs font-bold">
                  Session number
                  <input
                    name="sessionNumber"
                    type="number"
                    min="1"
                    defaultValue={record.sessionNumber}
                    className={cls}
                  />
                </label>
                <label className="grid gap-2 text-xs font-bold">
                  Total sessions booked
                  <input
                    name="totalSessions"
                    type="number"
                    min="1"
                    defaultValue={record.totalSessions}
                    className={cls}
                  />
                </label>
              </div>
              <label className="grid gap-2 text-xs font-bold">
                Amount paid
                <span className="relative block">
                  <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 font-bold text-black/55">£</span>
                  <input name="amount" type="number" min="0" step="0.01" inputMode="decimal" defaultValue={record.amount} className={`${cls} pl-8`} />
                </span>
              </label>
              {isLaserTreatment && <div className="grid grid-cols-2 gap-4 rounded-xl bg-pink-light/35 p-4">
                <label className="grid gap-2 text-xs font-bold">Fluence<select name="fluence" required defaultValue={record.fluence} className={cls}><option value="" disabled>Select fluence</option>{Array.from({ length: 80 }, (_, index) => index + 1).map((value) => <option key={value} value={value}>{value}</option>)}</select></label>
                <label className="grid gap-2 text-xs font-bold">Hertz<select name="hertz" required defaultValue={record.hertz} className={cls}><option value="" disabled>Select hertz</option>{Array.from({ length: 10 }, (_, index) => index + 1).map((value) => <option key={value} value={value}>{value}</option>)}</select></label>
                <label className="grid gap-2 text-xs font-bold">Shots fired<input name="shotsFired" required type="number" min="0" step="1" inputMode="numeric" defaultValue={record.shotsFired} placeholder="Enter shots fired" className={cls} /></label>
                <label className="grid gap-2 text-xs font-bold">Pulse<select name="pulse" required defaultValue={record.pulse} className={cls}><option value="Auto by machine">Auto by machine</option></select></label>
              </div>}
              <label className="grid gap-2 text-xs font-bold">
                Consultation sheet / consultation details
                <textarea
                  required
                  name="consultation"
                  rows={6}
                  defaultValue={record.consultation}
                  className={cls}
                />
              </label>
              <label className="grid gap-2 text-xs font-bold">
                Outcome
                <textarea
                  required
                  name="outcome"
                  rows={4}
                  defaultValue={record.outcome}
                  className={cls}
                />
              </label>
            </div>
            {error && (
              <p className="mt-4 rounded-xl bg-red-50 p-3 text-xs font-bold text-red-700">
                {error}
              </p>
            )}
            <button
              disabled={saving}
              className="button-primary mt-5"
              type="submit"
            >
              {saving && <LoaderCircle className="animate-spin" size={14} />}{" "}
              {saving ? "Saving changes..." : "Save treatment changes"}
            </button>
          </form>
        </div>
      )}
    </>
  );
}
